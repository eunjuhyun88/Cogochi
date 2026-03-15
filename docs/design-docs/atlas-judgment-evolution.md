# Atlas Judgment Evolution

- Status: proposed
- Last updated: 2026-03-12
- Scope: evolutionary agent architecture, trust model, mutation loop, battle-proof model
- Depends on: `CLAUDE.md`, `docs/AGENT_SYSTEM_DESIGN.md`, `docs/BATTLEFIELD_DESIGN.md`, `docs/design-docs/judgment-tamagotchi-loop.md`

## Purpose

This document translates the useful parts of the `atlas-gic` pattern into Cogochi without turning the product into a hedge-fund simulator.

What Cogochi should borrow:

- prompt and policy evolution
- trust weights that get louder or quieter from evidence
- keep or revert discipline
- orchestration as a first-class bottleneck

What Cogochi should not borrow literally:

- Sharpe as the only loss function
- live capital as the main proof loop
- invisible optimization that the player cannot feel

Cogochi is still a chart-native judgment RPG.

## Applicability Verdict

Yes, the pattern applies if it is translated this way:

- `prompt weights` -> doctrine, indicator, script, retrieval, and risk genes
- `rolling Sharpe` -> rolling composite judgment score on fixed historical proof packs
- `worst agent rewrite` -> weakest voice or squad role mutation candidate
- `CIO bottleneck` -> squad captain or orchestration bottleneck

No, the pattern does not apply if it is translated this way:

- `prompt evolution` -> hidden optimization that never touches the game body
- `market feedback` -> live trading loop instead of deterministic historical evaluation
- `agent trust` -> raw alpha leaderboard with no role-play or UI meaning

## Core Translation

Atlas has a multi-layer debate stack.
Cogochi should keep the same principle, but hide most of that complexity behind four visible companions.

The product-facing read should be:

`4 visible companions -> internal judgment council debates -> one mutation candidate -> fixed historical proof pack -> keep or revert -> visible body and trust writeback`

## Layer Model

### Layer 0. Visible Squad

The player still owns four visible companions:

- `Scout`
- `Analyst`
- `Risk`
- `Executor`

These are the creatures the player raises, names, and moves on the chart battlefield.

### Layer 1. Role Synthesizers

Each visible companion is backed by one role synthesizer that combines lower-level voices into a role-specific action tendency.

- `Scout Synthesizer`
- `Analyst Synthesizer`
- `Risk Synthesizer`
- `Executor Synthesizer`

These are not separate creatures on the roster.
They are the hidden role brains of the visible squad.

### Layer 2. Specialist Voice Lattice

The internal council should be extensible to `25` voices, but v1 does not need to ship all of them live.

Recommended target lattice:

| Group | Voices | Count |
| --- | --- | ---: |
| Structure | trend, range, support, resistance, breakout, rejection, liquidity, volatility | 8 |
| Context | macro narrative, news shock, onchain flow, funding and OI | 4 |
| Doctrine and Memory | doctrine checker, indicator interpreter, script interpreter, memory retriever | 4 |
| Counterplay | trap critic, counter-thesis critic, risk veto critic, overfit critic | 4 |
| Role Synthesizers | scout, analyst, risk, executor | 4 |
| Orchestration | squad captain | 1 |

Total: `25`

### Layer 3. Squad Captain

This is the equivalent of the orchestration or CIO layer from Atlas.

Its job is to:

- weight role outputs
- resolve disagreements
- decide which live command should be favored
- expose the final explanation to the player

This layer is expected to become a bottleneck.
Cogochi should explicitly score it instead of assuming better specialist prompts solve everything.

## V1 Runtime Shape

V1 should ship a reduced internal council while keeping the same architecture.

Recommended v1 active voices:

- structure reader
- breakout reader
- liquidity trap reader
- volatility reader
- doctrine checker
- memory retriever
- risk veto critic
- four role synthesizers
- squad captain

That is enough to prove:

- debates exist
- some voices become more trusted than others
- one weak voice can be mutated and re-tested

## Evolution Objects

### Voice

A bounded specialist or synthesizer.

Required fields:

- `id`
- `kind`
- `roleAffinity`
- `promptGene`
- `scriptGene`
- `indicatorGene`
- `retrievalGene`
- `riskGene`
- `trustWeight`
- `rollingJudgmentScore`

### Mutation Proposal

One targeted change against one weak node.

Allowed mutation units:

- prompt clause rewrite
- doctrine law rewrite
- indicator binding swap
- script binding swap
- retrieval priority change
- risk threshold change
- coordination rule change

Each proposal must declare:

- `why this node is being mutated`
- `which gene changes`
- `which proof pack will validate it`
- `what visible change should appear if accepted`

### Mutation Decision

Every proposal ends in:

- `accepted`
- `reverted`
- `quarantined`

`accepted` means it beat the baseline on the proof pack.
`reverted` means it underperformed and is rolled back.
`quarantined` means the result was ambiguous and should not write to the visible body yet.

