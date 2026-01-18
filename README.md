# HelloFresh Cards for Home Assistant

[![Version](https://img.shields.io/badge/version-1.1.0-green.svg)](https://github.com/JowinWaaijer/hellofresh-cards/releases)
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
| Onderweg | Oranje pill met tracking & countdown |
| Geleverd | Groene pill |
| Gepland | Groene pill met countdown |
| Gepauzeerd | Grijze pill |

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID |
| `show_tracking_button` | boolean | `true` | Show tracking button |
| `show_time_remaining` | boolean | `true` | Show countdown |
| `compact` | boolean | `false` | Compact mode |

---

### Meals Card
Grid display of your selected meals for the week with optional **meal planning** functionality.

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
| `storage_entity` | string | - | Entity ID for meal planning storage |
| `show_tht` | boolean | `true` | Show THT (expiry) badges |
| `auto_sort_tht` | boolean | `true` | Auto-sort meals by THT date |

#### Meal Planning Feature

Met de meal planning feature kun je:
- **THT datums** toevoegen aan maaltijden (Tenminste Houdbaar Tot)
- **Automatisch sorteren** op THT - wat het eerste verloopt, eet je eerst
- **Handmatig herordenen** via drag & drop
- **Opslag** persistent via een Home Assistant input_text helper

##### Setup

**Stap 1: Maak een input_text helper aan**

Voeg dit toe aan je `configuration.yaml`:

```yaml
input_text:
  hellofresh_meal_planning:
    name: HelloFresh Maaltijdplanning
    max: 255
```

Of maak de helper via de UI: Settings → Devices & Services → Helpers → Create Helper → Text.

**Stap 2: Configureer de card**

```yaml
type: custom:hellofresh-meals-card
entity: sensor.hellofresh_meals_this_week
storage_entity: input_text.hellofresh_meal_planning
title: Maaltijden deze week
show_tht: true
auto_sort_tht: true
columns: 2
```

##### Gebruik

1. **Edit mode**: Klik op het potlood-icoon in de header
2. **THT instellen**: Klik op een maaltijd om de datum te kiezen
3. **Herordenen**: Sleep maaltijden via de drag handle (6 puntjes)
4. **Reset volgorde**: Klik op "Reset volgorde" om terug te gaan naar automatisch sorteren

##### THT Badge Kleuren

| Kleur | Betekenis |
|-------|-----------|
| Groen | 3+ dagen houdbaar |
| Oranje | 1-2 dagen houdbaar |
| Rood | Vandaag of verlopen |

##### Hoe de Storage Entity werkt

De `storage_entity` is een `input_text` helper die een JSON object opslaat met:

```json
{
  "week": "2026-W03",
  "meals": {
    "Gele viscurry met": {"tht": "2026-01-20", "order": 0},
    "Krokante kip met s": {"tht": "2026-01-22", "order": 1}
  },
  "manual": false
}
```

| Veld | Beschrijving |
|------|--------------|
| `week` | ISO weeknummer (bijv. "2026-W03"). Bij een nieuwe week wordt de data automatisch gereset. |
| `meals` | Object met per maaltijd (eerste 20 karakters van de naam) de THT datum en volgorde. |
| `manual` | `true` wanneer je handmatig hebt gesleept, `false` voor automatisch sorteren op THT. |

**Waarom input_text?**
- Geen extra integratie nodig
- Makkelijk te backuppen
- Max 255 karakters (genoeg voor ~4-5 maaltijden met THT en volgorde)

**Automatische week reset:**
Wanneer een nieuwe week begint en de HelloFresh sensor nieuwe maaltijden toont, wordt de oude planning automatisch genegeerd. Je begint elke week met een schone lei.

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
        storage_entity: input_text.hellofresh_meal_planning
        columns: 2
```

## Version Check

Open browser console (F12) to see loaded version:

```
▶ HELLOFRESH-CARDS  v1.1.0
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

## Changelog

### v1.1.0
- **Meal Planning Feature**: THT datums, drag & drop, persistente opslag
- Nieuwe config opties: `storage_entity`, `show_tht`, `auto_sort_tht`
- SortableJS voor touch-friendly drag & drop

### v1.0.10
- Fix day countdown to use calendar days

### v1.0.5
- Add cutlery icon for RUNNING status
- Add Dutch label for RUNNING status

## License

MIT License - see [LICENSE](LICENSE)

## Credits

- HelloFresh branding © HelloFresh SE
- Icons from Material Design Icons
- [SortableJS](https://sortablejs.github.io/Sortable/) for drag & drop
