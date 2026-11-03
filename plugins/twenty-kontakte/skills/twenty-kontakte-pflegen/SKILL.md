---
name: "twenty-kontakte-pflegen"
description: "Kontakte in Twenty CRM anlegen und pflegen: aus Visitenkarten-Foto oder Texteingabe, mit kurzer Webrecherche, Dublettenprüfung, Firmenzuordnung und Bestätigung durch den Nutzer."
---

# Kontakte in Twenty anlegen und pflegen

Dieser Skill gilt, wenn der Nutzer eine Visitenkarte hochlädt, einen Kontakt per Text nennt ("leg mal Max Muster von Firma X an") oder einen bestehenden Kontakt ändern, ergänzen oder bereinigen will.

Grundregel: **Nichts wird in Twenty geschrieben, bevor der Nutzer den Vorschlag bestätigt hat.** Lesen, suchen und recherchieren ist vorher erlaubt.

## Rückfragen und Werkzeuge

Dieser Skill läuft in Claude und in ChatGPT/Codex. "Auswahlfrage" heißt: Nutze das Rückfrage-Werkzeug der Umgebung mit klickbaren Optionen, falls es eines gibt. Gibt es keines oder sind weniger Optionen möglich, stelle die Optionen als nummerierte Liste im Chat und warte auf die Antwort. Der Nutzer kann immer auch frei antworten.

Die Tools `learn_tools`, `find_many_*`, `create_one_*`, `update_one_*` und `execute_tool` stammen vom Twenty-MCP-Server. Das Plugin bringt die Verbindung zur FSTI-Instanz mit. Beim ersten Aufruf meldet sich der Nutzer per OAuth im Browser an. Fehlt die Verbindung oder schlägt die Anmeldung fehl, sag das und schreibe nichts. Ohne Websuche entfällt die Recherche; weise kurz darauf hin.

## Pflichtfelder und Workflow

Im Workspace läuft der Workflow "Pflichtfelder Personen prüfen". Er markiert Personen ohne **Unternehmen, Vorname, Nachname oder E-Mail**, erinnert den Ersteller per Aufgabe nach 1 Tag und dann wöchentlich und löscht den Kontakt nach 4 Wochen.

Der Nutzer muss im Dialog nichts angeben, was er nicht will. Fehlt beim Anlegen eines dieser vier Felder, weise ihn in einem Satz darauf hin ("Ohne E-Mail wird der Kontakt markiert und nach 4 Wochen gelöscht, wenn sie nicht nachgetragen wird.") und lege trotzdem an, wenn er das möchte.

## Ablauf A: Visitenkarte als Bild

1. **Auslesen.** Alle Angaben aus dem Bild extrahieren: Anrede, Vorname, Nachname, Titel, Position, Firma, Abteilung, E-Mail(s), Telefon und Mobil, Adresse, Website, LinkedIn. Rückseite beachten, falls mitgeschickt. Unsichere Zeichen (0/O, l/1, rn/m in E-Mail-Adressen) markieren statt raten.
2. **Kurz recherchieren** (Websuche, 1 bis 3 Suchen): Firmenwebsite und Domain, Branche, ggf. LinkedIn-Profil der Person, aktuelle Position. Nur berufliche, öffentlich zugängliche Informationen. Keine privaten Daten (Wohnort, Familie, private Social-Media-Profile). Widersprüche zur Karte benennen (z. B. Person hat laut LinkedIn inzwischen die Firma gewechselt).
3. **Twenty abgleichen** (siehe unten: Dubletten und Firmenzuordnung).
4. **Vorschlag zeigen** und bestätigen lassen (siehe "Vorschlag präsentieren").
5. **Anlegen** nach Bestätigung.

## Ablauf B: Texteingabe ohne Bild

1. Übernimm, was der Nutzer genannt hat.
2. Fehlen Kernangaben, frag einmal kompakt im Chat nach: "Magst du noch ergänzen: Unternehmen, Vorname, Nachname, E-Mail, Telefon? Alles optional." Freitextfelder werden im Chat abgefragt, nicht über eine Auswahlfrage, weil diese nur feste Optionen kennt.
3. Wenn genug für eine Suche da ist (Name plus Firma oder E-Mail-Domain), kurze Recherche wie in Ablauf A.
4. Weiter mit Dubletten, Firmenzuordnung, Vorschlag, Anlegen.

