# Governments

Government type, reform, and succession definitions for EU5.

**Paths:**
- Government Types: `game/in_game/common/government_types/`
- Government Reforms: `game/in_game/common/government_reforms/`
- Heir Selections: `game/in_game/common/heir_selections/`

## File Organization

### Government Types (1 file)
`00_default.txt` - All government types

### Government Reforms (5 files)
- `common.txt` - Shared reforms
- `monarchy.txt` - Monarchy reforms
- `republic.txt` - Republic reforms
- `country_specific.txt` - Nation-specific reforms
- `specialized.txt` - Special reforms

### Heir Selections (5 files)
- `monarchy.txt` - Monarchical succession
- `republic.txt` - Republican elections
- `theocracy.txt` - Theocratic succession
- `tribal.txt` - Tribal succession
- `specialized.txt` - Special succession types

## Government Type Fields

| Field | Type | Description |
|-------|------|-------------|
| `use_regnal_number` | boolean | Numbered ruler names (Henry IV) |
| `heir_selection` | string | Succession system (can have multiple) |
| `map_color` | color ref | Map display color |
| `government_power` | string | Power resource type (legitimacy, etc.) |
| `revolutionary_country_antagonism` | number | Revolution opposition level |
| `default_character_estate` | string | Primary estate reference |
| `generate_consorts` | boolean | Consort generation enabled |
| `modifier` | block | Government-wide modifiers |

## Government Types

| Type | Power | Default Estate |
|------|-------|----------------|
| `monarchy` | legitimacy | nobles_estate |
| `republic` | republican_tradition | burghers_estate |
| `theocracy` | devotion | clergy_estate |
| `steppe_horde` | horde_unity | tribes_estate |
| `tribe` | tribal_unity | tribes_estate |

## Government Reform Fields

| Field | Type | Description |
|-------|------|-------------|
| `age` | string | Era availability |
| `major` | boolean | Major reform flag |
| `potential` | block | Availability conditions |
| `allow` | block | Activation conditions |
| `country_modifier` | block | Game effects |
| `on_activate` | block | Activation effects |
| `years` | number | Duration in years |
| `societal_values` | block | Society value changes |

## Heir Selection Fields

| Field | Type | Description |
|-------|------|-------------|
| `traverse_family_tree` | boolean | Search family tree |
| `depth_first` | boolean | DFS traversal |
| `include_ruler_siblings` | boolean | Include siblings |
| `through_female` | boolean | Female line succession |
| `allow_female` | boolean | Female candidates allowed |
| `allow_male` | boolean | Male candidates allowed |
| `allow_children` | boolean | Minor candidates allowed |
| `ignore_ruler` | boolean | Exclude current ruler |
| `use_election` | boolean | Election process |
| `term_duration` | number | Term length in months |
| `max_possible_candidates` | number | Candidate limit |
| `allowed_estates` | block | Eligible estates |
| `heir_is_allowed` | block | Candidate filter trigger |
| `potential` | block | System availability |
| `sibling_score` | block | Candidate scoring calculation |

## Examples

### Government Type

```
monarchy = {
    use_regnal_number = yes

    heir_selection = cognatic_primogeniture
    heir_selection = agnatic_primogeniture
    heir_selection = absolute_cognatic_primogeniture

    map_color = gov_monarchy
    government_power = legitimacy
    revolutionary_country_antagonism = 20
    default_character_estate = nobles_estate
    generate_consorts = yes

    modifier = {
        # Government modifiers
    }
}
```

### Government Reform

```
centralized_bureaucracy = {
    age = age_2_renaissance
    major = yes

    potential = {
        government_type = government_type:monarchy
    }

    allow = {
        has_embraced_institution = institution:legalism
    }

    country_modifier = {
        monthly_towards_centralization = societal_value_monthly_move
        legislative_efficiency = 0.1
    }

    on_activate = {
        change_heir_selection = heir_selection:absolute_cognatic_primogeniture
    }

    years = 2
}
```

### Heir Selection

```
cognatic_primogeniture = {
    traverse_family_tree = yes
    depth_first = yes
    include_ruler_siblings = yes
    through_female = yes
    allow_female = yes
    allow_male = yes
    allow_children = yes

    potential = {
        government_type = government_type:monarchy
    }

    sibling_score = {
        if = {
            limit = { is_male = yes }
            add = { desc = "HEIR_SELECTION_MALE_DESC" value = 100 }
        }
        add = { desc = "HEIR_SELECTION_PRIMOGENITURE" value = birth_order multiply = -10 }
    }
}
```

## Succession Types

### Monarchical

| Type | Description |
|------|-------------|
| `cognatic_primogeniture` | Eldest child inherits, either gender |
| `agnatic_primogeniture` | Eldest male inherits |
| `absolute_cognatic_primogeniture` | Eldest regardless of gender |
| `fratricide_succession` | Ottoman-style succession |
| `unigeniture` | Single designated heir |

### Republican

| Type | Description |
|------|-------------|
| `noble_republic_election` | Noble estate election |
| `burgher_republic_election` | Burgher estate election |
| `merchant_republic_election` | Trade republic election |

### Theocratic

| Type | Description |
|------|-------------|
| `theocratic_election` | Religious leader selection |
| `papal_election` | Papal conclave |

### Tribal

| Type | Description |
|------|-------------|
| `tribal_election` | Tribal chief selection |
| `steppe_succession` | Horde succession |

## Cross-References

- Government types reference `heir_selections`
- Government types reference `estates`
- Reforms reference `government_types`
- Reforms reference `heir_selections` via `on_activate`
- Referenced by countries, laws, subjects
