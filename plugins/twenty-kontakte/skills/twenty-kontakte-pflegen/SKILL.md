---
name: "twenty-kontakte-pflegen"
description: "Kontakte in Twenty CRM anlegen und pflegen: aus Visitenkarten-Foto oder Texteingabe, mit kurzer Webrecherche, Dublettenprüfung, Firmenzuordnung und Bestätigung durch den Nutzer."
---

# Kontakte in Twenty anlegen und pflegen

Dieser Skill gilt, wenn der Nutzer eine Visitenkarte hochlädt, einen Kontakt per Text nennt ("leg mal Max Muster von Firma X an") oder einen bestehenden Kontakt ändern, ergänzen oder bereinigen will.

Grundregel: **Nichts wird in Twenty geschrieben, bevor der Nutzer den Vorschlag bestätigt hat.** Lesen, suchen und recherchieren ist vorher erlaubt.

## Rückfragen und Werkzeuge

Dieser Skill läuft in Claude und in ChatGPT/Codex. "Auswahlfrage" heißt: Nutze das Rückfrage-Werkzeug der Umgebung mit klickbaren Optionen, falls es eines gibt. Gibt es keines oder sind weniger Optionen möglich, stelle die Optionen als nummerierte Liste im Chat und warte auf die Antwort. Der Nutzer kann immer auch frei antworten.

Die Tools `learn_tools`, `find_many_*`, `create_one_*`, `update_one_*` und `execute_tool` stammen vom Twenty-MCP-Server. Die FSTI-Kürzel kommen aus dem Intranet (Strapi-MCP, Inhaltstyp `shorthand`, z. B. `list_shorthand` mit `pageSize: 100`, `status: published`; Felder `abbreviation` und `meaning`). Das Plugin bringt die Verbindung zur FSTI-Instanz mit. Beim ersten Aufruf meldet sich der Nutzer per OAuth im Browser an. Fehlt die Verbindung oder schlägt die Anmeldung fehl, sag das und schreibe nichts. Ohne Websuche entfällt die Recherche; weise kurz darauf hin.

## Kürzel verwenden

In Notizen und Freitexten in Twenty werden FSTI-Personen, Organisationen und Begriffe mit ihren Kürzeln aus dem Intranet bezeichnet, nicht mit vollem Namen. Beispiele: "HPA" statt "Paul", "LH" statt "Heiner Lasi", "FSTI", "PK" für Projekt.

- Kürzelliste einmal pro Session aus dem Intranet laden, bevor eine Notiz geschrieben wird.
- Den Nutzer selbst mit seinem eigenen Kürzel bezeichnen (z. B. "HPA hat X am 25.11.2026 kennengelernt").
- Gibt es für eine Person oder einen Begriff kein Kürzel, den Namen ausschreiben und nichts erfinden.
- Ist das Intranet nicht verbunden oder nicht erreichbar, Namen ausschreiben und kurz darauf hinweisen.

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

