# Roll for Trouble

**Roll for Trouble** ist ein 2D Horde-Survival-Roguelite mit Meta-Progression und humorvollen Anspielungen auf klassische RPGs wie D&D, DSA, World of Warcraft und Skyrim.

## Aktueller Kern

- 20 Wellen pro Run
- 40 Sekunden normale Wellenphase
- danach erscheint ein Wellenboss
- die Welle endet erst nach dessen Tod
- anschließend Wellenbelohnung und Shop
- mehrere Helden
- XP, Gold und Level-Ups
- zufällige Items und Set-Boni
- limitierte Equipment-Slots
- unterschiedliche Schadensarten, Resistenzen und Schwächen
- Statuszustände reagieren miteinander und auf die Umgebung
- zufällige/interaktive NPCs während der Wellen
- mehrere 2D-Karten; Fokus zunächst auf Dorf und Wald
- Karten sollen prozedural/random generiert werden

## Beispiel für Systeminteraktion

Wer durch Wasser läuft, erhält `SOAKED`.

`SOAKED` kann beispielsweise:

- Feuerschaden reduzieren
- Blitzschaden verstärken
- weitere Status- oder Iteminteraktionen auslösen

Das Ziel ist ein stark kombinatorisches Build-System, in dem Items, Sets, Schadensarten, Zustände, Helden und Umgebung aufeinander reagieren.

## Geplante Maps

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

Aktuell wird nur auf **Dorf und Wald** fokussiert.

## Repository-Regel

Dieses Repository ist die zentrale technische Quelle für Roll for Trouble. Code, Datenmodelle, Gameplayregeln und technische Dokumentation werden hier versioniert.

Weitere Details stehen unter `docs/`.
