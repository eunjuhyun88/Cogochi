# Agent Catalog

This generated catalog lists the repo-local agent blueprints that outsiders can inspect and reuse.

## Overview

- Agent count: `11`
- Public agents: `11`

## Agents

| ID | Role | Surfaces | Manifest | Writes |
| --- | --- | --- | --- | --- |
| `asset-curator` | researcher | `core` | `agents/asset-curator.json` | `static/assets/, docs/references/imported/, docs/design-docs/, .agent-context/, docs/AGENT_WATCH_LOG.md` |
| `autoresearch-director` | planner | `core` | `agents/autoresearch-director.json` | `docs/exec-plans/active/, .agent-context/, docs/AGENT_WATCH_LOG.md` |
| `battle-researcher` | implementer | `core` | `agents/battle-researcher.json` | `src/lib/engine/, src/lib/services/, docs/product-specs/, .agent-context/, docs/AGENT_WATCH_LOG.md` |
| `field-loop-builder` | implementer | `core` | `agents/field-loop-builder.json` | `src/routes/, src/components/, src/lib/stores/, src/lib/engine/, static/assets/, docs/product-specs/, .agent-context/, docs/AGENT_WATCH_LOG.md` |
| `implementer` | implementer | `core` | `agents/implementer.json` | `src/, .agent-context/, docs/AGENT_WATCH_LOG.md` |
| `memory-tuner` | implementer | `core` | `agents/memory-tuner.json` | `src/lib/services/memory/, src/lib/services/, docs/product-specs/, .agent-context/, docs/AGENT_WATCH_LOG.md` |
| `planner` | planner | `core` | `agents/planner.json` | `docs/exec-plans/active/, .agent-context/, docs/AGENT_WATCH_LOG.md` |
| `raising-ux-shipper` | implementer | `core` | `agents/raising-ux-shipper.json` | `src/routes/, src/components/, src/lib/stores/, static/, docs/product-specs/, .agent-context/, docs/AGENT_WATCH_LOG.md` |
| `reviewer` | reviewer | `core` | `agents/reviewer.json` | `.agent-context/, docs/AGENT_WATCH_LOG.md` |
| `runtime-memory-architect` | implementer | `core` | `agents/runtime-memory-architect.json` | `runtime/, src/lib/services/memory/, scripts/autoresearch/, docs/design-docs/, docs/exec-plans/active/, tools/` |
| `ship-reviewer` | reviewer | `core` | `agents/ship-reviewer.json` | `.agent-context/, docs/AGENT_WATCH_LOG.md` |

## How To Use

- Create a new blueprint with `npm run agent:new -- --id "<agent-id>" --role "<role>" --surface "<surface>"`.
- Refresh generated artifacts with `npm run agent:refresh` and `npm run docs:refresh`.
- Search the public manifest with `npm run registry:query -- --kind agent --q "<term>"`.

