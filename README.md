# EU5 ModHelper

A browser-based tool for viewing, editing, and creating mods for Europa Universalis V. No installation required - just open `index.html` in your browser.

## Features

- **Browse Game Data** - View all game definitions (goods, religions, cultures, advances, buildings, etc.) in a searchable, filterable interface
- **Edit Items** - Modify game values directly and see changes in real-time
- **Create Mods** - Generate properly structured mod folders with all required metadata
- **Save Changes** - Write modifications to mod files with correct EU5 formatting (UTF-8 BOM, REPLACE: prefix)
- **Load Existing Mods** - Auto-detects mods in your EU5 mod folder and shows which items are modded
- **Dark Theme** - Easy on the eyes for long modding sessions

## Quick Start

1. Download or clone this repository
2. Open `index.html` in a modern browser (Chrome, Edge, or Firefox recommended)
3. Click "Load EU5 Folder" and select your Europa Universalis V game directory
4. Browse categories in the sidebar, search and filter items
5. Click any item to view details, click "Edit" to modify values
6. Create a new mod or load an existing one to save your changes

## Screenshots

### Main Interface
Browse game definitions with search and filters. Items modified by mods show a purple indicator.

### Editing
Click any value to edit it. Changes are tracked and can be saved to your mod.

### Mod Creation
Create new mods with proper folder structure, metadata, and descriptor files.

## Supported Categories

### Core Gameplay
| Category | Description |
|----------|-------------|
| Religions | Religious definitions, holy sites, and modifiers |
| Cultures | Cultural groups, traditions, and language |
| Languages | Language definitions |

### Government & Politics
| Category | Description |
|----------|-------------|
| Government Types | Government forms and mechanics |
| Laws | Legal systems and reforms |
| Estates | Estate definitions and privileges |
| Succession | Heir selection and election rules |

### Economy & Buildings
| Category | Description |
|----------|-------------|
| Buildings | Building types, costs, and effects |
| Goods | Trade goods and resources |
| Pops | Population types and roles |
| Institutions | Institution spread and effects |

### Military & Diplomacy
| Category | Description |
|----------|-------------|
| Units | Military unit types and stats |
| Casus Belli | War justifications and goals |
| Subjects | Subject nation types and rules |
| Organizations | International organizations |

### Geography & Map
| Category | Description |
|----------|-------------|
| Climates | Climate types and effects |
| Vegetation | Vegetation and terrain features |
| Terrain | Topography definitions |
| Locations | Province templates |
| Regions | Map region definitions |

### Modifiers & Scripting
| Category | Description |
|----------|-------------|
| Modifiers | Modifier type definitions |
| Static Modifiers | Permanent modifier effects |

### Characters & Misc
| Category | Description |
|----------|-------------|
| Traits | Character trait definitions |
| Events | Game events and triggers |
| Advances | Technology/research tree |
| Disasters | Disaster definitions |
| Formables | Formable nation requirements |

### Graphics & UI
| Category | Description |
|----------|-------------|
| GFX Cultures | Graphical culture types |
| GUI | User interface definitions |

### Mod Tools
| Category | Description |
|----------|-------------|
| Mod Changes | View all changes made by loaded mods |

## How Modding Works

EU5 has specific requirements for mods:

1. **File Encoding**: All mod files must be UTF-8 with BOM
2. **Override Syntax**: Use `REPLACE:item_name` to override existing game definitions
3. **Mod Registration**: Mods must be in the correct folder structure

ModHelper handles all of this automatically when you save changes.

### Mod Folder Structure
```
Documents/Paradox Interactive/Europa Universalis V/mod/your_mod/
├── .metadata/
│   └── metadata.json      # Required: mod info for launcher
├── descriptor.mod         # Mod descriptor
├── in_game/
│   └── common/
│       └── goods/
│           └── goods_yourmod.txt   # Your changes
└── README.md
```

## Development

### Project Structure
```
EU5-ModHelper/
├── index.html              # Main application
├── css/styles.css          # Dark theme styling
├── js/
│   ├── app.js              # Main application logic
│   ├── parser.js           # Paradox script parser
│   ├── loader.js           # File system access
│   ├── mod-loader.js       # Mod detection and loading
│   ├── mod-writer.js       # Writes mod files
│   ├── mod-creator.js      # Creates mod structures
│   └── category-registry.js # Category definitions
└── tests/                  # Test suite (130+ tests)
```

### Running Tests

```bash
# Run all tests (Node.js)
node tests/run-all-tests.js

# Or open tests/test-suite.html in browser
```

### Tech Stack

- Vanilla JavaScript (no frameworks or dependencies)
- File System Access API for reading/writing files
- CSS Grid for responsive layouts

## Browser Compatibility

- Chrome/Edge 86+ (full support with File System Access API)
- Firefox 111+ (read-only, no save support)
- Safari (not tested)

## Known Limitations

- Cannot preview `.dds` texture files (displays as text references)
- Some complex nested structures may not render perfectly
- File System Access API requires user interaction for each folder access

## Contributing

Contributions are welcome! Please:

1. Run the test suite before submitting changes
2. Add tests for new functionality
3. Follow the existing code style (vanilla JS, no dependencies)

## License

MIT License - feel free to use, modify, and distribute.

## Acknowledgments

- Paradox Interactive for Europa Universalis V
- The EU5 modding community for documentation and examples
