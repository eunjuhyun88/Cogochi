# Chartfield Fullgame Direction

Status: proposed  
Scope: full web-game feel, asset family direction, movement states, field-to-battle grammar, and chart-native action staging  
Depends on: `docs/BATTLEFIELD_DESIGN.md`, `docs/VISUAL_WORLD_DESIGN.md`, `docs/design-docs/judgment-tamagotchi-loop.md`, `docs/references/imported/Cogochi_ItchAssetShortlist_20260312.md`

## Purpose

This document defines how Cogochi stops feeling like a disconnected set of menus and becomes a real web game.

The target feeling is:

`walk the chart world -> care for the squad -> enter a battle slice -> watch the chart react -> return with a new lesson and visible change`

This is not a generic overworld RPG.
The chart must remain the world substrate and the battle must remain explainable.

## Asset Direction

### Prototype Direction

Use `Ninja Adventure - Asset Pack` as the prototype replacement for the current dino placeholders because it is:

- CC0
- top-down ready
- UI-inclusive
- fast to import without budget or licensing bottlenecks

The prototype goal is not final style.
The prototype goal is to make `/field` movement, party follow, interact prompts, and battle transitions real as quickly as possible.

### Production Direction

If the team wants the shipped product to feel more modern, urban, and chart-native, the preferred family is:

- `Modern Interiors`
- `Modern Exteriors`
- `Modern User Interface`

This family is the better long-term fit for:

- trainer lab spaces
- archive rooms
- city-edge chart terrain
- portrait-driven agent ownership

### Hard Rule

Do not mix:

- dino sprites
- fantasy CC0 prototype tiles
- modern production tiles

inside the same shipped runtime surface.

At any given phase, one family must be the visual owner.

## Game Feel Goal

The player should feel:

- `my agents are a traveling squad`
- `the chart is a place I move through`
- `a clash is a short punctuating event, not the entire game`
- `I come back to care for the squad because history changed them`

The player should not feel:

- dashboard hopping
- static menu browsing
- AI art chaos
- random mascot spectacle detached from judgment

## The Two Modes

### Explore Mode

Mood:

- calm
- readable
- quiet
- travel-first

UI behavior:

- minimal HUD
- one active objective pin
- squad care pings only when relevant
- prompt windows stay small and anchored to the world

Player verbs:

- walk
- inspect
- open prompt
- switch leader
- enter gate
- return to camp

### Clash Mode

Mood:

- short
- sharp
- readable
- high-stakes

UI behavior:

- the active chart slice brightens
- command deck appears
- battle nouns become visible structures
- the result writes back to the squad

Player verbs:

- commit long
- commit short
- hold and scan
- veto risk
- retarget
- stabilize

## Chartfield Coordinate Grammar

Use the chart as the map grammar:

- `x-axis` = time travel
- `y-axis` = price band height
- candles = walkable ledges, ridges, or falls
- support = grounded platforms
- resistance = wall or barricade
- liquidation band = hazard pit, crush lane, or unstable floor
- moving average = wind path, track, or current line

The field must always read like a transformed chart, not a random town map pasted over finance.

## Party Composition

The field party should read as a four-slot squad.

For implementation, that means:

- one visible leader in front
- three followers with role-specific follow behavior

Role feel:

- `Scout`: breaks formation briefly, then returns
- `Analyst`: pauses and points at structures
- `Risk`: hugs the party center and braces near danger
- `Executor`: stands nearest the commitment line during clash

## Required Movement States

These states are required before polish:

- `idle`
- `walk`
- `run`
- `inspect`
- `think`
- `surge-up`
- `slam-down`
- `brace`
- `hit`
- `recover`
- `celebrate`

If a chosen asset pack does not support enough of these directly, fill the gap with:

- frame reuse
- simple pose variants
- overlay effects

Do not wait for perfect animation coverage before shipping the loop.

## Action Grammar From The Reference Images

The reference images are useful because they turn chart nouns into readable action scenes.

What to keep:

- support and resistance as literal structures
- liquidation as structural collapse
- breakout as upward ride or wall-crossing
- top pressure coming down from above
- team pressure coming up from below

What to reject:

- cluttered labels everywhere
- overly soft 3D mascot rendering
- action noise that obscures chart shape
- scenes where the mascots are more readable than the chart

## Concrete Battle Actions

These are the minimum readable actions that should appear on the chart slice.

### `Long Surge`

Player intent:

- defend a lower band and push upward

Visual:

- squad compresses
- leader and executor lunge upward
- green thrust ribbon travels through the active slice

Result hooks:

- support integrity rises
- momentum rises
- breakout chance increases

### `Short Slam`

Player intent:

- force failure from above

Visual:

- strike marker drops from the upper band
- target structure flashes red
- rival pressure visibly descends

Result hooks:

- structure integrity drops
- trap risk rises if mistimed

### `Hold Scan`

Player intent:

- avoid commitment and improve read quality

Visual:

- analyst pulse
- scout ping
- field markers briefly illuminate

Result hooks:

- reveal quality rises
- trap clarity rises
- confidence recovers

### `Risk Brace`

Player intent:

- avoid liquidation or bad chase

Visual:

- risk unit plants a guard cue
- shield or anchor overlay appears
- movement slows slightly

Result hooks:

- trap risk drops
- support loss is reduced

### `Breakout Ride`

Player intent:

- convert resistance into owned upward territory

Visual:

- wall fracture
- bright lane opens upward
- leader and followers cross the line

Result hooks:

- objective shifts
- keepsake chance rises
- celebration state can trigger on success

### `Liquidation Collapse`

System event:

- overcommitted side gets punished

Visual:

- floor breaks
- units scatter downward or upward
- panic or stun pose appears

Result hooks:

- heavy battle loss
- strong memory writeback candidate
- care state almost always changes

## World Nodes

`/field` should have a small number of meaningful interactables.

### Camp

Purpose:

- return point
- session resume point
- squad mood snapshot

### Archive Well

Purpose:

- inspect memory cards
- curate or pin a lesson

### Lab Bench

Purpose:

- edit doctrine, script, indicator, risk

### Battle Gate

Purpose:

- enter the next chart clash
- preview terrain and likely pressure direction

### Journal Board

Purpose:

- read the last lesson
- accept the next care action

## Mutation Pipeline

Visible growth must use layers, not full sprite replacements.

### Layer 1. Base Body

- the chosen asset family's base character

### Layer 2. Role Overlay

- scout, analyst, risk, executor cues

### Layer 3. Growth Overlay

- tuned accessory
- specialized stance
- signature mark

### Layer 4. History Overlay

- ribbons
- scars
- lesson badge
- keepsake icon

This makes asset replacement tractable and lets growth survive family upgrades.

## UX Layering Rule

At every moment one layer owns the player's eye:

- Explore Mode: party + terrain
- Clash Mode: contested chart slice
- Reflection Mode: lesson + next care action

If two layers fight for attention, remove one.

## Shipping Rule

The next implementation phase should not chase:

- large maps
- combat polish first
- complex quest writing
- multiple art families

It should ship:

1. one small field
2. one four-slot travel party
3. one battle gate
4. one chart clash with visible motion
5. one return-to-camp reflection writeback
