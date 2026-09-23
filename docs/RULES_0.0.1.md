# Roll for Trouble — Kanonische Regeln 0.0.1

> Nur Regeln aus dem aktuellen und zukünftigen Entwicklungsstand sind autoritativ. Frühere Projektstände gelten nicht.

## Schadensarten

Es existieren ausschließlich:

- `MELEE`
- `DISTANCE`
- `MAGIC`
- `BLOOD`
- `EARTH`
- `FIRE`
- `ICE`
- `LIGHTNING`
- `SOUND`
- `DARKNESS`
- `UNDEAD`

Eine einzelne Damage-Komponente besitzt immer genau eine Schadensart. Ein Angriff kann mehrere getrennte Komponenten erzeugen, z. B. 5 `DISTANCE` + 5 `FIRE`.

## Charakter-Damage-Multiplikatoren

Für `MELEE`, `DISTANCE` und `MAGIC` gilt:

```text
OffensiveDamage = SourceDamage × CharacterDamageMultiplier
```

Beispiel: `BASE_DAMAGE_MELEE = 3`, Waffe = 5 Melee → 15 Melee.

## Dodge

```text
DodgeChancePercent = min(DODGE, 100) × 0.7
```

- `DODGE` maximal 100.
- Maximal 70 % tatsächliche Dodge-Chance.
- Pro ursprünglichem Hit genau ein Dodge-Roll.
- Erfolgreicher Dodge: ursprünglicher Hit verursacht 0 Schaden und keinen Hit-Status.
- AoE kann ebenfalls gedodged werden.

## Block

Triggerchance:

```text
BlockChancePercent = min(BLOCK × 0.7, 70)
```

Reduktion bei erfolgreichem Block:

```text
BlockReductionPercent = min(BLOCK, 70)
DamageAfterBlock = DamageBeforeBlock × (1 - BlockReductionPercent / 100)
```

- Pro ursprünglichem Hit genau ein Block-Roll.
- Block wirkt nur auf den ursprünglichen Hit-Schaden.
- OnHit-Zusatzschaden wird nicht geblockt.
- AoE kann geblockt werden.

## Armor

```text
ArmorMultiplier = 2 ^ (-Armor / 100)
DamageAfterArmor = DamageBeforeArmor × ArmorMultiplier
```

Positiver Armor reduziert Schaden, negativer Armor erhöht ihn. Armor erreicht mathematisch nie 100 % Reduktion.

## Resistances

```text
ResistanceMultiplier = 1 - (Resistance / 100)
Result = DamageBeforeResistance × ResistanceMultiplier
```

- Resistance 100 → 0 Schaden.
- Resistance >100 → negativer Damage-Wert, der als Heilung verarbeitet wird.
- Beispiel Resistance 150 bei 40 Schaden → -20 Damage → +20 HP.
- Es gibt kein oberes Resistance-Cap.
- Negative Resistances erhöhen Schaden.

## Direkte Hit-Pipeline

```text
Base Damage
→ Character Damage Multiplier (MELEE/DISTANCE/MAGIC)
→ ausgehende Status-Multiplikatoren
→ Crit
→ Dodge
→ Block
→ eingehende Status-Multiplikatoren
→ Armor
→ passende Resistance
→ HP bzw. Heilung bei Result < 0
→ Status-Anwendung
→ OnHit-Zusatzschaden
```

OnHit-Zusatzschaden:

```text
ExtraDamage → Armor → Resistance → HP/Heilung
```

Kein neuer Dodge- oder Block-Roll.

## DoT

```text
FinalDoTDamage = DoTDamage × ArmorMultiplier × ResistanceMultiplier
```

DoT ignoriert Dodge und Block.

## Crit

```text
CritRollChance = CRIT_CHANCE %
CritDamage = Damage × CritMultiplier
```

`CritMultiplier = 0` ist erlaubt und absichtlich möglich.

## Attack Speed

`BASE_ATTACK_SPEED` ist ein Multiplikator.

```text
FinalAttackRate = BaseAttackRate × AttackSpeed
FinalAttackInterval = BaseAttackInterval / AttackSpeed
```

Beispiel AttackSpeed 10 → zehnfache Angriffsgeschwindigkeit.

## Projectile Count

`BASE_DISTANCE_PROJEKTILE` ist die Anzahl erzeugter Distance-Projektile.

## Lifesteal

```text
LifestealChance = LIFESTEAL %
```