### Proven Frame

A named historical chart frame where the current build has been tested.

Examples:

- `China Crackdown Flush`
- `FTX Collapse Flush`
- `ETF Headline Whipsaw`

These are what make the creature feel battle-tested instead of cosmetically leveled.

## Loss Function

Do not use Sharpe as the primary loss.

Cogochi should use a rolling composite judgment score per voice, per role, and per squad.

Recommended proof-pack score:

| Component | Weight |
| --- | ---: |
| scenario outcome accuracy | 20 |
| timing and commitment quality | 15 |
| trap avoidance and veto quality | 15 |
| risk discipline | 15 |
| retrieval precision | 10 |
| explanation fidelity | 10 |
| squad coordination | 10 |
| doctrine consistency | 5 |

Total: `100`

This should be computed on fixed historical scenario packs, not on live capital deployment.

## Trust Weights

Cogochi should adopt Darwinian trust weights, but make them player-readable.

Rules:

- top-quartile voices get louder
- bottom-quartile voices get quieter
- no voice can be fully silenced without human review
- trust shifts must be visible as squad identity, not only hidden math

Player-facing translation:

- louder voices become stronger badges, stronger stance cues, and more frequent explanation references
- quieter voices look uncertain, unstable, or deprioritized
- the player can see which internal specialists the squad currently trusts

## Mutation Pipeline

### 1. Debate

The council reads:

- fixed historical frame
- current doctrine
- current indicator and script loadout
- allowed memories

Each voice emits:

- thesis
- confidence
- supporting evidence
- risk objection if relevant

### 2. Role Synthesis

Role synths combine the relevant voices into role outputs:

- scout discovery
- analyst read
- risk veto
- executor timing

### 3. Captain Decision

The squad captain turns weighted role outputs into:

- favored battle command
- action confidence
- explanation trace

### 4. Evaluation

The proof pack scores:

- result quality
- explanation quality
- coordination quality

### 5. Mutation Candidate Selection

The lowest-value voice is selected by:

- weak rolling judgment score
- low contribution to successful outcomes
- repeated contradiction or noise

### 6. Mutation Proposal

One gene changes.
Never mutate several genes at once in the same accept or revert cycle.

### 7. Keep Or Revert

Run the same proof pack plus at least one adjacent scenario.

- if better and stable -> keep
- if worse -> revert
- if unstable -> quarantine

### 8. Visible Writeback

Accepted changes can mint:

- trust badge changes
- visible accessory change
- evolution log entry
- proven frame badge
- new care state if the change introduced drift

## Visible Expression Of Learning

AI learning must show up in four places at once.

### 1. Body

Accepted mutation categories map to visible changes:

- doctrine clarity -> antenna glyph, scroll, halo line
- memory mastery -> archive badge, satchel, memory sigil
- risk discipline -> shield crest, grounded stance, caution stripe
- execution tempo -> scarf, thruster, trail mark, forward lean
- trap mastery -> alert crest, hook, warning eye

### 2. Battle

The battle route should answer:

- which internal voice dominated
- which voices disagreed
- why the captain chose this command
- which proven frame influenced the call

### 3. Journal

The player should see:

- accepted mutations
- reverted mutations
- current weak link
- trusted voices
- recent proven frames

### 4. Field Presence

The squad on `/field` should show:

- stable role identity
- one or more accepted mutation overlays
- mood and certainty changes after recent wins or failures

## User-Facing Nouns

Avoid pure ML language in the UI.

Use:

- `voice`
- `instinct`
- `lesson`
- `mutation`
- `trust`
- `proven frame`
- `weak link`
- `captain call`

Avoid exposing raw internal nouns such as:

- token logit
- policy weight
- validation loss

## Battle Proof Rules

An agent is only considered meaningfully evolved if all three are true:

1. at least one accepted mutation exists
2. the accepted mutation has a matching proven frame
3. the battle explanation can point to the mutation and frame in plain language

If one of these is missing, the loop is still underbuilt.

## Autoresearch Implications

Cogochi autoresearch should optimize these questions:

1. can the player tell which internal voices are trusted?
2. can the system identify the weak link?
3. can one gene be mutated at a time?
4. can the same proof pack keep or revert that mutation?
5. does an accepted mutation change the creature body and battle explanation?
6. does the squad captain become a measurable bottleneck?

## Non-Goals

- live hedge-fund deployment as the game loop
- pure Sharpe leaderboard gameplay
- hidden agent optimization with no UI meaning
- random evolution trees disconnected from historical proof
- replacing the four-companion party fantasy with twenty-five visible widgets

## Acceptance Questions

The architecture is on target only if the answer trends toward `yes`:

1. Can the player name the current weak link in their squad brain?
2. Can the player see which voice got louder or quieter after recent proofs?
3. Can the player inspect an accepted mutation and understand why it survived?
4. Can the same historical frame be used to prove an improvement?
5. Can the player feel the orchestration layer as a game system, not a hidden backend?
