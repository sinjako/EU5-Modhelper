# Population & Estates

Population type and estate definitions for EU5.

**Paths:**
- Pop Types: `game/in_game/common/pop_types/`
- Estates: `game/in_game/common/estates/`
- Estate Privileges: `game/in_game/common/estate_privileges/`

## File Organization

### Pop Types (1 file)
`00_default.txt` - All 8 population types

### Estates (1 file)
`00_default.txt` - All 8 estate types

### Estate Privileges (4 files)
Organized by estate type

## Pop Type Fields

| Field | Type | Description |
|-------|------|-------------|
| `color` | color ref | Pop color reference |
| `editor` | number | Editor weight (0.01 to 1.0) |
| `assimilation_conversion_factor` | number | Assimilation speed |
| `pop_food_consumption` | number | Food needs (0 to 20) |
| `city_graphics` | number | Visual representation weight |
| `promotion_factor` | number | Promotion speed (0.1 to 1.5) |
| `migration_factor` | number | Migration tendency |
| `grow` | boolean | Natural population growth |
| `upper` | boolean | Upper class status |
| `has_cap` | boolean | Population cap exists |

### Estate Associations

| Field | Description |
|-------|-------------|
| `nobles_estate` | Nobles estate association |
| `clergy_estate` | Clergy estate association |
| `burghers_estate` | Burgher estate association |
| `peasants_estate` | Peasant estate association |
| `dhimmi_estate` | Dhimmi estate association |
| `tribes_estate` | Tribal estate association |

### Literacy Impact

```
literacy_impact = {
    cultural_tradition = 0.2
    monthly_control = 0.01
}
```

### Promotion Rules

```
promote_to = {
    pop_type:nobles = { weight = 0.1 }
    pop_type:burghers = { weight = 0.5 }
}
```

## Pop Types

| Type | Food | Promotion | Description |
|------|------|-----------|-------------|
| `nobles` | 20 | 0.1 | Upper class, high consumption |
| `clergy` | 5 | 0.1 | Religious leaders |
| `burghers` | 4 | 0.5 | Traders and merchants |
| `laborers` | 1 | 1.5 | Factory workers |
| `soldiers` | 5 | 1.0 | Military personnel |
| `peasants` | 1 | 0.5 | Base rural population |
| `tribesmen` | 0 | 0.0 | Tribal population |
| `slaves` | 1 | 0.0 | Enslaved population |

## Estate Fields

| Field | Type | Description |
|-------|------|-------------|
| `color` | color ref | Estate color |
| `power_per_pop` | number | Power generation (0 to 25) |
| `tax_per_pop` | number | Tax contribution (0 to 150) |
| `rival` | number | Rivalry modifier |
| `alliance` | number | Alliance modifier |
| `characters_have_dynasty` | string | Dynasty rules (always/yes/no) |
| `can_generate_mercenary_leaders` | boolean | Mercenary generation |
| `bank` | boolean | Can loan money |
| `ruler` | boolean | Is ruler estate |

### Estate Modifiers

| Block | Purpose |
|-------|---------|
| `satisfaction` | Bonuses when satisfied |
| `high_power` | Bonuses when power is high |
| `low_power` | Penalties when power is low |
| `power` | Base power effects |
| `opinion` | Opinion calculation system |

## Estates

| Estate | Power/Pop | Tax/Pop | Description |
|--------|-----------|---------|-------------|
| `crown_estate` | 0 | - | Ruler estate |
| `nobles_estate` | 25 | 150 | Nobility (highest tax) |
| `clergy_estate` | 10 | 25 | Religious leaders |
| `burghers_estate` | 2 | 20 | Merchants and traders |
| `peasants_estate` | 0.025 | 1 | Common people (lowest tax) |
| `dhimmi_estate` | 0.02 | 1 | Non-Muslim minority |
| `tribes_estate` | 0.01 | 0.01 | Tribal population |
| `cossacks_estate` | 0.02 | 0.02 | Cossack militias |

## Examples

### Pop Type

```
nobles = {
    color = pop_nobles

    editor = 1.0
    assimilation_conversion_factor = 0.25
    pop_food_consumption = 20
    city_graphics = 1.0
    promotion_factor = 0.1
    migration_factor = 0.05

    grow = no
    upper = yes
    has_cap = yes

    nobles_estate = yes

    literacy_impact = {
        cultural_tradition = 0.2
        monthly_control = 0.01
    }
}

peasants = {
    color = pop_peasants

    pop_food_consumption = 1
    promotion_factor = 0.5
    migration_factor = 0.5

    grow = yes
    upper = no
    has_cap = no

    peasants_estate = yes

    promote_to = {
        pop_type:nobles = { weight = 0.05 }
        pop_type:clergy = { weight = 0.1 }
        pop_type:burghers = { weight = 0.3 }
        pop_type:laborers = { weight = 0.5 }
        pop_type:soldiers = { weight = 0.2 }
    }
}
```

### Estate

```
nobles_estate = {
    color = estate_nobles
    power_per_pop = 25
    tax_per_pop = 150

    rival = -0.01
    alliance = 0.01
    characters_have_dynasty = always

    satisfaction = {
        cavalry_combat_modifier = 0.1
        levy_reinforcement_rate = 0.5
    }

    high_power = {
        noble_tax_cap = -0.5
        levy_combat_modifier = 1.0
    }

    low_power = {
        noble_tax_cap = 0.25
        monthly_autonomy = 0.5
    }
}

crown_estate = {
    color = estate_crown
    power_per_pop = 0
    ruler = yes

    high_power = {
        cabinet_efficiency = 1.0
        building_upkeep_cost = -1.0
    }

    low_power = {
        cabinet_efficiency = -1.0
        building_upkeep_cost = 2.0
    }
}
```

## Estate Mechanics

### Power Calculation

Estate power is calculated based on:
- Pop count * power_per_pop
- Territory controlled
- Privileges granted

### Satisfaction

Estate satisfaction affects:
- Modifier bonuses
- Revolt risk
- Political stability

### Tax Cap

Each estate has a tax cap that limits taxation rate.
High power estates reduce their own tax cap.

## Cross-References

- Pop types associated with `estates`
- Pops employed by `buildings`
- Estates referenced by `government_types`
- Estates affect `laws` availability
- Estate power affects country stability
