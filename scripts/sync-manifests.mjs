#!/usr/bin/env node
// Erzeugt die ChatGPT/Codex-Manifeste aus den Claude-Manifesten.
// Quelle: .claude-plugin/marketplace.json und plugins/<name>/.claude-plugin/plugin.json
// Ziel:   .agents/plugins/marketplace.json und plugins/<name>/plugin.json
// Aufruf: node scripts/sync-manifests.mjs          schreibt die Dateien
//         node scripts/sync-manifests.mjs --check  prüft nur, Exit-Code 1 bei Abweichung
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const schema = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const nameRule = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const render = (value) => `${JSON.stringify(value, null, 2)}\n`;
const fail = (message) => {
  console.error(`Fehler: ${message}`);
  process.exitCode = 1;
};

const marketplace = readJson(".claude-plugin/marketplace.json");
const outputs = new Map();

outputs.set(
  ".agents/plugins/marketplace.json",
  render({
    name: marketplace.name,
    interface: { displayName: "FSTI Plugins" },
    plugins: marketplace.plugins.map((entry) => ({
      name: entry.name,
      source: { source: "local", path: entry.source },
      policy: { installation: "AVAILABLE", authentication: "ON_USE" },
      category: "Productivity",
    })),
  }),
);

for (const entry of marketplace.plugins) {
  const dir = entry.source.replace(/^\.\//, "");
  const manifest = readJson(join(dir, ".claude-plugin/plugin.json"));
  if (manifest.name !== entry.name) {
    fail(`${dir}: Name "${manifest.name}" passt nicht zum Marketplace-Eintrag "${entry.name}"`);
  }
  if (!nameRule.test(manifest.name) || manifest.name.length > 64) {
    fail(`${dir}: Name "${manifest.name}" entspricht nicht Agent Plugins 1.0`);
  }
  if (!existsSync(join(root, dir, "skills"))) fail(`${dir}: Ordner skills/ fehlt`);

  const { name, version, description, author, homepage, repository, license, keywords } = manifest;
  const portable = { $schema: schema, name, version, description, author, homepage, repository, license, keywords };
  portable.extensions = {
    "com.openai": {
      interface: {
        displayName: manifest.displayName ?? name,
        shortDescription: entry.description,
        developerName: author?.name,
        category: "Productivity",
      },
    },
  };
  outputs.set(join(dir, "plugin.json"), render(portable));
}

for (const [path, content] of outputs) {
  const target = join(root, path);
  const current = existsSync(target) ? readFileSync(target, "utf8") : null;
  if (current === content) continue;
  if (check) {
    fail(`${path} ist nicht aktuell. Bitte node scripts/sync-manifests.mjs ausführen.`);
  } else {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
    console.log(`geschrieben: ${path}`);
  }
}
