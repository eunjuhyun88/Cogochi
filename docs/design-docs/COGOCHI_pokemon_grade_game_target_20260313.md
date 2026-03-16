# Cogochi Pokemon-Grade Game Target

- Status: proposed
- Last updated: 2026-03-13
- Scope: final target bar for game feel, world structure, encounter pacing, growth readability, and UI/UX completeness
- Depends on: `docs/MASTER_GAME_SPEC.md`, `docs/AGENT_SYSTEM_DESIGN.md`, `docs/BATTLEFIELD_DESIGN.md`, `docs/VISUAL_WORLD_DESIGN.md`, `docs/design-docs/judgment-tamagotchi-loop.md`

## Purpose

This document defines what `Pokemon-grade` means for Cogochi.

It does **not** mean:

- copying Pokemon IP
- matching Pokemon's content volume
- turning Cogochi into a JRPG detached from charts

It **does** mean reaching a completeness bar where the product feels like:

- a real travel-and-battle game
- a squad-raising game with strong attachment
- a readable world with short, legible encounters
- a loop where growth is visible, not only explained

The benchmark is:

`clear overworld -> clear encounter -> clear reward -> clear return pressure`

If Cogochi still feels like a sequence of panels, scorecards, and menu hops, it has not reached this bar.

## The Completeness Standard

Cogochi reaches the intended bar only when all of these are true:

1. The player can understand the next goal within `10 seconds`.
2. The player can enter the first meaningful clash within `2 minutes`.
3. The player can finish a full loop in `2 to 5 minutes`.
4. The player can describe one squad member as `mine`.
5. The player can see one visible change after a meaningful proof run.
6. The player can return to the field already knowing the next best action.

## Target Aesthetic Mix

Primary:

- `Fantasy`
- `Discovery`
- `Challenge`

Secondary:

- `Expression`

Avoid leading with:

- `dashboard competence`
- `analytics satisfaction`
- `passive pet submission`

The emotional read should be:

- `I am traveling with my chart squad`
- `I am reading the field, not filling a form`
- `I am choosing a move, not submitting an evaluation job`
- `my creature changed because of what happened`

## Five Design Pillars

### 1. World First, Menus Second

The field must be the default mode.
Management surfaces are support rooms, not the main fantasy.

Rule:

- every important loop should start in the world and return to the world

### 2. One Clear Objective Per Encounter

Each clash should ask only one tactical question.

Examples:

- defend support
- break the wall
- survive the trap
- rescue the lane

Rule:

- if an encounter needs several paragraphs to explain itself, it is overbuilt

### 3. Growth Must Touch Body, Battle, and Memory

No growth is real unless it changes at least two of the following:

- body
- battle behavior
- historical identity

### 4. Routes Must Teach The Game Quietly

The field should function like a Nintendo-style route.

It should teach by space, pacing, and encounter arrangement instead of heavy text.

### 5. The Return Loop Is Half The Game

The emotional hook is not only entering battle.
It is also coming back with:

- a win
- a scar
- a keepsake
- a repair need
- a new mutation decision

## Core Loop Stack

### Micro Loop: 30 to 90 seconds

`move -> spot a node -> enter a clash or care action -> resolve -> get one visible result`

### Core Loop: 2 to 5 minutes

`camp -> route -> encounter -> verdict -> reward -> camp return -> next destination`

### Meta Loop: 15 to 30 minutes

`raise four agents -> unlock route variants -> specialize for chart regimes -> build a squad identity`

## The Canonical Session Loop

1. Spawn in `Camp`
2. Read one visible next objective
3. Walk the squad through one compact chart route
4. Optionally touch one support node:
   - `Lab Bench`
   - `Archive Well`
   - `Journal Board`
5. Reach a `Gate`
6. Fight one short clash with one clear objective
7. Choose `Keep / Quarantine / Revert`
8. Receive:
   - one body/history update
   - one readable lesson
   - one next care prompt
9. Return to the field

## World Structure

The world should be compact, not open-world.

Required spaces:

