# HelloFresh Cards for Home Assistant

Beautiful custom Lovelace cards for the [HelloFresh Home Assistant integration](https://github.com/jowinwaaijer/hellofresh-service), styled with the official HelloFresh brand colors.

![HelloFresh Cards Preview](docs/preview.png)

## Features

- **Delivery Tracking Card** - Compact pill-shaped card showing your next delivery with real-time tracking
- **Meals Card** - Beautiful grid display of your selected meals for the week
- **Recipe Card** - Detailed view of a single recipe with nutrition info and cooking times

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Go to "Frontend" section
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/jowinwaaijer/hellofresh-cards`
6. Category: "Lovelace"
7. Click "Add"
8. Install "HelloFresh Cards"
9. Refresh your browser

### Manual Installation

1. Download `hellofresh-cards.js` from the [latest release](https://github.com/jowinwaaijer/hellofresh-cards/releases)
2. Copy it to your `config/www/` directory
3. Add the resource in your Lovelace configuration:

```yaml
resources:
  - url: /local/hellofresh-cards.js
    type: module
```

## Cards

### HelloFresh Delivery Card

A compact pill-shaped card showing your next delivery status and tracking information.

```yaml
type: custom:hellofresh-delivery-card
entity: sensor.hellofresh_next_delivery
show_tracking_button: true
show_time_remaining: true
compact: false  # Set to true for a more compact view
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID of the next_delivery sensor |
| `show_tracking_button` | boolean | `true` | Show button to open tracking URL |
| `show_time_remaining` | boolean | `true` | Show time remaining until delivery |
| `compact` | boolean | `false` | Use compact display mode |

### HelloFresh Meals Card

Display your selected meals for the week in a beautiful grid layout.

```yaml
type: custom:hellofresh-meals-card
entity: sensor.hellofresh_meals_this_week
title: Maaltijden deze week
show_tags: true
show_calories: true
show_prep_time: true
columns: 2
max_meals: 0  # 0 = show all
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID of the meals_this_week sensor |
| `title` | string | `Maaltijden deze week` | Card title |
| `show_tags` | boolean | `true` | Show meal tags (Caloriebewust, Familie, etc.) |
| `show_calories` | boolean | `true` | Show calorie information |
| `show_prep_time` | boolean | `true` | Show preparation time |
| `columns` | number | `2` | Number of columns in the grid |
| `max_meals` | number | `0` | Maximum meals to show (0 = all) |

### HelloFresh Recipe Card

Show detailed information about a single recipe.

```yaml
type: custom:hellofresh-recipe-card
entity: sensor.hellofresh_next_meal
show_nutrition: true
show_tags: true
show_recipe_button: true
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | Entity ID of the next_meal sensor |
| `show_nutrition` | boolean | `true` | Show nutrition information |
| `show_tags` | boolean | `true` | Show meal tags |
| `show_recipe_button` | boolean | `true` | Show button to view full recipe on HelloFresh |

## Example Dashboard

Here's an example of how to combine all cards in a dashboard:

```yaml
views:
  - title: HelloFresh
    path: hellofresh
    icon: mdi:food
    cards:
      # Delivery status at the top
      - type: custom:hellofresh-delivery-card
        entity: sensor.hellofresh_next_delivery

      # Recipe details
      - type: custom:hellofresh-recipe-card
        entity: sensor.hellofresh_next_meal

      # All meals this week
      - type: custom:hellofresh-meals-card
        entity: sensor.hellofresh_meals_this_week
        columns: 2
```

## Requirements

- Home Assistant 2023.1 or newer
- [HelloFresh Integration](https://github.com/jowinwaaijer/hellofresh-service) installed and configured

## Known Limitations

These limitations are due to the current state of the HelloFresh integration API:

1. **Recipe Steps Not Available** - The HelloFresh API endpoint for recipe steps hasn't been discovered yet. The recipe card shows a link to the website instead.

2. **No Ingredients List** - Ingredient details are not yet available from the API.

3. **Only Current Week** - The meals sensor only shows the current/upcoming week. Historical delivered meals are not available as a separate sensor.

See the [enhancement requests](https://github.com/jowinwaaijer/hellofresh-service/issues) in the integration repository for planned improvements.

## Brand Colors

These cards use the official HelloFresh brand colors:

| Color | Hex | Usage |
|-------|-----|-------|
| Salem (Green) | `#067A46` | Primary accent |
| White | `#FFFFFF` | Backgrounds |
| Mine Shaft | `#242424` | Text |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- HelloFresh branding and colors are property of HelloFresh SE
- Icons from Material Design Icons
