# EU5 Inspector - Development Reference

## Project Overview

EU5 Inspector is a web-based read-only viewer for Europa Universalis 5 game definitions. It parses Paradox script files and displays them in a searchable, browsable interface with filtering capabilities.

**Key Features:**
- Folder picker for EU5 installation (works from file:// protocol)
- Category-based browsing (Religions, Cultures, Buildings, etc.)
- 3-state filters (neutral/include/exclude) with ANY/ALL match modes
- Tech tree view for advances
- Grid-based card display with full property details

---

## EU5 Game Structure

### Root Directory
```
Europa Universalis V/
├── binaries/           # Compiled executables
├── clausewitz/         # Clausewitz engine files
├── jomini/             # Jomini engine components
├── game/               # Main game content
│   ├── in_game/        # Core game data
│   ├── loading_screen/ # Loading screen assets
│   ├── main_menu/      # Main menu assets
│   └── dlc/            # DLC content
└── platform_specific_game_data/
```

### game/in_game/common/ - Definition Files

**104 subfolders** containing 1,631+ definition files. Key categories:

| Folder | Description | Example Content |
|--------|-------------|-----------------|
| `advances/` | Technology/advancement trees | Ages, unlocks, modifiers |
| `age/` | Age definitions | age_of_discovery, reformation |
| `building_types/` | Building definitions (43 files) | Categories, production methods |
| `cultures/` | Culture definitions (100+ files) | Languages, groups, opinions |
| `culture_groups/` | Culture group classifications | European, Asian groups |
| `religions/` | Religion definitions | buddhist, christian, dharmic |
| `religion_groups/` | Religion family groupings | islam, christianity |
| `government_types/` | Government systems | monarchy, republic, theocracy |
| `government_reforms/` | Reform mechanics | Constitutional changes |
| `goods/` | Trade commodities | grain, cloth, iron |
| `traits/` | Character traits (7 files) | ruler, general, admiral traits |
| `unit_types/` | Military units | infantry, cavalry, ships |
| `laws/` | Legal system definitions | Succession, taxation laws |
| `policies/` | Country policies | Military, economic policies |
| `estates/` | Social classes | nobles, burghers, clergy |
| `pop_types/` | Population types | nobles, farmers, slaves |
| `casus_belli/` | War justifications | Conquest, liberation |
| `subject_types/` | Subject states | vassal, tributary, colony |
| `disasters/` | Crisis definitions | Revolt, famine |
| `institution/` | Institution definitions | printing_press, enlightenment |
| `missions/` | Country-specific missions | Nation-based mission trees |
| `events/` | Event trigger definitions | on_action events |
| `formable_countries/` | Formable nations | Prussia, Italy, Germany |
| `languages/` | Language definitions | indo_european, semitic |
| `language_families/` | Language family groups | Language classifications |
| `ethnicities/` | Ethnic group definitions | Visual/genetic groups |
| `heirs_selections/` | Succession mechanics | 20+ types: primogeniture, elective |
| `international_organizations/` | IOs | HRE, Catholic Church, Shogunate |
| `climates/` | Climate types | tropical, arid, temperate |
| `script_values/` | Script value definitions | Reusable numeric values |
| `scripted_triggers/` | Condition definitions | Reusable trigger blocks |
| `scripted_effects/` | Action definitions | Reusable effect blocks |

---

## Detailed Category Reference

### Religions
- **Path:** `game/in_game/common/religions/`
- **Key Fields:** `color`, `group`, `language`, `has_karma`, `definition_modifier`, `opinions`, `tags`
- **Filter By:** Religion Group, Tags
- **Examples:** sunni, catholic, buddhist, orthodox, hindu
- **Cross-References:** References religion_groups via `group` field

### Religion Groups
- **Path:** `game/in_game/common/religion_groups/`
- **Key Fields:** `color`, `crusade_name`, `hostile_within_group`
- **Examples:** christianity, islam, buddhist, dharmic, pagan

### Cultures
- **Path:** `game/in_game/common/cultures/`
- **File Count:** 100+ files organized by region
- **Key Fields:** `language`, `color`, `tags`, `opinions`, `culture_groups`
- **Filter By:** Culture Group, Language, Tags
- **Cross-References:** References culture_groups, languages

### Culture Groups
- **Path:** `game/in_game/common/culture_groups/`
- **Key Fields:** `color`, cultural modifiers
- **Examples:** germanic_group, latin_group, slavic_group, east_asian_group

### Languages
- **Path:** `game/in_game/common/languages/`
- **Key Fields:** `family`, `color`
- **Examples:** germanic_language, romance_language, slavic_language, sinitic_language

### Ethnicities
- **Path:** `game/in_game/common/ethnicities/`
- **Key Fields:** Visual/genetic group definitions
- **Purpose:** Controls character appearance/portraits

### Government Types
- **Path:** `game/in_game/common/government_types/`
- **Key Fields:** `use_regnal_number`, `heir_selection`, `map_color`, `government_power`, `revolutionary_country_antagonism`, `default_character_estate`, `modifier`
- **Examples:** monarchy, republic, theocracy, tribe
- **Cross-References:** References heir_selections, estates

### Laws
- **Path:** `game/in_game/common/laws/`
- **File Count:** 30 files
- **Key Fields:**
  - `law_category` - administrative, military, naval, religious, socioeconomic, estates
  - `law_gov_group` - monarchy, republic, theocracy, tribe, hre, shogunate
  - `potential`, `allow` - Trigger blocks for availability
  - `country_modifier` - Bonuses/penalties
  - `years` - Duration
  - `estate_preferences` - Estate support
- **Filter By:** Category, Government Type
- **Named Variants:** noble_levies, peasant_levies, all_cultures, etc.

### Estates
- **Path:** `game/in_game/common/estates/`
- **File Count:** 1 file (00_default.txt)
- **Key Fields:**
  - `color` - Estate color identifier
  - `power_per_pop`, `tax_per_pop` - Economic contribution
  - `rival`, `alliance` - Relationship modifiers
  - `characters_have_dynasty` - always/yes/no
  - `satisfaction`, `high_power`, `low_power` - Modifier blocks
  - `ruler` - Boolean for ruler estate
- **Types:** crown_estate, nobles_estate, clergy_estate, burghers_estate, peasants_estate

### Succession Laws (Heir Selections)
- **Path:** `game/in_game/common/heir_selections/`
- **File Count:** 6 files (organized by government type)
- **Key Fields:**
  - `traverse_family_tree` - Boolean
  - `allow_female`, `allow_male`, `allow_children` - Candidate restrictions
  - `through_female` - Female line succession
  - `use_election` - Election process
  - `term_duration` - Term length in months
  - `max_possible_candidates` - Candidate limit
  - `allowed_estates` - Eligible estate types
  - `calc` - Score calculation block
- **Types:** cognatic_primogeniture, agnatic_primogeniture, absolute_cognatic_primogeniture, fratricide_succession, unigeniture, election variants
- **Filter By:** Election type

### Buildings
- **Path:** `game/in_game/common/building_types/`
- **File Count:** 43 files
- **Key Fields:** `category`, `pop_type`, `max_levels`, `employment_size`, `build_time`, `location_potential`, `country_potential`, `capital_country_modifier`, `unique_production_methods`
- **Filter By:** Building Category, Worker Type
- **Cross-References:** References pop_types, goods

### Goods
- **Path:** `game/in_game/common/goods/`
- **Key Fields:** `category`, `base_price`, trade modifiers
- **Filter By:** Goods Category
- **Examples:** grain, cloth, iron, gold, spices

### Population Types
- **Path:** `game/in_game/common/pop_types/`
- **Key Fields:** Economic contribution, political power, cultural integration
- **Types:** nobles, burghers, clergy, farmers, artisans, slaves

### Institutions
- **Path:** `game/in_game/common/institution/`
- **File Count:** 7 files (organized by age)
- **Key Fields:**
  - `age` - age_1_traditions through age_6_revolutions
  - `can_spawn` - Trigger block for spawn location
  - `promote_chance` - Promotion probability calculation
  - `spread_from_*` - Various spread mechanics (coast, import, export, capital)
- **Filter By:** Age
- **Types:** feudalism, legalism, meritocracy, renaissance, banking, printing_press, global_trade, diplomatic_corps, standing_armies, enlightenment

### Units
- **Path:** `game/in_game/common/unit_types/`
- **Key Fields:** `category`, `type`, combat stats, maintenance costs
- **Filter By:** Unit Category, Unit Type
- **Examples:** infantry, cavalry, artillery, ships

### Casus Belli
- **Path:** `game/in_game/common/casus_belli/`
- **File Count:** 62 files
- **Key Fields:**
  - `visible` - Visibility trigger
  - `allow_creation`, `allow_declaration` - Availability triggers
  - `war_goal_type` - take_capital, superiority, naval, conquer_province, crusade_conquest
  - `can_expire` - Boolean
  - `allow_separate_peace` - Boolean
  - `ai_subjugation_desire`, `ai_cede_location_desire` - AI weights
- **Filter By:** War Goal Type

### Subject Types
- **Path:** `game/in_game/common/subject_types/`
- **File Count:** 17 files
- **Key Fields:**
  - `subject_pays` - Payment type
  - `level` - Hierarchy level (1-3)
  - `diplomatic_capacity_cost_scale` - Diplo cost multiplier
  - `strength_vs_overlord` - Military strength modifier
  - Annexation mechanics: `annexation_speed`, `annexation_min_years`, `annexation_min_opinion`
  - Overlord privileges: `can_overlord_build_*`, `can_overlord_recruit_regiments`
  - `can_be_annexed`, `has_limited_diplomacy` - Booleans
  - `overlord_modifier`, `subject_modifier` - Modifier blocks
- **Filter By:** Level
- **Types:** vassal, march, tributary, colonial_nation, dominion, appanage, fiefdom, samanta, trade_company

### International Organizations
- **Path:** `game/in_game/common/international_organizations/`
- **File Count:** 34 files
- **Key Fields:**
  - `unique` - Boolean for uniqueness
  - `has_parliament`, `parliament_type` - Parliament system
  - `has_leader_country`, `leader_type` - Leadership (character/country)
  - `leader_title_key`, `use_regnal_number` - Leader naming
  - War participation: `join_defensive_wars_*`, `join_offensive_wars_*`
  - `land_ownership_rule` - Land control rules
  - `max_active_resolutions` - Resolution limit
  - Triggers: `can_lead_trigger`, `can_join_trigger`, `can_leave_trigger`
- **Filter By:** Unique, Has Parliament
- **Types:** catholic_church, hre, coalition, crusade, defensive_league, foreign_leagues, colonial_federation

### Traits
- **Path:** `game/in_game/common/traits/`
- **File Count:** 7 files (ruler, general, admiral, artist, explorer, child, religious_figure)
- **Key Fields:** `allow`, `category`, `flavor`, `modifier`
- **Filter By:** Trait Type
- **Cross-References:** Traits can exclude other traits via `NOT = { has_trait = X }`

### Advances (Technology) - DETAILED

- **Path:** `game/in_game/common/advances/`
- **File Count:** 20+ files organized by purpose

#### File Organization
| Pattern | Purpose |
|---------|---------|
| `0_age_of_X.txt` | Core age-specific advances |
| `1_building_unlocks.txt` | Building-focused advances |
| `2_army_unlocks.txt` | Military unit advances |
| `2_ship_unlocks.txt` | Naval unit advances |
| `3_X_unlocks.txt` | Special unlock advances |
| `4_choices_X.txt` | Choice nodes (adm/dip/mil) |
| Country/culture/region files | Specific advances |

#### Key Fields (Critical for Tech Tree)

| Field | Type | Purpose |
|-------|------|---------|
| `age` | string | **Era assignment** - `age_1_traditions` through `age_6_revolutions` |
| `requires` | string | **Dependency** - References another advance by name |
| `depth` | number | **Root marker** - `depth = 0` marks tree starting points |
| `icon` | string | **Graphics** - Icon name (maps to DDS in `gfx/interface/advance/`) |
| `research_cost` | number | Base research cost multiplier |

#### Dependency System
Dependencies are defined using the **`requires` field** directly:
```
written_alphabet = {
    age = age_1_traditions
    icon = abacus_advance
    depth = 0                      # Root node (no parent)
    research_cost = 2.0
}

mapmaking = {
    age = age_1_traditions
    icon = mapmaking_advance
    requires = written_alphabet    # Direct parent reference
}

colonies = {
    age = age_1_traditions
    requires = mapmaking           # Chain: written_alphabet -> mapmaking -> colonies
}
```

#### Unlock Fields
Advances unlock game features via specific fields:
| Field | Unlocks |
|-------|---------|
| `unlock_unit` | Military units (e.g., `a_footmen`, `a_arquebusiers`) |
| `unlock_levy` | Levy types |
| `unlock_building` | Buildings (e.g., `windmill`, `apothecary`) |
| `unlock_law` | Laws |
| `unlock_production_method` | Production methods |
| `unlock_government_reform` | Government reforms |
| `unlock_subject_type` | Subject types (e.g., `vassal`, `fiefdom`) |
| `unlock_country_interaction` | Country interactions |

#### Ages/Eras
| Value | Display Name |
|-------|--------------|
| `age_1_traditions` | Age of Traditions |
| `age_2_renaissance` | Age of Renaissance |
| `age_3_discovery` | Age of Discovery |
| `age_4_reformation` | Age of Reformation |
| `age_5_absolutism` | Age of Absolutism |
| `age_6_revolutions` | Age of Revolutions |

#### Example Dependency Chain
```
written_alphabet (depth=0)
├── mapmaking
│   └── colonies
├── codified_laws
│   ├── subjects_advance (unlock_subject_type = vassal)
│   └── taxation_advance
│       └── state_administration_advance
```

#### Tech Tree Rendering Notes
- **No coordinates stored** - Positions computed by layout algorithm
- **`depth = 0`** marks root nodes (starting points)
- **GUI** uses `technology_lateralview.gui` for rendering
- Tree is a **directed acyclic graph (DAG)** - multiple parents/children possible
- Nodes color-coded by status (unavailable/available/researched)

#### Country-Specific Advances (potential block)
Many advances have a `potential` block that restricts them to specific countries, regions, or cultures:

```
route_to_the_indies_advance = {
    age = age_3_discovery
    potential = {
        capital = { sub_continent = sub_continent:western_europe }
    }
    # Only available to Western European nations
}
```

**Statistics:**
- **Total advances:** ~2590
- **With potential (country-specific):** ~1825
- **Universal (no potential):** ~765

The tech tree viewer **filters out advances with potential blocks** to show only universal advances. This provides a cleaner view of the core tech trees.

#### Per-Era Statistics (Universal Only)
| Era | Advances | Root Trees |
|-----|----------|------------|
| Age 1 - Traditions | 98 | 11 |
| Age 2 - Renaissance | 135 | 12 |
| Age 3 - Discovery | 136 | 44 |
| Age 4 - Reformation | 129 | 45 |
| Age 5 - Absolutism | 137 | 44 |
| Age 6 - Revolutions | 129 | 43 |

- **Filter By:** Age/Era
- **Special View:** Tech tree with dependency connections

### Disasters
- **Path:** `game/in_game/common/disasters/`
- **File Count:** 34 files
- **Key Fields:**
  - `image` - GFX path to illustration
  - `monthly_spawn_chance` - Spawn probability
  - `can_start`, `can_end` - Trigger blocks
  - `modifier` - Active disaster modifier
  - `on_start`, `on_monthly`, `on_end` - Effect blocks
- **Examples:** Peasant revolts, civil wars, religious conflicts

### Formable Countries
- **Path:** `game/in_game/common/formable_countries/`
- **File Count:** 2 files
- **Key Fields:**
  - `level` - Formation tier (1-3, higher = more difficult)
  - `required_locations_fraction` - Territory percentage needed (e.g., 0.75)
  - `rule` - historical, plausible, fantasy
  - `potential`, `allow` - Availability triggers
  - `tag`, `name`, `adjective`, `flag`, `color` - Country identity
  - `regions`, `areas` - Required territory
  - `form_effect` - Formation effects
- **Filter By:** Level, Rule Type

### Climates
- **Path:** `game/in_game/common/climates/`
- **Key Fields:** Climate modifiers, terrain effects
- **Types:** tropical, arid, temperate, arctic, etc.

### game/in_game/map_data/ - Map Definitions

| File | Description |
|------|-------------|
| `default.map` | Map configuration (181 KB) |
| `definitions.txt` | Province hierarchy (491 KB) |
| `location_templates.txt` | Location templates (3.7 MB) |
| `locations.png` | Province map (16384 x 8192, 8-bit RGB) |
| `ports.csv` | Port locations (LandProvince;SeaZone;x;y) |
| `adjacencies.csv` | Province adjacency data |
| `rivers.png` | River network image |
| `nodes.dat` | Binary pathfinding data (11.2 MB) |
| `named_locations/` | Named location definitions |

### game/in_game/events/ - Event Definitions

14+ subdirectories:
- `character/` - Character events (artist, consort, dynastic)
- `colonization/` - Colony events
- `culture/` - Cultural events
- `diplomacy/` - Diplomatic events
- `disaster/` - Crisis events
- `economy/` - Economic events
- `estates/` - Estate events
- `exploration/` - Discovery events
- `government/` - Government events
- `religion/` - Religious events
- `missionevents/` - Mission-specific events
- `DHE/` - Dynamic Historical Events
- `situations/` - Situation events

### game/in_game/gfx/ - Graphics

| Folder | Description |
|--------|-------------|
| `models/` | 3D models (buildings, units, ships) |
| `portraits/` | Character portraits |
| `particles/` | Particle effects |
| `terrain2/` | Terrain textures |
| `map/` | Map graphics (borders, biomes, flatmap) |
| `images/` | UI images and illustrations |
| `city_materials/` | City texture materials |
| `graphical_culture_types/` | Culture-specific graphics |

### game/in_game/localization/

Multiple language support (13+ languages):
- english, french, german, spanish, russian
- simp_chinese, japanese, korean
- polish, turkish, braz_por

---

## Paradox Script Format

### Basic Syntax
```
object_name = {
    # This is a comment
    property = value
    numeric_value = 123
    negative = -0.05
    boolean_yes = yes
    boolean_no = no

    nested_block = {
        inner_property = "quoted string"
    }

    list = { item1 item2 item3 }
}
```

### Special Value Types

**RGB Colors:**
```
color = rgb { 32 33 79 }
map_color = rgb { 150 50 50 }
```

**HSV Colors:**
```
color = hsv { 0.5 0.8 0.9 }
```

**Dates:**
```
start_date = 1444.11.11
end_date = 9999.1.1
```

**Operators (in conditions):**
```
trigger = {
    adm > 33
    mil >= 50
    NOT = { has_trait = cruel }
    OR = { tag = FRA tag = ENG }
}
```

**References:**
```
color = color_sunni          # Color reference
language = germanic_language # Language reference
group = christianity         # Religion group reference
culture_groups = { germanic_group }
has_advance = printing_press # Tech reference
```

---

## Reference Types

### Color References
- Pattern: `color_*`, `map_*`
- Example: `color = color_orthodox`, `map_color = map_sweden`
- Defined in: Various files as `color_name = rgb { r g b }`

### Category References
| Field | References |
|-------|------------|
| `group` | religion_groups |
| `culture_groups` | culture_groups |
| `language` | languages |
| `pop_type` | pop_types |
| `category` | building categories, goods categories |
| `has_advance` | advances |
| `has_technology` | advances |
| `government_type` | government_types |
| `heir_selection` | heir_selections |
| `estate` | estates |

### Cross-File References
Many definitions reference other definitions:
- Religions reference religion_groups
- Cultures reference culture_groups and languages
- Buildings reference pop_types and goods
- Advances reference other advances (prerequisites)
- Traits reference other traits (exclusions)

---

## Inspector Architecture

### File Structure
```
EU5-Inspector/
├── index.html              # Main HTML layout
├── Claude.md               # This documentation
├── css/
│   └── styles.css          # All styling (dark theme)
└── js/
    ├── parser.js           # Paradox script parser
    ├── loader.js           # File system access
    ├── app.js              # Main application logic
    └── components/
        ├── search.js       # Search input component
        ├── filters.js      # 3-state filter chips
        └── item-card.js    # Card rendering
```

### Component Responsibilities

**parser.js**
- Tokenizes Paradox script syntax
- Converts to JavaScript objects
- Handles: key=value, nested blocks, arrays, colors, dates, comments

**loader.js**
- Uses `<input type="file" webkitdirectory>` for folder selection
- Indexes files by relative path
- Reads and parses .txt files
- Validates EU5 folder structure

**app.js**
- Manages categories and navigation
- Stores loaded data in `this.items[category]`
- Coordinates filtering and search
- Renders item grid and tech tree view
- Filter configuration per category

**item-card.js**
- Renders cards with full property display
- Handles all value types (colors, arrays, objects)
- Recursive property rendering with indentation
- HTML escaping for security

**filters.js**
- 3-state toggles: neutral → include → exclude
- ANY/ALL match modes
- Per-category filter groups

**search.js**
- Debounced search input
- Filters items by name

### Data Flow
```
User selects folder
    → loader.selectFolder()
    → loader.readDirectory(categoryPath)
    → parser.parse(fileContent)
    → app.items[category] = parsedData
    → app.setupFilters(category)
    → app.applyFilters()
    → app.renderItems()
    → ItemCard.render(name, data, category)
```

---

## CSS Theme

### Color Variables
```css
--bg-primary: #1a1a2e;      /* Dark background */
--bg-secondary: #16213e;    /* Slightly lighter */
--bg-tertiary: #0f3460;     /* Section backgrounds */
--accent: #e94560;          /* Red/pink highlight */
--accent-light: #ff6b6b;    /* Lighter accent */

/* Value type colors */
--val-str: #98c379;         /* String green */
--val-num: #e5c07b;         /* Number yellow */
--val-yes: #61afef;         /* Boolean true blue */
--val-no: #e06c75;          /* Boolean false red */
--val-date: #c678dd;        /* Date purple */
```

---

## Future Enhancements

### Potential Features
- Province/map viewer using map_data
- Event browser with trigger/effect display
- Mission tree visualization
- Localization integration (show translated names)
- Mod support (load mod folders)
- Export/compare functionality
- Cross-reference navigation (click to jump to referenced item)
- Color preview for color references

### Technical Notes
- DDS images require conversion for browser display
- Binary files (nodes.dat) not parseable
- Large files (location_templates.txt) may need lazy loading
- Some nested structures are very deep (requires scroll)

---

## Development & Debugging

### Test Suite

**tests/test-suite.html** - Browser-based visual test suite
- Open in browser, click "Load EU5 Folder"
- Tests: Parser, Tree Builder, Visual Layout
- Shows pass/fail counts with visual component previews

**test-tree.js** - Node.js CLI test for tree logic
```bash
node test-tree.js "C:\Path\To\EU5"
```
Outputs: Advance counts, dependency analysis, sample tree structures

### Tech Tree Layout Investigation (2025-01)

**Problem**: Tech tree displayed as single vertical column instead of proper tree.

**Analysis**:
1. Parsed data is correct (Node.js verified: 54 roots at depth 0 for Age 2)
2. Tree building logic works (dependencies properly linked)
3. Issue was CSS: `flex-wrap: wrap` caused 54 nodes to wrap into column

**Fix Applied** (v2 - Grid Layout):
```css
.tech-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
```

**Changes Made**:
1. Changed from horizontal scroll to responsive grid
2. Added tier labels ("Root Advances", "Tier 1", etc.) with counts
3. Added "Requires: Parent Name" on each card
4. Disabled SVG connection lines (too complex with 50+ trees)

**Statistics by Era** (from EU5 game files):
| Era | Total | Roots | Max Depth |
|-----|-------|-------|-----------|
| Age 1 Traditions | 516 | 39 | 7 |
| Age 2 Renaissance | 564 | 54 | 9 |
| Age 3 Discovery | 435 | 86 | 8 |
| Age 4 Reformation | 417 | 85 | 10 |
| Age 5 Absolutism | 354 | 79 | 8 |
| Age 6 Revolutions | 303 | 75 | 9 |

### Debug Button
Press **Debug** button in header (when advances loaded) to dump:
- Current state, raw data, filtered data
- Tech tree structure by era
- DOM analysis (rows, nodes per row)
- CSS computed styles
