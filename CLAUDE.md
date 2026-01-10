# EU5 Inspector

A web-based read-only viewer for Europa Universalis 5 game definitions. Parses Paradox script files and displays them in a searchable, browsable interface.

## File Structure

```
EU5-Inspector/
├── index.html                 # Main HTML layout
├── css/styles.css             # Dark theme styling
├── js/
│   ├── app.js                 # Main application logic, filtering, routing
│   ├── parser.js              # Paradox script parser
│   ├── loader.js              # File system access (folder picker)
│   └── components/
│       ├── filters.js         # 3-state filter chips (neutral/include/exclude)
│       ├── item-card.js       # Card rendering for items
│       ├── detail-view.js     # Detail panel for selected items
│       ├── sidebar.js         # Category sidebar navigation
│       └── search.js          # Debounced search input
└── tests/
    ├── test-suite.html        # Browser-based visual test suite
    ├── test-parser.js         # Node.js CLI parser tests
    └── test-tree.js           # Node.js CLI tech tree tests
```

## Architecture

### Data Flow
```
User selects EU5 folder
  → loader.js indexes files
  → parser.js converts Paradox script to JS objects
  → app.js stores in this.items[category]
  → filters.js + search.js filter items
  → item-card.js renders grid
```

### Key Components

| Component | Responsibility |
|-----------|---------------|
| `parser.js` | Tokenizes Paradox script: key=value, nested blocks, arrays, rgb/hsv colors, dates |
| `loader.js` | Uses `webkitdirectory` input for folder selection, validates EU5 structure |
| `app.js` | Category navigation, tech tree view, filter coordination |
| `filters.js` | 3-state toggles with ANY/ALL match modes |
| `item-card.js` | Recursive property rendering with type-based coloring |

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
- `advances/` - Tech tree (uses `requires` for dependencies, `depth = 0` for roots)
- `religions/`, `cultures/`, `building_types/`, `government_types/`, etc.

The tech tree viewer filters out country-specific advances (those with `potential` blocks).

## Testing

### Test-First Development

**IMPORTANT:** When debugging, making changes, or extending functionality:
1. **Run existing tests first** to understand current behavior
2. **Add/update tests** for the functionality being changed
3. **Run tests after changes** to verify fixes and catch regressions

### Node.js CLI Tests (Preferred for Development)

Run from project root:
```bash
# Parser unit tests (no EU5 folder needed)
node tests/test-parser.js

# Parser + file tests (with EU5 folder)
node tests/test-parser.js "C:\Path\To\EU5"

# Tech tree tests (requires EU5 folder)
node tests/test-tree.js "C:\Path\To\EU5"
```

### Browser Tests

Open `tests/test-suite.html` in browser:
1. Click "Load EU5 Folder" and select your EU5 game directory
2. Click "Run All Tests" or individual test buttons
3. Tests include: Parser, Tree Builder, Filtering, Visual Layout

### Test Categories

| Test File | What It Tests |
|-----------|---------------|
| `tests/test-parser.js` | Paradox script parsing: key-value, nested blocks, arrays, colors, dates |
| `tests/test-tree.js` | Tech tree: filtering, requirements extraction, orphan detection, connectivity |
| `tests/test-suite.html` | All above + visual layout tests in browser |

### When to Add Tests

- **Bug fixes**: Add a test that reproduces the bug before fixing
- **New filters**: Add filtering tests in `runFilteringTests()`
- **Parser changes**: Add unit tests in `runParserTests()`
- **Tree logic changes**: Add tests in `test-tree.js`

## Conventions

- Dark theme with CSS variables (--bg-primary, --accent, --val-str, etc.)
- Value types color-coded: strings=green, numbers=yellow, booleans=blue/red, dates=purple
- HTML escaping in item-card.js for security
- No external dependencies - vanilla JS only
