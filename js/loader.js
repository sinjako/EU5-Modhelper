/**
 * File Loader for EU5 Inspector
 * Uses webkitdirectory input for cross-platform folder selection
 */

class FileLoader {
    constructor() {
        this.files = new Map(); // path -> File object
        this.parser = new ParadoxParser();
        this.cache = new Map();
        this.folderName = '';
        this.fileInput = null;
        this._createFileInput();
    }

    /**
     * Create hidden file input element
     */
    _createFileInput() {
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.webkitdirectory = true;
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);
    }

    /**
     * Prompt user to select the EU5 folder
     * @returns {Promise<boolean>} Whether selection was successful
     */
    selectFolder() {
        return new Promise((resolve) => {
            this.fileInput.onchange = (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) {
                    resolve(false);
                    return;
                }

                this.files.clear();
                this.cache.clear();

                // Get folder name from first file's path
                const firstPath = files[0].webkitRelativePath;
                this.folderName = firstPath.split('/')[0];

                // Index all files by their relative path (without root folder name)
                for (const file of files) {
                    const fullPath = file.webkitRelativePath;
                    // Remove the root folder name from path
                    const relativePath = fullPath.substring(this.folderName.length + 1);
                    this.files.set(relativePath, file);
                }

                console.log(`Loaded ${this.files.size} files from ${this.folderName}`);
                resolve(true);
            };

            // Reset and trigger
            this.fileInput.value = '';
            this.fileInput.click();
        });
    }

    /**
     * Get files matching a path pattern
     * @param {string} path - Directory path
     * @param {string} extension - File extension filter
     * @returns {Array} Array of {path, file} objects
     */
    getFilesInDirectory(path, extension = '.txt') {
        const results = [];
        const normalizedPath = path.replace(/\\/g, '/');

        for (const [filePath, file] of this.files) {
            // Check if file is in this directory (not subdirectory)
            if (filePath.startsWith(normalizedPath + '/')) {
                const remainder = filePath.substring(normalizedPath.length + 1);
                // Only direct children (no more slashes)
                if (!remainder.includes('/') && filePath.endsWith(extension)) {
                    results.push({ path: filePath, file });
                }
            }
        }

        return results.sort((a, b) => a.path.localeCompare(b.path));
    }

    /**
     * Read a single file and parse it
     * @param {string} path - Relative path from root
     * @returns {Promise<Object>} Parsed file content
     */
    async readFile(path) {
        const normalizedPath = path.replace(/\\/g, '/');

        if (this.cache.has(normalizedPath)) {
            return this.cache.get(normalizedPath);
        }

        const file = this.files.get(normalizedPath);
        if (!file) {
            console.error(`File not found: ${normalizedPath}`);
            return null;
        }

        try {
            const text = await file.text();
            const parsed = this.parser.parse(text);
            this.cache.set(normalizedPath, parsed);
            return parsed;
        } catch (err) {
            console.error(`Error reading file ${path}:`, err);
            return null;
        }
    }

    /**
     * Read all script files from a directory
     * @param {string} path - Relative path from root
     * @param {string|Array} extensions - File extension(s) to read (default: .txt)
     * @returns {Promise<Object>} Combined parsed content from all files
     */
    async readDirectory(path, extensions = '.txt') {
        // Support multiple extensions
        const extList = Array.isArray(extensions) ? extensions : [extensions];
        let allFiles = [];
        for (const ext of extList) {
            allFiles = allFiles.concat(this.getFilesInDirectory(path, ext));
        }
        const combined = {};

        for (const { file } of allFiles) {
            try {
                const text = await file.text();
                const parsed = this.parser.parse(text);

                // Extract age/era from filename (e.g., "00_age_1_traditions.txt" -> "age_1_traditions")
                const filename = file.name.replace('.txt', '');
                const ageMatch = filename.match(/age_\d+_\w+/);
                const fileAge = ageMatch ? ageMatch[0] : null;

                // Merge parsed content
                for (const [key, value] of Object.entries(parsed)) {
                    if (key.startsWith('_')) continue;
                    // Attach source file info
                    if (typeof value === 'object' && value !== null) {
                        value._sourceFile = filename;
                        if (fileAge && !value.age && !value.era) {
                            value._fileAge = fileAge;
                        }
                    }
                    combined[key] = value;
                }
            } catch (err) {
                console.error(`Error reading ${file.name}:`, err);
            }
        }

        return combined;
    }

    /**
     * Check if the selected folder appears to be EU5
     * @returns {boolean} Whether this looks like an EU5 installation
     */
    validateEU5Folder() {
        if (this.files.size === 0) {
            return false;
        }

        // Check for expected EU5 paths
        let hasGame = false;
        let hasClausewitz = false;

        for (const path of this.files.keys()) {
            if (path.startsWith('game/')) hasGame = true;
            if (path.startsWith('clausewitz/')) hasClausewitz = true;
            if (hasGame && hasClausewitz) return true;
        }

        return hasGame && hasClausewitz;
    }

    /**
     * Get the folder name
     * @returns {string} Name of the selected folder
     */
    getFolderName() {
        return this.folderName;
    }
}

// Export for use in other modules
window.FileLoader = FileLoader;
