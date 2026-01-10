# EU5 Object Cross-Reference Patterns

## Overview

EU5 uses two reference styles depending on context:
1. **Bare names** - Direct references within related categories
2. **Prefixed references** - Cross-category references using `type:name` syntax

## Reference Syntax Patterns

### Pattern 1: Bare Name References
Used for direct object references within related systems:

```paradox
unlock_building = cathedral           # Building name
unlock_unit = a_footmen              # Unit name
requires = city_building_advance     # Advance name
category = army_infantry             # Category name
copy_from = a_age_1_traditions       # Template name
pop_type = nobles                    # Pop type name
group = christian                    # Religion group name
```

### Pattern 2: Prefixed References
Used in conditions, triggers, and cross-category references:

```paradox
government_type = government_type:monarchy
religion = religion:catholic
has_culture_group = culture_group:chinese_group
has_reform = government_reform:military_order_reform
is_produced_in_market = goods:tools
institution = institution:feudalism
```

## Reference Matrix

### What Advances Reference

| Field | References | Style |
|-------|------------|-------|
| `age` | Age definitions | Bare (`age_1_traditions`) |
| `requires` | Other advances | Bare (`feudalism_advance`) |
| `unlock_building` | Building types | Bare (`cathedral`) |
| `unlock_unit` | Unit types | Bare (`a_footmen`) |
| `unlock_levy` | Levy types | Bare (`levy_a_footmen`) |
| `unlock_law` | Laws | Bare (`education_elites_law`) |
| `unlock_policy` | Policies | Bare (`aristocratic_court_policy`) |
| `unlock_government_reform` | Government reforms | Bare |
| `unlock_estate_privilege` | Estate privileges | Bare |
| `government` (filter) | Government types | Bare (`monarchy`) |
| `has_embraced_institution` | Institutions | Prefixed (`institution:feudalism`) |

### What Buildings Reference

| Field | References | Style |
|-------|------------|-------|
| `pop_type` | Pop types | Bare (`nobles`) |
| `category` | Building categories | Bare (`government_category`) |
| `employment_size` | Employment definitions | Bare |
| `government_type` (condition) | Government types | Prefixed (`government_type:monarchy`) |
| `has_reform` (condition) | Government reforms | Prefixed (`government_reform:X`) |
| `religion` (condition) | Religions | Prefixed (`religion:catholic`) |
| `culture` (condition) | Cultures | Prefixed (`culture:basque`) |
| `construction_demand` | Demand definitions | Bare |

### What Units Reference

| Field | References | Style |
|-------|------------|-------|
| `category` | Unit categories | Bare (`army_infantry`) |
| `copy_from` | Other units (templates) | Bare |
| `upgrades_to` | Other units | Bare |
| `pop_type` | Pop types | Bare (`burghers`) |
| `government_type` (condition) | Government types | Prefixed (`government_type:steppe_horde`) |
| `maintenance_demand` | Demand definitions | Bare |
| `construction_demand` | Demand definitions | Bare |
| `is_produced_in_market` | Goods | Prefixed (`goods:tools`) |

### What Religions Reference

| Field | References | Style |
|-------|------------|-------|
| `color` | Colors | Bare (`color_anglican`) |
| `group` | Religion groups | Bare (`christian`) |
| `language` | Languages | Bare (`church_slavonic_language`) |
| `opinions.X` | Other religions | Bare (`catharism`) |

### What Governments Reference

| Field | References | Style |
|-------|------------|-------|
| `heir_selection` | Heir selection types | Bare (`cognatic_primogeniture`) |
| `map_color` | Colors | Bare (`gov_monarchy`) |
| `government_power` | Power types | Bare (`legitimacy`) |
| `default_character_estate` | Estates | Bare (`nobles_estate`) |

### What Goods Reference

| Field | References | Style |
|-------|------------|-------|
| `category` | Goods categories | Bare (`produced`) |
| `color` | Colors | Bare (`goods_porcelain`) |
| `demand_multiply.X` | Pop types (as keys) | Bare (`nobles = 20`) |

## Prefix Reference Types

The following prefixes are used throughout EU5:

| Prefix | Used For |
|--------|----------|
| `government_type:` | Government systems (monarchy, republic, etc.) |
| `government_reform:` | Government reform options |
| `religion:` | Specific religions |
| `religion_group:` | Religion family groups |
| `culture:` | Specific cultures |
| `culture_group:` | Culture family groups |
| `goods:` | Trade goods |
| `institution:` | Institutions |
| `international_organization_type:` | International orgs |
| `estate_type:` | Estate types |
| `building_type:` | Building types (in some contexts) |

## Color Reference Conventions

Colors use a special naming pattern:
- `color_` prefix for religion/entity colors: `color_anglican`, `color_bogomilism`
- `goods_` prefix for trade good colors: `goods_porcelain`, `goods_grain`
- `pop_` prefix for pop type colors: `pop_nobles`, `pop_burghers`
- `gov_` prefix for government colors: `gov_monarchy`, `gov_republic`

## Validation Rules

When parsing EU5 files:

1. **Bare names** must match an object ID in the referenced category
2. **Prefixed references** must have valid prefix AND valid object ID
3. Some fields accept both styles (context-dependent)
4. References in `potential`, `allow`, `trigger` blocks typically use prefixed style
5. Direct property assignments typically use bare names

## Examples by Category

### Advance → Building
```paradox
cathedral_advance = {
    unlock_building = cathedral    # Bare reference to building_types/cathedral
}
```

### Building → Government (in condition)
```paradox
royal_court = {
    country_potential = {
        government_type = government_type:monarchy   # Prefixed
    }
}
```

### Unit → Goods (in condition)
```paradox
a_advanced_unit = {
    allow = {
        is_produced_in_market = goods:tools   # Prefixed
    }
}
```

### Advance → Institution (in allow block)
```paradox
printing_press_advance = {
    depth = 0
    allow = {
        has_embraced_institution = institution:printing_press   # Prefixed
    }
}
```
