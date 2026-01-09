# Events

Event definitions for EU5.

**Path:** `game/in_game/events/`

## File Organization

### Root-Level Events (29 files)
- `random_event.txt` (5,498 lines) - General random events
- `earthquake_events.txt` (5,390 lines) - Natural disasters
- `institution_events.txt` (3,532 lines) - Institution adoption
- `civil_war.txt` - Civil war mechanics
- `hre.txt` - Holy Roman Empire events
- `rebels.txt` - Rebel uprising events
- And more...

### Subdirectories (14 folders, 289 files)

| Folder | Files | Description |
|--------|-------|-------------|
| `DHE/` | 142 | Dynamic Historical Events (country-specific) |
| `disaster/` | 33 | Crisis and disaster chains |
| `religion/` | 28 | Religious mechanics and conversion |
| `situations/` | 23 | Long-duration world situations |
| `government/` | 18 | Government and succession |
| `economy/` | 10 | Trade, inflation, building |
| `character/` | 8 | Rulers, heirs, marriages |
| `diplomacy/` | 7 | Relations and annexation |
| `colonization/` | 6 | Colonial settlement |
| `estates/` | 6 | Estate satisfaction |
| `culture/` | 5 | Cultural integration |
| `missionevents/` | 3 | Mission system |
| `exploration/` | 2 | Discovery mechanics |
| `debug/` | 2 | QA/debug events |

**Total: 318 event files, 1,000+ events**

## Event Structure

```
namespace = event_namespace

event_id.1 = {
    type = country_event

    title = event_id.1.title
    desc = event_id.1.desc
    image = "gfx/interface/illustrations/event_image.dds"

    trigger = { <conditions> }
    immediate = { <setup_effects> }

    option = {
        name = event_id.1.a
        <effects>
    }

    option = {
        name = event_id.1.b
        <effects>
    }

    after = { <post_option_effects> }
}
```

## Event Types

| Type | Scope | Description |
|------|-------|-------------|
| `country_event` | Country | Most common - civil war, reforms, institutions |
| `character_event` | Character | Ruler personality, marriages |
| `province_event` | Province | Local events, building completion |
| `location_event` | Location | Location-specific events |
| `unit_event` | Military | Army/navy events |
| `age_event` | Age | Era transitions |
| `exploration_event` | Exploration | New world discovery |

## Event Categories

| Category | Icon | Files |
|----------|------|-------|
| `disaster_event` | Disaster icon | 34 disaster files |
| `situation_event` | Situation icon | 23 situation files |
| `international_organization_event` | IO icon | HRE, church events |
| (default) | Generic | Most events |

## Key Fields

### Display Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string/block | Event title (supports conditional) |
| `desc` | string/block | Event description |
| `image` | string | Illustration path (.dds) |
| `illustration_tags` | block | Auto-select image tags |
| `outcome` | enum | Audio: `positive`, `neutral`, `negative` |

### Behavior Fields

| Field | Type | Description |
|-------|------|-------------|
| `trigger` | block | Conditions to fire |
| `immediate` | block | Fire-time effects (scope saving) |
| `after` | block | Post-option effects |
| `on_trigger_fail` | block | Failure handling |

### Control Fields

| Field | Type | Description |
|-------|------|-------------|
| `hidden` | boolean | Invisible to player |
| `fire_only_once` | boolean | One-time per campaign |
| `major` | boolean | Notify other countries |
| `major_trigger` | block | Who sees notification |
| `interface_lock` | boolean | Pause game (default: yes) |

## Option Structure

```
option = {
    name = event_id.1.a

    # Visibility
    trigger = { <conditions> }
    hidden_trigger = { <conditions> }
    fallback = yes              # Available when others aren't
    exclusive = yes             # Hides other options

    # Tags
    historical_option = yes
    moral_option = yes
    evil_option = yes
    high_risk_option = yes
    high_reward_option = yes

    # AI behavior
    ai_chance = { base = 1 modifier = { add = 1 <triggers> } }

    # Effects
    <effect_block>
}
```

## Conditional Content

### Triggered Descriptions

