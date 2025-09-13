# ARES Fleet Management – Developer Instructions

## Ziel
Eine Java-Anwendung mit SQLite-Backend und JavaFX-GUI, die folgende Kernobjekte verwaltet:

* **Assets** – Fahrzeuge/Maschinen
* **Routes** – Routen mit Wegpunkten
* **Missions** – konkrete Fahrten eines Assets
* **MissionTasks** – Schritte innerhalb einer Mission

## 1. Setup

1. Repository klonen
   ```bash
   git clone https://github.com/<your-org>/ares-fleet.git
   cd ares-fleet
   ```
2. Java-Version (21+)
   ```bash
   java -version
   ```
3. Maven installieren (falls nötig) – <https://maven.apache.org/install.html>
4. Projekt builden & starten
   ```bash
   mvn clean install
   mvn exec:java
   ```

## 2. Projektstruktur
```
src/main/java/de/ares/fleet/
├─ App.java          // Einstiegspunkt JavaFX
├─ db/Db.java        // SQLite-Connection + Schema-Init
├─ dao/              // DAO-Klassen (Datenzugriff)
├─ model/            // Datenmodelle (POJOs)
└─ ui/               // JavaFX-GUIs (Tabs)
src/main/resources/
└─ schema.sql        // Datenbankschema
```

## 3. Datenbank
* SQLite-Datei: `~/.ares/ares_fleet.db`
* Schema beim ersten Start aus `schema.sql`
* Tabellen: `assets`, `routes`, `route_points`, `missions`, `mission_tasks`, `asset_routes`
* Views: `view_asset_summary`, `view_route_usage`

## 4. Anforderungen an die GUI
### Assets-Tab
* Tabelle: Name, Typ, Status
* Formular: Neues Asset anlegen (Name, Typ, Hersteller, Seriennummer, Status)
* CRUD: Create (✓), Read (✓), Update/Delete (optional)

### Routes-Tab
* Liste aller Routen
* Detailansicht: RoutePoints (Seq, Lat, Lon, Note)
* Neue Route + Points hinzufügen

### Missions-Tab
* Liste aller Missionen (Name, Asset, Status)
* Detailansicht: MissionTasks anzeigen
* Neue Mission anlegen (Asset wählen, optional Route)
* Tasks hinzufügen (Kind + JSON-Params)

## 5. Technische Hinweise
* DAO-Klassen nutzen `PreparedStatement` und werfen `RuntimeException` bei Fehlern
* Daten als `ObservableList<>` in JavaFX binden und Tabellen nach Inserts updaten
* `MissionTask.params` als JSON-String speichern (z. B. Jackson oder org.json)

## 6. Erweiterungen (später)
* ROS-Export: Missions/Tasks als JSON-Datei
* Live-Tracking: RoutePoints + Position im GUI (MapView)
* User-Management: Rechte pro Nutzer

## 7. Qualitätssicherung
* Unit-Tests für DAOs mit In-Memory-SQLite
* Smoke-Test der GUI (CRUD für Assets, Routen, Missionen)
* Dokumentation aktualisieren

## 8. ToDo-Liste
- [ ] Assets-Tab komplett (CRUD)
- [ ] Routes mit RoutePoints implementieren
- [ ] Missions mit MissionTasks umsetzen
- [ ] ROS-Export vorbereiten
- [ ] MapView für Live-Tracking integrieren
- [ ] User-Management hinzufügen
