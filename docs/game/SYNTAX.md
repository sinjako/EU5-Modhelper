# Paradox Script Syntax Reference

EU5 uses the Clausewitz engine's script syntax. This document covers the syntax patterns used in game definition files.

## Basic Syntax

### Key-Value Pairs

```
property = value
number_value = 123
negative_value = -0.05
boolean_yes = yes
boolean_no = no
string_value = "quoted string"
unquoted_string = simple_identifier
```

### Comments

```
# This is a comment
property = value  # Inline comment
```

### Blocks

```
object_name = {
    property = value
    nested_block = {
        inner_property = value
    }
}
```

### Lists/Arrays

```
# Space-separated values
list = { item1 item2 item3 }

# Multi-line
list = {
    item1
    item2
    item3
}
```

## Value Types

### Numbers

```
integer = 123
negative = -50
decimal = 0.75
percentage = 0.25    # Usually 0.0 to 1.0 for percentages
large = 10000
```

### Booleans

```
enabled = yes
disabled = no
```

### Strings

```
# Quoted (preserves spaces)
name = "The Holy Roman Empire"

# Unquoted (identifiers)
reference = some_identifier
```

### Dates

```
start_date = 1444.11.11
end_date = 9999.1.1
# Format: YYYY.M.D (month/day can be single digit)
```

### Colors

```
# RGB format (0-255 per channel)
color = rgb { 32 33 79 }

# HSV format (0.0-1.0 per channel)
color = hsv { 0.5 0.8 0.9 }

# Color references
color = color_catholic
map_color = map_sweden
```

## References

### Direct References

```
# Reference to another definition
group = christianity
language = english_language
culture_groups = { germanic_group }
government_type = monarchy
```

### Scoped References

```
# Scope prefix syntax
religion = religion:catholic
estate = estate_type:nobles_estate
institution = institution:printing_press
building = building_type:university
```

### Variable References

```
# Script value references
max_levels = guild_max_level
employment_size = rural_peasant_produce_employment
```

## Operators

### Comparison Operators

Used in trigger blocks:

```
trigger = {
    adm > 33           # Greater than
    mil >= 50          # Greater than or equal
    stability < 3      # Less than
    prestige <= 100    # Less than or equal
    tag = FRA          # Equals
}
```

### Existence Check

```
# Safe navigation - returns false if scope doesn't exist
owner ?= { has_building = university }
capital ?= { continent = continent:europe }
```

### Logical Operators

```
OR = {
    tag = FRA
    tag = ENG
    tag = SPA
}

AND = {
    is_great_power = yes
    prestige > 50
}

NOT = {
    has_trait = cruel
}

NOR = {
    government_type = republic
    government_type = theocracy
}
```

## Trigger Blocks

Conditions that evaluate to true/false.

### Basic Triggers

```
potential = {
    is_great_power = yes
    government_type = government_type:monarchy
    religion.group = religion_group:christian
}
```

### Conditional Triggers

```
trigger_if = {
    limit = { country_exists = c:PAP }
    c:PAP = { opinion = { target = root value > 100 } }
}
trigger_else = {
    always = yes
}
```

### Scope Navigation

```
# Current scope
root = { is_at_war = yes }

# Owner of location
owner = { tag = FRA }

# Capital location
capital = { continent = continent:europe }

# Any matching scope
any_owned_location = {
    has_building = university
}

# Every matching scope (must all pass)
every_neighbor_country = {
    religion = root.religion
}
```

## Effect Blocks

Actions that modify game state.

### Basic Effects

```
effect = {
    add_prestige = 10
    add_stability = 1
    remove_trait = cruel
}
```

### Conditional Effects

```
if = {
    limit = { is_great_power = yes }
    add_prestige = 50
}
else_if = {
    limit = { is_regional_power = yes }
    add_prestige = 25
}
else = {
    add_prestige = 10
}
```

### Hidden Effects

```
# Suppress tooltip display
hidden_effect = {
    set_variable = { name = counter value = 0 }
}
```

### Scope Effects

```
every_owned_location = {
    limit = { has_building = church }
    add_building_level = 1
}

random_neighbor_country = {
    save_scope_as = target_country
}
```

## Modifier Blocks

Game effect modifiers.

### Country Modifiers

```
country_modifier = {
    monthly_prestige = 0.1
    stability_cost = -0.10
    diplomatic_reputation = 1
    global_tax_modifier = 0.05
}
```

### Location Modifiers

```
location_modifier = {
    local_development_cost = -0.10
    local_tax_modifier = 0.15
}
```

### Character Modifiers

```
character_modifier = {
    monthly_legitimacy = 0.1
    advisor_cost = -0.10
}
```

## Script Values

Reusable numeric calculations.

```
script_value_name = {
    value = base_property
    add = {
        desc = "LOCALIZATION_KEY"
        value = property_name
        multiply = 0.5
    }
    subtract = 10
    multiply = 2
    divide = 4
    min = 0
    max = 100
}
```

## Scripted Triggers

Reusable condition blocks.

```
trigger_name = {
    OR = {
        government_type = monarchy
        government_type = theocracy
    }
    NOT = { is_subject = yes }
}

# Usage
potential = {
    trigger_name = yes
}
```

## Scripted Effects

Reusable effect sequences.

```
effect_name = {
    add_prestige = 10
    if = {
        limit = { is_great_power = yes }
        add_stability = 1
    }
}

# Usage
on_activate = {
    effect_name = yes
}

# With parameters
effect_with_param = {
    $target$ = { add_opinion = { target = root value = 25 } }
}

# Usage
effect_with_param = { target = scope:ally }
```

## Event Triggers (on_action)

Periodic or conditional event firing.

```
monthly_country_pulse = {
    on_actions = {
        on_specific_event
    }

    random_events = {
        10 = event_namespace.1    # Weight 10
        5 = event_namespace.2     # Weight 5
        chance_to_happen = 5      # 5% base chance
    }

    events = {
        always_fire_event.1
    }
}
```

## Common Patterns

### Opinion Definitions

```
opinions = {
    catholic = enemy        # -100
    orthodox = negative     # -50
    protestant = kindred    # +25
    anglican = positive     # +50
}
```

### Tags/Custom Tags

```
tags = { western_gfx european_gfx christian_gfx }
custom_tags = { protestant reformation_era }
```

### Unlock Definitions

```
unlock_building = cathedral
unlock_law = cultural_traditions_law
unlock_unit = a_footmen
unlock_subject_type = vassal
```

### Production Methods

```
unique_production_methods = {
    method_name = {
        input_good = 0.8      # Input quantity
        produced = output_good
        output = 1.5          # Output multiplier
        category = method_category
    }
}
```

### AI Weights

```
ai_desire_to_join = {
    subtract = {
        value = country_rank
        multiply = 10
    }
    add = {
        value = opinion
        multiply = 0.5
    }
}
```

## Scope Reference Quick Guide

| Scope | Description |
|-------|-------------|
| `root` | Current context scope |
| `prev` | Previous scope in chain |
| `this` | Self reference |
| `scope:name` | Named saved scope |
| `owner` | Owner of current scope |
| `capital` | Capital location |
| `ruler` | Country ruler character |
| `c:TAG` | Country by tag |
| `religion:name` | Religion by name |
| `culture:name` | Culture by name |

## File Encoding

- All files use UTF-8 encoding
- Line endings: Windows (CRLF) or Unix (LF) accepted
- BOM (Byte Order Mark) may be present
