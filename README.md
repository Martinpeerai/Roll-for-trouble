# Roll for Trouble

Android-Testbuild für **Roll for Trouble**.

Dieses Repository ist für den automatischen APK-Build über GitHub Actions vorbereitet.

## APK bauen

1. Die drei Dateien aus dem Chat in den Ordner `payload/` hochladen.
2. Danach oben auf **Actions** gehen.
3. **Build Roll for Trouble APK** auswählen.
4. **Run workflow** drücken.
5. Nach erfolgreichem Build den Artifact **Roll-for-Trouble-APK** herunterladen.
6. ZIP entpacken und `app-debug.apk` auf Android installieren.

Die Projektdateien werden beim Build aus den drei Payload-Teilen zusammengesetzt. Dadurch müssen die großen Android-Dateien nicht einzeln über die GitHub-Weboberfläche hochgeladen werden.
