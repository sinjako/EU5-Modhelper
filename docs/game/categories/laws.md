# Laws & Policies

Law and policy definitions for EU5.

**Paths:**
- Laws: `game/in_game/common/laws/`
- Policies: `game/in_game/common/policies/`

## File Organization

### Laws (30+ files)
- Government type: `00_monarchy.txt`, `00_republic.txt`, `00_theocracies.txt`
- Systems: `01_legal_system.txt`, `01_military_laws.txt`, `01_naval_laws.txt`
- Political: `02_distribution_of_power.txt`, `02_country_specific.txt`
- Estate: `03_estate_laws.txt`
- IO-specific: `20_hre.txt`, `20_shogunate.txt`
- Religion: `30_hindu.txt`, `31_catholic_church.txt`, `sects.txt`
- Special: `colonial_laws.txt`, `40_personal_unions.txt`

### Policies (3 files)
Policy option definitions

## Law Categories

| Category | Description |
|----------|-------------|
| `administrative` | Administration laws |
| `military` | Military laws |
| `naval` | Naval laws |
| `religious` | Religious laws |
| `socioeconomic` | Social/economic laws |
| `estates` | Estate laws |

## Law Fields

| Field | Type | Description |
|-------|------|-------------|
| `law_category` | string | Law category type |
| `law_gov_group` | string | Government type filter |
| `potential` | block | Law availability triggers |
| `locked` | block | Lock conditions (can't change) |

## Policy Fields

Each law contains multiple named policy blocks:

| Field | Type | Description |
|-------|------|-------------|
| `potential` | block | Policy availability |
| `allow` | block | Activation conditions |
| `country_modifier` | block | Game effects |
| `estate_preferences` | block | Favored estates |
| `years` | number | Duration in years |

## Examples

### Legal Code Law

```
legal_code_law = {
    law_category = administrative

    potential = {
        NOT = { has_tribal_government = yes }
    }

    # Traditional Law
    traditional_law_policy = {
        potential = { always = yes }

        country_modifier = {
            monthly_towards_traditional = societal_value_minor_monthly_move
        }

        estate_preferences = {
            nobles_estate
            clergy_estate
        }

        years = 2
    }

    # Civil Law (European)
    civil_law_policy = {
        potential = {
            has_embraced_institution = institution:legalism
            capital = { continent = continent:europe }
        }

        allow = {
            has_unlocked_policy_trigger = { type = court_of_appeals }
        }

        country_modifier = {
            legislative_efficiency = 0.10
            monthly_towards_centralization = societal_value_minor_monthly_move
        }

        estate_preferences = {
            burghers_estate
        }

        years = 2
    }

    # Sharia Law (Islamic)
    sharia_law_policy = {
        potential = {
            religion.group = religion_group:muslim
        }

        locked = {
            has_policy = sharia_law_policy
        }

        country_modifier = {
            global_pop_conversion_speed_modifier = 0.25
            monthly_towards_theocratic = societal_value_minor_monthly_move
        }

        estate_preferences = {
            clergy_estate
        }

        years = 2
    }
}
```

### Military Law

```
military_organization_law = {
    law_category = military

    potential = {
        has_tribal_government = no
    }

    # Feudal Levy
    feudal_levy_policy = {
        potential = { always = yes }

        country_modifier = {
            levy_reinforcement_rate = 0.10
            monthly_towards_decentralization = societal_value_minor_monthly_move
        }

        estate_preferences = {
            nobles_estate
        }
    }

    # Professional Army
    professional_army_policy = {
        potential = {
            has_advance = standing_armies_advance
        }

        country_modifier = {
            discipline = 0.05
            army_maintenance = 0.20
            monthly_towards_centralization = societal_value_minor_monthly_move
        }

        estate_preferences = {
            crown_estate
        }
    }
}
```

### Estate Law

```
noble_privileges_law = {
    law_category = estates

    potential = {
        NOT = { has_tribal_government = yes }
    }

    # High Noble Privileges
    high_noble_privileges_policy = {
        potential = { always = yes }

        country_modifier = {
            noble_tax_cap = -0.20
            noble_estate_power_modifier = 0.25
        }

        estate_preferences = {
            nobles_estate
        }
    }

    # Reduced Noble Privileges
    reduced_noble_privileges_policy = {
        potential = {
            has_reform = centralized_bureaucracy
        }

        country_modifier = {
            noble_tax_cap = 0.10
            noble_estate_power_modifier = -0.25
        }

        estate_preferences = {
            crown_estate
            burghers_estate
        }
    }
}
```

## Government-Specific Laws

### Monarchy Laws
- Succession laws
- Royal privileges
- Court administration

### Republic Laws
- Election laws
- Term limits
- Citizenship

### Theocracy Laws
- Religious authority
- Ecclesiastical courts
- Appointment rules

## IO-Specific Laws

### HRE Laws
- Imperial authority
- Free city status
- Elector rights

### Shogunate Laws
- Daimyo relations
- Shogun authority
- Bakufu administration

## Policy Modifiers

### Societal Value Movement

```
monthly_towards_centralization = societal_value_minor_monthly_move
monthly_towards_decentralization = societal_value_minor_monthly_move
monthly_towards_traditional = societal_value_minor_monthly_move
monthly_towards_innovative = societal_value_minor_monthly_move
```

### Common Modifiers

| Modifier | Description |
|----------|-------------|
| `legislative_efficiency` | Law enactment speed |
| `stability_cost` | Stability investment cost |
| `global_tax_modifier` | Tax collection |
| `discipline` | Military discipline |
| `global_estate_target_satisfaction` | Estate satisfaction |

## Cross-References

- Laws reference `government_types`
- Laws reference `institutions`
- Laws reference `advances`
- Laws reference `estates`
- Laws affect `policies`
- Laws unlocked via tech tree
