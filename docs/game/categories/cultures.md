# Cultures

Culture, culture group, and language definitions for EU5.

**Paths:**
- Cultures: `game/in_game/common/cultures/`
- Culture Groups: `game/in_game/common/culture_groups/`
- Languages: `game/in_game/common/languages/`
- Language Families: `game/in_game/common/language_families/`
- Ethnicities: `game/in_game/common/ethnicities/`

## File Organization

### Cultures (53 files)
Regional organization: `british.txt`, `arabia.txt`, `east_asia.txt`, etc.

### Culture Groups (1 file)
`00_culture_groups.txt` - All culture groups

### Languages (33 files)
Regional organization: `00_arabia.txt`, `00_europe.txt`, etc.

### Language Families (1 file)
`00_language_families.txt` - All language families

## Culture Fields

| Field | Type | Description |
|-------|------|-------------|
| `language` | string | Language reference |
| `color` | color ref | UI color (`map_ENG`, `map_culturename`) |
| `tags` | block | Cosmetic GFX tags |
| `opinions` | block | Relations to other cultures |
| `culture_groups` | block | Group membership (can be multiple) |
| `use_patronym` | boolean | Patronymic naming |

### Modifier Blocks

| Block | Purpose |
|-------|---------|
| `country_modifier` | Country-level effects |
| `character_modifier` | Character-level effects |
| `location_modifier` | Location-level effects |
| `noun_keys` | Cultural nouns for naming |
| `adjective_keys` | Cultural adjectives |

## Culture Group Fields

| Field | Type | Description |
|-------|------|-------------|
| `country_modifier` | block | Country-level effects |
| `character_modifier` | block | Character-level effects |
| `location_modifier` | block | Location-level effects |

## Language Fields

| Field | Type | Description |
|-------|------|-------------|
| `color` | color ref | UI color |
| `family` | string | Language family reference |
| `male_names` | block | Male character names |
| `female_names` | block | Female character names |
| `dynasty_names` | block | Dynasty/house names |
| `lowborn` | block | Lowborn character names |
| `patronym_prefix_son` | string | Son patronym localization key |
| `patronym_prefix_daughter` | string | Daughter patronym key |
| `location_prefix` | string | Location prefix key |
| `location_suffix` | string | Location suffix key |
| `dialects` | block | Dialect variants |

## Examples

### Culture

```
english = {
    language = english_dialect
    color = map_ENG

    tags = { english_gfx british_gfx european_gfx }

    opinions = {
        irish = enemy
        scottish = negative
        welsh = negative
        norman = positive
    }

    culture_groups = {
        british_group
    }

    country_modifier = { }
    character_modifier = { }
    location_modifier = { }

    noun_keys = { adder falcon baron castle }
    adjective_keys = { black red yellow white }
}
```

### Culture Group

```
british_group = {
    country_modifier = { }
    character_modifier = { }
    location_modifier = { }
}
```

### Language

```
english_language = {
    color = map_english
    family = germanic_language_family

    male_names = { name_edward name_william name_richard }
    female_names = { name_elizabeth name_mary name_anne }
    dynasty_names = { Tudor Stuart Windsor }
    lowborn = { Smith Jones Brown }

    patronym_prefix_son = "patronym_prefix_english_son"
    patronym_prefix_daughter = "patronym_prefix_english_daughter"

    dialects = {
        english_dialect = { }
        scots_dialect = {
            location_prefix = "location_prefix_scots"
        }
    }
}
```

## Opinion Values

| Value | Meaning |
|-------|---------|
| `kindred` | +25 opinion |
| `positive` | +50 opinion |
| `negative` | -50 opinion |
| `enemy` | -100 opinion |

## Culture Groups List (Sample)

- `british_group`, `celtic_group`, `french_group`
- `german_group`, `scandinavian_group`, `italian_group`
- `iberian_group`, `slavic_group`, `russian_group`
- `arabic_group`, `persian_group`, `turkic_group`
- `chinese_group`, `japanese_group`, `korean_group`
- `indian_group`, `dravidian_group`
- `african_group`, `mesoamerican_group`
- And 50+ more...

## Language Families

- `germanic_language_family`
- `romance_language_family`
- `slavic_language_family`
- `semitic_language_family`
- `sino_tibetan_language_family`
- `indo_aryan_language_family`
- `turkic_language_family`
- And more...

## Cross-References

- Cultures reference `languages` via `language` field
- Cultures reference `culture_groups` via `culture_groups` block
- Languages reference `language_families` via `family` field
- Referenced by countries, characters, locations
