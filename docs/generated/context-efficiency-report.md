# Context Efficiency Report

This report estimates how much context the routing system saves before the agent reaches implementation files.

## Core Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| small map | 9 | 900 | 8159 | 83.0% | 95.3% |
| canonical | 46 | 6920 | 48026 | 0.0% | 72.4% |
| all docs | 115 | 24928 | 174133 | -262.6% | 0.0% |

## Estimated Savings

- Small map saves approximately `39867` tokens vs the canonical bundle.
- Small map saves approximately `165974` tokens vs the all-doc bundle.
- Surface `core` saves approximately `163727` tokens vs the all-doc bundle.
- Surface `raising` saves approximately `162537` tokens vs the all-doc bundle.
- Surface `field` saves approximately `163531` tokens vs the all-doc bundle.
- Surface `proof` saves approximately `164385` tokens vs the all-doc bundle.
- Surface `passport` saves approximately `164496` tokens vs the all-doc bundle.
- Surface `battle` saves approximately `164835` tokens vs the all-doc bundle.
- Surface `journal` saves approximately `164942` tokens vs the all-doc bundle.

## Surface Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| core | 13 | 1147 | 10406 | 78.3% | 94.0% |
| raising | 13 | 1277 | 11596 | 75.9% | 93.3% |
| field | 13 | 1155 | 10602 | 77.9% | 93.9% |
| proof | 13 | 1141 | 9748 | 79.7% | 94.4% |
| passport | 13 | 1087 | 9637 | 79.9% | 94.5% |
| battle | 13 | 1022 | 9298 | 80.6% | 94.7% |
| journal | 13 | 1016 | 9191 | 80.9% | 94.7% |

## Structural Scorecard

| Check | Actual | Target | Result |
| --- | --- | --- | --- |
| Small-map reduction vs canonical | 83.0% | >= 40% | PASS |
| Small-map reduction vs all docs | 95.3% | >= 55% | PASS |
| Worst surface reduction vs all docs | 93.3% | >= 50% | PASS |
| Small-map approx tokens | 8159 | <= 3800 | FAIL |
| Small-map file count | 9 | <= 6 | FAIL |
| Canonical approx tokens | 48026 | <= 12000 | FAIL |

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

