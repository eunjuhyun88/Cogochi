# System Intent

## Product Thesis

Cogochi is a chart-battle AI agent training RPG.

The player is a trainer, not a trader bot operator.
The player trains agents, assembles a team, makes entry judgments on chart terrain, and improves
future outcomes through reflection and memory writeback.

The core loop is:

`agent -> train -> battle -> reflect -> improve`

Cogochi is not:

- a trading simulator
- an autobattler
- a passive chart viewer

Cogochi is:

- a judgment RPG
- an agent training system
- a chart-native battlefield game where price history becomes the evaluation arena

The intended product ratio is:

- training, memory, experiment: 70%
- battle expression and evaluation: 30%

## Primary User Context

The primary user is someone who already spends time around crypto charts and wants:

- to turn chart exposure into skill growth instead of passive screen time
- to train AI agents whose decisions and personalities evolve over repeated runs
- to test and improve judgment without pretending to change the market itself
- to feel that each battle result teaches something durable

Cogochi must work both:

- as an active training session
- as a reflection and roster-improvement session between battles

## What Cogochi Is

- a trainer-led squad RPG with AI agents
- a chart-native decision and evaluation game
- a progression system built around memory, doctrine, roster growth, and reflected learning
- a deterministic battle layer that expresses judgment quality through readable combat outcomes

## What Cogochi Is Not

- a brokerage product
- an auto-trading tool
- a real-money promise machine
- a generic pet sim with chart wallpaper
- a pure cozy companion app
- a random or luck-driven combat game

## Non-Negotiable Invariants

### Product Invariants

- The chart is never decoration. It is the battlefield, evaluation surface, and history layer.
- Price is immutable historical or live market input. The player changes judgment, not price.
- The agents are trainable units with memory and doctrine, not cosmetic followers.
- Core rewards are better judgment, stronger team composition, richer memory, and improved evaluation outcomes, not PnL.
- Battle outcomes must be explainable as judgment quality expressed through the game layer.
- Training and reflection must matter more than spectacle.
- Battle must exist, but as readable expression and evaluation, not as an isolated combat toy.

### System Invariants

- The repository must contain enough local truth for an agent to reason without chat history.
- Canonical docs outrank ad-hoc instructions.
- Runtime memory is local-only and never authoritative.
- Surface contracts should be explainable in terms of routes, stores, and APIs.
- Optional AI layers must never be required for the core loop to function.
- Current market data must not be fed into RAG in ways that contaminate evaluation.
- Battle resolution must remain deterministic rather than random-first.

## Current Constraints

### Product Constraints

- v1 must preserve the trainer fantasy and the agent training loop.
- v1 must keep battle present as a visible outcome layer.
- v1 must weight training, memory, and experiment above battle spectacle.
- v1 must avoid looking like a broker terminal, a passive pet widget, or an idle battler.
- v1 must preserve a clear reason for the chart to exist as battlefield logic rather than background art.

### Engineering Constraints

- The canonical stack remains SvelteKit 2, Svelte 5, TypeScript, and Canvas 2D.
- MVP persistence remains local-first, with `localStorage` as the baseline storage layer.
- Optional AI runtime such as Ollama or OpenClaw may enrich reflection, memory, or guidance, but must have deterministic fallback behavior.
- Rendering should continue to treat the chart as a first-class visual layer rather than a DOM screenshot or iframe-like embed.
- Routes may orchestrate surfaces, but business logic belongs in stores, services, and engine layers.
- Score calculation and battle resolution belong in engine code, not in routes or stores.
- Packaging for desktop or mobile may happen later, but the source of truth remains the web app.

## Directional Consequence

This intent defines the sequencing of the product roadmap:

1. lock the training and memory loop
2. lock the chart battlefield translation rules
3. lock the deterministic battle evaluation layer
4. expand expression, roster depth, and reflective tooling

Any future spec that drifts toward "pet app", "autobattler", or "chart tool" should be considered stale.