## Firmenzuordnung (Dropdown-Ersatz)

Eine Auswahlfrage hat höchstens 4 Optionen; freie Antworten sind zusätzlich möglich. Eine vollständige Firmenliste als Dropdown geht deshalb nicht. Stattdessen:

1. Mit dem Firmennamen bzw. der E-Mail-Domain in Twenty suchen:
   - `find_many_companies` mit `name: { ilike: "%<Kernbegriff>%" }` (Rechtsform wie GmbH, AG, e.V. weglassen, ggf. mehrere Varianten probieren)
   - zusätzlich nach Domain: `domainName: { primaryLinkUrl: { ilike: "%<domain>%" } }`
2. Ergebnis:
   - **genau ein eindeutiger Treffer**: im Vorschlag direkt verwenden, nicht extra fragen.
   - **mehrere Treffer**: Auswahlfrage mit bis zu 3 besten Treffern (Label: Firmenname, Beschreibung: Domain/Ort) plus Option "Neue Firma anlegen".
   - **kein Treffer**: im Vorschlag "Neue Firma anlegen: <Name>, <Domain>, Branche <Vorschlag>" aufführen.
   - **Firma unbekannt** (Texteingabe ohne Firma): im Chat fragen; der Nutzer kann auch "ohne Firma" sagen.

