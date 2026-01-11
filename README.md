# EU5 ModHelper

A browser-based tool for viewing, editing, and creating mods for Europa Universalis V. No installation required - just open `index.html` in your browser.

## Features

- **Browse Game Data** - View all game definitions (goods, religions, cultures, advances, buildings, etc.) in a searchable, filterable interface
- **Edit Items** - Modify game values directly, and see the totality of your staged changes.
- **Create Mods** - Generate properly structured mod folders with all required metadata
- **Save Changes** - Write modifications to mod files with correct EU5 formatting (UTF-8 BOM, REPLACE: prefix)
- **Load Existing Mods** - Auto-detects mods in your EU5 mod folder and shows which items are modded
- **Dark Theme** - Easy on the eyes for long modding sessions

## Quick Start

1. Download or clone this repository
2. Open `index.html` in a modern browser (Chrome or Edge recommended)
3. Follow the workflow below to start modding

## Workflow Tutorial

### Step 1: Load the EU5 Game Folder

1. Click **"Load EU5 Folder"** in the header
2. Navigate to and select your Europa Universalis V installation directory
   - Steam default: `C:\Program Files (x86)\Steam\steamapps\common\Europa Universalis V`
   - The folder should contain a `game` subfolder
3. Wait for the game data to load - you'll see categories populate in the sidebar

### Step 2: Browse and Find Items to Edit

1. Use the **sidebar** to navigate between categories (Goods, Religions, Buildings, etc.)
2. Use the **search bar** to find specific items by name
3. Use **filters** to narrow down results by type or properties
4. Click any **item card** to view its full details
5. Items with a purple **"Mod"** badge are already modified by a loaded mod

### Step 3: Set Up Your Mod

Before you can save changes, you need a mod folder:

**Option A: Create a New Mod**
1. Click **"Create Mod"** in the header
2. Enter a name for your mod (e.g., "My Balance Changes")
3. The tool creates the proper folder structure automatically in your EU5 user directory

**Option B: Load an Existing Mod**
1. Click **"Load Mod Folder"** in the header
2. Navigate to your mod folder in:
   `Documents/Paradox Interactive/Europa Universalis V/mod/your_mod/`
3. Select the mod's root folder (the one containing `.metadata/`)

### Step 4: Edit Items

1. Click on an item to open its detail view
2. Click the **"Edit"** button to enter edit mode
3. Click on any **value** to modify it (numbers, strings, booleans, etc.)
4. Your changes are tracked - edited items show an orange **"Edited"** badge
5. Click **"Done Editing"** when finished with an item

### Step 5: Review Your Changes

1. Go to the **"Mod Changes"** category in the sidebar
2. Review all pending edits before saving
3. You can continue editing or remove changes you don't want

### Step 6: Save to Disk

**Important:** Changes are NOT automatically saved - you must explicitly save them.

1. Click **"Save to Mod"** in the header
2. Grant file system write permission if prompted by your browser
3. The tool writes your changes to the mod folder with:
   - Correct UTF-8 BOM encoding
   - Proper `REPLACE:` prefix for overrides
   - Organized file structure matching EU5 conventions

### Step 7: Enable Your Mod in EU5

1. Launch Europa Universalis V
2. Go to the **Mod Manager** / **Playset** screen
3. Enable your mod in the active playset
4. Start a new game to see your changes

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
