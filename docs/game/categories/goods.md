# Goods

Trade goods and demand system definitions for EU5.

**Paths:**
- Goods: `game/in_game/common/goods/`
- Goods Demand: `game/in_game/common/goods_demand/`
- Goods Demand Category: `game/in_game/common/goods_demand_category/`

## File Organization

### Goods (6 files)
- `00_raw_materials.txt` - Mining, farming, gathering
- `01_plantation_goods.txt` - Colonial plantation crops
- `02_produced_goods.txt` - Manufactured items
- `03_food.txt` - Food and beverages
- `04_special.txt` - Special goods

### Goods Demand (7 files)
- `pop_demands.txt` - Population consumption
- `army_demands.txt` - Military maintenance
- `navy_demands.txt` - Naval maintenance
- `building_construction_costs.txt` - Construction
- `special_construction_demands.txt` - Unique buildings
- `hardcoded.txt` - Engine demands
- `from_events.txt` - Event-triggered

## Goods Fields

| Field | Type | Description |
|-------|------|-------------|
| `method` | string | Extraction method (farming, mining, etc.) |
| `category` | string | Classification (raw_material, produced, food) |
| `color` | color ref | Goods color (`goods_cloth`, `goods_gold`) |
| `default_market_price` | number | Base price (0.5 to 10) |
| `transport_cost` | number | Transport cost (0.5 to 5) |
| `base_production` | number | Base RGO output (0.1 to 0.4) |
| `inflation` | boolean | Subject to inflation (precious metals) |

### AI Fields

| Field | Description |
|-------|-------------|
| `ai_rgo_expansion_priority` | AI preference to expand (0 to 0.25) |
| `ai_rgo_size_importance` | AI size weighting (3 to 10) |

### Demand Fields

| Field | Description |
|-------|-------------|
| `demand_add` | Flat demand by pop type |
| `demand_multiply` | Multiplicative demand |
| `wealth_impact_threshold` | Price sensitivity to wealth |
| `development_threshold` | Dev level before available |
| `custom_tags` | Metadata (old_world, new_world) |

## Extraction Methods

| Method | Description |
|--------|-------------|
| `farming` | Agricultural production |
| `mining` | Mineral extraction |
| `gathering` | Collection/harvesting |
| `hunting` | Animal hunting |
| `forestry` | Wood harvesting |

## Goods Categories

| Category | Description |
|----------|-------------|
| `raw_material` | Unprocessed resources |
| `produced` | Manufactured goods |
| `food` | Food and beverages |

## Examples

### Raw Material (Gold)

```
goods_gold = {
    method = mining
    category = raw_material
    color = goods_gold
    default_market_price = 10       # High value
    transport_cost = 0.5
    base_production = 0.1
    inflation = yes                 # Causes inflation
    ai_rgo_expansion_priority = 0.2

    demand_add = {
        nobles = 0.025
    }

    wealth_impact_threshold = {
        all = 1.05
    }
}
```

### Produced Good (Cloth)

```
cloth = {
    category = produced
    color = goods_cloth
    default_market_price = 3

    demand_add = {
        peasants = 0.0005
        soldiers = 0.001
        laborers = 0.0005
        slaves = 0.0002
        burghers = 0.01
        clergy = 0.02
    }

    wealth_impact_threshold = {
        all = 1.0
    }
}
```

## Goods Demand Examples

### Pop Demands

```
# Wine demand with conditional multipliers
wine_pop_demand = {
    goods = wine

    # Religion restriction (Muslims don't drink)
    trigger_if = {
        limit = { religion.group = religion_group:muslim }
        multiply = 0
    }

    # Culture preference (Japanese prefer sake)
    trigger_if = {
        limit = { culture.language.family = japanese_family }
        multiply = 0.5
    }

    # Regional bonus
    trigger_if = {
        limit = { region = region:mediterranean }
        multiply = 2
    }

    # Class multiplier
    demand_multiply = {
        upper = 2.5
    }
}
```

### Army Demands

```
infantry_maintenance = {
    firearms = 0.1
    weaponry = 0.1
    leather = 0.05
    category = regiment_maintenance
}

heavy_cavalry_maintenance = {
    horses = 1.0
    leather = 0.2
    cloth = 0.1
    weaponry = 0.2
    category = regiment_maintenance
}
```

### Building Construction

```
school_construction = {
    paper = 2
    books = 1
    masonry = 1
    category = building_construction
}

horse_breeders_construction = {
    masonry = 0.5
    lumber = 0.2
    wheat = 0.25
    horses = 0.15
    category = building_construction
}
```

## Goods List (Sample)

### Raw Materials
- `wheat`, `rice`, `grain` - Staple crops
- `cotton`, `wool`, `silk` - Textiles
- `iron`, `copper`, `gold`, `silver` - Metals
- `lumber`, `stone` - Construction
- `fish`, `cattle`, `horses` - Animals

### Produced Goods
- `cloth`, `leather`, `paper` - Basic manufactured
- `weapons`, `firearms`, `artillery` - Military
- `tools`, `glass`, `furniture` - Industrial
- `books`, `luxury_goods` - Luxury

### Food & Beverages
- `grain`, `fish`, `meat` - Basic food
- `wine`, `beer`, `spirits` - Alcohol
- `spices`, `tea`, `coffee` - Colonial goods

## Cross-References

- Goods referenced by `buildings` (production)
- Goods referenced by `goods_demand` (consumption)
- Goods referenced by `unit_types` (maintenance)
- Goods affect market prices and trade
