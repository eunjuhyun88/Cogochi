# Context Efficiency Report

This report estimates how much context the routing system saves before the agent reaches implementation files.

## Core Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| small map | 9 | 876 | 7877 | 83.5% | 94.8% |
| canonical | 46 | 6889 | 47687 | 0.0% | 68.6% |
| all docs | 100 | 21450 | 151810 | -218.3% | 0.0% |

## Estimated Savings

- Small map saves approximately `39810` tokens vs the canonical bundle.
- Small map saves approximately `143933` tokens vs the all-doc bundle.
- Surface `core` saves approximately `141765` tokens vs the all-doc bundle.
- Surface `raising` saves approximately `140575` tokens vs the all-doc bundle.
- Surface `field` saves approximately `141569` tokens vs the all-doc bundle.
- Surface `proof` saves approximately `142423` tokens vs the all-doc bundle.
- Surface `passport` saves approximately `142534` tokens vs the all-doc bundle.
- Surface `battle` saves approximately `142873` tokens vs the all-doc bundle.
- Surface `journal` saves approximately `142980` tokens vs the all-doc bundle.

## Surface Bundles

| Bundle | Files | Lines | Approx Tokens | Reduction vs canonical | Reduction vs all docs |
| --- | --- | --- | --- | --- | --- |
| core | 13 | 1115 | 10045 | 78.9% | 93.4% |
| raising | 13 | 1245 | 11235 | 76.4% | 92.6% |
| field | 13 | 1123 | 10241 | 78.5% | 93.3% |
| proof | 13 | 1109 | 9387 | 80.3% | 93.8% |
| passport | 13 | 1055 | 9276 | 80.5% | 93.9% |
| battle | 13 | 990 | 8937 | 81.3% | 94.1% |
| journal | 13 | 984 | 8830 | 81.5% | 94.2% |

## Structural Scorecard

| Check | Actual | Target | Result |
| --- | --- | --- | --- |
| Small-map reduction vs canonical | 83.5% | >= 40% | PASS |
| Small-map reduction vs all docs | 94.8% | >= 55% | PASS |
| Worst surface reduction vs all docs | 92.6% | >= 50% | PASS |
| Small-map approx tokens | 7877 | <= 3800 | FAIL |
| Small-map file count | 9 | <= 6 | FAIL |
| Canonical approx tokens | 47687 | <= 12000 | FAIL |

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

