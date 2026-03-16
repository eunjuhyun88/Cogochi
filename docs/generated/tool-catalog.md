# Tool Catalog

This generated catalog lists repo-local tool contracts that agents can reuse without reading large free-form prompt text.

## Overview

- Tool count: `11`
- Public tools: `11`

## Tools

| ID | Scope | Surfaces | Safety | Invocation |
| --- | --- | --- | --- | --- |
| `battle-benchmark` | local-command | `core` | `writes-generated` | `autoresearch:battle` |
| `change-acceptance` | local-command | `core` | `writes-generated` | `autoresearch:accept` |
| `context-retrieve` | context-api | `core` | `read-only` | `retrieve:query` |
| `coord-claim` | coordination | `core` | `writes-generated` | `coord:claim` |
| `field-loop-eval` | local-command | `core` | `writes-generated` | `autoresearch:field` |
| `openclaw-health` | local-command | `core` | `writes-generated` | `autoresearch:openclaw` |
| `proof-readiness` | local-command | `proof` | `writes-generated` | `autoresearch:proof` |
| `raising-ux-eval` | local-command | `core` | `writes-generated` | `autoresearch:raising` |
| `registry-search` | context-api | `core` | `read-only` | `registry:query` |
| `runtime-readiness` | local-command | `core` | `writes-generated` | `autoresearch:runtime` |
| `scorecard-report` | local-command | `core` | `writes-generated` | `autoresearch:score` |

## How To Use

- Create a new tool contract with `npm run tool:new -- --id "<tool-id>" --surface "<surface>"`.
- Refresh generated artifacts with `npm run tool:refresh` and `npm run docs:refresh`.
- Search the public manifest with `npm run registry:query -- --kind tool --q "<term>"`.

