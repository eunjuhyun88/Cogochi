# Cogochi Chart-World JRPG Reset

Status: proposed canonical direction  
Scope: product reset, world structure, route model, combat loop, growth loop, and implementation framing  
Supersedes in intent: split trainer-hub and detached tamagotchi-screen framing

## One-Line Product

Cogochi is a game where a pixel companion walks on real BTC history and fights the market with `LONG`, `SHORT`, `HOLD`, and `RUN`.

Short version:

`real BTC chart = world map`

`walking the chart = traversal`

`taking a position = combat`

## Why This Reset Exists

The previous direction still read too much like:

- a training dashboard
- a mutation lab
- a set of connected menu screens

That shape weakens the fantasy.
The stronger fantasy is:

- I am inside Bitcoin history
- my Cogochi travels from era to era
- the chart itself is the terrain
- every position call is a fight for survival

The player should not feel like they are managing an experiment first and playing a game second.

## Design Pillars

### 1. The chart is the world

BTC history is not a background.
It is the actual overworld, level layout, terrain grammar, and historical memory layer.

### 2. Movement through history must feel physical

The player should move left and right across time and stand on actual candles, slopes, steps, support shelves, and liquidation pits.

### 3. Every position choice is a combat verb

The core combat grammar is:

- `LONG`
- `SHORT`
- `HOLD`
- `RUN`

Those are not finance buttons.
They are the player's battle stances against the current market situation.

### 4. Historical market events are bosses

Major BTC events are not only text lore.
They are encounter peaks:

- `COVID Crash`
- `LUNA Collapse`
- `FTX Collapse`
- `ATH Dragon`

### 5. Care and setup happen at camp

The player returns to camp to:

- feed
- rest
- review
- adjust archetype and loadout
- save

That loop replaces detached journal and lab-first structure as the dominant emotional landing.

## World Map Structure

The world has three zoom layers.

### `MACRO`

Scope:
full BTC history, roughly 2017 to 2026

Read:

- line-chart silhouette becomes mountains, valleys, and plateaus
- each market era becomes one region
- selecting a region zooms into a playable zone

Primary use:

- choose era
- see progression
- unlock future regions

### `MESO`

Scope:
one selected era over months of daily or 4-hour candles

Read:

- candles become buildings, ridges, towers, and structures
- the player chooses a path deeper into the region
- landmarks such as camp, forge, arena, or monument appear here

Primary use:

- route through a region
- approach facilities
- select the next playable slice

### `MICRO`

Scope:
one playable slice using 15-minute or 1-hour candles

Read:

- each candle body and wick becomes immediate terrain
- the player walks on the current structure
- the next hidden candle is the incoming threat or opportunity

Primary use:

- make judgment decisions
- survive short combat windows
- earn HP, XP, gold, and progression

## Region Model

Suggested early region framing:

| Region | BTC range | World read | Difficulty | Boss |
| --- | --- | --- | --- | --- |
| `2017 Q4` | `$6K -> $20K` | high mountain rush | `2/5` | ICO bubble collapse |
| `2018 Bear` | `$20K -> $3.2K` | dark valley descent | `3/5` | endless downtrend |
| `2019 Recovery` | `$3.2K -> $13K -> $7K` | forest of false hope | `2/5` | fake bull reset |
| `2020 COVID` | `$9K -> $3.8K -> $10K` | crash dungeon | `4/5` | COVID Crash |
| `2020-2021 Bull` | `$10K -> $69K` | legendary summit | `3/5` | ATH Dragon |
| `2022 LUNA` | `$40K -> $17K` | ruined ecosystem | `4/5` | cascade collapse |
| `2022 FTX` | `$21K -> $15K` | prison undercity | `5/5` | FTX Collapse |
| `2023 Rebuild` | `$16K -> $45K` | recovery road | `2/5` | grind endurance |
| `2024 ETF` | approval era | gate of whipsaw | `3/5` | approval fakeout |
| `2024-2025` | `$40K -> $100K+` | new continent | `3/5` | leverage purge |

The exact ranges can still be tuned.
The important point is that era selection becomes world progression.

## World Facilities

### `Camp`

Purpose:

- care
- rest
- save
- review current setup

### `Forge`

Purpose:

- change archetype
- tune indicators
- change doctrine
- upgrade gear or loadout

### `Arena`

Purpose:

- region-end boss fight
- unlock the next region on clear

### `Monument`

Purpose:

- explain the real historical event
- grant lore and memory cards
- reinforce that this is playable market history

## Movement Model

### Axes

- `X axis`: time
- `Y axis`: price level

### Controls

- `Right`: move to the next candle and advance time
- `Left`: step back and review the previous candle
- `Zoom in/out`: move between map scales

### Auto-scroll Mode

