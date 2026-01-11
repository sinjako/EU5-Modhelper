/**
 * Mod Creator for EU5 ModHelper
 * Creates new mod folder structures with proper metadata
 */

class ModCreator {
    constructor() {
        this.supportsFileSystemAccess = 'showDirectoryPicker' in window;
    }

    /**
     * Generate mod ID from name
     */
    generateId(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
    }

    /**
     * Create metadata.json content
     */
    createMetadata(config) {
        return JSON.stringify({
            name: config.name,
            id: config.id,
            version: config.version,
            supported_game_version: config.gameVersion,
            short_description: config.description,
            tags: config.tags || [],
            relationships: [],
            game_custom_data: {
                multiplayer_synchronized: true
            }
        }, null, 4);
    }

    /**
     * Create descriptor.mod content (Paradox format)
     */
    createDescriptor(config, modPath = null) {
        const tags = config.tags && config.tags.length > 0
            ? config.tags.map(t => `\t"${t}"`).join('\n')
            : '\t"Gameplay"';

        return `version="${config.version}"
tags={
${tags}
}
name="${config.name}"
supported_version="${config.gameVersion}"
${modPath ? `path="${modPath.replace(/\\/g, '/')}"` : ''}
`;
    }

    /**
     * Create a README file for the mod
     */
    createReadme(config) {
        return `# ${config.name}

${config.description || 'A mod for Europa Universalis V.'}

## Version
${config.version}

## Supported Game Version
${config.gameVersion}

## Installation
1. Copy this folder to your EU5 mods directory:
   \`Documents/Paradox Interactive/Europa Universalis V/mod/\`
2. Enable the mod in the game launcher

## Folder Structure
\`\`\`
${config.id}/
├── .metadata/
│   └── metadata.json
├── descriptor.mod
${config.folders.includes('common') ? '├── in_game/\n│   └── common/\n' : ''}${config.folders.includes('events') ? '├── in_game/\n│   └── events/\n' : ''}${config.folders.includes('localization') ? '├── in_game/\n│   └── localization/\n' : ''}${config.folders.includes('gfx') ? '├── in_game/\n│   └── gfx/\n' : ''}${config.folders.includes('gui') ? '├── in_game/\n│   └── gui/\n' : ''}└── README.md
\`\`\`

## Created with EU5 ModHelper
`;
    }

    /**
     * Get list of files to create
     * @param {Object} config - Mod configuration
     * @param {string} modPath - Full path to mod folder (optional, for descriptor.mod)
     */
    getFileList(config, modPath = null) {
        const files = [
            { path: '.metadata/metadata.json', content: this.createMetadata(config) },
            { path: 'descriptor.mod', content: this.createDescriptor(config, modPath) },
            { path: 'README.md', content: this.createReadme(config) }
        ];

        // Add folder placeholder files
        if (config.folders.includes('common')) {
            files.push({
                path: 'in_game/common/.gitkeep',
                content: '# Add your common files here\n'
            });
        }
        if (config.folders.includes('events')) {
            files.push({
                path: 'in_game/events/.gitkeep',
                content: '# Add your event files here\n'
            });
        }
        if (config.folders.includes('localization')) {
            files.push({
                path: 'in_game/localization/.gitkeep',
                content: '# Add your localization files here\n'
            });
            files.push({
                path: 'in_game/localization/english/.gitkeep',
                content: '# English localization files\n'
            });
        }
        if (config.folders.includes('gfx')) {
            files.push({
                path: 'in_game/gfx/.gitkeep',
                content: '# Add your graphics files here\n'
            });
        }
        if (config.folders.includes('gui')) {
            files.push({
                path: 'in_game/gui/.gitkeep',
                content: '# Add your GUI files here\n'
            });
        }

        return files;
    }

    /**
     * Create mod using File System Access API (if supported)
     */
    async createModWithFSA(config) {
        try {
            // Let user pick where to save
            const dirHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            // Create mod folder
            const modFolder = await dirHandle.getDirectoryHandle(config.id, { create: true });

            // Create all files
            const files = this.getFileList(config);
            for (const file of files) {
                await this.writeFileToHandle(modFolder, file.path, file.content);
            }

            return { success: true, method: 'filesystem', path: config.id, handle: modFolder };
        } catch (err) {
            if (err.name === 'AbortError') {
                return { success: false, cancelled: true };
            }
            // Check for permission/security errors
            if (err.name === 'NotAllowedError' || err.message.includes('system') || err.message.includes('protected')) {
                throw new Error(
                    'Cannot write to this folder (protected by your browser).\n\n' +
                    'Select your USER mods folder:\n' +
                    'Documents/Paradox Interactive/Europa Universalis V/mod/\n\n' +
                    'The game will NOT load mods from the installation folder!'
                );
            }
            console.error('FSA Error:', err);
            throw err;
        }
    }

    /**
     * Write a file to a directory handle, creating subdirectories as needed
     */
    async writeFileToHandle(dirHandle, path, content) {
        const parts = path.split('/');
        const fileName = parts.pop();

        // Navigate/create subdirectories
        let currentDir = dirHandle;
        for (const part of parts) {
            currentDir = await currentDir.getDirectoryHandle(part, { create: true });
        }

        // Create and write file
        const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    }

    /**
     * Create mod as downloadable zip file (fallback)
     */
    async createModAsDownload(config) {
        const files = this.getFileList(config);

        // Create a simple download of individual files
        // For a proper implementation, you'd want to use JSZip library
        // For now, we'll create a data URL with instructions

        const structure = files.map(f => `${config.id}/${f.path}`).join('\n');

        // Download metadata.json
        this.downloadFile(
            `${config.id}_metadata.json`,
            this.createMetadata(config),
            'application/json'
        );

        // Download descriptor.mod
        setTimeout(() => {
            this.downloadFile(
                `${config.id}_descriptor.mod`,
                this.createDescriptor(config),
                'text/plain'
            );
        }, 500);

        // Download README
        setTimeout(() => {
            this.downloadFile(
                `${config.id}_README.md`,
                this.createReadme(config),
                'text/markdown'
            );
        }, 1000);

        return {
            success: true,
            method: 'download',
            message: `Downloaded mod files. Create folder structure:\n\n${structure}`
        };
    }

    /**
     * Download a file
     */
    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Create a new mod
     */
    async createMod(config) {
        // Validate
        if (!config.name || !config.id) {
            throw new Error('Mod name and ID are required');
        }

        // Try File System Access API first, fall back to download
        if (this.supportsFileSystemAccess) {
            try {
                return await this.createModWithFSA(config);
            } catch (err) {
                console.warn('FSA failed, falling back to download:', err);
                return await this.createModAsDownload(config);
            }
        } else {
            return await this.createModAsDownload(config);
        }
    }
}

window.ModCreator = ModCreator;
