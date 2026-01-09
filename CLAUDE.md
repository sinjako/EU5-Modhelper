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
├── tests/test-suite.html      # Browser-based visual test suite
├── test-parser.js             # Node.js CLI parser tests
└── test-tree.js               # Node.js CLI tech tree tests
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

**Browser tests:** Open `tests/test-suite.html`, click "Load EU5 Folder"

**Node.js tests:**
```bash
node test-parser.js "C:\Path\To\EU5"
node test-tree.js "C:\Path\To\EU5"
```

## Conventions

- Dark theme with CSS variables (--bg-primary, --accent, --val-str, etc.)
- Value types color-coded: strings=green, numbers=yellow, booleans=blue/red, dates=purple
- HTML escaping in item-card.js for security
- No external dependencies - vanilla JS only
