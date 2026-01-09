# Scripting System

Script value, trigger, effect, and trait definitions for EU5.

**Paths:**
- Script Values: `game/in_game/common/script_values/`
- Scripted Triggers: `game/in_game/common/scripted_triggers/`
- Scripted Effects: `game/in_game/common/scripted_effects/`
- On Actions: `game/in_game/common/on_action/`
- Traits: `game/in_game/common/traits/`

## Script Values

Reusable numeric calculations.

### File Organization (19 files)
- `define_values.txt` - Named constants
- `building_caps.txt` - Building level calculations
- `monthly_income.txt` - Revenue calculations
- `research_values.txt` - Tech advancement

### Syntax

```
script_value_name = {
    value = base_property
    add = {
        desc = "LOCALIZATION_KEY"
        value = property_name
        multiply = 0.5
    }
    subtract = 10
    min = 0
    max = 100
}
```

### Example

```
guild_max_level = {
    add = { desc = "BASE" value = 1 }
    add = {
        desc = "DEVELOPMENT"
        value = development
        multiply = 0.1
    }
    if = {
        limit = { location_rank ?= location_rank:city }
        add = { desc = "IS_CITY" value = 5 }
    }
}
```

## Scripted Triggers

Reusable condition blocks.

### File Organization (22 files)
Organized by scope (country, character, location, etc.)

### Syntax

```
trigger_name = {
    OR = {
        condition1 = value
        condition2 = value
    }
    NOT = { condition3 = value }
    trigger_if = {
        limit = { scope_check }
        actual_condition = value
    }
}
```

### Example

```
country_can_ennoble_trigger = {
    OR = {
        NOR = {
            government_type = government_type:republic
            government_type = government_type:theocracy
        }
        AND = {
            government_type = government_type:republic
            has_reform = government_reform:noble_elite
        }
    }
}

has_diplomatic_traits = {
    OR = {
        has_trait = careful
        has_trait = entrepreneur
        has_trait = charismatic_negotiator
    }
}
```

## Scripted Effects

Reusable action blocks.

### File Organization (14 files)
Organized by scope type

### Syntax

```
effect_name = {
    if = {
        limit = { trigger_block }
        effect_block
    }
    hidden_effect = {
        effect_block
    }
    every_scope = {
        limit = { filter }
        effect
    }
}
```

### Parameters

```
# Definition with parameter
effect_with_param = {
    $target$ = { add_opinion = { target = root value = 25 } }
}

# Usage
effect_with_param = { target = scope:ally }
```

### Example

```
create_newborn_ruler_child = {
    custom_tooltip = new_child_for_ruler
    hidden_effect = {
        create_character = {
            dynasty = root.ruler.dynasty
            culture = root.ruler.culture
            religion = root.ruler.religion
            father = root.ruler
            age = 0
            no_stats = yes
        }
    }
}

banish_character = {
    if = {
        limit = { exists = owner }
        owner = { save_scope_as = original_country }
    }
    scope:original_country = {
        random_neighbor_country = {
            save_scope_as = target_banish_country
        }
    }
    if = {
        limit = { exists = scope:target_banish_country }
        move_country = scope:target_banish_country
    }
    else = {
        kill_character_silently = { target = this reason = vanished }
    }
}
```

## On Actions

Event trigger definitions.

### File Organization (18+ files)
- `country_monthly.txt` - Monthly country pulse
- `country_yearly.txt` - Yearly country pulse
- `character.txt` - Character lifecycle
- `location_pulses.txt` - Location events

### Syntax

```
on_action_name = {
    on_actions = {
        on_nested_action
    }

    random_events = {
        10 = event_namespace.1    # Weight 10
        5 = event_namespace.2     # Weight 5
        chance_to_happen = 5      # Base chance
    }

    events = {
        always_fire_event.1
    }

    trigger = { conditions }
    effect = { actions }
}
```

### Example

```
monthly_country_pulse = {
    on_actions = {
        on_papal_opinion_added
        on_annexing_subject_monthly_pulse
    }

    random_events = {
        10 = empires.1
        10 = empires.2
        1 = border_friction.1
        chance_to_happen = 5
    }

    events = {
        earthquake_events.1
        banking.1
    }
}

on_character_birth = {
    trigger = {
        is_ruler = no
    }
    effect = {
        add_trait = newborn
    }
}
```

## Traits

Character trait definitions.

### File Organization (7 files)
- `00_ruler.txt` - Ruler traits
- `01_general.txt` - General traits
- `02_admiral.txt` - Admiral traits
- `03_artist.txt` - Artist traits
- `04_explorer.txt` - Explorer traits
- `05_child.txt` - Child traits
- `06_religious_figure.txt` - Religious leader traits

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `allow` | block | Assignment eligibility trigger |
| `category` | string | Trait type (ruler, general, etc.) |
| `flavor` | string | UI flavor category |
| `modifier` | block | Mechanical effects |

### Trait Categories

| Category | Description |
|----------|-------------|
| `ruler` | Ruler/monarch traits |
| `general` | Land commander traits |
| `admiral` | Naval commander traits |
| `artist` | Artist character traits |
| `explorer` | Explorer traits |
| `child` | Youth traits |
| `religious_figure` | Religious leader traits |

### Flavor Types

| Flavor | Description |
|--------|-------------|
| `personality` | Personality traits |
| `military` | Combat traits |
| `government_approach` | Ruling style |
| `education` | Education background |

### Example

```
just = {
    allow = {
        adm > 33
        NOT = { has_trait = cruel }
    }
    category = ruler
    flavor = personality
    modifier = {
        global_estate_target_satisfaction = 0.05
        peace_offer_fairness = 0.2
        stability_importance_modifier = 0.1
    }
}

cruel = {
    allow = {
        NOT = { has_trait = just }
    }
    category = ruler
    flavor = personality
    modifier = {
        global_estate_target_satisfaction = -0.05
        war_declaration_stab_hit_tolerance = 25
        can_execute_characters = yes
        peace_offer_fairness = -0.2
    }
}

tolerant = {
    allow = {
        NOT = { has_trait = zealot }
        NOT = { has_trait = pious }
        owner ?= {
            any_neighbor_country = {
                NOT = { religion = root.owner.religion }
            }
        }
    }
    category = ruler
    flavor = government_approach
    modifier = {
        tolerance_heretic = 1
        tolerance_heathen = 1
        religious_unity_importance_modifier = -0.2
    }
}
```

## Scope Reference

| Scope | Description |
|-------|-------------|
| `root` | Current context scope |
| `prev` | Previous scope in chain |
| `this` | Self reference |
| `scope:name` | Named saved scope |
| `owner` | Owner of current scope |
| `capital` | Capital location |
| `ruler` | Country ruler |

## Operators

| Operator | Description |
|----------|-------------|
| `=` | Equals |
| `>`, `>=` | Greater than |
| `<`, `<=` | Less than |
| `?=` | Existence check |
| `NOT`, `OR`, `AND` | Logical operators |

## Cross-References

- Script values used in modifiers
- Triggers used in events, decisions
- Effects used in events, decisions
- On actions fire events
- Traits reference other traits
