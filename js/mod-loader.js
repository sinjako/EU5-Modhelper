/**
 * Mod Loader for EU5 ModHelper
 * Handles scanning, loading, and merging mod files
 */

class ModLoader {
    constructor() {
        this.mods = new Map(); // modId -> mod info
        this.modFiles = new Map(); // modId -> Map of path -> File
        this.modHandles = new Map(); // modId -> DirectoryHandle (for writing)
        this.currentMod = null;
        this.parser = new ParadoxParser();
        this.modChanges = new Map(); // path -> {type: 'add'|'modify'|'replace', original, modded}
        this.fileInput = null;
        this.supportsFileSystemAccess = 'showDirectoryPicker' in window;
        this._createFileInput();
    }

    /**
     * Create hidden file input for mod folder selection
     */
    _createFileInput() {
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.webkitdirectory = true;
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);
    }

    /**
     * Prompt user to select a mod folder
     * Scans for mods with .metadata/metadata.json or descriptor.mod
     * @returns {Promise<Array>} Array of found mods
     */
    selectModFolder() {
        return new Promise((resolve) => {
            this.fileInput.onchange = async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) {
                    resolve([]);
                    return;
                }

                // Get folder name from first file's path
                const firstPath = files[0].webkitRelativePath;
                const rootFolder = firstPath.split('/')[0];

                // Clear existing mods
                this.mods.clear();
                this.modFiles.clear();

                // Group files by potential mod folders
                const modFolders = new Map(); // modPath -> files[]

                for (const file of files) {
                    const fullPath = file.webkitRelativePath;
                    const relativePath = fullPath.substring(rootFolder.length + 1);
                    const parts = relativePath.split('/');

                    // Check if this is a direct mod folder or we're in a mods container
                    if (parts.length >= 2) {
                        const modFolder = parts[0];
                        if (!modFolders.has(modFolder)) {
                            modFolders.set(modFolder, []);
                        }
                        modFolders.get(modFolder).push({
                            file,
                            relativePath: parts.slice(1).join('/')
                        });
                    }
                }

                // Scan each potential mod folder for metadata
                for (const [modFolder, modFileList] of modFolders) {
                    const modInfo = await this._scanModFolder(modFolder, modFileList);
                    if (modInfo) {
                        this.mods.set(modInfo.id, modInfo);

                        // Store mod files
                        const fileMap = new Map();
                        for (const { file, relativePath } of modFileList) {
                            fileMap.set(relativePath, file);
                        }
                        this.modFiles.set(modInfo.id, fileMap);
                    }
                }

                console.log(`Found ${this.mods.size} mods`);
                resolve(Array.from(this.mods.values()));
            };

            // Reset and trigger
            this.fileInput.value = '';
            this.fileInput.click();
        });
    }

    /**
     * Scan a folder for mod metadata
     * @param {string} modFolder - Folder name
     * @param {Array} files - Files in the folder
     * @returns {Object|null} Mod info or null
     */
    async _scanModFolder(modFolder, files) {
        // Look for .metadata/metadata.json (EU5 style)
        let metadataFile = null;
        let descriptorFile = null;

        for (const { file, relativePath } of files) {
            if (relativePath === '.metadata/metadata.json') {
                metadataFile = file;
            } else if (relativePath === 'descriptor.mod') {
                descriptorFile = file;
            }
        }

        if (metadataFile) {
            try {
                const text = await metadataFile.text();
                const metadata = JSON.parse(text);
                return {
                    id: metadata.id || modFolder,
                    name: metadata.name || modFolder,
                    version: metadata.version || '1.0.0',
                    description: metadata.short_description || '',
                    supportedVersion: metadata.supported_game_version || '*',
                    tags: metadata.tags || [],
                    folder: modFolder,
                    type: 'metadata.json'
                };
            } catch (err) {
                console.warn(`Failed to parse metadata.json for ${modFolder}:`, err);
            }
        }

        if (descriptorFile) {
            try {
                const text = await descriptorFile.text();
                const parsed = this.parser.parse(text);
                return {
                    id: parsed.id || modFolder,
                    name: parsed.name || modFolder,
                    version: parsed.version || '1.0',
                    description: parsed.description || '',
                    supportedVersion: parsed.supported_version || '*',
                    tags: parsed.tags || [],
                    folder: modFolder,
                    type: 'descriptor.mod'
                };
            } catch (err) {
                console.warn(`Failed to parse descriptor.mod for ${modFolder}:`, err);
            }
        }

        // Check if folder has game-like structure (in_game, common, etc.)
        const hasGameStructure = files.some(f =>
            f.relativePath.startsWith('in_game/') ||
            f.relativePath.startsWith('common/') ||
            f.relativePath.startsWith('events/')
        );

        if (hasGameStructure) {
            return {
                id: modFolder,
                name: modFolder,
                version: '1.0.0',
                description: 'Mod without metadata',
                supportedVersion: '*',
                tags: [],
                folder: modFolder,
                type: 'inferred'
            };
        }

        return null;
    }

    /**
     * Get list of available mods
     * @returns {Array} Array of mod info objects
     */
    getAvailableMods() {
        return Array.from(this.mods.values());
    }

    /**
     * Select a mod to be active
     * @param {string} modId - The mod ID to activate
     */
    selectMod(modId) {
        if (modId && !this.mods.has(modId)) {
            console.warn(`Mod not found: ${modId}`);
            return;
        }
        this.currentMod = modId || null;
        this.modChanges.clear();
    }

    /**
     * Get currently selected mod
     * @returns {Object|null} Current mod info or null (includes directoryHandle if available)
     */
    getCurrentMod() {
        if (!this.currentMod) return null;
        const mod = this.mods.get(this.currentMod);
        if (!mod) return null;

        // Include directory handle if available
        return {
            ...mod,
            directoryHandle: this.modHandles.get(this.currentMod) || null
        };
    }

    /**
     * Get or request write access to current mod folder
     * Uses File System Access API
     * @returns {Promise<FileSystemDirectoryHandle|null>}
     */
    async getModDirectoryHandle() {
        if (!this.currentMod) return null;

        // Check if we already have a handle
        let handle = this.modHandles.get(this.currentMod);
        if (handle) {
            // Verify we still have permission
            const permission = await handle.queryPermission({ mode: 'readwrite' });
            if (permission === 'granted') return handle;

            // Try to request permission
            const request = await handle.requestPermission({ mode: 'readwrite' });
            if (request === 'granted') return handle;
        }

        // Need to get a new handle via showDirectoryPicker
        if (!this.supportsFileSystemAccess) {
            console.warn('File System Access API not supported');
            return null;
        }

        try {
            handle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            // Store the handle
            this.modHandles.set(this.currentMod, handle);
            return handle;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Failed to get directory handle:', err);
            }
            return null;
        }
    }

    /**
     * Set directory handle for a mod (used when creating new mods)
     * @param {string} modId - Mod ID
     * @param {FileSystemDirectoryHandle} handle - Directory handle
     */
    setModDirectoryHandle(modId, handle) {
        this.modHandles.set(modId, handle);
    }

    /**
     * Check if a mod has a file at the given path
     * @param {string} path - File path to check
     * @returns {boolean}
     */
    hasModFile(path) {
        if (!this.currentMod) return false;
        const modFileMap = this.modFiles.get(this.currentMod);
        if (!modFileMap) return false;

        const normalizedPath = path.replace(/\\/g, '/');

        // Check various path formats
        return modFileMap.has(normalizedPath) ||
               modFileMap.has('in_game/' + normalizedPath) ||
               modFileMap.has(normalizedPath.replace('game/in_game/', '')) ||
               modFileMap.has(normalizedPath.replace('game/', ''));
    }

    /**
     * Get a file from the current mod
     * @param {string} path - File path
     * @returns {File|null}
     */
    getModFile(path) {
        if (!this.currentMod) return null;
        const modFileMap = this.modFiles.get(this.currentMod);
        if (!modFileMap) return null;

        const normalizedPath = path.replace(/\\/g, '/');

        // Try various path formats
        const pathsToTry = [
            normalizedPath,
            'in_game/' + normalizedPath,
            normalizedPath.replace('game/in_game/', ''),
            normalizedPath.replace('game/', ''),
            normalizedPath.replace('game/in_game/', 'in_game/'),
        ];

        for (const p of pathsToTry) {
            if (modFileMap.has(p)) {
                return modFileMap.get(p);
            }
        }

        return null;
    }

    /**
     * Get all mod files for a directory path
     * @param {string} basePath - Base game path (e.g., 'game/in_game/common/religions')
     * @returns {Array} Array of {path, file} objects
     */
    getModFilesInDirectory(basePath) {
        if (!this.currentMod) return [];
        const modFileMap = this.modFiles.get(this.currentMod);
        if (!modFileMap) return [];

        const results = [];
        const normalizedBase = basePath.replace(/\\/g, '/').replace('game/', '');

        for (const [filePath, file] of modFileMap) {
            // Check if file matches the directory
            const normalizedFilePath = filePath.replace(/\\/g, '/');

            // Try matching with and without 'in_game' prefix
            const matchPaths = [
                normalizedBase,
                normalizedBase.replace('in_game/', ''),
                'in_game/' + normalizedBase.replace('in_game/', '')
            ];

            for (const matchPath of matchPaths) {
                if (normalizedFilePath.startsWith(matchPath + '/') ||
                    normalizedFilePath.startsWith(matchPath.replace('in_game/', '') + '/')) {
                    if (filePath.endsWith('.txt')) {
                        results.push({ path: filePath, file });
                    }
                    break;
                }
            }
        }

        return results;
    }

    /**
     * Read and parse a mod file
     * @param {string} path - File path
     * @returns {Promise<Object|null>} Parsed content or null
     */
    async readModFile(path) {
        const file = this.getModFile(path);
        if (!file) return null;

        try {
            const text = await file.text();
            return this.parser.parse(text);
        } catch (err) {
            console.error(`Error reading mod file ${path}:`, err);
            return null;
        }
    }

    /**
     * Merge mod data with base game data
     * @param {Object} baseData - Base game data
     * @param {Object} modData - Mod data to merge
     * @param {string} category - Category being merged
     * @returns {Object} Merged data
     */
    mergeData(baseData, modData, category) {
        if (!modData) return baseData;

        const merged = { ...baseData };

        for (const [key, value] of Object.entries(modData)) {
            if (key.startsWith('_')) continue;

            // Check for special mod commands
            if (key.startsWith('INJECT:') || key.startsWith('TRY_INJECT:')) {
                const targetKey = key.replace(/^(TRY_)?INJECT:/, '');
                if (merged[targetKey]) {
                    // Inject into existing object
                    merged[targetKey] = this._injectInto(merged[targetKey], value);
                    this._trackChange(category, targetKey, 'inject', baseData[targetKey], merged[targetKey]);
                }
            } else if (key.startsWith('REPLACE:') || key.startsWith('TRY_REPLACE:')) {
                const targetKey = key.replace(/^(TRY_)?REPLACE:/, '');
                if (merged[targetKey] || !key.startsWith('TRY_')) {
                    merged[targetKey] = value;
                    this._trackChange(category, targetKey, 'replace', baseData[targetKey], value);
                }
            } else if (key.startsWith('INJECT_OR_CREATE:')) {
                const targetKey = key.replace('INJECT_OR_CREATE:', '');
                if (merged[targetKey]) {
                    merged[targetKey] = this._injectInto(merged[targetKey], value);
                } else {
                    merged[targetKey] = value;
                }
                this._trackChange(category, targetKey, merged[targetKey] ? 'inject' : 'add', baseData[targetKey], merged[targetKey]);
            } else if (key.startsWith('REPLACE_OR_CREATE:')) {
                const targetKey = key.replace('REPLACE_OR_CREATE:', '');
                const changeType = merged[targetKey] ? 'replace' : 'add';
                merged[targetKey] = value;
                this._trackChange(category, targetKey, changeType, baseData[targetKey], value);
            } else {
                // Regular key - check if it's new or modified
                const isNew = !baseData[key];
                const isModified = !isNew && JSON.stringify(baseData[key]) !== JSON.stringify(value);

                if (typeof value === 'object' && value !== null) {
                    value._modded = true;
                    value._modSource = this.getCurrentMod()?.name || 'Unknown Mod';
                }

                merged[key] = value;

                if (isNew) {
                    this._trackChange(category, key, 'add', null, value);
                } else if (isModified) {
                    this._trackChange(category, key, 'modify', baseData[key], value);
                }
            }
        }

        return merged;
    }

    /**
     * Inject content into an existing object
     * @param {Object} target - Target object
     * @param {Object} source - Source content to inject
     * @returns {Object} Modified target
     */
    _injectInto(target, source) {
        if (typeof target !== 'object' || typeof source !== 'object') {
            return source;
        }

        const result = { ...target };
        for (const [key, value] of Object.entries(source)) {
            if (key.startsWith('_')) continue;
            if (typeof value === 'object' && typeof result[key] === 'object') {
                result[key] = this._injectInto(result[key], value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }

    /**
     * Track a change made by the mod
     * @param {string} category - Category
     * @param {string} key - Item key
     * @param {string} type - Change type
     * @param {*} original - Original value
     * @param {*} modded - Modded value
     */
    _trackChange(category, key, type, original, modded) {
        const changeKey = `${category}:${key}`;
        this.modChanges.set(changeKey, {
            category,
            key,
            type,
            original,
            modded,
            modName: this.getCurrentMod()?.name || 'Unknown'
        });
    }

    /**
     * Get all changes made by the current mod
     * @returns {Array} Array of change objects
     */
    getModChanges() {
        return Array.from(this.modChanges.values());
    }

    /**
     * Get changes for a specific category
     * @param {string} category - Category to filter by
     * @returns {Array} Array of changes for that category
     */
    getChangesForCategory(category) {
        return this.getModChanges().filter(c => c.category === category);
    }

    /**
     * Clear all loaded mods
     */
    clear() {
        this.mods.clear();
        this.modFiles.clear();
        this.modHandles.clear();
        this.currentMod = null;
        this.modChanges.clear();
    }
}

// Export for use in other modules
window.ModLoader = ModLoader;
