# Launch Readiness

OpenDocu v1 is launchable when these checks pass:

- `npm run check`
- `npm run gate:all`
- `npm pack --dry-run`
- CI is green on Node.js 24
- independent agent forward test succeeds from an empty store
- README and install docs describe the deterministic CLI/agent boundary
- Codex, Claude Code, and generic agent adapters describe the same CLI contract
- security notes explain that imported docs are untrusted reference material

Current v1 coverage:

- Markdown/MDX official docs import
- HTML official docs import
- version-aware search
- stale index protection
- scoped package IDs
- local aliases and resolver
- Codex skill with progressive references
- Claude Code plugin manifest and manual search command
- generic `AGENTS.md` instructions for other shell-capable agents
- real Node.js Markdown gate
- real Node.js HTML gate

Known non-goals for v1:

- hosted global docs corpus
- MCP server
- hidden network fetches in the CLI
- LLM summarization inside the CLI
