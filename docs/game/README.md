# EU5 Game Data Reference

Documentation for Europa Universalis V game definition files. This reference is designed to help understand the game's data structures for building the EU5 Inspector viewer and future modding tools.

## Game Location

Default Steam install: `C:\Program Files (x86)\Steam\steamapps\common\Europa Universalis V\`

## Documentation Index

### Core References

| Document | Description |
|----------|-------------|
| [FOLDER-STRUCTURE.md](FOLDER-STRUCTURE.md) | Complete game folder hierarchy |
| [COMMON-FOLDERS.md](COMMON-FOLDERS.md) | All 110 common/ subfolders inventory |
| [CROSS-REFERENCES.md](CROSS-REFERENCES.md) | How objects reference each other |
| [SYNTAX.md](SYNTAX.md) | Paradox script syntax reference |

### Category Documentation

| Document | Categories Covered |
|----------|-------------------|
| [categories/advances.md](categories/advances.md) | Technology trees, ages, unlocks |
| [categories/ADVANCES-DETAILED.md](categories/ADVANCES-DETAILED.md) | Complete advances technical reference |
| [categories/religions.md](categories/religions.md) | Religions, religion groups |
| [categories/cultures.md](categories/cultures.md) | Cultures, culture groups, languages, ethnicities |
| [categories/governments.md](categories/governments.md) | Government types, reforms, heir selections |
| [categories/buildings.md](categories/buildings.md) | Building types, categories, production methods |
| [categories/goods.md](categories/goods.md) | Trade goods, demand systems |
| [categories/pops-estates.md](categories/pops-estates.md) | Population types, estates |
| [categories/units.md](categories/units.md) | Unit types, categories, military |
| [categories/diplomacy.md](categories/diplomacy.md) | Casus belli, subject types, international organizations |
| [categories/laws.md](categories/laws.md) | Laws, policies |
| [categories/disasters.md](categories/disasters.md) | Disasters, situations |
| [categories/scripting.md](categories/scripting.md) | Script values, triggers, effects, traits |
| [categories/events.md](categories/events.md) | Events, DHE, disaster chains, situations |

## Quick Stats

| Metric | Count |
|--------|-------|
| Common subfolders | 110 |
| Total definition files | 1,600+ |
| Event files | 318 |
| Events | 1,000+ |
| Advances (technologies) | ~2,590 |
| Religions | 80+ |
| Cultures | 500+ |
| Buildings | 200+ |
| Goods | 70+ |

## Key Concepts

### Definition Files
All game data is stored in `.txt` files using Paradox script syntax. Files are UTF-8 encoded and use a consistent key-value block structure.

### Cross-References
Categories frequently reference each other:
- Religions reference religion_groups
- Cultures reference culture_groups and languages
- Buildings reference pop_types and goods
- Advances reference other advances (tech tree dependencies)
- Units reference goods (construction/maintenance)

### Scopes
Script blocks operate within "scopes" (country, character, location, etc.). Scope determines which properties and effects are available.

### Triggers vs Effects
- **Triggers**: Conditions that evaluate to true/false
- **Effects**: Actions that modify game state

## Inspector Implementation Notes

### Currently Supported
- Advances (tech tree view)
- Religions
- Cultures
- Buildings
- Government types
- Basic filtering and search

### Planned Categories
All 110 common subfolders can potentially be browsed. Priority for Inspector support:
1. Laws and policies (political system)
2. Subject types (diplomacy)
3. International organizations (HRE, churches)
4. Disasters and situations (events)
5. Traits (characters)

### Parser Considerations
- Colors: `rgb { r g b }` and `hsv { h s v }` formats
- Dates: `YYYY.M.D` format (e.g., `1444.11.11`)
- References: String references to other definitions
- Operators: `>`, `>=`, `<`, `<=`, `=` in trigger blocks
- Lists: Space-separated values in braces `{ a b c }`