An optional auto-progress mode should reveal candles one by one, like watching history play forward, while still pausing for judgment input.

## Core Combat Loop

At each candle or small candle bundle:

1. show the current market context
2. let the Cogochi read or comment on it
3. let the player choose `LONG`, `SHORT`, `HOLD`, or `RUN`
4. reveal the next candle or candles
5. apply HP, XP, and gold consequences
6. continue, branch into event logic, or escalate into a boss state

## Command Grammar

### `LONG`

Meaning:
bet on upward continuation or rebound

### `SHORT`

Meaning:
bet on downward failure or breakdown

### `HOLD`

Meaning:
observe, preserve, or avoid forcing a bad commitment

### `RUN`

Meaning:
close exposure and survive

This is the primary battle grammar.
No additional command layer should compete with it in the first playable version.

## HP, Reward, and Failure Model

Baseline proposal:

- Cogochi HP represents portfolio stamina
- start from `1000 HP`
- positive calls restore or preserve HP
- wrong calls damage HP
- liquidation or catastrophic squeeze can zero out HP

Illustrative tuning:

- `LONG` and `+1%` move: `HP +10`, `gold +10`
- `LONG` and `-1%` move: `HP -10`
- `LONG` and `-5%` move: `HP -50`
- `SHORT` and `-1%` move: `HP +10`, `gold +10`
- `SHORT` and `+1%` move: `HP -10`
- `HOLD`: low or no HP change, but opportunity cost
- `RUN`: realize outcome, gain survival credit when used correctly

The exact numbers are balancing data, not product truth.
The product truth is that market judgment becomes health, reward, and survival.

## Enemy Taxonomy

### Common enemies

- `Red Candle Mob`
- `Green Candle Mob`
- `Whale Shadow`

### Mid-bosses

- `Liquidation Hunter`
- `Trap Master`
- `Cascade`

### Region bosses

- `COVID Crash`
- `FTX Collapse`
- `ATH Dragon`

Enemy types should always correspond to real market behaviors, not abstract fantasy species.

## Growth Model

### Level bands

- `Lv.1-5 Fresh`
  - basic commands only
- `Lv.6-15 Tuned`
  - pattern recognition, simple leverage, stop tools
- `Lv.16-30 Specialized`
  - archetype selection and special skills
- `Lv.31-50 Signature`
  - stronger leverage bands, ultimate skills, historical pattern callbacks

### Archetypes

- `CRUSHER`
- `RIDER`
- `ORACLE`
- `GUARDIAN`

Each archetype should unlock skills that reinforce a clear judgment style, not generic combat power.

## Tamagotchi Layer Integration

The life-sim layer remains, but it must live inside the chart-world loop.

Vitals:

- `hunger`
- `energy`
- `mood`
- `hp`

Camp care items:

- `DATA_SNACK`
- `NEWS_FEED`
- `ONCHAIN_MEAL`
- `MACRO_FEAST`

Care should create meaningful next-run effects, not become a detached chore loop.

## Route Model

Target route structure:

- `/`
  - macro world map
  - first-visit nursery and egg selection
- `/zone/[zoneId]`
  - meso and micro region play
- `/boss/[bossId]`
  - special JRPG cut-in boss battle
- `/camp`
  - care, setup, and save point
- `/cogochi/[id]`
  - companion profile and progression
- `/passport/[id]`
  - public record and career history

Legacy routes such as `/roster`, `/lab`, `/field`, `/journal`, `/proof`, and `/agent/[id]` should be treated as migration targets, not the final IA.

## Technical Framing

### Data

- macro daily BTC data can ship as static JSON
- micro 15-minute and 1-hour slices can load per zone
- the game should use fixed historical data

### Rendering

- `MACRO`: SVG
- `MESO`: SVG
- `MICRO`: Canvas 2D
- `BOSS`: SVG or Canvas 2D

### Reusable code candidates

- `ChartBattlefield.svelte` -> evolve toward `ChartWorld.svelte`
- `PixelSprite.svelte` -> keep as the sprite base
- deterministic evaluation code can still support result calculation and grading

## Immediate Product Consequences

This reset means:

- the old split-screen tamagotchi framing is no longer the main read
- detached journal and proof screens are no longer primary loop anchors
- the macro map and zone traversal become the front door of the game
- the player fantasy becomes `history traversal + judgment survival`, not `lab tuning + proof review`

## Acceptance Test

The reset is correct only if a new player can say:

- `I am standing on Bitcoin history`
- `I move through real market eras like regions`
- `LONG, SHORT, HOLD, and RUN feel like battle commands`
- `camp feels like the place I recover and prepare`
- `boss fights feel like historical market disasters turned into encounters`
- `this no longer reads like a SaaS dashboard`
