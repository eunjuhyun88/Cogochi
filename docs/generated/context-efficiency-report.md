# Context Efficiency Report

This report estimates how much context the routing system saves before the agent reaches implementation files.

## Core Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| small map | 9 | 900 | 8159 | 83.0% | 94.8% |
| canonical | 46 | 6920 | 48026 | 0.0% | 69.2% |
| all docs | 101 | 21859 | 156126 | -225.1% | 0.0% |

## Estimated Savings

- Small map saves approximately `39867` tokens vs the canonical bundle.
- Small map saves approximately `147967` tokens vs the all-doc bundle.
- Surface `core` saves approximately `145783` tokens vs the all-doc bundle.
- Surface `raising` saves approximately `144593` tokens vs the all-doc bundle.
- Surface `field` saves approximately `145587` tokens vs the all-doc bundle.
- Surface `proof` saves approximately `146441` tokens vs the all-doc bundle.
- Surface `passport` saves approximately `146552` tokens vs the all-doc bundle.
- Surface `battle` saves approximately `146891` tokens vs the all-doc bundle.
- Surface `journal` saves approximately `146998` tokens vs the all-doc bundle.

## Surface Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| core | 13 | 1140 | 10343 | 78.5% | 93.4% |
| raising | 13 | 1270 | 11533 | 76.0% | 92.6% |
| field | 13 | 1148 | 10539 | 78.1% | 93.2% |
| proof | 13 | 1134 | 9685 | 79.8% | 93.8% |
| passport | 13 | 1080 | 9574 | 80.1% | 93.9% |
| battle | 13 | 1015 | 9235 | 80.8% | 94.1% |
| journal | 13 | 1009 | 9128 | 81.0% | 94.2% |

## Structural Scorecard

| Check | Actual | Target | Result |
| --- | --- | --- | --- |
| Small-map reduction vs canonical | 83.0% | >= 40% | PASS |
| Small-map reduction vs all docs | 94.8% | >= 55% | PASS |
| Worst surface reduction vs all docs | 92.6% | >= 50% | PASS |
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

