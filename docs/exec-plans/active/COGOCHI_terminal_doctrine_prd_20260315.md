# COGOCHI terminal doctrine PRD 20260315

Last updated: 2026-03-15
Status: active

This document rewrites the current product direction around one integrated thesis:

`natural-language doctrine authoring -> proof validation -> agent evolution -> optional public credibility layer`

If this document conflicts with:

- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`

those canonical docs win.

## 1. Why this rewrite exists

Recent product discussion introduced a strong new surface:

- type natural-language requests in a terminal
- ask for indicator logic or market-pattern search
- receive script drafts plus explanations
- render those criteria back on the chart
- save the interaction as reusable doctrine
- use the resulting data to train and evolve agents

That direction is valuable, but it becomes dangerous if it drifts into:

- a broker terminal
- a quant dashboard
- a copytrading shell with mascots
- a browser-side AI copilot disconnected from proof

The correct move is not to reject the terminal idea.
The correct move is to absorb it into the judgment RPG core.

## 2. Product thesis

Cogochi is a chart-native judgment RPG where the player authors doctrine in natural language, validates it on fixed historical proof packs, and turns the surviving doctrine into visible agent growth.

In practical terms:

1. The player describes what kind of market pattern they care about.
2. The system turns that intent into structured criteria, chart overlays, and exportable script drafts.
3. The player reviews, edits, and saves that logic as doctrine.
4. The doctrine is tested inside deterministic proof runs on fixed BTC history.
5. Only proven doctrine survives into the agent's memory, mutation history, trust weight, and future battle behavior.

The product should first be described as:

`I raise AI agents and prove them on chart battles.`

Not:

`I use an AI trading terminal.`

## 3. One-line definition

Cogochi is a judgment-RPG system that compiles user-authored doctrine into proofable agent behavior.

## 4. Product stack

The correct stack remains:

```text
Layer A: Judgment RPG core
Layer B: Doctrine authoring and proof credibility
Layer C: Public passport / market / monetization layer
```

The terminal belongs inside Layer A and Layer B.
It does not replace them.

## 5. What the terminal actually is

The terminal is not a generic chatbot.

It is a `Doctrine Terminal`:

- a natural-language authoring surface
- a criteria explanation surface
- an overlay design surface
- a script export surface
- a doctrine capture surface

Its job is to help the player express intent in a way that can later be:

- shown on the chart
- replayed in proof
- attached to one agent
- accepted, quarantined, or reverted

## 6. What the terminal is not

The terminal must not be treated as:

- real trade execution
- live brokerage integration
- direct TradingView automation truth
- direct market-data truth source for proof
- an authority that bypasses battle/proof/journal

The terminal is an authoring surface.
`proof` remains the validation contract.

## 7. Core user outcome

After one complete loop, the player should be able to say:

- "I asked for the kind of setup I care about."
- "The system showed me the exact criteria it used."
- "I saw those criteria rendered back onto the chart."
- "I tested that idea on fixed historical frames."
- "I know whether that logic deserves keep, quarantine, or revert."
- "My creature changed because of that result."

## 8. Primary user loop

```text
author idea
-> inspect criteria
-> preview overlay
-> save doctrine session
-> bind to one agent
-> run proof pack
-> enter one or more battles
-> choose keep / quarantine / revert
-> write back to agent
-> return to field / journal with the next action
```

## 9. Surface map

## 9.1 Phase 1 surface map

The terminal should live inside existing surfaces first.

- `/lab`
  - main doctrine authoring surface
  - terminal, preview, mutation bench
- `/proof`
  - deterministic historical validation
- `/battle`
  - one readable clash inside the active proof context
- `/journal`
  - verdict review, writeback summary, next action
- `/agent/[id]`
  - doctrine history, mutation history, trust, proven frames
- `/field`
  - world-space routing toward the next repair or proof node

## 9.2 Future surface split

If density grows too high, the terminal may graduate into a dedicated `/terminal` route.

That route would still remain downstream of the game loop and upstream of proof.
It must not become a standalone finance product.

## 10. Terminal interaction model

## 10.1 Input types

The player can input:

- natural-language pattern requests
- natural-language rule edits
- short CLI-style commands
- threshold adjustments
- save / compare / bind actions

Examples:

- `BTC에서 OI 과열 + CVD 다이버전스 구간 찾아줘`
- `펀딩 기준을 0.08%에서 0.05%로 낮춰줘`
- `FIND OI SPIKE BTC 4H`

## 10.2 Terminal outputs

Each successful terminal turn should produce four outputs:

1. `Normalized intent`
   - what the system thinks the player asked for
2. `Criteria explanation`
   - why those thresholds and signals were chosen
3. `Overlay spec`
   - the in-app chart rendering contract
4. `Script draft`
   - an exportable Pine-style draft for external use

Optional fifth output:

5. `Historical hits`
   - the strongest matching frames or regions in history

## 10.3 The critical rendering rule

Cogochi uses `TradingView Lightweight Charts`, not the licensed full TradingView Charting Library.

Therefore the product must separate:

- `OverlaySpec`
  - canonical in-app rendering truth
- `PineDraft`
  - exportable user artifact

The system may generate Pine-compatible drafts, but the in-app chart should render from a deterministic overlay spec owned by Cogochi.

This prevents the product from making false promises about native Pine execution inside the app.

## 11. Doctrine session model

Every meaningful terminal exchange should become a `DoctrineSession`.

Suggested structure:

```ts
interface DoctrineSession {
  id: string;
  agentId: string | null;
  symbol: string;
  timeframe: string;
  userPrompt: string;
  normalizedIntent: string;
  criteriaSummary: string[];
  overlaySpecId: string;
  pineDraftId: string | null;
  evidenceFrames: string[];
  userEdits: string[];
  finalVerdict: 'DRAFT' | 'BOUND' | 'KEPT' | 'QUARANTINED' | 'REVERTED';
  createdAt: string;
}
```

Important rule:

Not every doctrine session becomes training truth.
Only sessions that survive proof should become durable agent writeback.

## 12. Agent learning model

The terminal does not directly "train the whole model" each time.

It contributes structured input to the agent evolution loop:

- authored doctrine
- accepted thresholds
- rejected thresholds
- proof outcomes
- frame-specific lessons
- explanation style
- risk preference deltas

These become:

- memory writeback
- mutation candidates
- trust movement
- proven frames
- future retraining inputs

## 13. AutoResearch role

AutoResearch is the orchestration layer that turns doctrine activity into bounded agent evolution.

Its job is not:

- generic internet research
- autonomous trading
- full model pretraining from scratch in MVP

Its real job is:

1. detect promising doctrine changes
2. bind them to proof packs
3. compare before/after behavior
4. score keep / quarantine / revert
5. package accepted changes into memory and future retraining inputs
6. distill next recommended actions

In product language:

AutoResearch is the `strategy formation and mutation review loop`.

## 14. Clarifying "from scratch"

The phrase `from scratch` should not be used loosely in canonical docs.

For Cogochi MVP:

- yes to `from-scratch doctrine formation`
- yes to `from-zero mutation history for each owned agent`
- yes to `AutoResearch-built strategy profiles and proof packs`
- maybe later to bounded retraining or distillation
- no to claiming full custom foundation-model pretraining as MVP truth

The product promise is:

`the player forms a unique agent from their own doctrine and proven history`

not:

`every user fully pretrains a brand new model in production MVP`

## 15. Proof = game-native backtest

The old language of `backtest` remains useful, but the canonical player-facing term should stay `proof`.

Proof answers:

- did this mutation survive multiple historical frames
- was the logic robust beyond one clash
- does this doctrine deserve trust

Battle answers:

- what happened in this one readable fight

The terminal feeds proof.
Proof governs writeback.

## 16. Deterministic validation contract

Every doctrine candidate must be validated against:

- fixed historical BTC frames
- deterministic scoring rules
- frozen retrieval context
- visible metric weights
- stable verdict categories

The verdict categories remain:

- `KEEP`
- `QUARANTINE`
- `REVERT`

## 17. Anti-overfitting guardrails

Any terminal-driven doctrine system will drift into overfitting unless the proof layer prevents it.

Cogochi should explicitly guard against:

- temporal overfitting
- feature leakage
- threshold overfitting
- explanation-only confidence without behavioral robustness

The MVP validation system should use:

1. `Regime segmentation`
   - validate ideas across materially different historical conditions
2. `Walk-forward logic`
   - avoid future leakage in proof or retraining preparation
3. `Out-of-sample proof packs`
   - do not test only on frames used to shape the mutation
4. `Robustness scoring`
   - favor stable judgment quality over lucky short-term returns

Suggested robustness read:

- regime consistency
- drawdown stability
- trap avoidance
- retrieval quality
- explanation consistency
- shadow return as support only

## 18. Frontend / shared domain / backend split

This PRD must obey the repo-wide architecture rule.

## 18.1 Frontend responsibilities

Frontend owns:

- terminal input UI
- criteria readability
- overlay readability
- chart rendering from `OverlaySpec`
- saved-session browsing
- pack selection readability
- verdict selection UI

Frontend must not own:

- provider calls
- score calculation
- proof metric math
- persistence truth
- writeback policy

## 18.2 Shared deterministic domain

Shared domain owns:

- `DoctrineSession` contracts
- `OverlaySpec` contracts
- proof pack definitions
- frame-to-scenario mapping
- compare contracts
- verdict inputs

## 18.3 Backend responsibilities

Backend owns:

- LLM generation for normalized intent and draft scripts
- doctrine persistence
- runtime artifact generation
- retrieval freeze for proof
- historical frame search
- aggregated proof artifact packaging
- memory writeback orchestration
- nightly distill and next-action generation

## 19. Canonical data contracts

The minimum backend-facing contracts should be:

- `DoctrineSession`
- `OverlaySpec`
- `PineDraft`
- `ProofPack`
- `ProofArtifact`
- `MutationCandidate`
- `MutationVerdict`
- `AgentWritebackPacket`

## 20. Market layer positioning

The user keeps asking about marketplace, proof, trust, and copytrading.
That pressure is real.

The correct rule is:

- market is allowed
- market is not core
- market must consume proof outputs
- market must not define proof truth

Future layers may include:

- public passport
- public proof summary
- subscription or rental access
- strategy browsing
- optional attestation or onchain wrappers

But these remain Layer C.

## 21. MVP scope

## 21.1 Must ship

- doctrine terminal inside `/lab`
- natural-language prompt input
- criteria explanation output
- in-app overlay preview via `OverlaySpec`
- Pine-style export draft
- doctrine session persistence
- bind doctrine session to one agent
- proof pack selection
- deterministic proof verdicts
- writeback into mutation history, trust, memory, and care state
- journal summary after proof

## 21.2 Must not be MVP-gated

- real trade execution
- broker integration
- real-money copytrading
- market-ranking economy
- token-first loops
- claiming full per-user foundation-model pretraining

## 22. Success criteria

The terminal layer is successful only if it improves the game loop.

Success looks like:

- the player can author one doctrine idea in under 60 seconds
- the player can understand the criteria without reading raw code
- the player can see the criteria on the chart immediately
- the player can move from doctrine draft to proof run in one session
- at least one visible agent change happens after a completed proof cycle
- repeated terminal use creates better mutation quality, not just more text

## 23. Failure modes

This direction fails if:

- the terminal feels more important than the creature
- the chart becomes a sterile quant screen
- proof is bypassed by chat output
- every prompt becomes training truth without validation
- Pine export becomes the in-app runtime authority
- the product reads like a trading console with a pet wrapper

## 24. Delivery order

### Phase 1

- doctrine terminal in `/lab`
- overlay spec renderer
- proof binding from saved doctrine session
- journal writeback

### Phase 2

- richer criteria editing
- doctrine session compare history
- stronger proof artifact packaging
- passport-style proof summaries

### Phase 3

- public proof profiles
- market-style discovery surfaces
- optional subscription or rental wrappers

## 25. Final product sentence

Cogochi is a judgment RPG where players author trading doctrine in natural language, render and explain that doctrine on a chart, prove it on deterministic historical packs, and turn only the surviving logic into visible agent growth and future credibility.
