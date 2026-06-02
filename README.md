# OpenDocu

OpenDocu helps coding agents answer coding questions from a local, versioned store of official documentation.

The CLI is the deterministic storage and retrieval layer. It imports local Markdown, MDX, or HTML docs, builds one raw-doc search index, validates optional retrieval-repair cards, and returns ranked results with source URLs. It does not crawl websites, fetch from the internet, summarize docs, or interpret natural-language questions.

The agent plugin is the workflow layer. It helps an agent choose the right library and version, fetch official docs when the local store is missing evidence, normalize those docs into source-backed Markdown or MDX, run the CLI, and answer from cited raw documentation.

## Requirements

- Node.js `24` or newer
- A terminal or shell-capable coding agent
- Official docs fetched locally before import

## Install

OpenDocu is currently installed from this repository checkout.

```bash
git clone https://github.com/yu2001-s/OpenDocu.git
cd OpenDocu
npm install
node bin/opendocu.mjs --help
```

Use `node bin/opendocu.mjs` from the checkout unless you have installed an `opendocu` binary on your PATH. The npm package is not published yet, so `npm install -g opendocu` is not part of the current public install path.

## Agent Setup

Copy this prompt into your agent:

```text
Install the OpenDocu coding-agent plugin from https://github.com/yu2001-s/OpenDocu.
```

## Quickstart

This example imports one official Node.js documentation page into a temporary local store, indexes it, searches by explicit keywords, and reads the raw page.

```bash
mkdir -p .tmp/opendocu-node .tmp/opendocu-store
curl -fsSL https://raw.githubusercontent.com/nodejs/node/v24.16.0/doc/api/async_context.md \
  -o .tmp/opendocu-node/async_context.md

node bin/opendocu.mjs import node 24.16.0 .tmp/opendocu-node \
  --url-base https://github.com/nodejs/node/blob/v24.16.0/doc/api \
  --store .tmp/opendocu-store

node bin/opendocu.mjs index --store .tmp/opendocu-store
node bin/opendocu.mjs search node AsyncLocalStorage snapshot \
  --version 24.16.0 \
  --store .tmp/opendocu-store
node bin/opendocu.mjs get node@24.16.0/async_context \
  --store .tmp/opendocu-store
```

For a normal store, omit `--store`. The default location is `~/.opendocu`. You can also set `OPENDOCU_HOME` or pass `--store <path>` per command.

## Core Commands

```bash
opendocu init
opendocu import node 24.16.0 ./node/doc/api \
  --url-base https://github.com/nodejs/node/blob/v24.16.0/doc/api
opendocu import-html node 24.16.0 ./node-html/api \
  --url-base https://nodejs.org/download/release/v24.16.0/docs/api
opendocu alias nodejs node
opendocu resolve nodejs
opendocu index
opendocu search node AsyncLocalStorage snapshot --version 24.16.0
opendocu get node@24.16.0/async_context
opendocu list
opendocu doctor
```

`search` defaults to `--match auto`: OpenDocu first requires all keywords to match, then falls back to any-keyword matching only if the strict search returns nothing. Agents should search with explicit keywords, symbols, option names, headings, or error codes instead of passing full natural-language questions.

If a requested project version is more specific than the stored docs version, OpenDocu can resolve compatible semver aliases and reports the stored version it searched. Use `opendocu alias <alias> <library>` to keep local names consistent, for example `nodejs -> node` or `next -> nextjs`.

## Importing Docs

OpenDocu imports local files only. Fetch official docs with your agent or normal shell tools first.

Markdown and MDX docs can be imported directly:

```bash
opendocu import node 24.16.0 ./node/doc/api \
  --url-base https://github.com/nodejs/node/blob/v24.16.0/doc/api
opendocu index
```

Static HTML docs can be imported with `import-html`:

```bash
opendocu import-html node 24.16.0 ./node-html/api \
  --url-base https://nodejs.org/download/release/v24.16.0/docs/api
opendocu index
```

For generated JSON, API specs, language-native reference output, manpages, dynamic docs pages, or other source formats, normalize the official material into Markdown or MDX first. Keep source URLs, retrieved time, source format, adapter name, identifiers, declarations, parameters, warnings, version notes, examples, and links.

Each imported page should keep source metadata in frontmatter:

```md
---
library: nextjs
version: "15"
title: Middleware
url: https://nextjs.org/docs/app/building-your-application/routing/middleware
retrieved_at: 2026-06-02T00:00:00Z
content_hash: sha256:...
---

# Middleware

Original documentation content goes here.
```

## Store Layout

OpenDocu writes docs under `~/.opendocu` by default:

```text
~/.opendocu/
  registry.json
  libraries/
    nextjs/
      versions/
        15/
          pages/
            app-router/
              middleware.mdx
          map/
            README.md
            log.md
            apis/
              middleware-cookies.md
  index/
    opendocu.sqlite
    opendocu.index.json
```

Markdown or MDX files under `pages/` are the source of truth. `opendocu index` builds the SQLite search artifact and JSON debug artifact under `index/`.

## Retrieval Repair

Source docs are the knowledge base. Semantic cards are retrieval patches. Use them only after raw official docs exist and a real search misses or misranks the right evidence because of aliases, wording, or cross-topic relationships.

```bash
opendocu map init node 24.16.0
opendocu map validate node --version 24.16.0
opendocu index
opendocu search node AsyncLocalStorage snapshot --version 24.16.0
```

Cards live under `libraries/<library>/versions/<version>/map/`. They can route and rank ordinary `opendocu search` results, but final answers should still use raw docs returned by `search` or `get`.

See `docs/architecture.md` for the full data model.

## Contributor Checks

```bash
npm run check
npm run gate:release
```

`npm run gate:release` runs the release gate, including fixture, normalization, workflow simulation, package, and network checks. See `docs/validation-gate.md` for details.

For local Codex plugin evaluation or marketplace packaging, build and inspect the generated plugin bundle:

```bash
npm run build:plugin
plugin-eval analyze dist/opendocu --format markdown
```

`dist/opendocu` is the installable plugin artifact. Rebuild it after source changes; do not edit files in `dist/opendocu` directly.
