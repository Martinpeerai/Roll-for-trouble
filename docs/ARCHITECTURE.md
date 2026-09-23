# Roll for Trouble – Technische Architektur

## Ziel

Die technische Struktur soll neue Helden, Items, Sets, Gegner, Schadensarten, Statuszustände, NPCs und Maps möglichst datengetrieben ergänzbar machen.

## Kernsysteme

### RunController

Verantwortlich für:

- Run-Start und Run-Ende
- 20 Wellen
- 40-Sekunden-Normalphase
- Wellenboss nach Ablauf des Timers
- Wellenende erst nach Bosstod
- Übergang in Reward-/Shop-Phase
- Start der nächsten Welle

### CombatEngine

Verantwortlich für:

- Schaden
- Heilung
- Crits
- Resistenzen
- Schwächen
- Block / Dodge / Shield
- Angriffsprofile
- Trefferauflösung

### EffectEngine

Verantwortlich für:

- Statuszustände
- Statusdauer
- Stacks
- Statusreaktionen
- Umgebungsreaktionen
- Trigger
- Kombinationen wie `SOAKED` + `LIGHTNING`

Waffen und Gegner sollen nicht selbst jede mögliche Statuskombination kennen müssen. Sie liefern Tags, Schaden und Effekte; die EffectEngine löst Interaktionen zentral auf.

### BuildEngine

Verantwortlich für:

- Spielerwerte
- Level-Up-Modifikatoren
- Equipment
- zwei gleichzeitig aktive Waffen
- Items
- Set-Zugehörigkeiten
- Set-Boni
- Neuberechnung des aktiven Builds

### WorldEngine

Verantwortlich für:

- Map-Seed
- prozedurale Generierung
- Zonen
- Hindernisse
- Kollision
- Sichtlinien
- Projektilblocker
- Wasser / Feuer / andere Oberflächen
- Navigation
- Spawnregionen

### EncounterEngine

Verantwortlich für:

- Gegner-Spawns
- Gegnerzusammensetzung
- Wellenbosse
- NPC-Spawns
- Events
- Interaktionspunkte

### InventoryEngine

Verantwortlich für:

- Rucksack
- Equipment-Slots
- Item-Instanzen
- Drag & Drop
- Shopkäufe
- Itembelohnungen

### MetaProgression

Später verantwortlich für:

- Unlocks
- Heldenfreischaltungen
- Mapfreischaltungen
- Artefakte
- dauerhafte Fortschritte
- Rekorde / Statistiken

## Daten statt Hardcoding

Wo immer möglich sollen Inhalte in Datenstrukturen liegen, beispielsweise:

- `data/heroes/`
- `data/items/`
- `data/sets/`
- `data/enemies/`
- `data/bosses/`
- `data/statuses/`
- `data/npcs/`
- `data/maps/`

Code implementiert die Regeln. Daten definieren die Inhalte.

## Entwicklungsprinzip

Neue Inhalte sollen bestehende Engines benutzen.

Beispiel:

Eine neue Blitzwaffe definiert `LIGHTNING`-Schaden. Sie braucht keinen eigenen Sondercode dafür, dass ein `SOAKED`-Ziel stärker auf Blitz reagiert. Diese Regel gehört zentral in die Status-/Effect-Logik.

Das reduziert Duplikate und ermöglicht die für Roll for Trouble wichtigen emergenten Kombinationen.
