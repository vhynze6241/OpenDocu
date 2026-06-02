# Contributing

OpenDocu is a local-first docs substrate for coding agents. Keep the boundary clear:

- CLI: deterministic local storage, import, indexing, search, validation
- Skill/agent: fetching, source selection, keyword choice, reasoning, final answers

## Development

```bash
npm install
npm run check
npm run gate:all
```

Use Node.js `24` or newer.

## Quality Bar

Changes that affect indexing, search, versioning, import, or skill behavior should include tests and, when practical, a real-doc gate update.

Do not add hidden network fetches, LLM calls, or external services to the CLI. If a workflow needs judgment or remote fetching, put the guidance in the skill.
