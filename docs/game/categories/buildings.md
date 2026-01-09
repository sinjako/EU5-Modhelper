# Buildings

Building type and category definitions for EU5.

**Paths:**
- Building Types: `game/in_game/common/building_types/`
- Building Categories: `game/in_game/common/building_categories/`
- Production Methods: `game/in_game/common/production_methods/`

## File Organization

### Building Types (43 files)
Organized by building type/chain:
- `00_basic.txt` - Basic infrastructure
- `01_government.txt` - Administrative buildings
- `02_military.txt` - Military buildings
- Industry chains: `cloth.txt`, `iron.txt`, `weapons.txt`, etc.

### Building Categories (1 file)
`00_default.txt` - All building categories

## Building Type Fields

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | Building category reference |
| `pop_type` | string | Worker type (peasants, burghers, etc.) |
| `max_levels` | reference | Maximum building levels |
| `employment_size` | reference | Worker employment size |
| `build_time` | reference | Construction duration |
| `is_foreign` | boolean | Can foreign countries build |
| `expensive` | boolean | High construction cost flag |

### Trigger Blocks

| Block | Purpose |
|-------|---------|
| `location_potential` | Buildability conditions |
| `allow` | Additional build triggers |
| `remove_if` | Automatic demolition conditions |

### Production Blocks

| Block | Purpose |
|-------|---------|
| `unique_production_methods` | Production recipes |
| `possible_production_methods` | Maintenance methods |
| `construction_demand` | Construction goods required |

### Modifier Blocks

| Block | Purpose |
|-------|---------|
| `modifier` | Building property modifiers |
| `market_center_modifier` | Merchant modifiers |

### Progression

| Field | Purpose |
|-------|---------|
| `obsolete` | Building this replaces |
| `custom_tags` | Metadata tags |

## Building Categories

| Category | Description |
|----------|-------------|
| `cargo_building_category` | Trade goods |
| `basic_industry_category` | Raw processing |
| `weapons_industry_category` | Military goods |
| `consumer_goods_category` | Finished goods |
| `government_category` | Administrative |
| `infrastructure_category` | Transportation |
| `religious_category` | Religious buildings |
| `cultural_category` | Cultural institutions |
| `trade_category` | Commerce |
| `naval_category` | Naval facilities |
| `military_category` | Military barracks |
| `defense_category` | Fortifications |
| `village_category` | Settlements |
| `colonial_category` | Overseas settlements |
| `estate_category` | Noble buildings |

## Production Methods

```
unique_production_methods = {
    cotton_to_cloth = {
        cotton = 0.8          # Input quantity
        produced = cloth
        output = 1.0          # Output multiplier
        category = guild_input
        debug_max_profit = 3
    }
}
```

## Example Building Chain

### Cloth Production Progression

```
cloth_guild = {
    category = consumer_goods_category
    pop_type = burghers
    max_levels = guild_max_level
    employment_size = guild_employment
    custom_tags = { guild }

    unique_production_methods = {
        cotton_to_cloth = { cotton = 0.8 produced = cloth output = 1.0 }
        wool_to_cloth = { wool = 0.8 produced = cloth output = 1.0 }
    }
}

cloth_workshop = {
    category = consumer_goods_category
    pop_type = burghers
    obsolete = cloth_guild    # Replaces guild
    custom_tags = { workshop }

    unique_production_methods = {
        cotton_to_cloth = { cotton = 0.8 produced = cloth output = 1.1 }  # +10%
    }
}

cloth_manufactory = {
    obsolete = cloth_workshop
    custom_tags = { midgame_manufactory }

    unique_production_methods = {
        cotton_to_cloth = { cotton = 0.8 dyes = 0.2 produced = cloth output = 2.0 }  # +100%
    }
}

textile_mill = {
    obsolete = cloth_manufactory
    custom_tags = { factory }

    unique_production_methods = {
        cotton_to_cloth = { cotton = 0.8 dyes = 0.3 produced = cloth output = 3.0 }  # +200%
    }
}
```

## Location Potential Examples

```
# RGO building (raw material)
iron_mine = {
    location_potential = {
        raw_material = goods:iron
    }
}

# Development-gated
university = {
    location_potential = {
        development >= 20
    }
}

# Terrain-specific
fishery = {
    location_potential = {
        is_coastal = yes
    }
}

# Climate-specific
vineyard = {
    location_potential = {
        climate = mediterranean
    }
}
```

## Construction Demand

```
construction_demand = {
    masonry = 2
    lumber = 1
    tools = 1
}
```

## Statistics

| Metric | Count |
|--------|-------|
| Building types | ~200 |
| Building categories | 14 |
| Production methods | 100+ |

## Cross-References

- Buildings reference `building_categories`
- Buildings reference `pop_types`
- Buildings reference `goods` (inputs/outputs)
- Buildings unlock via `advances`
- Buildings affect `production_methods`
