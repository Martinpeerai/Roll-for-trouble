# Roll for Trouble – Game Design

## 1. Spieltyp

Roll for Trouble ist ein 2D Horde-Survival-Roguelite mit Meta-Progression. Das Spiel spielt bewusst mit Konventionen klassischer RPGs und enthält Anspielungen auf D&D, DSA, World of Warcraft, Skyrim und verwandte Systeme.

## 2. Run-Struktur

Ein Run besteht aus 20 Wellen.

### Ablauf einer Welle

1. Wellenstart
2. 40 Sekunden normale Gegnerphase
3. Nach Ablauf der 40 Sekunden erscheint ein Wellenboss
4. Die Welle endet erst, wenn der Wellenboss besiegt wurde
5. Danach wird das Kampfgeschehen pausiert
6. Wellenbelohnung
7. Shop / Inventar / Build-Anpassung
8. nächste Welle

Damit besitzt jede Welle eine eigene Bossbegegnung.

## 3. Karten

Geplante Karten:

1. Dorf
2. Wald
3. Höhle
4. Friedhof
5. Unterwasser
6. Böse Burg
7. Labor
8. Drachenhort
9. Höllengebiet
10. offen

Für die aktuelle Entwicklung werden ausschließlich **Dorf** und **Wald** priorisiert.

Die Karten sind 2D und sollen aus Regeln und Zufall/Seeds generiert werden. Randomisierung darf nicht zu chaotischen oder unspielbaren Karten führen.

## 4. Helden

Es gibt mehrere spielbare Helden.

Helden dürfen sich unterscheiden durch:

- Basiswerte
- passive Fähigkeiten
- Startboni
- Startnachteile
- besondere Regeländerungen
- mögliche Synergien mit Items, Sets und Schadensarten

## 5. Progression innerhalb eines Runs

Der Spieler sammelt:

- XP
- Gold
- Items

XP führt zu Level-Ups. Bei Level-Ups werden Stats verbessert.

Gold wird insbesondere für Shops und andere Run-Systeme verwendet.

## 6. Equipment

Ausrüstung ist slotbasiert und klar limitiert.

Aktueller Kern:

- 2 Waffen
- 1 Helm
- 1 Rüstung
- 1 Handschuhe
- 1 Hose
- 1 Schuhe
- 1 Umhang
- 1 Schild
- 1 Trinket
- 1 Aura
- 1 Reittier

Nur ausgerüstete Items wirken aktiv auf den Build.

## 7. Items und Sets

Items können:

- Stats verändern
- eigene Angriffe bereitstellen
- passive Effekte besitzen
- Trigger auslösen
- Statuszustände anwenden
- Schadensarten verändern
- mit Sets interagieren

Items können Set-Zugehörigkeiten besitzen. Mehrere ausgerüstete Teile desselben Sets schalten Set-Boni frei.

## 8. Schaden, Resistenzen und Schwächen

Das Spiel besitzt verschiedene Schadensarten, darunter physische, magische und elementare Typen.

Gegner können:

- resistent sein
- neutral reagieren
- Schwächen besitzen

Das System soll datengetrieben sein, damit neue Schadensarten und Gegner ohne Sondercode ergänzt werden können.

## 9. Zustände und Reaktionen

Statuszustände sind ein zentrales System.

Beispiele:

- vergiftet
- geschwächt
- nass
- brennend
- eingefroren
- elektrisiert
- blutend

Statuszustände sollen sowohl miteinander als auch mit der Umgebung reagieren.

Beispiel:

- Figur läuft durch Wasser
- Figur erhält `SOAKED`
- `SOAKED` reduziert Feuerschaden
- `SOAKED` erhöht die Anfälligkeit gegenüber Blitzschaden

Weitere Kombinationen sollen systemisch statt über einzelne Sonderfälle aufgebaut werden.

## 10. Umgebung

Kartenelemente können Gameplay beeinflussen.

Beispiele:

- Wasser setzt `SOAKED`
- Feuer kann `BURNING` auslösen
- bestimmte Flächen können Bewegung verändern
- Gebäude und Hindernisse beeinflussen Bewegung, Sicht und Projektile

## 11. NPCs während einer Welle

Während einer laufenden Welle können interaktive NPCs auf der Karte erscheinen.

Beispiele:

- Händler
- Tüftlerin
- Schmied
- Priester
- Heilerin
- Alchemist
- Glücksspieler

Der Spieler muss den NPC während der Welle erreichen und aktiv mit ihm interagieren.

NPCs dürfen eigene Angebote, Services und zufällige Run-Ereignisse besitzen.

## 12. Designziel

Das wichtigste langfristige Ziel ist ein stark kombinatorisches System:

**Held + Items + Sets + Stats + Schadensarten + Statuszustände + Umgebung + Gegner = Build und Run-Ergebnis.**

Neue Inhalte sollen möglichst über Daten und bestehende Regeln entstehen, nicht über immer mehr isolierten Sondercode.