```
title = {
    first_valid = {
        triggered_desc = {
            trigger = { exists = scope:target_character }
            desc = event.1.title.with_target
        }
        triggered_desc = {
            desc = event.1.title.default
        }
    }
}
```

### Immediate Block (Scope Saving)

```
immediate = {
    ruler = { save_scope_as = target_ruler }
    random_cabinet_character = { save_scope_as = target_minister }
    capital = { save_scope_as = capital_location }
}
```

## Event Triggering

### From Script

```
trigger_event = { id = event.1 days = 30 }
trigger_event_silently = { id = event.1 }
trigger_event_non_silently = { id = event.1 days = 15 }
```

### From On_Actions

Events fire from `on_action` pulse triggers:

```
monthly_country_pulse = {
    random_events = {
        10 = event_namespace.1    # Weight 10
        5 = event_namespace.2     # Weight 5
        chance_to_happen = 5      # 5% base chance
    }
}
```

## Examples

### Country Event (Institution)

```
institution_events.1 = {
    type = country_event

    trigger = {
        NOT = { has_embraced_institution = institution:feudalism }
        knows_about_institution = institution:feudalism
        any_owned_non_rural_location = {
            institution_progress:feudalism <= 50
        }
    }

    immediate = {
        random_owned_non_rural_location = {
            limit = { institution_progress:feudalism <= 50 }
            save_scope_as = feudal_province
        }
    }

    option = {
        name = institution_events.1.a
        scope:feudal_province = {
            change_institution_progress = {
                type = institution:feudalism
                value = institution_progress_extreme_bonus
            }
        }
    }
}
```

### Character Event (Personality)

```
character_events.1 = {
    type = country_event

    trigger = {
        has_ruler = yes
        ruler ?= { has_character_modifier = erratic }
    }

    immediate = {
        ruler ?= { save_scope_as = target_character }
    }

    option = {
        name = character_events.1.a
        add_legitimacy = legitimacy_weak_penalty
        scope:target_character = {
            add_character_modifier = {
                modifier = erratic_angry
                days = -1
            }
        }
    }
}
```

### Disaster Event

```
aspiration_for_liberty.1 = {
    type = country_event
    category = disaster_event
    image = "gfx/interface/illustrations/disaster/aspiration_for_liberty.dds"

    trigger = {
        any_active_disaster = {
            disaster_type = disaster_type:aspiration_for_liberty
        }
    }

    option = {
        name = aspiration_for_liberty.1.a
        add_stability = stability_extreme_penalty
        every_pop = {
            limit = { pop_type = pop_type:burghers }
            add_pop_satisfaction = pop_satisfaction_severe_penalty
        }
    }
}
```

## Dynamic Historical Events (DHE)

142 files in `DHE/` folder, named `flavor_<TAG>.txt`:
- `flavor_FRA.txt` - France events
- `flavor_ENG.txt` - England events
- `flavor_TUR.txt` - Ottoman events
- etc.

Each contains country-specific flavor events with high ID ranges to avoid collisions.

## Event ID System

- **Format:** `<namespace>.<id_number>`
- **Range:** 1-9999
- **Must be globally unique**

### Localization Keys

| Key | Pattern |
|-----|---------|
| Title | `event_id.1.title` |
| Description | `event_id.1.desc` |
| Option A | `event_id.1.a` |
| Option B | `event_id.1.b` |
| Tooltip | `event_id.1.a.tt` |

## Cross-References

Events reference many game objects:

| Reference | Example |
|-----------|---------|
| Religion | `religion = religion:catholic` |
| Government | `government_type = government_type:monarchy` |
| Estate | `estate_type:nobles_estate` |
| Institution | `institution:feudalism` |
| Advance | `has_advance = printing_press` |
| Disaster | `disaster_type:civil_war` |
| Pop Type | `pop_type:burghers` |
| Character Modifier | `has_character_modifier = erratic` |
| Country Modifier | `add_country_modifier = {...}` |

## Statistics

| Metric | Count |
|--------|-------|
| Total files | 318 |
| Total events | 1,000+ |
| DHE files | 142 |
| Disaster chains | 33 |
| Situation events | 23 |
| Religion events | 28 |
