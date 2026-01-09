# Religions

Religion definitions for EU5.

**Paths:**
- Religions: `game/in_game/common/religions/`
- Religion Groups: `game/in_game/common/religion_groups/`

## File Organization

### Religions (29 files)
- `buddhist.txt`, `christian.txt`, `muslim.txt` - Major religions
- `dharmic.txt`, `druze.txt`, `israelite.txt` - Regional religions
- `folk_*.txt` - Folk/pagan religions by region

### Religion Groups (1 file)
- `00_default.txt` - All religion groups

## Religion Fields

| Field | Type | Description |
|-------|------|-------------|
| `color` | color ref | UI color (`color_catholic` or `religion_catholic`) |
| `group` | string | Religion group reference |
| `language` | string | Liturgical language reference |
| `enable` | date | Historical enable date |
| `religious_aspects` | number | Number of aspects/tenets |
| `has_religious_influence` | boolean | Influence mechanics enabled |
| `has_religious_head` | boolean | Has religious leader |
| `has_cardinals` | boolean | Cardinal system (Catholic) |
| `has_canonization` | boolean | Saint system |
| `needs_reform` | boolean | Can be reformed |
| `ai_wants_convert` | boolean | AI conversion preference |
| `religious_school` | string | School/sect reference (can have multiple) |

### Modifier Blocks

| Block | Purpose |
|-------|---------|
| `definition_modifier` | Game effects |
| `opinions` | Relations to other religions |
| `unique_names` | Character name lists |
| `tags` | Cosmetic GFX tags |
| `custom_tags` | Custom classifications |

## Religion Group Fields

| Field | Type | Description |
|-------|------|-------------|
| `color` | color ref | UI color |
| `allow_slaves_of_same_group` | boolean | Slavery rules |
| `convert_slaves_at_start` | boolean | Start slave conversion |
| `modifier` | block | Game effects |

## Examples

### Religion

```
catholic = {
    color = religion_catholic
    group = christian
    language = latin_language

    religious_aspects = 3
    has_religious_influence = yes
    has_religious_head = yes
    has_cardinals = yes
    has_canonization = yes
    needs_reform = yes

    definition_modifier = {
        # Modifiers here
    }

    opinions = {
        orthodox = negative
        protestant = enemy
        sunni = enemy
    }

    unique_names = { name_john name_peter name_paul }
    tags = { catholic_gfx western_christian_gfx }
}
```

### Religion Group

```
christian = {
    color = religion_catholic
    allow_slaves_of_same_group = no
    convert_slaves_at_start = yes
    modifier = { }
}
```

## Opinion Values

| Value | Meaning |
|-------|---------|
| `kindred` | +25 opinion |
| `positive` | +50 opinion |
| `negative` | -50 opinion |
| `enemy` | -100 opinion |

## Religion Groups List

- `christian` - Christianity
- `muslim` - Islam
- `buddhist` - Buddhism
- `dharmic` - Dharmic religions
- `zoroastrian_group` - Zoroastrianism
- `manichaean_group` - Manichaeism
- `mandean_group` - Mandaeism
- `druze_group` - Druze
- `yazidi_group` - Yazidi
- `israelite_group` - Judaism
- `folk_*_group` - Regional folk religions

## Islamic Schools

Islam religions can have multiple schools:
```
sunni = {
    group = muslim
    religious_school = hanafi_school
    religious_school = maliki_school
    religious_school = shafii_school
    religious_school = hanbali_school
}
```

## Cross-References

- References `religion_groups` via `group` field
- References `languages` via `language` field
- References other religions in `opinions` block
- Referenced by cultures, countries, characters
