# Cogochi Full-Game Autoresearch Plan

Last updated: 2026-03-12

## Outcome

Turn Cogochi into a playable chart-native web game with this real loop:

`field travel -> one care or training action -> battle gate entry -> controllable chart clash -> reflection and keepsake writeback -> return to field`

This plan replaces the current `dino placeholder + menu-first prototype` direction with:

- itch.io-sourced pixel assets
- a real top-down field
- a coherent travel party
- visible chart-slice action on battle entry
- autoresearch tasks that can keep shipping until the loop is complete

## Asset Decision

Use the asset shortlist in:

- `docs/references/imported/Cogochi_ItchAssetShortlist_20260312.md`

Phase rule:

1. `prototype`: replace dino with `Ninja Adventure`
2. `production`: graduate to `LimeZu Modern Interiors + Modern Exteriors + Modern User Interface`
3. do not import `Pixel Plains` because its page bans crypto, NFT, p2e, or meta-related use

## Product Test

The game is on target only if a new player can say all of these after one session:

1. `I walked my squad into a clash`
2. `I changed one agent before that clash`
3. `I saw that choice appear in motion on the chart`
4. `The battle wrote back a lesson or visible change`
5. `I know what to do next when I return to camp`

## Route Map

### `/field`

Owns:

- travel
- interact nodes
- battle gate entry
- return loop

### `/roster`

Owns:

- stable overview
- visible progression
- quick party decisions

### `/agent/[id]`

Owns:

- personal identity
- memory
- doctrine
- visible mutation state

### `/lab`

Owns:

- authored change
- preview
- training confirmation

### `/battle`

Owns:

- controllable clash
- command deck
- chart-slice action proof

### `/journal`

Proposed new supporting surface:

- last lesson
- keepsake history
- recommended care action

## User Journeys

### Journey A: First Meaningful Session

1. Spawn in camp on `/field`.
2. See the active four-slot party following the leader.
3. Walk to the `Lab Bench`.
4. Change one doctrine, indicator, script, or memory knob.
5. Walk to the `Battle Gate`.
6. Enter a fixed scenario.
7. Execute 2 to 4 commands that visibly move the team through the chart slice.
8. See support, wall, trap, or liquidation structures respond.
9. Return to camp with one lesson, one care cue, and possibly one keepsake.

### Journey B: Repeat Daily Session

1. Return to camp and immediately see one agent needs care.
2. Walk to `Archive Well` or `Lab Bench`.
3. Repair or tune one issue.
4. Re-enter a known scenario from the gate.
5. Confirm whether the same situation improved.
6. Promote the new build or reject it.

### Journey C: Loss Recovery

1. Lose a clash because of a trap, blur, or overcommitment.
2. Receive a readable failure noun such as `confidence shake` or `memory drift`.
3. Return to camp automatically.
4. Get one recommended next care action.
5. Run a safer spar or repair action before trying again.

## Feature Inventory

### 1. Field Traversal

Requirements:

- WASD or arrows move the leader
- three followers trail with delay and role flavor
- camera softly follows
- field includes at least camp, lab, archive, and one gate

### 2. Asset Pipeline

Requirements:

- one chosen family lives in `static/assets/`
- body, role, growth, and history layers are separated
- portraits and field sprites share one identity source

### 3. Battle Gate Transition

Requirements:

- a field node opens a scenario preview
- entering battle preserves squad and scenario state
- returning from battle restores the field with updated writeback

### 4. Chart Clash Motion

Requirements:

- support, resistance, and liquidation are visible structures
- units move up or down within the active slice
- command use produces a readable motion result
- the screen relaxes back after the clash

### 5. Care And Reflection

Requirements:

- battle outcome can mint a care state
- battle outcome can mint a keepsake or progress token
- journal and roster surfaces update from battle results

## Action Vocabulary

These are the player-facing action names the game should converge on.

| Verb | Player meaning | On-screen action | Main writeback |
| --- | --- | --- | --- |
| `Tune` | adjust doctrine or setup | small portrait/preview delta | loadout change |
| `Curate` | clean memory | archive animation, card pin | memory quality up |
| `Spar` | safe rehearsal | minor gate entry | confidence repair |
| `Long Surge` | push from below | upward squad motion | momentum or support gain |
| `Short Slam` | force collapse from above | downward strike motion | wall damage or trap risk |
| `Hold Scan` | gather signal | pulse and reveal markers | better read quality |
| `Risk Brace` | avoid punishment | guard or anchor cue | trap risk reduction |
| `Breakout Ride` | cross the wall | wall break and lane ride | objective gain |
| `Recover` | regroup after damage | return-to-formation motion | care state repair |

## Animation Priorities

Do not chase full combat spectacle first.

The first required visible actions are:

1. idle
2. walk
3. follow
4. inspect
5. surge-up
6. slam-down
7. brace
8. hit
9. recover
10. celebrate

