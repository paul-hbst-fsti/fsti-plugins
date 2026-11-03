# FSTI Plugins

Plugin-Marketplace für Claude und ChatGPT/Codex mit Skills für das Team des Ferdinand-Steinbeis-Instituts.

## Installation

### Claude

In Claude Code:

```bash
claude plugin marketplace add paul-hbst-fsti/fsti-plugins
claude plugin install twenty-kontakte@fsti-plugins
```

Oder in einer Session: `/plugin marketplace add paul-hbst-fsti/fsti-plugins`, danach `/plugin install twenty-kontakte@fsti-plugins`.

Updates holen: `claude plugin marketplace update fsti-plugins`.

### ChatGPT und Codex

In der Codex CLI:

```bash
codex plugin marketplace add paul-hbst-fsti/fsti-plugins
codex plugin add twenty-kontakte@fsti-plugins
```

Updates holen: `codex plugin marketplace upgrade fsti-plugins`.

Workspace-Admins können das Repo in ChatGPT unter Workspace settings > Plugins importieren. In der Desktop-App erscheint der Marketplace im Plugins-Verzeichnis, sobald er hinzugefügt ist.

## Plugins

| Plugin | Inhalt |
| :- | :- |
| `twenty-kontakte` | Skill `twenty-kontakte-pflegen`: Kontakte in Twenty CRM aus Visitenkarten-Foto oder Texteingabe anlegen und pflegen, mit kurzer Webrecherche, Dublettenprüfung, Firmenzuordnung und Bestätigung vor jedem Schreibvorgang |

## Voraussetzungen

- Zugang zur Twenty-Instanz des FSTI. Das Plugin `twenty-kontakte` liefert den MCP-Server mit, beim ersten Aufruf meldest du dich per OAuth im Browser an
- Für die Recherche: Websuche in Claude oder ChatGPT aktiviert

## Aufbau

Skills liegen einmal unter `plugins/<name>/skills/` und gelten für beide Plattformen. Die Claude-Manifeste sind die Quelle:

| Plattform | Marketplace | Plugin-Manifest |
| :- | :- | :- |
| Claude | `.claude-plugin/marketplace.json` (von Hand) | `plugins/<name>/.claude-plugin/plugin.json` (von Hand) |
| ChatGPT/Codex | `.agents/plugins/marketplace.json` (erzeugt) | `plugins/<name>/plugin.json` (erzeugt) |

MCP-Server stehen in `plugins/<name>/.mcp.json` und werden nach `mcp.json` übertragen. Das Repo ist öffentlich, also nur OAuth verwenden und keine Schlüssel oder Header eintragen.

Erzeugte Dateien nicht von Hand ändern. Skills in neutraler Sprache schreiben, also keine Tool-Namen einer einzelnen Plattform verwenden.

## Neues Plugin hinzufügen

1. Ordner `plugins/<name>/` mit `.claude-plugin/plugin.json` und `skills/<skill>/SKILL.md` anlegen
2. Eintrag in `.claude-plugin/marketplace.json` ergänzen (Eintragsname = `name` in `plugin.json`)
3. `node scripts/sync-manifests.mjs` ausführen, um die ChatGPT/Codex-Manifeste zu erzeugen
4. `claude plugin validate .` ausführen
5. Bei Änderungen an einem Plugin die `version` in dessen `.claude-plugin/plugin.json` erhöhen und das Skript erneut ausführen, sonst bekommen Nutzer das Update nicht
