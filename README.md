# HelloFresh Cards for Home Assistant

[![Version](https://img.shields.io/badge/version-1.0.3-green.svg)](https://github.com/JowinWaaijer/hellofresh-cards/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)

Beautiful custom Lovelace cards for the [HelloFresh Home Assistant integration](https://github.com/JowinWaaijer/hellofresh-homeassistant), styled with the official HelloFresh brand colors.

## Cards

### Delivery Card
Compact pill-shaped card showing delivery status with real-time tracking.

```yaml
type: custom:hellofresh-delivery-card
entity: sensor.hellofresh_next_delivery
```

| Status | Weergave |
|--------|----------|
| Onderweg | 🚚 Oranje pill met tracking & countdown |
| Geleverd | ✓ Groene pill |
| Gepland | 🚚 Groene pill met countdown |
| Gepauzeerd | ⏸ Grijze pill |

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID |
| `show_tracking_button` | boolean | `true` | Show tracking button |
| `show_time_remaining` | boolean | `true` | Show countdown |
| `compact` | boolean | `false` | Compact mode |

---

### Meals Card
Grid display of your selected meals for the week.

```yaml
type: custom:hellofresh-meals-card
entity: sensor.hellofresh_meals_this_week
title: Maaltijden deze week
columns: 2
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID |
| `title` | string | `Maaltijden deze week` | Card title |
| `show_tags` | boolean | `true` | Show meal tags |
| `show_calories` | boolean | `true` | Show calories |
| `show_prep_time` | boolean | `true` | Show prep time |
| `columns` | number | `2` | Grid columns |
| `max_meals` | number | `0` | Max meals (0 = all) |

---

### Recipe Card
Detailed view of a single recipe with nutrition info.

```yaml
type: custom:hellofresh-recipe-card
entity: sensor.hellofresh_next_meal
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID |
| `show_nutrition` | boolean | `true` | Show nutrition info |
| `show_tags` | boolean | `true` | Show tags |
| `show_recipe_button` | boolean | `true` | Show link to HelloFresh |

## Installation

### HACS (Recommended)

1. Open HACS → Frontend
2. Click ⋮ → Custom repositories
3. Add `https://github.com/JowinWaaijer/hellofresh-cards` (Lovelace)
4. Install "HelloFresh Cards"
5. Refresh browser

### Manual

1. Download `hellofresh-cards.js` from [releases](https://github.com/JowinWaaijer/hellofresh-cards/releases)
2. Copy to `config/www/`
3. Add resource:

```yaml
lovelace:
  resources:
    - url: /local/hellofresh-cards.js
      type: module
```

## Example Dashboard

```yaml
views:
  - title: HelloFresh
    cards:
      - type: custom:hellofresh-delivery-card
        entity: sensor.hellofresh_next_delivery

      - type: custom:hellofresh-recipe-card
        entity: sensor.hellofresh_next_meal

      - type: custom:hellofresh-meals-card
        entity: sensor.hellofresh_meals_this_week
        columns: 2
```

## Version Check

Open browser console (F12) to see loaded version:

```
▶ HELLOFRESH-CARDS  v1.0.3
    📦 Cards included:
       • hellofresh-delivery-card
       • hellofresh-meals-card
       • hellofresh-recipe-card
```

## Requirements

- Home Assistant 2023.1+
- [HelloFresh Integration](https://github.com/JowinWaaijer/hellofresh-homeassistant)

## Known Limitations

- **Recipe steps not available** - API endpoint not discovered yet ([#6](https://github.com/JowinWaaijer/hellofresh-homeassistant/issues/6))
- **Ingredients always 0** - API endpoint not discovered ([#8](https://github.com/JowinWaaijer/hellofresh-homeassistant/issues/8))

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Salem Green | `#067A46` | Primary |
| White | `#FFFFFF` | Background |
| Mine Shaft | `#242424` | Text |
| In-Transit | `#F57C00` | Orange for packages in transit |

## License

MIT License - see [LICENSE](LICENSE)

## Credits

- HelloFresh branding © HelloFresh SE
- Icons from Material Design Icons
