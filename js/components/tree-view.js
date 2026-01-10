/**
 * Tree View Component for EU5 Inspector
 * Renders hierarchical data with expand/collapse functionality
 */
class TreeView {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            levelNames: ['Continent', 'Subcontinent', 'Region', 'Area', 'Province', 'Location'],
            levelColors: ['#e94560', '#61afef', '#98c379', '#e5c07b', '#c678dd', '#56b6c2'],
            onSelect: null,
            ...options
        };
        this.expandedNodes = new Set();
        this.selectedNode = null;
    }

    /**
     * Render the tree from hierarchical data
     */
    render(data, locationData = null) {
        this.locationData = locationData;
        const html = this.renderLevel(data, 0, '');
        this.container.innerHTML = `<div class="tree-view">${html}</div>`;
        this.attachEventListeners();
    }

    /**
     * Render a level of the tree
     */
    renderLevel(data, level, path) {
        if (!data || typeof data !== 'object') return '';

        // Handle arrays - render each element
        if (Array.isArray(data)) {
            return data.map((item, index) => {
                if (typeof item === 'string' || typeof item === 'number') {
                    // Primitive array items are leaf nodes - no badge for these
                    const nodePath = path ? `${path}[${index}]` : `[${index}]`;
                    return `
                        <div class="tree-node leaf" data-path="${nodePath}" data-level="${level}">
                            <div class="tree-node-header" style="padding-left: ${level * 20}px">
                                <span class="tree-leaf-icon">•</span>
                                <span class="tree-node-name">${this.formatName(String(item))}</span>
                            </div>
                        </div>
                    `;
                } else if (typeof item === 'object') {
                    return this.renderLevel(item, level, path);
                }
                return '';
            }).join('');
        }

        const entries = Object.entries(data).filter(([key]) => !key.startsWith('_'));
        if (entries.length === 0) return '';

        const levelName = this.options.levelNames[level] || `Level ${level}`;
        const levelColor = this.options.levelColors[level % this.options.levelColors.length];

        return entries.map(([key, value]) => {
            const nodePath = path ? `${path}.${key}` : key;
            const isExpanded = this.expandedNodes.has(nodePath);

            // Determine if this node has expandable children
            const childInfo = this.getChildInfo(value);
            const hasChildren = childInfo.count > 0;
            const isLeaf = !hasChildren;

            const displayName = this.formatName(key);

            let nodeHtml = `
                <div class="tree-node ${isExpanded ? 'expanded' : ''} ${isLeaf ? 'leaf' : ''}"
                     data-path="${nodePath}" data-level="${level}">
                    <div class="tree-node-header" style="padding-left: ${level * 20}px">
                        ${!isLeaf ? `
                            <span class="tree-toggle">${isExpanded ? '▼' : '▶'}</span>
                        ` : `
                            <span class="tree-leaf-icon">•</span>
                        `}
                        <span class="tree-level-badge" style="background: ${levelColor}">${levelName}</span>
                        <span class="tree-node-name">${displayName}</span>
                        ${hasChildren ? `<span class="tree-child-count">(${childInfo.count})</span>` : ''}
                    </div>
            `;

            if (hasChildren) {
                nodeHtml += `
                    <div class="tree-children" style="display: ${isExpanded ? 'block' : 'none'}">
                        ${this.renderLevel(value, level + 1, nodePath)}
                    </div>
                `;
            }

            nodeHtml += '</div>';
            return nodeHtml;
        }).join('');
    }

    /**
     * Get information about children of a value
     */
    getChildInfo(value) {
        if (value === null || value === undefined) {
            return { count: 0, type: 'empty' };
        }

        if (typeof value !== 'object') {
            return { count: 0, type: 'primitive' };
        }

        if (Array.isArray(value)) {
            // Arrays with items are expandable
            return { count: value.length, type: 'array' };
        }

        // Object - count non-underscore keys
        const keys = Object.keys(value).filter(k => !k.startsWith('_'));
        return { count: keys.length, type: 'object' };
    }

    /**
     * Format a key name for display
     */
    formatName(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    /**
     * Attach event listeners for expand/collapse
     */
    attachEventListeners() {
        this.container.querySelectorAll('.tree-node-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const node = header.closest('.tree-node');
                const path = node.dataset.path;
                const isLeaf = node.classList.contains('leaf');

                if (!isLeaf) {
                    this.toggleNode(path, node);
                }

                if (this.options.onSelect) {
                    this.options.onSelect(path, node.dataset.level);
                }
            });
        });
    }

    /**
     * Toggle node expansion
     */
    toggleNode(path, node) {
        const children = node.querySelector(':scope > .tree-children');
        if (!children) return;

        const isExpanded = this.expandedNodes.has(path);

        if (isExpanded) {
            this.expandedNodes.delete(path);
            children.style.display = 'none';
            node.classList.remove('expanded');
            const toggle = node.querySelector(':scope > .tree-node-header .tree-toggle');
            if (toggle) toggle.textContent = '▶';
        } else {
            this.expandedNodes.add(path);
            children.style.display = 'block';
            node.classList.add('expanded');
            const toggle = node.querySelector(':scope > .tree-node-header .tree-toggle');
            if (toggle) toggle.textContent = '▼';
        }
    }

    /**
     * Expand all nodes
     */
    expandAll() {
        this.container.querySelectorAll('.tree-node:not(.leaf)').forEach(node => {
            const path = node.dataset.path;
            this.expandedNodes.add(path);
            node.classList.add('expanded');
            const toggle = node.querySelector(':scope > .tree-node-header .tree-toggle');
            if (toggle) toggle.textContent = '▼';
            const children = node.querySelector(':scope > .tree-children');
            if (children) children.style.display = 'block';
        });
    }

    /**
     * Collapse all nodes
     */
    collapseAll() {
        this.expandedNodes.clear();
        this.container.querySelectorAll('.tree-node').forEach(node => {
            node.classList.remove('expanded');
            const toggle = node.querySelector(':scope > .tree-node-header .tree-toggle');
            if (toggle) toggle.textContent = '▶';
            const children = node.querySelector(':scope > .tree-children');
            if (children) children.style.display = 'none';
        });
    }

    /**
     * Filter tree to show only matching nodes
     */
    filter(query) {
        const lowerQuery = query.toLowerCase();
        this.container.querySelectorAll('.tree-node').forEach(node => {
            const name = node.querySelector(':scope > .tree-node-header .tree-node-name').textContent.toLowerCase();
            const matches = name.includes(lowerQuery);
            node.style.display = matches || !query ? '' : 'none';

            if (matches && query) {
                let parent = node.parentElement.closest('.tree-node');
                while (parent) {
                    parent.style.display = '';
                    const path = parent.dataset.path;
                    if (!this.expandedNodes.has(path)) {
                        this.toggleNode(path, parent);
                    }
                    parent = parent.parentElement.closest('.tree-node');
                }
            }
        });
    }
}

window.TreeView = TreeView;
