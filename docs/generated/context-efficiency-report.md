# Context Efficiency Report

This report estimates how much context the routing system saves before the agent reaches implementation files.

## Core Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| small map | 9 | 896 | 8123 | 83.1% | 94.8% |
| canonical | 46 | 6916 | 47990 | 0.0% | 69.1% |
| all docs | 101 | 21796 | 155420 | -223.9% | 0.0% |

## Estimated Savings

- Small map saves approximately `39867` tokens vs the canonical bundle.
- Small map saves approximately `147297` tokens vs the all-doc bundle.
- Surface `core` saves approximately `145113` tokens vs the all-doc bundle.
- Surface `raising` saves approximately `143923` tokens vs the all-doc bundle.
- Surface `field` saves approximately `144917` tokens vs the all-doc bundle.
- Surface `proof` saves approximately `145771` tokens vs the all-doc bundle.
- Surface `passport` saves approximately `145882` tokens vs the all-doc bundle.
- Surface `battle` saves approximately `146221` tokens vs the all-doc bundle.
- Surface `journal` saves approximately `146328` tokens vs the all-doc bundle.

## Surface Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| core | 13 | 1136 | 10307 | 78.5% | 93.4% |
| raising | 13 | 1266 | 11497 | 76.0% | 92.6% |
| field | 13 | 1144 | 10503 | 78.1% | 93.2% |
| proof | 13 | 1130 | 9649 | 79.9% | 93.8% |
| passport | 13 | 1076 | 9538 | 80.1% | 93.9% |
| battle | 13 | 1011 | 9199 | 80.8% | 94.1% |
| journal | 13 | 1005 | 9092 | 81.1% | 94.2% |

## Structural Scorecard

| Check | Actual | Target | Result |
| --- | --- | --- | --- |
| Small-map reduction vs canonical | 83.1% | >= 40% | PASS |
| Small-map reduction vs all docs | 94.8% | >= 55% | PASS |
| Worst surface reduction vs all docs | 92.6% | >= 50% | PASS |
| Small-map approx tokens | 8123 | <= 3800 | FAIL |
| Small-map file count | 9 | <= 6 | FAIL |
| Canonical approx tokens | 47990 | <= 12000 | FAIL |

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

