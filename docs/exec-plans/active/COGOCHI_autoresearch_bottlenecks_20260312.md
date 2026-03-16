# Cogochi Autoresearch Bottlenecks

Last updated: 2026-03-12

## Current Ranked Bottlenecks

### 1. The field is connected, but it still does not feel like the main game

Why it blocks:

- the product still risks reading as menu-first with movement attached
- the player does not yet start with one obvious world objective and one short route
- without a stronger camp-route-gate-return rhythm, Cogochi will not hit the intended completeness bar

Next ship step:

- ship a stronger `camp -> route -> spar/proof gate -> return` structure and make `/field` the undisputed primary play surface

### 2. Encounters are readable prototypes, not yet one-objective game fights

Why it blocks:

- battles still spend too much screen weight on explanation panels
- the player needs clearer danger, success, and failure cues in world space
- without one obvious objective per clash, the game cannot feel like a polished encounter loop

Next ship step:

- reduce battle text, promote one primary objective, and strengthen world-space clash cues

### 3. The memory/runtime contract is finally visible, but still needs to become a dependable live rail

Why it blocks:

- the repo only just stopped behaving like a Memento bootstrap and started behaving like a product with explicit layers
- if runtime bundle, index, and distill drift away from the actual surfaces, OpenClaw enrichment will become misleading noise
- without this rail, future AI-facing work will regress back into store-local hacks

Next ship step:

- keep `runtime/` generated artifacts green, keep `src/lib/services/memory/` authoritative, and score runtime readiness in every serious autoresearch pass

### 4. There is no strong return-pressure surface yet

Why it blocks:

- a loop does not feel complete until the player returns and instantly knows what to do next
- without `/journal` or a journal-board equivalent, battle results remain too hidden in detail views
- this weakens replay pull and the feeling of raising a traveled squad

Next ship step:

- ship `/journal` plus a camp-side journal board that surfaces the latest mutation, proven frame, and next care action

### 5. Growth is visible, but not yet stage-defining

Why it blocks:

- the current overlays prove state change, but not yet strong creature evolution
- Pokemon-grade attachment requires bigger silhouette and stage differences
- without stronger body-stage deltas, repeated proof runs will still feel too abstract

Next ship step:

- implement stronger `Fresh -> Tuned -> Specialized -> Signature` body-stage changes and cleaner accessory silhouettes

### 6. Route teaching and encounter pacing are underdesigned

Why it blocks:

- routes should teach by space and pacing, not by text
- the current world has useful nodes, but not yet a deliberate `safe introduction -> development -> twist -> return` structure
- without this, the game will feel functional but not authored

Next ship step:

- design and implement at least one compact route using explicit level beats and guided pacing
