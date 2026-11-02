# FSTI Plugins

Plugin-Marketplace für Claude mit Skills für das Team des Ferdinand-Steinbeis-Instituts.

## Installation

In Claude Code:

```bash
claude plugin marketplace add paul-hbst-fsti/fsti-plugins
claude plugin install twenty-kontakte@fsti-plugins
```

Oder in einer Session: `/plugin marketplace add paul-hbst-fsti/fsti-plugins`, danach `/plugin install twenty-kontakte@fsti-plugins`.

Updates holen: `claude plugin marketplace update fsti-plugins`.

## Plugins

| Plugin | Inhalt |
| :- | :- |
| `twenty-kontakte` | Skill `twenty-kontakte-pflegen`: Kontakte in Twenty CRM aus Visitenkarten-Foto oder Texteingabe anlegen und pflegen, mit kurzer Webrecherche, Dublettenprüfung, Firmenzuordnung und Bestätigung vor jedem Schreibvorgang |

## Voraussetzungen

- Verbindung zu einem Twenty-CRM-Workspace über den Twenty-MCP-Server
- Für die Recherche: Websuche in Claude aktiviert

## Neues Plugin hinzufügen

1. Ordner `plugins/<name>/` mit `.claude-plugin/plugin.json` und `skills/<skill>/SKILL.md` anlegen
2. Eintrag in `.claude-plugin/marketplace.json` ergänzen (Eintragsname = `name` in `plugin.json`)
3. `claude plugin validate .` ausführen
4. Bei Änderungen an einem Plugin die `version` in dessen `plugin.json` erhöhen, sonst bekommen Nutzer das Update nicht