- `Camp`
- `Training Route`
- `Archive Route`
- `Spar Gate`
- `Proof Gate`
- `Journal Board`
- `Recovery Spot`

### Camp

Purpose:

- orientation
- squad mood read
- next destination

### Training Route

Purpose:

- safe route to one care or tuning action

### Archive Route

Purpose:

- inspect memories and proven frames

### Spar Gate

Purpose:

- lower-risk rehearsal

### Proof Gate

Purpose:

- real keep/revert encounter

### Journal Board

Purpose:

- visible recap of the last mutation, keepsake, and next care action

### Recovery Spot

Purpose:

- reset after failed proof

## Route Design Standard

Each route should follow:

1. `Safe Introduction`
2. `Development`
3. `Twist`
4. `Return`

Example:

- Safe Introduction:
  - one visible support platform and one simple interact node
- Development:
  - one hazard lane and one clearer battle gate
- Twist:
  - a trap or split path that tests reading
- Return:
  - a short path back to camp, journal, or repair

## Encounter Standard

Each encounter must declare:

- objective
- danger source
- success cue
- failure cue
- writeback type

### Objective Types

- `Support Defense`
- `Breakout Ride`
- `Trap Escape`
- `Pressure Collapse`
- `Reclaim Window`

### Success Cue

Must be visible without reading a paragraph.

Examples:

- wall shatters
- squad rides upward
- trap deactivates
- support glows and stabilizes

### Failure Cue

Must also be visible without reading a paragraph.

Examples:

- floor cracks
- squad falls
- trap closes
- rebound slams the lane

## Battle UX Standard

Battle should look closer to:

- a short JRPG encounter
- a readable tactical puzzle

and less like:

- a report view
- a metrics dashboard

Rules:

- one primary objective always visible
- one main conflict object always visible
- command panel should be readable in `2 seconds`
- side text should explain, not compete
- the battlefield should own most of the screen

## Field UX Standard

Rules:

- HUD must be minimal
- no large explanatory cards by default
- nearby interactables should read through world-space beacons and silhouette first
- only one next-best destination should be emphasized
- party presence should do more work than floating text

## Growth Standard

Growth must have three layers:

### 1. Stage Growth

- Fresh
- Tuned
- Specialized
- Signature

This should change:

- stance
- body silhouette
- aura strength

### 2. Mutation Growth

- doctrine
- memory
- risk
- execution
- coordination

This should change:

- accessories
- overlays
- battle explanation emphasis

### 3. History Growth

- ribbons
- scars
- proven frame marks
- camp totems

This should change:

- body storytelling
- journal storytelling
- field return storytelling

## UI Surface Roles

### `/field`

- primary play surface
- travel, encounters, return rhythm

### `/battle`

- primary tension surface
- short command encounter

### `/roster`

- quick squad read

### `/agent/[id]`

- deep attachment and growth view

### `/lab`

- one mutation proposal surface

### `/journal`

- return-pressure surface
- the place where history becomes readable and next action becomes obvious

## Anti-Patterns

Do not ship toward these patterns:

- field as a decorative wrapper around menu clicks
- battle as a panel wall with a small chart inside it
- growth as chips and metrics with no body change
- routes with no pacing or teaching
- gates that feel identical
- reward screens that do not create a next move

## Alpha Exit Criteria

The first `Pokemon-grade alpha` is complete only when:

1. `/field` feels like the main game surface
2. there are at least `2` distinct gate types:
   - spar
   - proof
3. there is a readable `journal` return surface
4. each loop can end with `Keep / Quarantine / Revert`
5. the result changes body or history immediately
6. the player can read the next action without opening several menus
7. the first five minutes contain:
   - travel
   - one clash
   - one verdict
   - one return

## Autoresearch Questions

Autoresearch should now ask:

1. Does the game read as a world before it reads as a tool?
2. Can the player finish a complete loop in under five minutes?
3. Is the next objective obvious without text-heavy explanation?
4. Does each clash have one clear objective and one clear result cue?
5. Did the result change body, history, or care pressure in a visible way?
6. Does the return loop create a strong reason to do one more run?
