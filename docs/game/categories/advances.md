# Advances (Technology)

Technology tree definitions for EU5.

**Path:** `game/in_game/common/advances/`

## File Organization

| Pattern | Purpose |
|---------|---------|
| `0_age_of_*.txt` | Core age-specific advances |
| `1_building_unlocks.txt` | Building-focused advances |
| `2_army_unlocks.txt` | Military unit advances |
| `2_ship_unlocks.txt` | Naval unit advances |
| `3_*_unlocks.txt` | Special unlock advances |
| `4_choices_*.txt` | Choice nodes (adm/dip/mil) |
| Country/region files | Country-specific advances |

## Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `age` | string | Era assignment (`age_1_traditions` through `age_6_revolutions`) |
| `requires` | string | Parent advance dependency |
| `depth` | number | Root marker (`depth = 0` marks tree roots) |
| `icon` | string | Icon name (maps to `gfx/interface/advance/`) |
| `research_cost` | number | Base research cost multiplier |

## Unlock Fields

| Field | Unlocks |
|-------|---------|
| `unlock_building` | Buildings (e.g., `cathedral`) |
| `unlock_law` | Laws |
| `unlock_unit` | Military units (e.g., `a_footmen`) |
| `unlock_levy` | Levy types |
| `unlock_production_method` | Production methods |
| `unlock_government_reform` | Government reforms |
| `unlock_subject_type` | Subject types (e.g., `vassal`) |
| `unlock_country_interaction` | Country interactions |

## Ages/Eras

| Value | Display Name |
|-------|--------------|
| `age_1_traditions` | Age of Traditions |
| `age_2_renaissance` | Age of Renaissance |
| `age_3_discovery` | Age of Discovery |
| `age_4_reformation` | Age of Reformation |
| `age_5_absolutism` | Age of Absolutism |
| `age_6_revolutions` | Age of Revolutions |

## Example

```
written_alphabet = {
    age = age_1_traditions
    icon = abacus_advance
    depth = 0                      # Root node
    research_cost = 2.0
}

mapmaking = {
    age = age_1_traditions
    icon = mapmaking_advance
    requires = written_alphabet    # Dependency
}

colonies = {
    age = age_1_traditions
    requires = mapmaking
    can_colonize = yes             # Feature unlock
}
```

## Dependency Chain Example

```
written_alphabet (depth=0)
├── mapmaking
│   └── colonies (can_colonize = yes)
├── codified_laws
│   ├── subjects_advance (unlock_subject_type = vassal)
│   └── taxation_advance
│       └── state_administration_advance
```

## Conditional Advances

Many advances have `potential` blocks restricting them to specific countries/regions:

```
route_to_the_indies_advance = {
    age = age_3_discovery
    potential = {
        capital = { sub_continent = sub_continent:western_europe }
    }
}
```

## Statistics

| Metric | Count |
|--------|-------|
| Total advances | ~2,590 |
| With potential (country-specific) | ~1,825 |
| Universal (no potential) | ~765 |

### Per-Era Statistics (Universal Only)

| Era | Advances | Root Trees |
|-----|----------|------------|
| Age 1 - Traditions | 98 | 11 |
| Age 2 - Renaissance | 135 | 12 |
| Age 3 - Discovery | 136 | 44 |
| Age 4 - Reformation | 129 | 45 |
| Age 5 - Absolutism | 137 | 44 |
| Age 6 - Revolutions | 129 | 43 |

## Inspector Notes

- Tech tree viewer filters out advances with `potential` blocks for cleaner view
- Tree is a DAG (directed acyclic graph) - multiple parents/children possible
- No coordinates stored - positions computed by layout algorithm
- `depth = 0` marks root nodes (starting points)
