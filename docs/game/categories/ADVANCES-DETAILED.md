# EU5 Advances - Complete Technical Documentation

## Overview

The advances folder (`game/in_game/common/advances/`) contains **189 files** defining the tech tree system. This document provides complete technical details for parsing and filtering advances.

## File Organization

### Universal Tech Tree (6 files)
**ONLY these files contain the universal/generic tech tree:**

| File | Era | Advances |
|------|-----|----------|
| `0_age_of_traditions.txt` | Age 1 | ~50-60 advances |
| `0_age_of_renaissance.txt` | Age 2 | ~50-60 advances |
| `0_age_of_discovery.txt` | Age 3 | ~50-60 advances |
| `0_age_of_reformation.txt` | Age 4 | ~50-60 advances |
| `0_age_of_absolutism.txt` | Age 5 | ~50-60 advances |
| `0_age_of_revolutions.txt` | Age 6 | ~50-60 advances |

### Restricted Files (183 files)

| File Pattern | Count | Restriction Type |
|--------------|-------|------------------|
| `country_*.txt` | 110 | Country-specific (has_or_had_tag) |
| `government_*.txt` | 4 | Government type (monarchy/republic/theocracy/steppe_horde) |
| `culture_*.txt` | 34 | Culture or culture group |
| `religion_*.txt` | 8 | Religion specific |
| `region_*.txt`, `area_*.txt` | 6 | Geographic (capital location) |
| `ctype_*.txt` | 3 | Country type |
| `estate_*.txt` | 1 | Estate specific |
| `1_building_unlocks.txt` | 1 | Building unlock advances |
| `2_army_unlocks.txt` | 1 | Army unit unlock advances |
| `2_ship_unlocks.txt` | 1 | Ship unlock advances |
| `3_*.txt` | 6 | Various unlock types |
| `4_choices_*.txt` | 3 | ADM/DIP/MIL choice advances |
| Other | 5 | Special (Japanese, colonial, etc.) |

## Advance Definition Schema

```paradox
advance_name = {
    # === REQUIRED FIELDS ===
    age = age_X_xxx                    # One of: age_1_traditions, age_2_renaissance,
                                       #         age_3_discovery, age_4_reformation,
                                       #         age_5_absolutism, age_6_revolutions

    # === ROOT INDICATOR ===
    depth = 0                          # ONLY present on root advances (24 total)
                                       # Absence = non-root advance

    # === DEPENDENCY ===
    requires = other_advance           # Single dependency (most common)
    requires = adv1                    # Multiple requires = ALL must be met
    requires = adv2

    # === FILTERING/RESTRICTION FIELDS ===
    # If ANY of these are present, the advance is RESTRICTED (not universal)

    potential = { conditions }         # Complex eligibility (country tag, location, etc.)
    government = monarchy              # Government type: monarchy/republic/theocracy/steppe_horde
    for = adm                          # Choice type: adm/dip/mil
    country_type = army                # Country archetype

    # === UNLOCK EFFECTS ===
    unlock_building = building_name
    unlock_unit = unit_name
    unlock_levy = levy_name
    unlock_law = law_name
    unlock_government_reform = reform_name
    unlock_estate_privilege = privilege_name
    unlock_casus_belli = cb_name
    unlock_production_method = method_name
    unlock_road_type = road_name
    unlock_policy = policy_name
    unlock_cabinet_action = action_name

    # === MODIFIERS (hundreds possible) ===
    global_max_literacy = 0.05
    army_infantry_power = 0.10
    # ... 2000+ possible modifier fields ...

    # === AI HINTS ===
    ai_weight = { add = 10 }
    ai_preference_tags = { exploration }

    # === TREE CONTROL ===
    allow_children = no                # Leaf node - prevents further advancement
}
```

## Root Advances (depth = 0)

**24 total root advances** - starting points of the tech tree:

### Age 1 - Traditions (7 roots)
1. `written_alphabet` - Literacy foundation
2. `agriculture_advance` - Food extraction
3. `mining_advance` - Resource extraction
4. `ship_building_advance` - Naval tech foundation
5. `organized_religion` - Religious development
6. `meritocracy_advance` - Bureaucracy
7. `feudalism_advance` - Government (requires feudalism institution)

### Age 2 - Renaissance (1 root)
1. `renaissance_advance`