Beim Neuanlegen einer Firma: `name`, `domainName.primaryLinkUrl` (https://...), `branche` aus den vorhandenen Optionen wählen (BILDUNG_FORSCHUNG, IT_DIENSTLEITUNGEN, INDUSTRIE_PRODUKTION, DIENSLEITUNGEN_HANDWERK, GESUNDHEIT_SOZIALES, FINANZEN_VERSICHERUNGEN, BAU_IMMOBILIEN, LOGISTIK_VERKEHR, OFFENTLICHER_SEKTOR_NON_PROFIT, ENERGIE_UMWELT, LAND_FORSTWIRTSCHAFT, PRESSE, MEDIENWIRTSCHAFT, HOLZINDUSTRIE), Adresse falls bekannt. Optionen im Zweifel per `learn_tools(create_one_company)` aktuell prüfen.

## Dublettenprüfung

Vor jedem Anlegen in Twenty suchen:

- `find_many_people` nach E-Mail: `emails: { primaryEmail: { ilike: "<email>" } }`
- nach Name: `name: { firstName: { ilike: "<vorname>" }, lastName: { ilike: "<nachname>" } }`

Gibt es einen Treffer, nicht neu anlegen, sondern zeigen: "Existiert bereits: <Name>, <Firma>, <E-Mail>. Soll ich ihn mit den neuen Angaben aktualisieren?" Bei Aktualisierung nur Felder überschreiben, die leer sind oder die der Nutzer ausdrücklich ändern will. Alte E-Mail oder Telefonnummer in `additionalEmails` bzw. `additionalPhones` verschieben statt löschen.

## Vorschlag präsentieren

Kompakte Übersicht im Chat, dann eine Auswahlfrage zur Bestätigung.

```
**Neuer Kontakt**
Name: Dr. Max Mustermann (Herr)
Position: Leiter Digitalisierung
Firma: Musterwerke GmbH (vorhanden in Twenty) | (neu: musterwerke.de, Industrie/Produktion)
E-Mail: max.mustermann@musterwerke.de
Telefon: +49 711 123456 · Mobil: +49 170 1234567
LinkedIn: linkedin.com/in/... (aus Recherche)
Kategorie: Projektpartner (Vorschlag) · Status: In Kontakt · Priorität: offen

Aus der Recherche: <1 bis 3 Sätze, mit Quelle>
Unsicher: <z. B. E-Mail-Zeichen schlecht lesbar>
Fehlt: <Pflichtfelder, die fehlen>
```

Bestätigungsfrage (Auswahlfrage), z. B. "Anlegen?":
- "Passt, anlegen"
- "Kategorie/Status ändern"
- "Ohne Rechercheangaben anlegen"
- (Korrekturen sind als freie Antwort möglich)

Wenn Kategorie oder Kontaktstatus unklar sind, kann eine zweite Auswahlfrage sie direkt mit abfragen (max. 4 Optionen, die wahrscheinlichsten zuerst).

## Anlegen in Twenty

Vorher einmal `learn_tools(["create_one_person", "create_one_company", "update_one_person", "find_many_people", "find_many_companies"])` aufrufen, falls die Schemata in der Session noch nicht geladen sind; Feldnamen und Select-Werte immer aus dem aktuellen Schema nehmen.

Person (`create_one_person`), Feldzuordnung:

- `name`: `{ firstName, lastName }`. Akademische Titel (Dr., Prof.) gehören vor den Vornamen nur, wenn der Nutzer das so will; sonst in `jobTitle` nicht vermischen, sondern im Vorschlag erwähnen.
- `anrede`: FRAU, HERR, DIVERS (nur wenn eindeutig, sonst leer)
- `jobTitle`: Position laut Karte
- `emails`: `{ primaryEmail, additionalEmails: [] }`, klein geschrieben
- `phones`: `{ primaryPhoneNumber: "711123456", primaryPhoneCallingCode: "+49", primaryPhoneCountryCode: "DE", additionalPhones: [{ number, callingCode, countryCode }] }`. Festnetz als primär, Mobil als zusätzlich, außer der Nutzer will es andersherum. Führende 0 bei der Nummer entfernen, wenn eine Vorwahl gesetzt ist.
- `linkedinLink`: `{ primaryLinkUrl: "https://..." }` nur bei sicherer Zuordnung
- `companyId`: ID der gewählten oder neu angelegten Firma (Firma zuerst anlegen)
- `kategorie`: FSTI_MITARBEITER_IN, DIENSTLEISTER_FSTI, ANKERTHEMEN, PROJEKTPARTNER, NETZWERKPARTNER, PRESSEKONTAKT
- `kontaktstatus`: IM_PROJEKT, IN_KONTAKT, INAKTIV, KONTAKTAUFNAHME_GEPLANT (bei frisch übergebener Visitenkarte meist IN_KONTAKT)
- `prioritat`: A, B, C nur wenn der Nutzer es angibt
- `sperrvermerk`, `nachsteUberprufung`, `letzteUberprufung`: nur auf ausdrücklichen Wunsch
- `unvollstaendigSeit`: nie selbst setzen, das macht der Workflow

Kontext zur Begegnung ("getroffen auf der Hannover Messe am 12.11.", Gesprächsinhalt) als Notiz anlegen (`create_one_note` mit `bodyV2.markdown`) und per `note_target` mit der Person verknüpfen. Das Visitenkartenbild auf Wunsch als Anhang an die Person hängen.

Nach dem Anlegen: eine Zeile Rückmeldung mit Name, Firma und Hinweis auf fehlende Pflichtfelder, falls vorhanden.

## Kontakte pflegen

- **Ändern**: Person suchen, bei mehreren Treffern per Auswahlfrage auswählen lassen, Änderungen als Vorher/Nachher zeigen, nach Bestätigung `update_one_person`.
- **Firmenwechsel**: neue Firma zuordnen, alte Firma und Position in einer Notiz festhalten ("bis 11/2026 bei X als Y"), alte E-Mail in `additionalEmails`.
- **Mehrere Visitenkarten auf einmal**: jede einzeln auslesen, dann eine gesammelte Tabelle zur Bestätigung zeigen, Dubletten und unsichere Felder markieren, danach gesammelt anlegen.
- **Löschen oder Zusammenführen**: nur auf ausdrückliche Anweisung und mit Bestätigung, welcher Datensatz bleibt.

## Was nicht passiert

- Keine Kontakte ohne Bestätigung anlegen oder ändern.
- Keine Recherche über das Berufliche hinaus.
- Keine erfundenen Daten: was weder auf der Karte steht noch in der Recherche belegt ist, bleibt leer.
- Keine Gedankenstriche (em dashes) in Texten an den Nutzer oder in Notizen.