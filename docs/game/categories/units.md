# Military Units

Unit type and category definitions for EU5.

**Paths:**
- Unit Types: `game/in_game/common/unit_types/`
- Unit Categories: `game/in_game/common/unit_categories/`
- Unit Abilities: `game/in_game/common/unit_abilities/`
- Levies: `game/in_game/common/levies/`

## File Organization

### Unit Types (31 files)
- Age templates: `age_1_*.txt`, `age_2_*.txt`, etc.
- Land units: `infantry.txt`, `cavalry.txt`, `artillery.txt`
- Naval units: `galley.txt`, `light_ship.txt`, `heavy_ship.txt`
- Special units: `mercenaries.txt`, `levies.txt`

### Unit Categories (9 files)
Numbered files for each category type

## Unit Category Fields

| Field | Type | Description |
|-------|------|-------------|
| `is_army` | boolean | Land unit (vs navy) |
| `assault` | boolean | Can assault forts |
| `is_garrison` | boolean | Can garrison |
| `movement_speed` | number | Map movement speed |
| `build_time` | reference | Recruitment duration |
| `max_strength` | number | Unit strength pool |
| `supply_weight` | number | Supply consumption |
| `food_storage_per_strength` | number | Food capacity |
| `food_consumption_per_strength` | number | Food usage |

### Combat Fields

| Field | Description |
|-------|-------------|
| `damage_taken` | Damage multiplier |
| `frontage` | Combat width (1 to 1.5) |
| `initiative` | First strike chance |
| `combat_speed` | Battle speed |
| `flanking_ability` | Flank bonus |
| `secure_flanks_defense` | Flank defense |

### Naval Fields

| Field | Description |
|-------|-------------|
| `anti_piracy_warfare` | Anti-piracy stat |
| `transport_capacity` | Troop transport |

### Maintenance

| Field | Description |
|-------|-------------|
| `maintenance_demand` | Goods demand reference |
| `construction_demand` | Building cost reference |

## Unit Categories

### Land Units

| Category | Speed | Combat | Description |
|----------|-------|--------|-------------|
| `army_infantry` | 2.5 | 2 | Standard foot soldiers |
| `army_cavalry` | 2.5 | 4 | Mounted troops (4x combat) |
| `army_artillery` | 2.5 | - | Siege and bombardment |
| `army_auxiliary` | 2.5 | - | Supply and transport |

### Naval Units

| Category | Speed | Combat | Description |
|----------|-------|--------|-------------|
| `navy_galley` | 0.5 | - | Oared coastal ships |
| `navy_light_ship` | 0.5 | - | Fast traders/frigates |
| `navy_heavy_ship` | 0.5 | 0.5 | Combat warships |
| `navy_transport` | 0.5 | - | Troop transports |

## Unit Type Fields

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | Unit category reference |
| `copy_from` | string | Inherit stats from template |
| `max_strength` | number | Unit strength |
| `combat_power` | number | Combat effectiveness |
| `strength_damage_taken` | number | Strength damage modifier |
| `morale_damage_taken` | number | Morale damage modifier |
| `buildable` | boolean | Can be recruited |
| `levy` | boolean | Is a levy unit |
| `upgrades_to` | string | Upgrade path reference |

### Terrain Combat

```
combat = {
    grasslands = 0.10      # +10% in grassland
    wetlands = -0.10       # -10% in wetland
    mountains = -0.20      # -20% in mountains
}
```

### Graphics

| Field | Description |
|-------|-------------|
| `gfx_tags` | Visual tags (heavy_tag, crusader_tag) |
| `mercenaries_per_location` | Mercenary availability |

## Age Templates

Units are organized by age with progressive improvements:

```
# Age 1 base template
a_age_1_traditions_infantry = {
    category = army_infantry
    max_strength = 0.1
    combat_power = 1
}

# Age 2 improved
a_age_2_renaissance_infantry = {
    copy_from = a_age_1_traditions_infantry
    combat_power = 1.2
}
```

## Examples

### Infantry Unit

```
a_footmen = {
    category = army_infantry
    copy_from = a_age_1_traditions_infantry

    buildable = no
    levy = yes

    combat = {
        grasslands = 0.05
        forests = 0.10
    }

    gfx_tags = { infantry_tag }
}
```

### Cavalry Unit

```
a_mailed_knights = {
    category = army_cavalry
    copy_from = a_age_1_traditions_cavalry

    strength_damage_taken = -0.25
    morale_damage_taken = -0.25

    buildable = no
    levy = yes

    combat = {
        grasslands = 0.10
        wetlands = -0.10
    }

    gfx_tags = { heavy_tag cavalry_tag }
}
```

### Naval Unit

```
heavy_ship = {
    category = navy_heavy_ship
    max_strength = 0.5
    combat_power = 2

    transport_capacity = 0.050
    food_storage_per_strength = 0.2

    construction_demand = {
        lumber = 5
        iron = 2
        cloth = 1
    }
}
```

## Unit Progression

### Cavalry Evolution

| Age | Unit | Description |
|-----|------|-------------|
| 1 | Mailed Knights | Basic heavy cavalry |
| 2 | Plated Knights | Improved armor |
| 3 | Late Cavaliers | Advanced cavalry |
| 5 | Provincial Cavalry | Regional cavalry |
| 6 | Gendarmerie | Elite cavalry |

### Infantry Evolution

| Age | Unit | Description |
|-----|------|-------------|
| 1 | Footmen | Basic infantry |
| 2 | Men-at-Arms | Armored infantry |
| 3 | Arquebusiers | Early firearms |
| 4 | Musketeers | Musket infantry |
| 5 | Line Infantry | Drilled soldiers |
| 6 | Fusiliers | Modern infantry |

## Construction Demands

```
infantry_construction = {
    firearms = 0.1
    weaponry = 0.1
    leather = 0.05
    category = regiment_construction
}

heavy_cavalry_construction = {
    leather = 0.2
    cloth = 0.1
    horses = 1.0
    weaponry = 0.2
    tools = 0.2
    category = regiment_construction
}
```

## Cross-References

- Units reference `unit_categories`
- Units reference `goods` (construction/maintenance)
- Units unlock via `advances`
- Units affect military combat and strategy
