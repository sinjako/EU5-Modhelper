# Diplomacy

Casus belli, subject types, and international organization definitions for EU5.

**Paths:**
- Casus Belli: `game/in_game/common/casus_belli/`
- Subject Types: `game/in_game/common/subject_types/`
- International Organizations: `game/in_game/common/international_organizations/`
- War Goals: `game/in_game/common/wargoals/`
- Peace Treaties: `game/in_game/common/peace_treaties/`

## Casus Belli

### File Organization (62 files)
- `00_hardcoded.txt` - Engine CBs
- `01_event_triggered.txt` - Event CBs
- Thematic files: `union_cbs.txt`, `hre_cbs.txt`, `religious_cbs.txt`

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `visible` | block | Visibility trigger |
| `allow_creation` | block | Creation conditions |
| `allow_declaration` | block | Declaration conditions |
| `war_goal_type` | string | War goal reference |
| `can_expire` | boolean | Can expire over time |
| `allow_separate_peace` | boolean | Peace negotiation allowed |

### AI Fields

| Field | Description |
|-------|-------------|
| `ai_subjugation_desire` | AI desire to subjugate |
| `ai_cede_location_desire` | AI desire for territory |
| `additional_war_enthusiasm_attacker` | Morale modifier |

### War Goal Types

| Type | Description |
|------|-------------|
| `conquer_province` | Territorial conquest |
| `take_capital` | Capital seizure |
| `take_capital_tributary` | Force tributary |
| `independence` | Independence war |
| `take_capital_claim_throne` | Dynastic claim |
| `superiority` | War supremacy |
| `naval` | Naval dominance |

### Example

```
cb_conquest = {
    visible = {
        has_valid_claim = yes
    }

    allow_creation = {
        has_claim_on = scope:target
    }

    war_goal_type = conquer_province
    can_expire = yes
    allow_separate_peace = yes

    ai_subjugation_desire = -100
    ai_cede_location_desire = 50
}
```

## Subject Types

### File Organization (17 files)
One file per subject type

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `subject_pays` | string | Payment type enum |
| `color` | color ref | Subject map color |
| `level` | number | Hierarchy level (0-2) |
| `has_overlords_ruler` | boolean | Overlord controls heir |
| `can_be_annexed` | boolean | Annexation possible |
| `strength_vs_overlord` | number | Military weakness (-0.5 to -1.0) |

### Diplomatic Fields

| Field | Description |
|-------|-------------|
| `diplomatic_capacity_cost_scale` | Diplo cost multiplier |
| `great_power_score_transfer` | Score transfer fraction |
| `minimum_opinion_for_offer` | Opinion requirement |
| `has_limited_diplomacy` | Restrict diplomatic actions |

### War Participation

| Field | Description |
|-------|-------------|
| `join_offensive_wars_always` | Mandatory offensive joining |
| `join_offensive_wars_can_call` | Conditional joining |
| `join_defensive_wars_always` | Mandatory defensive joining |

### Annexation

| Field | Description |
|-------|-------------|
| `annexation_speed` | Annexation multiplier |
| `annexation_min_years` | Years before annexation |
| `annexation_min_opinion` | Opinion requirement |

### Overlord Privileges

| Field | Description |
|-------|-------------|
| `can_overlord_build_roads` | Build roads in subject |
| `can_overlord_build_buildings` | Build buildings |
| `can_overlord_recruit_regiments` | Recruit troops |
| `can_overlord_build_ships` | Build ships |

### Subject Types

| Type | Level | Description |
|------|-------|-------------|
| `vassal` | 2 | Traditional vassal |
| `march` | 1 | Military buffer state |
| `tributary` | 0 | Tribute-paying state |
| `colonial_nation` | 1 | Overseas colony |
| `dominion` | 1 | Self-governing territory |
| `appanage` | 2 | Family territory |
| `trade_company` | 1 | Trade enterprise |

### Example

```
vassal = {
    subject_pays = subject_pays_vassal
    color = subject_vassal
    level = 2

    has_overlords_ruler = no
    can_be_annexed = yes
    strength_vs_overlord = -0.75

    diplomatic_capacity_cost_scale = 0.5
    annexation_min_years = 10
    annexation_min_opinion = 150

    join_defensive_wars_always = { always = yes }
    join_offensive_wars_can_call = { always = yes }

    overlord_modifier = {
        monthly_towards_decentralization = 0.01
    }

    subject_modifier = {
        discipline = 0.05
        loyalty_to_overlord = 0.1
    }
}
```

## International Organizations

### File Organization (34 files)
One file per organization type

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `unique` | boolean | Only one instance exists |
| `has_target` | boolean | Targets other countries |
| `has_leader_country` | boolean | Has leader nation |
| `leader_type` | string | character or country |
| `has_parliament` | boolean | Parliament system |
| `parliament_type` | string | Parliament type reference |

### Membership

| Field | Description |
|-------|-------------|
| `can_join_trigger` | Joining eligibility |
| `can_leave_trigger` | Departure eligibility |
| `auto_leave_trigger` | Automatic removal |
| `on_joined` | Join effect |
| `on_left` | Leave effect |

### War Participation

| Field | Description |
|-------|-------------|
| `join_defensive_wars_always` | Defensive war joining |
| `join_defensive_wars_auto_call` | Auto-call conditions |
| `only_leader_country_joins_defensive_wars` | Leader-only defense |

### Territory

| Field | Description |
|-------|-------------|
| `land_ownership_rule` | Territory control rules |
| `antagonism_modifier_for_taking_land_from_fellow_member` | Aggression penalty |

### Modifiers

| Block | Purpose |
|-------|---------|
| `modifier` | Global IO modifier |
| `international_organization_modifier` | IO-specific modifier |
| `leader_modifier` | Leader country bonuses |

### Organization Types

| Type | Description |
|------|-------------|
| `hre` | Holy Roman Empire |
| `catholic_church` | Papal authority |
| `crusade` | Christian crusade |
| `jihad` | Islamic holy war |
| `coalition` | Defensive coalition |
| `defensive_league` | Regional defense |
| `japanese_shogunate` | Japanese shogunate |
| `colonial_federation` | Colonial federation |

### Example

```
hre = {
    unique = yes
    has_leader_country = yes
    leader_type = country
    leader_title_key = "HRE_LEADER"
    use_regnal_number = yes

    has_parliament = yes
    parliament_type = hre_court_assembly

    can_join_trigger = {
        is_neighbor_of_international_organization = yes
        government_type = government_type:monarchy
    }

    join_defensive_wars_always = {
        is_free_city = yes
    }

    only_leader_country_joins_defensive_wars = yes
    land_ownership_rule = hre_land_ownership

    antagonism_modifier_for_taking_land_from_fellow_member = 0.75

    leader_modifier = {
        diplomatic_capacity = 3
        max_diplomats = 1
    }

    variables = {
        imperial_authority = {
            format = "IO_IMPERIAL_AUTHORITY_FORMAT"
            min = 0
            max = 100
        }
    }
}
```

## Cross-References

- CBs reference `government_types`
- CBs reference `international_organizations`
- Subject types reference `government_types`
- Subject types reference `advances`
- IOs reference `parliament_types`
- IOs affect diplomatic relationships
