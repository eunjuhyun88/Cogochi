# Context Efficiency Report

This report estimates how much context the routing system saves before the agent reaches implementation files.

## Core Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| small map | 9 | 900 | 8159 | 83.9% | 94.9% |
| canonical | 49 | 7764 | 50719 | 0.0% | 68.5% |
| all docs | 105 | 22146 | 160956 | -217.3% | 0.0% |

## Estimated Savings

- Small map saves approximately `42560` tokens vs the canonical bundle.
- Small map saves approximately `152797` tokens vs the all-doc bundle.
- Surface `core` saves approximately `151879` tokens vs the all-doc bundle.
- Surface `raising` saves approximately `151936` tokens vs the all-doc bundle.
- Surface `field` saves approximately `151849` tokens vs the all-doc bundle.
- Surface `proof` saves approximately `151965` tokens vs the all-doc bundle.
- Surface `passport` saves approximately `151382` tokens vs the all-doc bundle.
- Surface `battle` saves approximately `151944` tokens vs the all-doc bundle.
- Surface `journal` saves approximately `151955` tokens vs the all-doc bundle.

## Surface Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| core | 13 | 1013 | 9077 | 82.1% | 94.4% |
| raising | 13 | 1008 | 9020 | 82.2% | 94.4% |
| field | 13 | 1016 | 9107 | 82.0% | 94.3% |
| proof | 13 | 999 | 8991 | 82.3% | 94.4% |
| passport | 13 | 1080 | 9574 | 81.1% | 94.1% |
| battle | 13 | 1004 | 9012 | 82.2% | 94.4% |
| journal | 13 | 997 | 9001 | 82.3% | 94.4% |

## Structural Scorecard

| Check | Actual | Target | Result |
| --- | --- | --- | --- |
| Small-map reduction vs canonical | 83.9% | >= 40% | PASS |
| Small-map reduction vs all docs | 94.9% | >= 55% | PASS |
| Worst surface reduction vs all docs | 94.1% | >= 50% | PASS |
| Small-map approx tokens | 8159 | <= 3800 | FAIL |
| Small-map file count | 9 | <= 6 | FAIL |
| Canonical approx tokens | 50719 | <= 12000 | FAIL |

## Structural Readiness

- FAIL: structural routing gate
- Final acceptance still requires a repeated runtime benchmark with controlled noise.

## Budget Checks

- FAIL: Small map approx tokens <= 3800
- FAIL: Small map files <= 6
- FAIL: Canonical approx tokens <= 12000

## Small Map Files

- `README.md`
- `AGENTS.md`
- `docs/README.md`
- `ARCHITECTURE.md`
- `docs/SYSTEM_INTENT.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/AGENT_FACTORY.md`
- `docs/TOOL_DESIGN.md`
- `docs/AGENT_OBSERVABILITY.md`

## How To Use

- Compare small-map and surface bundles against canonical/all-doc bundles.
- Review `docs/generated/contextual-retrieval.md` if ambiguous tasks still open too many docs.
- Review `docs/generated/agent-catalog.md` if outsiders still cannot discover reusable agents quickly.
- Use this with `docs/CONTEXT_EVALUATION.md` for task-level evaluation.
- Run `npm run harness:benchmark -- --base-url http://localhost:4173` for repeated runtime/noise validation.
- If the small map grows too much, routing quality is degrading even if docs remain correct.

