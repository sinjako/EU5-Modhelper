# EU5 Folder Structure

Complete hierarchy of the Europa Universalis V game folder.

## Root Directory

```
Europa Universalis V/
├── binaries/                    # Compiled executables
├── clausewitz/                  # Clausewitz engine files
├── jomini/                      # Jomini engine components
├── game/                        # Main game content
│   ├── in_game/                 # Core game data
│   ├── loading_screen/          # Loading screen assets
│   ├── main_menu/               # Main menu assets
│   ├── dlc/                     # DLC content
│   └── mod/                     # Mod folder
└── platform_specific_game_data/
```

## game/in_game/ Structure

```
in_game/
├── common/           # Definition files (110 subfolders)
├── content_source/   # Map object content
├── events/           # Event definitions (318 files)
├── fonts/            # Font files
├── gfx/              # Graphics assets
├── gui/              # UI definitions (161 files)
├── map_data/         # Map definitions
└── setup/            # Country starting data
```

**Note:** Localization files are NOT in `in_game/`. They are in:
- `game/loading_screen/localization/`
- `game/main_menu/localization/`
- Engine folders (`clausewitz/`, `jomini/`)

## common/ Subfolders (110 total)

### Core Game Systems

| Folder | Files | Description |
|--------|-------|-------------|
| `advances/` | 20+ | Technology tree definitions |
| `age/` | 1 | Age/era definitions |
| `government_types/` | 1 | Government systems |
| `government_reforms/` | 5 | Government reform mechanics |
| `heir_selections/` | 5 | Succession systems |
| `laws/` | 30+ | Legal system definitions |
| `policies/` | 3 | Country policies |

### Culture & Religion

| Folder | Files | Description |
|--------|-------|-------------|
| `religions/` | 29 | Religion definitions |
| `religion_groups/` | 1 | Religion family groupings |
| `religious_aspects/` | 2 | Religious mechanics |
| `religious_factions/` | 1 | Religious faction types |
| `religious_figures/` | 1 | Religious leader types |
| `religious_focuses/` | 3 | Religious focus paths |
| `religious_schools/` | 5 | Islamic/Buddhist schools |
| `cultures/` | 53 | Culture definitions |
| `culture_groups/` | 1 | Culture group classifications |
| `languages/` | 33 | Language definitions |
| `language_families/` | 1 | Language family groupings |
| `ethnicities/` | 1 | Ethnic group definitions |

### Economy & Buildings

| Folder | Files | Description |
|--------|-------|-------------|
| `building_types/` | 43 | Building definitions |
| `building_categories/` | 1 | Building category types |
| `goods/` | 6 | Trade goods definitions |
| `goods_demand/` | 7 | Demand calculation systems |
| `goods_demand_category/` | 1 | Demand categories |
| `production_methods/` | 5 | Production recipes |
| `prices/` | 1 | Price definitions |
| `employment_systems/` | 1 | Employment mechanics |

### Population & Estates

| Folder | Files | Description |
|--------|-------|-------------|
| `pop_types/` | 1 | Population type definitions |
| `estates/` | 1 | Estate definitions |
| `estate_privileges/` | 4 | Estate privilege options |

### Military

| Folder | Files | Description |
|--------|-------|-------------|
| `unit_types/` | 31 | Military unit definitions |
| `unit_categories/` | 9 | Unit category classifications |
| `unit_abilities/` | 1 | Special unit abilities |
| `levies/` | 1 | Levy system definitions |
| `recruitment_method/` | 1 | Recruitment mechanics |

### Diplomacy

| Folder | Files | Description |
|--------|-------|-------------|
| `casus_belli/` | 62 | War justification types |
| `wargoals/` | 1 | War goal definitions |
| `peace_treaties/` | 5 | Peace treaty types |
| `subject_types/` | 17 | Subject state types |
| `subject_military_stances/` | 1 | Subject military options |
| `international_organizations/` | 34 | IO definitions (HRE, etc.) |
| `international_organization_land_ownership_rules/` | 1 | IO territory rules |
| `international_organization_payments/` | 1 | IO payment systems |
| `international_organization_special_statuses/` | 1 | IO special statuses |

### Events & Crises

| Folder | Files | Description |
|--------|-------|-------------|
| `disasters/` | 34 | Disaster/crisis definitions |
| `situations/` | 21 | World situation events |
| `diseases/` | 1 | Disease definitions |

### Characters

| Folder | Files | Description |
|--------|-------|-------------|
| `traits/` | 7 | Character trait definitions |
| `trait_flavor/` | 1 | Trait flavor text |
| `child_educations/` | 2 | Child education types |
| `character_interactions/` | 3 | Character interaction options |
| `death_reason/` | 1 | Death cause types |
| `designated_heir_reason/` | 1 | Heir designation reasons |
| `artist_types/` | 1 | Artist character types |
| `artist_work/` | 2 | Artist work definitions |

### Nations & Formation

| Folder | Files | Description |
|--------|-------|-------------|
| `formable_countries/` | 2 | Nation formation rules |
| `country_ranks/` | 1 | Country rank definitions |
| `country_description_categories/` | 1 | Country description types |
| `country_interactions/` | 2 | Country interaction options |
| `hegemons/` | 1 | Hegemony mechanics |

### Geography

| Folder | Files | Description |
|--------|-------|-------------|
| `climates/` | 1 | Climate type definitions |
| `topography/` | 1 | Terrain topography |
| `vegetation/` | 1 | Vegetation types |
| `road_types/` | 1 | Road type definitions |
| `location_ranks/` | 1 | Location rank types |
| `town_setups/` | 1 | Town initialization |

