# HelloFresh Home Assistant Integration - Knowledge Base

Dit document bevat alle kennis over de `hellofresh-homeassistant` integratie die nodig is voor het ontwikkelen van de cards.

**GitHub:** https://github.com/JowinWaaijer/hellofresh-homeassistant

## Beschikbare Entities

### 1. `sensor.hellofresh_next_delivery`
**State:** DateTime van de volgende levering (bijv. "7 januari 2026 om 12:00")

**Attributes:**
| Attribute | Type | Beschrijving |
|-----------|------|--------------|
| `week` | string | ISO week format (bijv. "2026-W02") |
| `state` | string | **Preparing**, **ON_THE_WAY**, **DELIVERED** |
| `status` | string | DELIVERED, SCHEDULED, PAUSED (legacy) |
| `sub_status` | string | RATING, COOK_IT, of "NULL" (let op: string, niet null!) |
| `cutoff_date` | string | Deadline voor wijzigingen |
| `product` | string | Bijv. "4-maaltijdenbox - 2 personen" |
| `price` | string | Geformatteerd als "€52.00" |
| `delivery_slot` | string | Bijv. "Woensdag: 18:00 - 22:00" |
| `delivery_day` | int | 1=Maandag, 3=Woensdag, 7=Zondag |
| `tracking_url` | string | HTTPS link naar tracking (bijv. hftrack.nl) |
| `estimated_delivery` | string | Datetime met tijd (bijv. "7 januari 2026 om 18:35:00") |
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

## State Attribuut - NIEUW!

Het `state` attribuut geeft direct de leveringsstatus aan:

| state | Betekenis | Card weergave |
|-------|-----------|---------------|
| `Preparing` | Levering wordt voorbereid | 📦 Groene pill |
| `ON_THE_WAY` | Onderweg naar klant | 🚚 Oranje pill |
| `DELIVERED` | Afgeleverd | ✓ Groene pill |

### Sub-status (na levering)
| sub_status | Betekenis |
|------------|-----------|
| `RATING` | Wacht op beoordeling |
| `COOK_IT` | Klaar om te koken |
| `"NULL"` | Geen actie vereist |

**Let op:** `sub_status` kan de **string** `"NULL"` zijn wanneer leeg, niet een echte `null` waarde!

## Belangrijke Opmerkingen

1. **sub_status is een string:** De waarde is `"NULL"` als string, niet `null`. Check altijd op beide!
2. **Prijzen:** Weergegeven als "€52.00" (al geformatteerd)
3. **Tijdformaat:** Nederlandse datetime strings
4. **Week formaat:** ISO week (2026-W02)
5. **Afbeeldingen:** Volledige HTTPS URLs, direct bruikbaar

## Ontbrekende Data (Enhancement Requests)

Issues aangemaakt in hellofresh-homeassistant repo:

1. **[#6] Recept stappen & ingrediënten:** Geen API endpoint gevonden
2. **[#7] Laatst geleverde maaltijden:** Geen aparte sensor voor vorige week
3. **[#8] Ingredients count:** Sensor toont altijd 0
4. **[#9] Status clarificatie:** DELIVERED + NULL = onderweg

## Deployment naar Home Assistant

Via SSH (SCP werkt niet op HA OS):
```bash
cat dist/hellofresh-cards.js | ssh jowin@192.168.1.49 "sudo tee /config/www/hellofresh-cards.js > /dev/null"
```

Cache-busting in configuration.yaml:
```yaml
lovelace:
  resources:
    - { url: /local/hellofresh-cards.js?v=102, type: module }
```

## HelloFresh Huisstijl

| Kleur | Hex | Gebruik |
|-------|-----|---------|
| Salem (Groen) | #067A46 | Primaire accent kleur |
| White | #FFFFFF | Achtergrond licht |
| Mine Shaft | #242424 | Tekst donker |
| In-Transit Orange | #F57C00 | Onderweg status |

### Extra kleuren voor cards
| Kleur | Hex | Gebruik |
|-------|-----|---------|
| Lime Accent | #91C11E | Secundair groen, pulse indicator |
| Light Gray | #F5F5F5 | Card achtergrond |
| Border | #E0E0E0 | Borders |
