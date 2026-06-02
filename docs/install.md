# Install

## Requirements

- Node.js `24` or newer
- A local docs source fetched by the user or agent

## CLI

After publishing:

```bash
npm install -g opendocu
opendocu --help
```

From a checkout:

```bash
npm install
node bin/opendocu.mjs --help
```

## Store Location

Default:

```text
~/.opendocu
```

Override per command:

```bash
opendocu search node AsyncLocalStorage.snapshot --store /path/to/store
```

Or per shell:

```bash
export OPENDOCU_HOME=/path/to/store
```

## Codex Plugin

This repository includes a Codex plugin manifest at `.codex-plugin/plugin.json` and the OpenDocu skill under `skills/opendocu`.

Use the repository as a local plugin during development. The skill expects the `opendocu` CLI to be available on PATH, or commands can be run through `node bin/opendocu.mjs` from the checkout.

## Claude Code Plugin

This repository includes a Claude Code plugin manifest at `.claude-plugin/plugin.json`. The plugin uses the same OpenDocu skill under `skills/opendocu` and adds a manual search command at `commands/search.md`.

During development, load the plugin from the checkout:

```bash
claude --plugin-dir .
```

Claude Code exposes the main skill as `/opendocu:opendocu` and the search command as `/opendocu:search`.

If the global `opendocu` command is not installed, the Claude adapter can run the bundled CLI with:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/opendocu.mjs"
```

## Other Agents

For shell-capable agents without native OpenDocu packaging, point the agent at `AGENTS.md` and ensure it can run `opendocu` or `node bin/opendocu.mjs`.
