# Disasters & Situations

Disaster and world situation definitions for EU5.

**Paths:**
- Disasters: `game/in_game/common/disasters/`
- Situations: `game/in_game/common/situations/`
- Diseases: `game/in_game/common/diseases/`

## File Organization

### Disasters (34 files)
One file per disaster type

### Situations (21 files)
Historical world events

### Diseases (1 file)
Disease definitions

## Disaster Fields

| Field | Type | Description |
|-------|------|-------------|
| `image` | string | Illustration path |
| `monthly_spawn_chance` | reference | Spawn frequency |

### Lifecycle Triggers

| Block | Purpose |
|-------|---------|
| `can_start` | Disaster onset conditions |
| `can_end` | Disaster end conditions |
| `modifier` | Active disaster modifiers |

### Event Triggers

| Block | Purpose |
|-------|---------|
| `on_start` | Triggered at onset |
| `on_monthly` | Monthly pulse events |
| `on_end` | Triggered at conclusion |

## Spawn Chances

| Value | Description |
|-------|-------------|
| `monthly_spawn_chance_very_low` | Very rare |
| `monthly_spawn_chance_low` | Rare |
| `monthly_spawn_chance_medium` | Moderate |
| `monthly_spawn_chance_high` | Common |
| `monthly_spawn_chance_unique` | One-time |

## Disaster Types

### Government Crises
- `revolution_disaster` - Revolutionary uprising
- `succession_crisis` - Heir disputes
- `coup_attempt` - Military coup
- `struggle_for_royal_power` - Royal power struggle

### Civil Conflicts
- `english_civil_war` - English Civil War
- `war_of_the_roses` - War of the Roses
- `castilian_civil_war` - Castilian succession
- `french_wars_of_religion` - Huguenot wars

### Dynastic Issues
- `time_of_troubles` - Russian chaos
- `muscovite_succession_war` - Moscow succession
- `byzantine_succession_crisis` - Byzantine decline

### Imperial Decline
- `decline_of_mali` - Mali collapse
- `decline_of_majapahit` - Majapahit decline
- `dissolution_of_delhi` - Delhi sultanate fall

### Religious/Cultural
- `sinicization_disaster` - Chinese assimilation
- `peasants_war` - Peasant revolt
- `hussitism_disaster` - Hussite crisis

## Example

```
revolution_disaster = {
    image = gfx/interface/illustrations/disaster/revolution_disaster.dds
    monthly_spawn_chance = monthly_spawn_chance_very_low

    can_start = {
        current_age = age_6_revolutions
        is_revolutionary = no
        in_civil_war = no
        at_war = no

        has_embraced_institution = institution:enlightenment
        NOT = { tag = PAP }
        NOT = { government_type = government_type:steppe_horde }

        average_country_literacy > 55
        is_great_power = yes

        estate_satisfaction:peasants_estate < 0.25
        OR = {
            "estate(estate_type:peasants_estate)" = { estate_tax_rate > 0.6 }
            "estate(estate_type:burghers_estate)" = { estate_tax_rate > 0.5 }
        }
    }

    can_end = {
        revolution_disaster_end_trigger = yes
    }

    modifier = {
        pop_leave_rebels_threshold = -0.25
        stability_investment = 0.50
    }

    on_start = {
        trigger_event_non_silently = revolution_disaster.1
    }

    on_monthly = {
        random_list = {
            1 = { trigger_event_non_silently = parliaments.28 }
            99 = { }
        }
    }

    on_end = {
        trigger_event_non_silently = revolution_disaster.3
    }
}
```

## Situation Fields

| Field | Type | Description |
|-------|------|-------------|
| `monthly_spawn_chance` | reference | Spawn frequency |
| `hint_tag` | string | Tutorial hint reference |

### Lifecycle Triggers

| Block | Purpose |
|-------|---------|
| `can_start` | Situation onset conditions |
| `can_end` | Situation end conditions |
| `visible` | Visibility conditions |

### Event Triggers

| Block | Purpose |
|-------|---------|
| `on_start` | Triggered at onset |
| `on_monthly` | Monthly pulse |
| `on_yearly` | Yearly pulse |

## Situation Types

### Religious
- `reformation` - Protestant Reformation
- `counter_reformation` - Catholic response
- `spread_of_islam` - Islamic expansion

### Political
- `hundred_years_war` - Anglo-French conflict
- `rise_of_ottomans` - Ottoman expansion
- `ming_collapse` - Ming dynasty fall

### Economic
- `columbian_exchange` - New World discovery
- `age_of_sail` - Maritime expansion

### Disease
- `black_death` - Bubonic plague
- `smallpox_in_americas` - New World epidemics

## Situation Example

```
reformation = {
    monthly_spawn_chance = monthly_spawn_chance_high
    hint_tag = hint_reformation

    can_start = {
        current_year >= 1510
    }

    can_end = {
        reformation_end_trigger = yes
    }

    visible = {
        exists = religion
        religion.group = religion_group:christian
        NOT = {
            OR = {
                religion = religion:miaphysite
                religion = religion:nestorianism
            }
        }
    }

    on_start = {
        religion:lutheran = { enable_religion = yes }

        continent:europe = {
            random_location_in_continent = {
                limit = {
                    has_building_with_at_least_one_level = university
                    dominant_religion = religion:catholic
                }
                weight = {
                    base = 1
                    modifier = { add = 12 region = region:north_german_region }
                }
                every_pop = {
                    limit = { religion = religion:catholic }
                    split_pop = { fraction = 0.50 religion = religion:lutheran }
                }
            }
        }

        every_country = {
            limit = { religion = religion:catholic }
            trigger_event_non_silently = reformation.1
        }
    }
}
```

## Cross-References

- Disasters reference `ages`
- Disasters reference `institutions`
- Disasters reference `estates`
- Disasters trigger `events`
- Situations reference `religions`
- Situations reference `international_organizations`
- Situations affect world state