### Age 3 - Discovery (3 roots)
1. `new_world_advance` - Colonization (requires new_world institution)
2. `printing_press_advance` - Literacy (requires printing_press institution)
3. `pike_and_shot_advance` - Military (requires pike_and_shot institution)

### Age 4 - Reformation (2+ roots)
- Root advances require reformation-era institutions

### Age 5 - Absolutism (2+ roots)
1. `manufactories_advance` - Production (requires manufactories institution)

### Age 6 - Revolutions (2+ roots)
- Root advances require late-game institutions

## Filtering Rules for Universal Tech Tree

To display ONLY universal advances (the core tech tree), filter by **source file**:

```javascript
// CORRECT: Filter by source file
function isUniversalAdvance(filename) {
    return filename.startsWith('0_age_of_');
}
```

Alternatively, filter by field presence:

```javascript
// ALTERNATIVE: Filter by restrictive fields
function isUniversalAdvance(item) {
    // These fields indicate restricted advances
    if (item.potential) return false;      // Country/condition specific
    if (item.government) return false;     // Government type specific
    if (item.for) return false;            // ADM/DIP/MIL choice
    if (item.country_type) return false;   // Country archetype specific

    // Must be part of main tree (has dependency OR is root)
    const isRoot = item.depth === 0 || item.depth === '0';
    if (!item.requires && !isRoot) return false;

    return true;
}
```

## Requirement Extraction

The `requires` field can have multiple formats:

```javascript
function extractRequirements(item) {
    const reqs = [];

    if (!item.requires) return reqs;

    if (typeof item.requires === 'string') {
        // Simple: requires = advance_name
        reqs.push(item.requires);
    } else if (Array.isArray(item.requires)) {
        // Array: requires = { adv1 adv2 adv3 }
        reqs.push(...item.requires.filter(r => typeof r === 'string'));
    } else if (typeof item.requires === 'object') {
        // Nested: requires = { advance = name } or { any_of = { ... } }
        extractNestedRequires(item.requires, reqs);
    }

    return [...new Set(reqs)];
}

function extractNestedRequires(obj, reqs) {
    for (const [key, val] of Object.entries(obj)) {
        if (key === 'advance' && typeof val === 'string') {
            reqs.push(val);
        } else if (['any_of', 'all_of', 'AND', 'OR'].includes(key)) {
            if (Array.isArray(val)) {
                val.forEach(v => {
                    if (typeof v === 'string') reqs.push(v);
                    else if (typeof v === 'object') extractNestedRequires(v, reqs);
                });
            } else if (typeof val === 'object') {
                extractNestedRequires(val, reqs);
            }
        }
    }
}
```

## File-Based Advance Categories

### By File Prefix Analysis

| Prefix | Purpose | Universal? |
|--------|---------|------------|
| `0_` | Age-based universal advances | YES |
| `1_` | Building unlocks | NO |
| `2_` | Unit unlocks | NO |
| `3_` | Various unlocks | NO |
| `4_` | ADM/DIP/MIL choices | NO |
| `country_` | Country-specific | NO |
| `government_` | Government-specific | NO |
| `culture_` | Culture-specific | NO |
| `religion_` | Religion-specific | NO |
| `region_`, `area_` | Geographic | NO |
| `ctype_` | Country type | NO |
| `estate_` | Estate-specific | NO |

## Institutional Dependencies

Some root advances require institutions:

```paradox
feudalism_advance = {
    depth = 0
    allow = { has_embraced_institution = institution:feudalism }
}

printing_press_advance = {
    depth = 0
    allow = { has_embraced_institution = institution:printing_press }
}
```

## Common Issues and Solutions

### Issue 1: Random unconnected advances
**Cause:** Advances from non-universal files appearing in tree
**Solution:** Filter by source file (`0_age_of_*`)

### Issue 2: Government-specific advances in universal tree
**Cause:** `government` field not being filtered
**Solution:** Check for `government` field and exclude

### Issue 3: Choice advances appearing as roots
**Cause:** Advances with `for` field have no `requires`
**Solution:** Filter out advances with `for` field

### Issue 4: Orphaned advances
**Cause:** Advance requires another advance that was filtered out
**Solution:** After filtering, remove advances whose requirements don't exist in filtered set

## Statistics (as of documentation date)

- Total advance files: 189
- Total advance definitions: ~2589
- Universal advances (0_age_* files): ~500-520
- Root advances (depth=0): 24
- Country-specific: ~1825 (via potential)
- Government-specific: ~71
- Choice advances (for field): ~150