Beim Neuanlegen einer Firma: `name`, `domainName.primaryLinkUrl` (https://...), `branche` aus den vorhandenen Optionen wählen (BILDUNG_FORSCHUNG, IT, INDUSTRIE_PRODUKTION, DIENSLEITUNGEN_HANDWERK, DIENSLEISTUNGEN, GESUNDHEIT_SOZIALES, FINANZEN_VERSICHERUNGEN, BAU_IMMOBILIEN, LOGISTIK_VERKEHR, OFFENTLICHER_SEKTOR_NON_PROFIT, ENERGIE_UMWELT, LAND_FORSTWIRTSCHAFT, PRESSE, MEDIENWIRTSCHAFT, HOLZINDUSTRIE), Adresse falls bekannt, `infosZumUnternehmen` mit 1 bis 2 Sätzen aus der Recherche. Optionen im Zweifel per `learn_tools(create_one_company)` aktuell prüfen.

### Eine Firma pro Domain

In Twenty ist die Haupt-Domain einer Firma eindeutig, eine Domain gehört also zu genau einer Firma. Die Firma ist deshalb die Organisation hinter der Mail-Domain, nicht eine Abteilung, Dienststelle, ein Institut oder Standort. Beispiel: Karte "Planungsamt der Bundeswehr, Referat Zukunftsanalyse" mit Mail @bundeswehr.org ergibt die Firma "Bundeswehr" (bundeswehr.org). "Planungsamt der Bundeswehr, Referat ..." gehört in `jobTitle` der Person. Eine eigene Firma für eine Untereinheit nur dann, wenn sie eine eigene Mail-Domain hat. Die Adresse einer Dienststelle nicht als Firmenadresse eintragen, wenn die Firma die Gesamtorganisation ist.

Eine gelöschte Firma liegt im Papierkorb und blockiert ihre Domain weiter. Soll eine andere Firma diese Domain bekommen, muss der Nutzer die gelöschte Firma vorher in Twenty endgültig aus dem Papierkorb entfernen. Über den MCP-Server geht das nicht.

### Workflow "Create company when adding a new person"

Im Workspace läuft ein Workflow, der beim Anlegen einer Person und bei jeder Änderung ihrer E-Mail startet, aber nur für Personen **ohne Firma** und mit geschäftlicher Mail (private wie gmail oder web.de lässt er aus). Er nimmt die Domain der primären E-Mail und sucht eine Firma, deren **Haupt-Domain** (`domainName.primaryLinkUrl`) diese Domain enthält. Zweite Domains (`secondaryLinks`) prüft er nicht. Findet er eine, hängt er die Person dort ein. Findet er keine, legt er eine Firma mit der Domain als Name an (z. B. "bundeswehr.org").

Damit der Workflow trotzdem richtig arbeitet:

1. **Personen immer mit `companyId` anlegen**, wenn die Firma feststeht. Dann greift der Workflow nicht.
2. **Neue Firma:** Die E-Mail-Domain als `primaryLinkUrl` eintragen. Weicht die Website ab, kommt sie als `secondaryLinks` dazu. Im Vorschlag so zeigen: "Domain: bundeswehr.org (Mail), Website: bundeswehr.de". Website-Domain und Mail-Domain unterscheiden sich oft (bundeswehr.de vs. bundeswehr.org, ip.ai vs. ipai-foundation.ai).
3. **Vorhandene Firma mit anderer Haupt-Domain:** Im Vorschlag anbieten, die Haupt-Domain auf die Mail-Domain umzustellen (alte Domain als `secondaryLinks` behalten). Sonst legt der Workflow beim nächsten Kontakt dieser Firma ohne Zuordnung eine Domain-Firma an.
4. **Person ohne Firma anlegen** (Nutzer will "ohne Firma"): darauf hinweisen, dass der Workflow sie per Mail-Domain zuordnet oder eine Domain-Firma anlegt. Nach etwa 5 Sekunden `companyId` erneut lesen und das Ergebnis melden.
5. Gibt es eine Domain-Firma (Name = Domain, vom Workflow angelegt) neben der echten Firma: Personen zur echten Firma umhängen, die Domain-Firma nur auf ausdrücklichen Wunsch löschen und vorher prüfen, dass niemand mehr daran hängt. Danach muss der Nutzer sie im Papierkorb endgültig löschen, bevor die echte Firma die Domain als Haupt-Domain bekommen kann.

### Domain-Firmen

Firmen werden in Twenty oft automatisch aus der E-Mail-Domain angelegt (Name = Domain, z. B. "mpg.de") oder später umbenannt. Den Firmennamen deshalb direkt vor dem Vorschlag frisch abfragen und nicht aus einer früheren Abfrage übernehmen. Ist eine solche Domain-Firma die einzige Zuordnung, im Vorschlag anbieten, sie zu ergänzen (Name, https-Website, Branche, Adresse, Infos). Vorher prüfen, welche Personen an der Firma hängen (`find_many_people` mit `companyId`), damit eine Umbenennung keine anderen Kontakte falsch zuordnet. Führende oder doppelte Leerzeichen im Namen bereinigen.

## Dublettenprüfung

Vor jedem Anlegen in Twenty suchen:

- `find_many_people` nach E-Mail: `emails: { primaryEmail: { ilike: "<email>" } }`
- nach Name: `name: { firstName: { ilike: "<vorname>" }, lastName: { ilike: "<nachname>" } }`

Gibt es einen Treffer, nicht neu anlegen, sondern zeigen: "Existiert bereits: <Name>, <Firma>, <E-Mail>. Soll ich ihn mit den neuen Angaben aktualisieren?" Bei Aktualisierung nur Felder überschreiben, die leer sind oder die der Nutzer ausdrücklich ändern will. Alte E-Mail oder Telefonnummer in `additionalEmails` bzw. `additionalPhones` verschieben statt löschen.

## Vorhandene Notizen lesen (Pflicht vor jeder Aktualisierung)

Bevor ein vorhandener Kontakt aktualisiert oder eine Notiz angelegt wird, immer die zugehörigen Notizen holen und lesen:

1. `find_many_note_targets` mit `targetPersonId: { eq: <personId> }`, `select: ["noteId", "note"]`. Dasselbe für die zugeordnete Firma mit `targetCompanyId`.
2. Die gefundenen Notizen über ihre `noteId`s mit `title` und `bodyV2` vollständig lesen (`find_many_notes`).
3. Im Vorschlag kurz zeigen, was schon da ist (Titel, Datum, 1 Zeile Inhalt).
4. Gibt es schon eine Notiz zum selben Anlass oder Kennenlernen, keine zweite anlegen, sondern vorschlagen, die vorhandene zu ergänzen (`update_one_note`, bestehenden Text unverändert lassen und neuen Absatz anhängen). Eine neue Notiz nur, wenn es um einen neuen Anlass geht oder der Nutzer das will.
5. Inhalte aus vorhandenen Notizen (Anlass, Kontext, beteiligte Personen) für den Vorschlag nutzen, statt erneut nachzufragen.

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
Kategorie: Projektpartner (Vorschlag) · Status: offen · Priorität: offen
Vorhandene Notizen: <Titel, Datum> | keine
Notiz: <neu: Text mit Kürzeln> | <Ergänzung zu vorhandener Notiz: Text>

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
- `kategorie` (Mehrfachauswahl, Array): FSTI_MITARBEITER_IN, DIENSLEISTER_FSTI, PROJEKTPARTNER, POTENZIELLER_PROJEKTPARTNER, NETZWERKPARTNER, AIOT, SKALIERUNG, DATEN_INFORMATIONSOKONOMIE, ECOSYSTEM, COSMOS_PARTNER. Nur setzen, wenn der Nutzer eine wählt; "keine Kategorie" ist eine gültige Antwort.
- `kontaktstatus`: KONTAKTAUFNAHME_GEPLANT, IM_KONTAKT, PROJEKTANBAHNUNG, IM_PROJEKT, INAKTIV. Nicht automatisch setzen, auch nicht nach einem persönlichen Kennenlernen; im Vorschlag als offen führen und nur auf Angabe des Nutzers setzen.
- `prioritat`: A, B, C nur wenn der Nutzer es angibt
- `sperrvermerk`, `nachsteUberprufung`, `letzteUberprufung`: nur auf ausdrücklichen Wunsch
- `unvollstaendigSeit`: nie selbst setzen, das macht der Workflow

Kontext zur Begegnung ("getroffen auf der Hannover Messe am 12.11.", Gesprächsinhalt) als Notiz festhalten, mit Kürzeln formuliert (z. B. "HPA hat X am 25.11.2026 kennengelernt. Im Rahmen von Vortrag LH bei ..."). Erst die vorhandenen Notizen prüfen (siehe "Vorhandene Notizen lesen"); nur wenn keine passende existiert, neu anlegen (`create_one_note` mit `title` und `bodyV2.markdown`) und per `create_one_note_target` mit `targetPersonId` verknüpfen. Anlass und Gesprächsinhalt im Chat erfragen, bevor die Notiz geschrieben wird, statt eine Platzhalter-Notiz anzulegen. Das Visitenkartenbild auf Wunsch als Anhang an die Person hängen.

Nach dem Anlegen: eine Zeile Rückmeldung mit Name, Firma und Hinweis auf fehlende Pflichtfelder, falls vorhanden.

## Kontakte pflegen

- **Ändern**: Person suchen, bei mehreren Treffern per Auswahlfrage auswählen lassen, vorhandene Notizen von Person und Firma lesen, Änderungen als Vorher/Nachher zeigen, nach Bestätigung `update_one_person`.
- **Firmenwechsel**: neue Firma zuordnen, alte Firma und Position in einer Notiz festhalten ("bis 11/2026 bei X als Y"), alte E-Mail in `additionalEmails`.
- **Mehrere Visitenkarten auf einmal**: jede einzeln auslesen, dann eine gesammelte Tabelle zur Bestätigung zeigen, Dubletten und unsichere Felder markieren, danach gesammelt anlegen.
- **Löschen oder Zusammenführen**: nur auf ausdrückliche Anweisung und mit Bestätigung, welcher Datensatz bleibt.

## Was nicht passiert

- Keine Kontakte ohne Bestätigung anlegen oder ändern.
- Keine Recherche über das Berufliche hinaus.
- Keine erfundenen Daten: was weder auf der Karte steht noch in der Recherche belegt ist, bleibt leer.
- Keine Gedankenstriche (em dashes) in Texten an den Nutzer oder in Notizen.
- Keine Aktualisierung und keine neue Notiz, ohne vorher die vorhandenen Notizen gelesen zu haben.
- Keine vollen Namen von FSTI-Personen in Notizen, wenn es ein Kürzel gibt.