Bei jedem erfolgreichen Treffer wird einmal gewürfelt. Bei Erfolg heilt Lifesteal immer exakt 1 HP. `LIFESTEAL = 100` bedeutet +1 HP bei jedem erfolgreichen Hit.

## Move Speed

```text
FinalMoveSpeed = CurrentBaseMoveSpeed × aktive Multiplikatoren
```

Hard Overrides wie `FROZEN` oder `ROOTED` setzen MoveSpeed auf 0.

## XP und Gold

```text
FinalXP = BaseXP × XP_MULTIPLYER
FinalGold = BaseGold × GOLD_MULTIPLYER
```

## Status-Grundregeln

- 1 Tick = 1 Sekunde.
- Stacks bestimmen gleichzeitig Stärke und Restdauer.
- Bei jedem Tick wird nach der Effektberechnung 1 Stack entfernt.
- Bei 0 Stacks wird der Status entfernt.
- Neue Stacks:

```text
newStacks = min(currentStacks + addedStacks, STACK_MAX)
```

- Tick-Reihenfolge: aktuelle Stackzahlen lesen → Werte berechnen → statische Effekte berücksichtigen → Status-Rolls → Damage anwenden → 1 Stack je bereits aktivem Status entfernen → Status bei 0 entfernen.
- Alle Statusberechnungen eines Ticks sehen denselben Ausgangs-Stackstand.

## Status-Kombinationen

Multiplikative Effekte werden multipliziert.

- `HASTED ×2` und `SLOWED ×0.5` heben sich auf.
- `PARALISED ×0.5` und `SLOWED ×0.5` ergeben ×0.25.
- `ROOTED` oder `FROZEN` → MoveSpeed = 0 und haben Vorrang vor MoveSpeed-Multiplikatoren.
- `WEAKED` und `STRENGTHENED` wirken gleichzeitig multiplikativ.
- `VULNERABLE` und `HARDENED` wirken gleichzeitig multiplikativ.
- `CURSED` setzt `MELEE_RANGE = 1` und `DISTANCE_RANGE = 1` als Hard Override.
- `BURNING + WET` laufen parallel; Wet erhöht Fire-Resistance und reduziert dadurch Burning-Schaden automatisch.
- `BURNING + FROZEN` haben keine Sonderreaktion.
- `FROZEN + WET` haben keine Sonderreaktion.
- `ELECTRIFIED + WET` ist die direkte Sonderkombination über die Electrified-Damageformel.

## Level-Up-Auswahl

Standard:

```text
LEVEL_UP_OPTION_COUNT = 3
```

Artefakte oder andere Variablen dürfen die Anzahl erhöhen oder senken. Das UI muss dynamisch sein.

### Rarity-Basisgewichte

| Rarity | Basisgewicht |
|---:|---:|
| 1 | 100 |
| 2 | 60 |
| 3 | 30 |
| 4 | 12 |
| 5 | 4 |

### Tags

Tags kommen aus Held, Equipment, Items im Rucksack und sonstigen aktiven Quellen. Mehrfach vorhandene Tags zählen mehrfach.

```text
TagMultiplier = 1 + (TAG_1_Matches × 0.20) + (TAG_2_Matches × 0.10)
TagMultiplier = min(TagMultiplier, 2.5)
```

### Luck

```text
LuckMultiplier = max(0.1, 1 + Luck × 0.05 × (Rarity - 1))
```

Rarity 1 wird durch Luck nicht erhöht; höhere Rarities profitieren zunehmend.

### Finales Reward-Gewicht

```text
FinalWeight = RarityBaseWeight × TagMultiplier × LuckMultiplier
```

### Ziehregeln

1. OptionCount bestimmen, Standard 3.
2. Alle aktuell gültigen Rewards laden.
3. Rewards entfernen, die keinen Effekt mehr haben können.
4. `FinalWeight` für jeden Reward berechnen.
5. Gewichtet einen Reward ziehen.
6. Dessen `REWARD_STAT` für diese Auswahl sperren.
7. Wiederholen, bis OptionCount erreicht ist.
8. Derselbe `REWARD_ID` darf in einer Auswahl nie doppelt vorkommen.
9. Wenn mehr Optionen verlangt werden als unterschiedliche zulässige Stats existieren, darf erst dann ein weiterer Stat-Durchlauf beginnen.

Die kanonischen Datensätze liegen unter `src/data/`.