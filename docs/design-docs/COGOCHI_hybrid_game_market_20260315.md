# COGOCHI hybrid game market 20260315

Last updated: 2026-03-15

## 1. Decision

Cogochi should combine both directions, but not as equals.

The correct stack is:

```text
Layer A: Judgment RPG core
Layer B: Proof and credibility layer
Layer C: Market and monetization layer
```

This means:

- the game loop stays primary
- proof makes the game output legible and reusable
- market/economy sits on top of proof, not underneath it

If the order flips, Cogochi collapses into a trading product with a game skin.

## 2. Hybrid Thesis

Cogochi is:

- a chart-native judgment RPG where the player raises a four-agent squad
- a proof system that turns historical performance into explainable credibility
- a future market layer where proven agents can be surfaced, licensed, or subscribed to

Cogochi is not:

- a broker terminal
- a copytrading shell with mascots
- a token-first or NFT-first product

## 3. Product Order

### 3.1 Layer A. Judgment RPG core

This is the main product.

Core loop:

`field -> proof gate -> battle -> verdict -> journal/lab -> improve -> field`

Player value:

- emotional ownership
- visible growth
- readable judgment improvement
- squad identity

Without this layer, there is no product people want to train inside.

### 3.2 Layer B. Proof and credibility layer

This is the bridge between game and market.

Its job is to make the game output trustworthy enough for reuse.

Proof artifacts:

- fixed historical frame packs
- mutation history
- keep / quarantine / revert trail
- trust weight movement
- proven frames
- replayable deterministic reports

Player value:

- "my agent is not just cute, it is proven"
- "I know why this mutation survived"
- "I can show this result to someone else"

Without this layer, market expansion becomes fake or easily gamed.

### 3.3 Layer C. Market and monetization layer

This is a later meta layer.

It can include:

- agent profiles
- public proof history
- subscription or rental-style access
- strategy discovery
- optional onchain attestation

It must not dictate the core gameplay loop.

The market is downstream of proof.
Proof is downstream of the game.

## 4. Non-Negotiable Hybrid Rules

### Rule 1. The game loop stays primary

The player should still describe Cogochi first as:

`I raise AI agents and prove them on chart battles.`

Not:

`I rent strategies and watch scores.`

### Rule 2. Proof is deterministic and replayable

Any market-facing credibility must come from:

- historical frames
- fixed inputs
- explainable outcomes
- stable verdicts

No live PnL claim should outrank deterministic proof in product trust.

### Rule 3. Market output cannot contaminate training truth

The following must never change battle truth:

- popularity
- subscription count
- token holdings
- price of the agent
- marketplace demand

Those are meta outcomes, not battle inputs.

### Rule 4. Onchain or rental features are optional wrappers

Onchain records, rentals, subscriptions, and performance sharing must wrap proof artifacts.

They must not become required for:

- agent creation
- growth
- battle
- verdict
- memory writeback

### Rule 5. No fake execution fantasy in core surfaces

Core surfaces must remain:

- game-native
- historical
- proof-native

Real-money execution belongs to a separate future layer, if it exists at all.

## 5. Resulting Surface Map

## 5.1 Core game surfaces

- `/`
- `/field`
- `/roster`
- `/agent/[id]`
- `/lab`
- `/proof`
- `/battle`
- `/journal`

These define the main player experience.

## 5.2 Proof and credibility surfaces

- `/proof`
- `/journal`
- `/agent/[id]`
- future `/passport`

These surfaces package game results into explainable proof.

## 5.3 Market expansion surfaces

- future `/market`
- future `/agent/[id]/public`
- future `/passport/[id]`
- future `/dashboard`

These surfaces consume proof output.
They do not define training truth.

## 6. Frontend / Backend Split For The Hybrid Product

### Frontend

Frontend owns:

- movement
- squad control
- battle input
- proof presentation
- journal readability
- market browsing UI

### Shared deterministic domain

Shared domain owns:

- battle resolution
- proof scoring
- mutation verdict rules
- trust movement
- scenario/frame translation

### Backend runtime

Backend owns:

- SignalSnapshot generation
- memory retrieval and writeback
- runtime distill
- proof artifact packaging
- public profile assembly
- optional attestation/export adapters

### Future market backend

If added later, market backend owns:

- listings
- subscriptions or rentals
- public track record APIs
- payout or fee logic

But it must consume proof outputs, not redefine them.

## 7. What From The PRD Gets Reused

Reusable with translation:

- SignalSnapshot
- ORPO chosen/rejected pipeline
- APPROVE / REJECT / OVERRIDE feedback
- deterministic historical validation
- public proof packaging
- later market discovery

Needs translation before reuse:

- `backtest` -> `proof`
- `track record` -> `proof ledger` or `public passport`
- `training config` -> `mutation / doctrine / memory setup`

Must stay out of the core product:

- NFT-first ownership
- token-first progression
- copytrading as the main fantasy
- CEX execution in the main loop

## 8. Sequencing

### Phase 1. Core game

Ship:

- field
- proof
- battle
- journal
- visible evolution
- deterministic proof packs

Success question:

- do players enjoy raising and proving their agents?

### Phase 2. Credibility export

Ship:

- public passport
- proof history summaries
- shareable agent pages
- stable proof metrics

Success question:

- do players trust and compare proven agents?

### Phase 3. Market layer

Ship:

- listing
- subscription or rental
- optional attestation

Success question:

- does proven judgment become a usable, tradable asset without degrading the game?

## 9. Final Rule

The correct synthesis is:

`Pokemon-like judgment RPG first, proof system second, market layer third.`

Not:

`copytrading platform first, game wrapper second.`
