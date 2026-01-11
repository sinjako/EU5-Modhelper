# EU5 ModHelper

A web-based viewer and editor for Europa Universalis 5 game definitions. Parses Paradox script files, displays them in a searchable interface, and allows creating/editing mods.

## File Structure

```
EU5-ModHelper/
├── index.html                 # Main HTML layout
├── css/styles.css             # Dark theme styling
├── js/
│   ├── app.js                 # Main application logic, filtering, routing, editing
│   ├── parser.js              # Paradox script parser
│   ├── loader.js              # File system access (folder picker)
│   ├── mod-loader.js          # Mod detection, loading, and change tracking
│   ├── mod-writer.js          # Writes mod files in Paradox format
│   ├── mod-creator.js         # Creates new mod folder structures
│   ├── category-registry.js   # Category definitions and paths
│   ├── reference-manager.js   # Cross-reference management
│   └── handlers/              # Category-specific handlers
│       ├── base-handler.js
│       ├── default-handler.js
│       ├── advances-handler.js
│       ├── mod-changes-handler.js
│       └── ...
└── tests/
    ├── test-suite.html        # Browser-based visual test suite
    ├── test-utils.js          # Test framework and utilities
    ├── test-parser.js         # Parser tests (130+ tests)
    ├── test-mod-writer.js     # ModWriter serialization tests
    ├── test-mod-creator.js    # ModCreator tests
    ├── test-integration.js    # Round-trip and workflow tests
    └── run-all-tests.js       # Unified test runner for all suites
```

## Architecture

### Data Flow
```
User selects EU5 folder
  → loader.js indexes game files
  → mod-loader.js auto-detects mods in EU5/mod/ folder
  → parser.js converts Paradox script to JS objects
  → app.js stores in this.items[category]
  → mod-loader.js merges mod changes, tracks modifications
  → filters.js + search.js filter items
  → item-card.js renders grid with mod indicators

User edits items
  → app.js tracks in pendingEdits
  → mod-writer.js generates Paradox script with REPLACE: prefix
  → Files saved with UTF-8 BOM encoding
```

### Key Components

| Component | Responsibility |
|-----------|---------------|
| `parser.js` | Tokenizes Paradox script: key=value, nested blocks, arrays, rgb/hsv colors, dates |
| `loader.js` | Uses `webkitdirectory` input for folder selection, validates EU5 structure |
| `mod-loader.js` | Detects mods, loads mod files, tracks changes, manages mod selection |
| `mod-writer.js` | Generates Paradox script with REPLACE:/INJECT: prefixes, UTF-8 BOM |
| `mod-creator.js` | Creates mod folder structures with metadata.json and descriptor.mod |
| `app.js` | Category navigation, editing UI, filter coordination, mod saving |

## EU5 Modding Requirements

**CRITICAL**: EU5 has specific requirements for mods to work:

1. **File Encoding**: All mod files MUST be UTF-8 with BOM (`\uFEFF` at start)
2. **Override Syntax**: Use `REPLACE:key_name = { }` to override existing game definitions
3. **New Content**: New items can use regular `key_name = { }` syntax
4. **Inject Syntax**: Use `INJECT:key_name = { }` to add properties to existing definitions
5. **Mod Registration**: Mods must be listed in `playsets.json` to be loaded by the game

### Mod Folder Structure
```
Documents/Paradox Interactive/Europa Universalis V/mod/your_mod/
├── .metadata/
│   └── metadata.json          # Required: name, id, version, tags
├── descriptor.mod             # Optional: version, name, tags, supported_version
├── in_game/
│   └── common/
│       └── goods/
│           └── goods_modhelper.txt   # Your changes
└── README.md
```

### playsets.json Registration
Mods are enabled via `Documents/Paradox Interactive/Europa Universalis V/playsets.json`:
```json
{
  "orderedListMods": [{
    "path": "C:/Users/.../mod/your_mod/",
    "isEnabled": true
  }]
}
```

## Paradox Script Format

The parser handles this syntax:
```
object_name = {
    property = value           # Key-value
    number = 123               # Numbers (including negative, decimals)
    bool_yes = yes             # Booleans
    bool_no = no
    color = rgb { 32 33 79 }   # RGB colors
    color2 = hsv { 0.5 0.8 0.9 }  # HSV colors
    date = 1444.11.11          # Dates
    nested = { inner = value } # Nested blocks
    list = { a b c }           # Arrays
    # This is a comment
}
```

## EU5 Game Structure

Game definitions are in `game/in_game/common/` with 104+ subfolders:
- `advances/` - Technology/research tree
- `religions/`, `cultures/`, `building_types/`, `government_types/`, etc.

GUI files are in `game/in_game/gui/` with `.gui` extension.
Graphics definitions are in `game/in_game/gfx/`.

## Testing

### Test-First Development

**IMPORTANT:** When debugging, making changes, or extending functionality:
1. **Run existing tests first** to understand current behavior
2. **Add/update tests** for the functionality being changed
3. **Run tests after changes** to verify fixes and catch regressions

### Node.js CLI Tests (Preferred for Development)

Run from project root:
```bash
# Run all test suites
node tests/run-all-tests.js

# Run with EU5 folder for file integration tests
node tests/run-all-tests.js "C:\Path\To\EU5"

# Individual test suites
node tests/test-parser.js              # Parser tests (41 tests)
node tests/test-mod-writer.js          # ModWriter tests (40 tests)
node tests/test-mod-creator.js         # ModCreator tests (29 tests)
node tests/test-integration.js         # Integration tests (20 tests)
```

### Browser Tests

Open `tests/test-suite.html` in browser:
1. Parser, ModWriter, and ModCreator tests run automatically on load
2. Click "Load EU5 Folder" for file-based tests
3. Click "Run All Tests" or individual test buttons

### Test Coverage

| Test File | What It Tests | Test Count |
|-----------|--------------|------------|
| `test-parser.js` | Parsing: values, blocks, arrays, colors, dates, operators | 41 |
| `test-mod-writer.js` | Serialization: all types, REPLACE: prefix, category paths | 40 |
| `test-mod-creator.js` | Mod creation: ID generation, metadata, descriptors, file lists | 29 |
| `test-integration.js` | Round-trip (parse→serialize→parse), workflows, category registry | 20 |
| **Total** | | **130** |

### When to Add Tests

- **Bug fixes**: Add a test that reproduces the bug before fixing
- **New features**: Add tests for new functionality
- **Parser changes**: Add unit tests covering the new syntax
- **Serialization changes**: Add round-trip tests to ensure correctness

## Conventions

- Dark theme with CSS variables (--bg-primary, --accent, --val-str, etc.)
- Value types color-coded: strings=green, numbers=yellow, booleans=blue/red, dates=purple
- HTML escaping for security
- No external dependencies - vanilla JS only
- Items modified by mods show a purple "Mod" indicator
- Pending edits show an orange "Edited" indicator
