# Roll for Trouble

**Aktuelle Version: 0.0.1**

Roll for Trouble ist ein 2D Horde-Survival-Roguelite/Roguelike mit Meta-Progression und RPG-Parodieelementen.

## Verbindliche Quellenregel

Für das Projekt gelten ausschließlich:

1. der aktuelle Chat ab dem Neustart des Projekts,
2. alle zukünftigen Chats,
3. daraus ausdrücklich in dieses Repository übernommene Regeln und Daten.

Ältere Chats, frühere Projektdateien, alte Prototyp-Regeln und historische Designstände sind nicht autoritativ und dürfen nicht zur Ableitung neuer Regeln verwendet werden.

## Versionsregel

Bis der Projektinhaber ausdrücklich den Sprung auf `0.1` freigibt, darf nur die letzte Stelle erhöht werden:

`0.0.1 → 0.0.2 → 0.0.3 → ... → 0.0.9 → 0.0.10 → ...`

Kein automatischer Sprung auf `0.1.0`.

## Aktuell bestätigter Kern

- Phaser 3 + TypeScript + Vite
- 20 Wellen pro Run
- 40 Sekunden normale Kampfphase
- danach Wellenboss
- Welle endet erst nach Boss-Tod
- anschließend Reward-/Shop-Phase
- mehrere Helden mit eigenen Level-1-Basiswerten
- Stats können durch Level-Ups, Wellen, Items und weitere Run-Effekte verändert werden
- prozedurale/random Maps
- Fokus zunächst auf Dorf und Wald
- XP, Gold, Items, Set-Boni und begrenzte Equipment-Slots
- mehrere getrennte Schadensarten und passende Resistenzen
- Status- und Umweltinteraktionen

## Kanonischer Stand 0.0.1

Die aktuell verbindlichen Regeln und Daten liegen hier:

- `docs/RULES_0.0.1.md` — Schadens-, Defense-, Status- und Level-Up-Formeln
- `src/data/characters.json` — finale Level-1-Basiswerte der sieben Charaktere
- `src/data/statuses.json` — finale Statusdefinitionen, Stackregeln und Kombinationen
- `src/data/level_up_rewards.json` — finaler Level-Up-Reward-Pool sowie Rarity-, Tag- und Luck-Gewichtung

## Repository-Regel

Dieses Repository ist die zentrale technische Quelle für Code und die jeweils aktuell bestätigten Regeln. Neue Regeln werden nach der Festlegung im aktuellen oder einem zukünftigen Chat ins Repository übernommen.
