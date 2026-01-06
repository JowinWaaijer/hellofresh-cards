# HelloFresh Home Assistant Integration - Knowledge Base

Dit document bevat alle kennis over de `hellofresh-service` integratie die nodig is voor het ontwikkelen van de cards.

## Beschikbare Entities

### 1. `sensor.hellofresh_next_delivery`
**State:** DateTime (ISO8601) van de volgende levering

**Attributes:**
| Attribute | Type | Beschrijving |
|-----------|------|--------------|
| `week` | string | ISO week format (bijv. "2026-W03") |
| `status` | string | DELIVERED, SCHEDULED, PAUSED |
| `sub_status` | string \| null | RATING, COOK_IT, of null |
| `cutoff_date` | string | Deadline voor wijzigingen |
| `product` | string | Bijv. "4-maaltijdenbox - 2 personen" |
| `price` | string | Geformatteerd als "€XX.XX" |
| `delivery_slot` | string | Bijv. "Woensdag: 18:00 - 22:00" |
| `delivery_day` | int | 1=Maandag, 7=Zondag |
| `tracking_url` | string | HTTPS link naar tracking |
| `estimated_delivery` | string | ISO8601 datetime |
| `order_id` | string | Unieke order identifier |

### 2. `sensor.hellofresh_next_meal`
**State:** Naam van de volgende maaltijd

**Attributes:**
| Attribute | Type | Beschrijving |
|-----------|------|--------------|
| `headline` | string | Korte beschrijving |
| `prep_time_minutes` | int | Bereidingstijd |
| `total_time_minutes` | int | Totale kooktijd |
| `image_url` | string \| null | URL naar afbeelding |
| `tags` | list[string] | Bijv. ["Caloriebewust", "Familie"] |
| `cuisines` | list[string] | Bijv. ["Aziatisch"] |
| `calories` | int | Calorieën |
| `protein` | string | Bijv. "31g" |
| `carbohydrate` | string | Bijv. "54g" |
| `fat` | string | Bijv. "26g" |
| `recipe_url` | string \| null | Link naar volledig recept |
| `premium_charge` | string \| null | Extra kosten premium gerecht |

### 3. `sensor.hellofresh_meals_this_week`
**State:** Integer (aantal geselecteerde maaltijden)

**Attributes:**
| Attribute | Type | Beschrijving |
|-----------|------|--------------|
| `week` | string | ISO week format |
| `meals` | array | Array van geselecteerde maaltijden |

**Meals array structuur:**
```json
{
  "name": "Gele viscurry met volkoren noedels",
  "headline": "met wortel, broccoli en gomasio",
  "prep_time_minutes": 25,
  "calories": 586,
  "tags": ["Caloriebewust", "Familie"],
  "image_url": "https://img.hellofresh.com/..."
}
```

### 4. `sensor.hellofresh_ingredients_count`
**State:** Integer (altijd 0 - endpoint niet ontdekt)

## Status Lifecycle

| Status | Sub-Status | Betekenis |
|--------|-----------|---------|
| `DELIVERED` | `RATING` | Geleverd, wacht op beoordeling |
| `DELIVERED` | `COOK_IT` | Geleverd, klaar om te koken |
| `SCHEDULED` | - | Geplande levering (toekomst) |
| `PAUSED` | - | Gepauzeerd voor deze week |

## Belangrijke Opmerkingen

1. **Prijzen:** Intern opgeslagen als centen (5200 = €52.00)
2. **Tijdformaat:** ISO 8601 duration voor bereidingstijd (PT25M = 25 minuten)
3. **Week formaat:** ISO week (2026-W03)
4. **Afbeeldingen:** Volledige HTTPS URLs, direct bruikbaar

## Ontbrekende Data (Enhancement Requests)

1. **Recept stappen & ingrediënten:** Geen API endpoint gevonden
2. **Historische bestellingen:** Alleen huidige week beschikbaar als sensor
3. **Laatst geleverde maaltijden:** Geen aparte sensor voor vorige week

## API Endpoints (voor referentie)

- Login: `POST /gw/login`
- Deliveries: `GET /gw/api/customers/me/deliveries`
- Menu: `GET /gw/my-deliveries/menu`

## HelloFresh Huisstijl

| Kleur | Hex | Gebruik |
|-------|-----|---------|
| Salem (Groen) | #067A46 | Primaire accent kleur |
| White | #FFFFFF | Achtergrond licht |
| Mine Shaft | #242424 | Tekst donker |

### Extra kleuren voor cards
| Kleur | Hex | Gebruik |
|-------|-----|---------|
| Lime Accent | #91C11E | Secundair groen |
| Orange CTA | #FFC618 | Call-to-action buttons |
| Light Gray | #F5F5F5 | Card achtergrond |
| Border | #E0E0E0 | Borders |