If those ten exist, the game can feel alive enough for the next loop.

## Autoresearch Worker Set

### `autoresearch-director`

Chooses the current bottleneck and rejects drift.

### `asset-curator`

Owns:

- itch pack review
- license capture
- asset family decision
- import manifest

### `field-loop-builder`

Owns:

- `/field`
- movement
- follow party
- interact graph
- gate transitions

### `raising-ux-shipper`

Owns:

- `/roster`
- `/agent/[id]`
- `/lab`
- `/journal`

### `battle-researcher`

Owns:

- `/battle`
- chart clash grammar
- command resolution
- explainability

### `memory-tuner`

Owns:

- memory curation
- care writeback
- reflection text and retrieval quality

### `ship-reviewer`

Owns:

- docs gates
- route/store/engine boundaries
- screenshot sanity checks

## Detailed Task Tree

### Phase 0. Asset Audit And Replacement

#### `asset-shortlist-lock`

- record the prototype and production family
- record rejected packs and why
- exit when one prototype family is chosen

#### `prototype-family-import`

- remove dino from active default surfaces
- import the chosen prototype family
- create a runtime asset manifest
- exit when roster and battle can render with the new family

#### `mutation-layer-map`

- define base, role, growth, and history overlays
- exit when one agent can visibly change without full sprite replacement

### Phase 1. Field Foundation

#### `field-route-shell`

- create `/field`
- render one compact map with camp, lab, archive, and gate
- exit when the player can move and interact

#### `party-follow-pass`

- implement leader movement plus three followers
- give each role a small follow personality
- exit when the squad feels like a party, not stacked icons

#### `field-node-graph`

- connect interactables to roster, lab, journal, and battle
- exit when every node returns to a meaningful next action

### Phase 2. Battle Entry And Motion

#### `battle-gate-preview`

- show objective, terrain hint, and risk hint before entry
- exit when battle no longer feels like a contextless jump

#### `chart-slice-motion-pass`

- animate surge, slam, brace, hit, and recover
- exit when commands visibly move bodies and structures

#### `hazard-entity-pass`

- add wall, trap, or liquidation hazard actors
- exit when the player fights readable structures, not only meters

### Phase 3. Care And Progression

#### `keepsake-writeback`

- battle results mint visible keepsakes or marks
- exit when memorable wins or losses change the agent body or card

#### `care-repair-actions`

- failed runs produce repair states
- exit when bad outcomes create a strong reason to revisit camp or lab

#### `journal-board`

- create a reflection surface in or from `/field`
- exit when the last lesson and next care action are both visible

### Phase 4. Full Loop Proof

#### `before-after-proof`

- prove the same scenario changed after one authored intervention
- exit when one benchmark artifact shows before, after, and why

#### `session-close-proof`

- prove the player can travel, train, battle, reflect, and re-enter
- exit when the loop can be completed end-to-end without dead screens

### Phase 5. Shipping Automation

#### `field-loop-eval`

- add a field-focused evaluator
- exit when the branch can score field readiness explicitly

#### `visual-regression-gates`

- add deterministic screenshots for `/field`, `/battle`, `/roster`, and `/agent/[id]`
- exit when regressions become catchable

#### `phase-baseline-reset`

- reset autoresearch baseline after the new full-game rubric is in place
- exit when score and accept loops point at the new bottleneck stack

## Evaluator Set

Each narrow change should run the smallest relevant evaluator set.

### Asset work

- `npm run docs:check`
- `npm run autoresearch:field`
- `npm run autoresearch:raising`

### Field work

- `npm run check`
- `npm run build`
- `npm run autoresearch:field`
- browser screenshot pass

### Battle work

- `npm run check`
- `npm run build`
- `npm run autoresearch:battle`
- `npm run autoresearch:field`

### Loop-closing work

- `npm run check`
- `npm run build`
- `npm run docs:refresh`
- `npm run docs:check`
- `npm run ctx:check -- --strict`
- `npm run autoresearch:field`
- `npm run autoresearch:raising`
- `npm run autoresearch:battle`
- `npm run autoresearch:score`

## Acceptance Rule For This Phase

Reject changes that:

- add art without a mapped runtime use
- add movement without loop value
- add battle motion that weakens chart readability
- add care flavor without post-battle writeback
- keep dino placeholders on the main path after the prototype family is imported

Prefer changes that:

- close one broken transition in the player journey
- make one field node real
- make one action verb visibly readable
- make one care state actionable
- make the asset pipeline more coherent

## Exit Criteria

This phase is complete when:

1. `/field` exists and is the default play loop entry
2. the dino family is no longer the default runtime family
3. the player can move a four-slot squad through a small chart-world
4. battle entry happens from a gate in the world
5. battle actions visibly move the team within the chart slice
6. battle results write back a lesson, care state, and visible change
7. autoresearch explicitly scores field readiness and uses it to pick the next bottleneck
