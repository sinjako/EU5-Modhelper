/**
 * Advances Handler for EU5 Inspector
 * Handles tech tree rendering and filtering for the advances category
 */
class AdvancesHandler extends BaseHandler {
    constructor(app) {
        super(app);
        this.techTreeData = null;
        this.currentEra = null;
    }

    getCategoryId() {
        return 'advances';
    }

    getFilterConfig() {
        return CategoryRegistry.get('advances').filters;
    }

    /**
     * Era labels for display
     */
    static get ERA_LABELS() {
        return {
            'age_1_traditions': 'I - Age of Traditions',
            'age_2_renaissance': 'II - Age of Renaissance',
            'age_3_discovery': 'III - Age of Discovery',
            'age_4_reformation': 'IV - Age of Reformation',
            'age_5_absolutism': 'V - Age of Absolutism',
            'age_6_revolutions': 'VI - Age of Revolutions'
        };
    }

    /**
     * Render the tech tree view
     */
    render(container, items, keys) {
        // Build the tech tree data structure
        this.techTreeData = this.buildTechTreeData(items, keys);

        // Render the visual tech tree
        container.innerHTML = this.renderTechTree();

        // Add era tab handlers
        container.querySelectorAll('.era-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentEra = tab.dataset.era;
                this.render(container, items, keys);
            });
        });

        // Add node click handlers for expansion
        container.querySelectorAll('.tech-node').forEach(node => {
            node.addEventListener('click', (e) => {
                if (e.target.closest('.ref-link')) return;
                node.classList.toggle('expanded');
                setTimeout(() => this.drawTechTreeConnections(), 250);
            });
        });

        // Draw SVG connections after DOM is rendered
        requestAnimationFrame(() => {
            this.drawTechTreeConnections();
        });
    }

    /**
     * Called after render for additional setup
     */
    afterRender(container) {
        this.drawTechTreeConnections();
    }

    /**
     * Handle window resize
     */
    onResize() {
        this.drawTechTreeConnections();
    }

    /**
     * Build the tech tree data structure
     */
    buildTechTreeData(items, keys) {
        const advances = {};
        let filteredNonUniversal = 0;

        // First pass: create all nodes, FILTER to only universal advances
        // Universal advances are ONLY in 0_age_of_*.txt files
        for (const key of keys) {
            const item = items[key];

            // Filter by source file
            const sourceFile = item._sourceFile || '';
            if (!sourceFile.startsWith('0_age_of_')) {
                filteredNonUniversal++;
                continue;
            }

            const era = item.age || item._fileAge || 'other';
            const icon = item.icon || null;
            const isRoot = item.depth === 0 || item.depth === '0';

            advances[key] = {
                name: key,
                data: item,
                requires: this.extractRequirements(item),
                unlockedBy: [],
                treeDepth: 0,
                era: era,
                icon: icon,
                isRoot: isRoot
            };
        }

        // Second pass: build reverse dependencies
        for (const [key, advance] of Object.entries(advances)) {
            for (const req of advance.requires) {
                if (advances[req]) {
                    advances[req].unlockedBy.push(key);
                }
            }
        }

        // Find roots and orphans
        const roots = [];
        const orphaned = new Set();
        for (const [key, advance] of Object.entries(advances)) {
            const internalReqs = advance.requires.filter(r => advances[r]);
            if (advance.isRoot || advance.requires.length === 0) {
                roots.push(key);
                advances[key].treeDepth = 0;
            } else if (internalReqs.length === 0 && advance.requires.length > 0) {
                orphaned.add(key);
            }
        }

        // BFS to calculate depths
        const queue = [...roots];
        const visited = new Set(roots);

        while (queue.length > 0) {
            const current = queue.shift();
            const currentDepth = advances[current].treeDepth;

            for (const child of advances[current].unlockedBy) {
                if (!visited.has(child)) {
                    visited.add(child);
                    advances[child].treeDepth = currentDepth + 1;
                    queue.push(child);
                }
            }
        }

        // Handle unvisited nodes
        for (const [key, advance] of Object.entries(advances)) {
            if (!visited.has(key) && !orphaned.has(key)) {
                advances[key].treeDepth = 0;
            }
        }

        // Remove orphaned advances
        for (const key of orphaned) {
            delete advances[key];
        }

        console.log(`Tech tree: ${Object.keys(advances).length} universal advances (from 0_age_of_* files), ${roots.length} roots`);
        console.log(`Filtered: ${filteredNonUniversal} non-universal advances (from other files)`);

        return advances;
    }

    /**
     * Render the tech tree HTML
     */
    renderTechTree() {
        const advances = this.techTreeData;
        if (!advances) return '';

        // Group by era
        const eras = {};
        for (const [key, advance] of Object.entries(advances)) {
            const era = advance.era;
            if (!eras[era]) eras[era] = [];
            eras[era].push({ key, ...advance });
        }

        // Sort eras by age number
        const eraOrder = Object.keys(eras)
            .filter(e => e !== 'other' && e !== 'Other')
            .sort((a, b) => {
                const aNum = parseInt(a.match(/\d+/)?.[0] || '99');
                const bNum = parseInt(b.match(/\d+/)?.[0] || '99');
                return aNum - bNum;
            });

        // Set default era
        if (!this.currentEra || !eras[this.currentEra] || this.currentEra === 'other') {
            this.currentEra = eraOrder[0];
        }

        let html = '<div class="tech-tree-container">';

        // Era tabs
        html += '<div class="era-tabs">';
        for (const era of eraOrder) {
            const eraName = AdvancesHandler.ERA_LABELS[era] ||
                era.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const isActive = era === this.currentEra;
            const count = eras[era].length;
            html += `<button class="era-tab ${isActive ? 'active' : ''}" data-era="${era}">${eraName} <span class="era-count">(${count})</span></button>`;
        }
        html += '</div>';

        // Get advances for current era
        const currentAdvances = eras[this.currentEra] || [];
        const advanceMap = {};
        currentAdvances.forEach(a => advanceMap[a.key] = a);
        const currentKeys = new Set(currentAdvances.map(a => a.key));

        // Find era roots
        const eraRoots = currentAdvances.filter(adv => {
            const internalReqs = adv.requires.filter(r => currentKeys.has(r));
            return internalReqs.length === 0;
        });

        eraRoots.sort((a, b) => a.key.localeCompare(b.key));

        console.log(`Era ${this.currentEra}: ${currentAdvances.length} universal advances, ${eraRoots.length} root trees`);

        html += `<div class="tech-era" data-era="${this.currentEra}">`;
        html += `<div class="tech-forest">`;

        for (const root of eraRoots) {
            html += this.renderTree(root, advanceMap, currentKeys);
        }

        html += '</div></div>';
        html += '</div>';
        return html;
    }

    /**
     * Recursively render a tree from a root node
     */
    renderTree(node, advanceMap, currentKeys) {
        const displayName = node.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        const children = (node.unlockedBy || [])
            .filter(childKey => currentKeys.has(childKey))
            .map(childKey => advanceMap[childKey])
            .filter(Boolean)
            .sort((a, b) => a.key.localeCompare(b.key));

        let html = `<div class="tree-node" data-key="${node.key}">`;
        html += `<div class="tree-node-card">`;
        html += `<span class="tree-icon">${this.getTechIcon(node.key, node.data)}</span>`;
        html += `<span class="tree-name" title="${displayName}">${displayName}</span>`;
        html += `</div>`;

        if (children.length > 0) {
            html += `<div class="tree-children">`;
            for (const child of children) {
                html += this.renderTree(child, advanceMap, currentKeys);
            }
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    /**
     * Get icon for a tech based on its name
     */
    getTechIcon(key, data) {
        const name = key.toLowerCase();
        if (name.includes('military') || name.includes('army') || name.includes('infantry') || name.includes('cavalry')) return '⚔️';
        if (name.includes('naval') || name.includes('ship') || name.includes('fleet')) return '⚓';
        if (name.includes('trade') || name.includes('merchant') || name.includes('market')) return '💰';
        if (name.includes('diplomacy') || name.includes('diplomatic') || name.includes('envoy')) return '📜';
        if (name.includes('admin') || name.includes('government') || name.includes('reform')) return '🏛️';
        if (name.includes('religion') || name.includes('church') || name.includes('faith')) return '⛪';
        if (name.includes('culture') || name.includes('art') || name.includes('theater')) return '🎭';
        if (name.includes('science') || name.includes('university') || name.includes('school')) return '🔬';
        if (name.includes('exploration') || name.includes('colonial') || name.includes('new_world')) return '🧭';
        if (name.includes('manufactories') || name.includes('production') || name.includes('industry')) return '🏭';
        if (name.includes('renaissance')) return '🎨';
        if (name.includes('printing') || name.includes('press')) return '📰';
        if (name.includes('revolution')) return '🔥';
        return '📜';
    }

    /**
     * Draw SVG connections between tech tree nodes
     */
    drawTechTreeConnections() {
        const advances = this.techTreeData;
        if (!advances) return;

        const eraEl = document.querySelector('.tech-era');
        if (!eraEl) return;

        const svg = eraEl.querySelector('.tech-connections');
        const treeEl = eraEl.querySelector('.era-tree');
        if (!svg || !treeEl) return;

        const nodes = eraEl.querySelectorAll('.tech-node');
        const displayedKeys = new Set();
        nodes.forEach(n => displayedKeys.add(n.dataset.key));

        const treeRect = treeEl.getBoundingClientRect();
        svg.setAttribute('width', treeRect.width);
        svg.setAttribute('height', treeRect.height);
        svg.style.width = treeRect.width + 'px';
        svg.style.height = treeRect.height + 'px';

        const nodePositions = {};
        nodes.forEach(node => {
            const key = node.dataset.key;
            const rect = node.getBoundingClientRect();
            nodePositions[key] = {
                x: rect.left - treeRect.left + rect.width / 2,
                top: rect.top - treeRect.top,
                bottom: rect.top - treeRect.top + rect.height
            };
        });

        let paths = '';

        for (const [key, advance] of Object.entries(advances)) {
            if (!displayedKeys.has(key)) continue;
            const fromPos = nodePositions[key];
            if (!fromPos) continue;

            for (const childKey of advance.unlockedBy) {
                if (!displayedKeys.has(childKey)) continue;
                const toPos = nodePositions[childKey];
                if (!toPos) continue;

                const startX = fromPos.x;
                const startY = fromPos.bottom;
                const endX = toPos.x;
                const endY = toPos.top;
                const midY = (startY + endY) / 2;

                if (Math.abs(startX - endX) < 5) {
                    paths += `<path d="M ${startX} ${startY} L ${endX} ${endY}" class="tech-connection-line" />`;
                } else {
                    paths += `<path d="M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}" class="tech-connection-line" />`;
                }
            }
        }

        svg.innerHTML = paths;
    }

    /**
     * Extract requirements from an advance item
     */
    extractRequirements(item) {
        const reqs = [];
        if (!item || typeof item !== 'object') return reqs;

        const extractFromValue = (val) => {
            if (typeof val === 'string') {
                reqs.push(val);
            } else if (Array.isArray(val)) {
                for (const v of val) {
                    extractFromValue(v);
                }
            } else if (val && typeof val === 'object') {
                for (const [key, nested] of Object.entries(val)) {
                    if (key.startsWith('_')) continue;
                    if (key === 'advance' || key === 'any_of' || key === 'all_of' ||
                        key === 'AND' || key === 'OR' || key === 'NOT') {
                        extractFromValue(nested);
                    }
                }
            }
        };

        if (item.requires) {
            extractFromValue(item.requires);
        }

        const otherFields = ['prerequisites', 'prerequisite', 'parent'];
        for (const field of otherFields) {
            if (item[field]) {
                extractFromValue(item[field]);
            }
        }

        return [...new Set(reqs)];
    }

    /**
     * Render tech effects for display
     */
    renderTechEffects(item) {
        const effects = [];

        if (item.modifier && typeof item.modifier === 'object') {
            for (const [key, val] of Object.entries(item.modifier)) {
                if (!key.startsWith('_')) {
                    const sign = typeof val === 'number' && val > 0 ? '+' : '';
                    effects.push(`${key.replace(/_/g, ' ')}: ${sign}${val}`);
                }
            }
        }

        if (effects.length === 0) return '';

        return `
            <div class="tech-section tech-effects">
                <span class="tech-label">Effects:</span>
                <ul class="effects-list">
                    ${effects.slice(0, 5).map(e => `<li>${e}</li>`).join('')}
                    ${effects.length > 5 ? `<li class="more">+${effects.length - 5} more...</li>` : ''}
                </ul>
            </div>
        `;
    }

    /**
     * Get the current tech tree data
     */
    getTechTreeData() {
        return this.techTreeData;
    }

    /**
     * Get the current era
     */
    getCurrentEra() {
        return this.currentEra;
    }
}

// Export for use in other modules
window.AdvancesHandler = AdvancesHandler;