### Scripting System

| Folder | Files | Description |
|--------|-------|-------------|
| `script_values/` | 19 | Reusable numeric calculations |
| `scripted_triggers/` | 22 | Reusable condition blocks |
| `scripted_effects/` | 14 | Reusable effect blocks |
| `scripted_modifiers/` | 5 | Reusable modifier blocks |
| `scripted_guis/` | 3 | Scripted GUI elements |
| `scripted_lists/` | 2 | Scripted list definitions |
| `scripted_rules/` | 1 | Scripted rule definitions |
| `scripted_relations/` | 1 | Relationship definitions |
| `on_action/` | 18+ | Event trigger definitions |

### AI & Automation

| Folder | Files | Description |
|--------|-------|-------------|
| `ai_diplochance/` | 1 | AI diplomatic decisions |
| `biases/` | 1 | AI bias definitions |
| `generic_action_ai_lists/` | 1 | AI action lists |
| `generic_actions/` | 2 | Generic action definitions |
| `rival_criteria/` | 1 | Rivalry criteria |

### Parliament & Governance

| Folder | Files | Description |
|--------|-------|-------------|
| `parliament_types/` | 1 | Parliament system types |
| `parliament_agendas/` | 1 | Parliament agenda options |
| `parliament_issues/` | 5 | Parliament issue types |
| `resolutions/` | 2 | IO resolution types |
| `cabinet_actions/` | 6 | Cabinet action options |
| `regencies/` | 1 | Regency mechanics |

### Institutions

| Folder | Files | Description |
|--------|-------|-------------|
| `institution/` | 7 | Institution definitions |
| `societal_values/` | 1 | Society value tracks |

### Missions

| Folder | Files | Description |
|--------|-------|-------------|
| `missions/` | 100+ | Country mission trees |
| `mission_task_defs/` | 1 | Mission task definitions |

### Misc

| Folder | Files | Description |
|--------|-------|-------------|
| `gods/` | 1 | Deity definitions |
| `holy_sites/` | 1 | Holy site locations |
| `holy_site_types/` | 1 | Holy site categories |
| `historical_scores/` | 1 | Historical scoring |
| `insults/` | 1 | Diplomatic insults |
| `avatars/` | 1 | Player avatars |
| `genes/` | 1 | Character genetics |
| `persistent_dna/` | 1 | DNA persistence |
| `customizable_localization/` | 4 | Dynamic text |
| `effect_localization/` | 1 | Effect text |
| `trigger_localization/` | 1 | Trigger text |
| `scripted_country_names/` | 1 | Dynamic country naming |
| `scripted_diplomatic_objectives/` | 1 | AI diplomatic goals |
| `scriptable_hints/` | 1 | Tutorial hints |
| `attribute_columns/` | 1 | Attribute display |
| `auto_modifiers/` | 1 | Automatic modifiers |
| `diplomatic_costs/` | 1 | Diplomatic action costs |
| `tests/` | 1 | Test definitions |
| `tutorial_lesson_chains/` | 1 | Tutorial sequences |
| `tutorial_lessons/` | 5 | Tutorial content |

## map_data/ Structure

| File/Folder | Description |
|-------------|-------------|
| `default.map` | Map configuration (181 KB) |
| `definitions.txt` | Province hierarchy (491 KB) |
| `location_templates.txt` | Location templates (3.7 MB) |
| `locations.png` | Province map (16384 x 8192) |
| `ports.csv` | Port location data |
| `adjacencies.csv` | Province adjacency |
| `rivers.png` | River network |
| `nodes.dat` | Pathfinding data (11.2 MB) |
| `named_locations/` | Named location definitions |

## events/ Structure

14+ subdirectories organized by event type:
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

## gfx/ Structure

| Folder | Description |
|--------|-------------|
| `models/` | 3D models (buildings, units, ships) |
| `portraits/` | Character portraits |
| `particles/` | Particle effects |
| `terrain2/` | Terrain textures |
| `map/` | Map graphics (borders, biomes) |
| `images/` | UI images and illustrations |
| `city_materials/` | City texture materials |
| `graphical_culture_types/` | Culture-specific graphics |

## gui/ Structure

161 GUI definition files (`.gui` format) for UI modding:

| File Pattern | Description |
|--------------|-------------|
| `*_lateralview.gui` | Side panel views |
| `*_view.gui` | Main view windows |
| `*_popup.gui` | Popup dialogs |
| `*_header.gui` | Header components |
| `cooltip*.gui` | Tooltip definitions |

Key files:
- `advances_lateralview.gui` - Tech tree UI
- `building_view.gui` - Building interface
- `character_lateralview.gui` - Character panel
- `country_header.gui` - Country info header

## setup/ Structure

Country starting conditions:

| Folder | Files | Description |
|--------|-------|-------------|
| `countries/` | 46 | Country color and tag definitions |

Files organized by region: `british_isles.txt`, `anatolia.txt`, `balkans.txt`, etc.

## Localization (Outside in_game/)

Localization is NOT in `in_game/`. Located in:
- `game/loading_screen/localization/`
- `game/main_menu/localization/`

Language folders: `english/`, `french/`, `german/`, `spanish/`, `russian/`, `simp_chinese/`, `japanese/`, `korean/`, `polish/`, `turkish/`, `braz_por/`
