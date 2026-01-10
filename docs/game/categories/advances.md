# Advances (Technology)

Technology tree definitions for EU5.

**Path:** `game/in_game/common/advances/`
**Total Files:** 189
**See Also:** [ADVANCES-DETAILED.md](ADVANCES-DETAILED.md) for complete technical documentation

## File Organization

### Universal Tech Tree (6 files)
| File | Era |
|------|-----|
| `0_age_of_traditions.txt` | Age 1 |
| `0_age_of_renaissance.txt` | Age 2 |
| `0_age_of_discovery.txt` | Age 3 |
| `0_age_of_reformation.txt` | Age 4 |
| `0_age_of_absolutism.txt` | Age 5 |
| `0_age_of_revolutions.txt` | Age 6 |

### Restricted Files (183 files)
| Pattern | Count | Restriction |
|---------|-------|-------------|
| `country_*.txt` | 110 | Country-specific (has_or_had_tag) |
| `government_*.txt` | 4 | Government type |
| `culture_*.txt` | 34 | Culture/culture group |
| `religion_*.txt` | 8 | Religion specific |
| `region_*.txt`, `area_*.txt` | 6 | Geographic |
| `1_*`, `2_*`, `3_*` | 8 | Unlock advances |
| `4_choices_*.txt` | 3 | ADM/DIP/MIL choices |
| Other | 10 | Special cases |

## Key Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `age` | Era assignment | `age_1_traditions` |
| `depth` | Root indicator | `depth = 0` (only on roots) |
| `requires` | Dependency | `requires = written_alphabet` |
| `potential` | Country/condition filter | `{ has_or_had_tag = ENG }` |
| `government` | Government type filter | `monarchy` |
| `for` | Choice type filter | `adm`, `dip`, `mil` |
| `country_type` | Country archetype filter | `army` |

## Filtering for Universal Tech Tree

**Method 1: Filter by source file (recommended)**
```javascript
const isUniversal = filename.startsWith('0_age_of_');
```

**Method 2: Filter by restrictive fields**
```javascript
const isUniversal = !item.potential && !item.government &&
                    !item.for && !item.country_type;
```

## Root Advances

24 root advances with `depth = 0`:

**Age 1 (7 roots):** written_alphabet, agriculture_advance, mining_advance, ship_building_advance, organized_religion, meritocracy_advance, feudalism_advance

**Later Ages:** Additional roots tied to institutions

## Unlock Fields

| Field | Unlocks |
|-------|---------|
| `unlock_building` | Buildings |
| `unlock_unit` | Military units |
| `unlock_levy` | Levy types |
| `unlock_law` | Laws |
| `unlock_government_reform` | Government reforms |
| `unlock_estate_privilege` | Estate privileges |
| `unlock_production_method` | Production methods |
| `unlock_road_type` | Road types |
| `unlock_policy` | Policies |
| `unlock_cabinet_action` | Cabinet actions |

## Statistics

| Metric | Count |
|--------|-------|
| Total advance files | 189 |
| Total advance definitions | ~2,589 |
| Universal advances (0_age_* files) | ~510 |
| Root advances (depth=0) | 24 |
| Country-specific (potential) | ~1,825 |
| Government-specific | ~71 |
| Choice advances (for) | ~150 |

## Example

```paradox
written_alphabet = {
    age = age_1_traditions
    icon = abacus_advance
    depth = 0                    # Root node
    research_cost = 2.0
}

mapmaking = {
    age = age_1_traditions
    icon = mapmaking_advance
    requires = written_alphabet  # Dependency
}
```
