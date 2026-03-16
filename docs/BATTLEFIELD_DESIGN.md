# Battlefield Design

Status: canonical  
Last updated: 2026-03-16

## 1. Purpose

This document defines how a real BTC chart becomes a traversable world and a deterministic combat space.

It exists to answer:

- how chart history becomes terrain
- how the player moves through time and price
- how `LONG`, `SHORT`, `HOLD`, and `RUN` behave as battle commands
- how ordinary encounters differ from boss fights

## 2. Core Thesis

The chart is not decoration.
The chart is:

- the overworld
- the level structure
- the combat lane
- the memory layer

The player does not change history.
The player moves through history and chooses how to survive it.

## 3. Zoom Layers

### 3.1 `MACRO`

Purpose:
region selection and global progression

Visual read:

- full-history silhouette
- mountains, valleys, and plateaus
- one marker for current location

### 3.2 `MESO`

Purpose:
region routing and landmark approach

Visual read:

- daily and 4-hour candles as structures
- camps, forges, monuments, and arenas anchored to history

### 3.3 `MICRO`

Purpose:
direct playable judgment encounters

Visual read:

- candle body = immediate ground, wall, or tower
- wick = unstable edge, spike, or trap limb
- next hidden candle = incoming event

## 4. Coordinate Model

### Axes

- `X axis`: time progression
- `Y axis`: price level

### Movement read

- move right to advance
- move left to review or retreat
- climb when price structure supports it
- drop when the structure breaks or the path descends

The player should feel like they are traversing history physically, not scrolling a chart tool.

## 5. Terrain Grammar

### 5.1 Candle terrain

- `Bull candle`
  - climbable or supportive terrain
- `Bear candle`
  - downward pressure terrain
- `Large body`
  - momentum lane
- `Long wick`
  - unstable rejection edge
- `Tight cluster`
  - range box or compressed corridor

### 5.2 Structural terrain

- `Support shelf`
  - safe footing
- `Resistance wall`
  - barrier or gate
- `Breakout ridge`
  - threshold terrain that rewards correct commitment
- `Liquidation pit`
  - catastrophic danger zone
- `Volume burst spring`
  - sudden movement amplifier
- `Trap corridor`
  - false breakout or fake breakdown space

Every terrain object must answer:

- can I stand on it
- does it push up or down
- is it safe or dangerous
- which command does it tempt

## 6. Core Commands

### `LONG`

Meaning:
commit to upward move or rebound

Read:

- aggressive climb
- upward banner, surge, or leap

### `SHORT`

Meaning:
commit to breakdown or downward continuation

Read:

- downward strike
- top-down pressure

### `HOLD`

Meaning:
do not force a bad entry

Read:

- cautious stance
- information gathering

### `RUN`

Meaning:
close exposure and preserve survival

Read:

- retreat
- disengage
- survival over greed

## 7. Encounter Flow

The default micro encounter loop is:

1. show the visible candle context
2. surface support, resistance, volume, and hazard hints
3. let the Cogochi say one short line
4. let the player choose `LONG`, `SHORT`, `HOLD`, or `RUN`
5. reveal the next candle or candles
6. apply deterministic outcome

This loop should finish quickly.
It is the normal heartbeat of play.

## 8. Outcome Rules

The battlefield resolves into:

- HP change
- gold change
- XP change
- progress state

Example tuning direction:

- correct continuation or rebound yields HP and gold
- wrong commitment damages HP
- major traps or squeezes deal burst damage
- `HOLD` preserves HP but may cost tempo
- `RUN` locks in survival

The numbers are tunable.
The rule is not.

## 9. Enemy Grammar

Common enemy patterns:

- `Red Candle Mob`
- `Green Candle Mob`
- `Whale Shadow`

Mid-boss patterns:

- `Liquidation Hunter`
- `Trap Master`
- `Cascade`

Boss patterns:

- `COVID Crash`
- `LUNA Collapse`
- `FTX Collapse`
- `ATH Dragon`

These are market behaviors expressed as enemies.
They are not arbitrary fantasy mobs.

## 10. Boss Battles

Bosses may shift into a dedicated cut-in route.

Boss battle rules:

- stronger scripting
- multi-turn structure
- explicit boss HP
- phase changes
- higher-stakes clear or fail outcome

Boss battles still use the same four command verbs.
The cut-in presentation changes, not the core judgment grammar.

## 11. Readability Rules

The player must be able to tell:

- where the current candle footing is
- where support and resistance sit
- where the next danger zone lies
- which direction their current commitment wants to travel
- whether a boss is entering a new phase

If the player cannot point to the turning point on the chart, the battlefield has failed.

## 12. Non-Goals

- a generic fantasy overworld with chart wallpaper
- live-trading UI
- random outcome-driven combat
- hidden AI autoplay
- excessive side-panel explanation that smothers the stage

## 13. Acceptance Criteria

This spec is successful when:

- the player can walk on chart structure and understand why the ground looks that way
- `LONG`, `SHORT`, `HOLD`, and `RUN` read as game verbs
- the next hidden candle feels like incoming danger or reward
- historical crash events feel like bosses, not slides in a lesson deck
