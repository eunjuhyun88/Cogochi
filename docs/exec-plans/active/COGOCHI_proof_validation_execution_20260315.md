# COGOCHI proof validation execution 20260315

Last updated: 2026-03-15

## Outcome

Ship a concrete proof layer that makes Cogochi's `backtest/validation` story true without collapsing the game into a finance dashboard.

The shipped read should be:

`mutation candidate -> fixed proof pack -> deterministic clashes -> weighted verdict -> writeback -> future credibility`

## Product Question

The proof system exists to answer one question:

`does this creature deserve more trust than before?`

Not:

- did one screenshot look profitable
- did the user cherry-pick a lucky frame
- did shadow return look attractive in isolation

## Canonical User Journey

1. From `/lab` or `/agent/[id]`, the player opens `/proof`.
2. The proof page binds the currently active mutation candidate to one fixed pack.
3. The player reads:
   - what weakness is under review
   - which frames are in the pack
   - which metrics matter most
4. The player launches the first clash into `/battle`.
5. The battle returns a deterministic outcome and trainer verdict.
6. `/journal` explains what changed and what the next proof-worthy action is.
7. Future passport or market-facing surfaces consume the proof artifact instead of inventing new scoring truth.

## Surface Split

### Frontend track

Own:

- `/proof`
- pack browsing
- candidate readability
- metric readability
- battle launch
- verdict-story readability

Do not own:

- SignalSnapshot creation
- proof scoring math
- retrieval freeze
- proof artifact assembly

### Shared deterministic domain track

Own:

- proof pack schema
- historical frame mapping
- pack metric weights
- compare contracts
- proof mode definitions

Files:

- `src/lib/types.ts`
- `src/lib/engine/proof-system.ts`
- frame/scenario mapping code

### Backend/runtime track

Own:

- future SignalSnapshot generation for each proof case
- retrieval freeze against historical frames
- aggregated proof artifact generation
- future public passport summaries
- runtime distill cues about the next proof target

Files:

- `src/routes/proof/+page.server.ts`
- `src/lib/server/runtimeArtifacts.js`
- future proof services under `src/lib/server/` or `src/lib/services/`

## Execution Rounds

### Round 1. Canonicalize proof

- ship `docs/product-specs/proof.md`
- ship `docs/design-docs/COGOCHI_proof_validation_20260315.md`
- register `proof` in `context-kit.json`

Exit:

- `proof` is a first-class route/surface in repo metadata

### Round 2. Route and pack shell

- ship `/proof`
- ship pack definitions in shared domain
- show active mutation, weak link, metric weights, and frame bundle
- launch first clash from `/proof`

Exit:

- player can enter `/proof`, pick a pack, and launch a battle opener

### Round 3. Loop integration

- wire battle gate context into proof
- ensure battle verdict flows back into field/journal
- ensure proof stays the stable reference around those clashes

Exit:

- the player can finish one proof-backed clash and know what verdict it produced

### Round 4. Artifact generation

- aggregate pack-level results across all cases
- produce a proof artifact usable by journal and future public passport surfaces
- keep `shadow return` secondary

Exit:

- proof generates a stable artifact instead of only one clash result

### Round 5. Public-ready adapter

- map finished proof artifacts into future passport or market adapters
- keep public display downstream from proof truth

Exit:

- downstream credibility surfaces consume proof artifacts but do not redefine scoring

## Autoresearch Hooks

Every serious round touching proof should run:

```bash
npm run autoresearch:proof
npm run autoresearch:raising
npm run autoresearch:runtime
npm run autoresearch:score
```

Proof rounds should be rejected if they:

- make proof depend on live market state
- replace judgment metrics with raw PnL authority
- bypass keep/quarantine/revert
- move scoring logic into routes or stores

## Acceptance Criteria

Proof is concrete enough when:

- the player can explain what a proof pack is in one sentence
- the player can choose a pack in under 15 seconds
- the first clash launches from `/proof` without extra setup
- the battle verdict returns to journal/field with clear consequence
- proof uses fixed historical inputs only
- future public credibility surfaces can only consume proof artifacts
