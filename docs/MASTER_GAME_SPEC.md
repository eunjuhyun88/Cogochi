# Cogochi Master Game Spec

Last updated: 2026-03-16

This is the product-level source of truth for Cogochi.

If older docs make the game feel like:

- a trainer dashboard
- a detached tamagotchi screen
- a thin wrapper around trading metrics

this document wins.

## 1. Product Definition

Cogochi is a chart-world judgment RPG where a pixel companion travels across real BTC history, walks on candle terrain, and fights the market with `LONG`, `SHORT`, `HOLD`, and `RUN`.

The product is not:

- a real trading terminal
- a passive chart viewer
- a generic autobattler
- an AI lab with a game skin

The correct read is:

`world map` -> `zone traversal` -> `market judgment` -> `survival outcome` -> `camp return` -> `growth`

## 2. Core Fantasy

The player should feel:

- `I am standing on Bitcoin history`
- `each era is a place I can travel through`
- `my Cogochi is my companion, not a stat row`
- `LONG, SHORT, HOLD, and RUN feel like battle commands`
- `historical crashes and manias feel like bosses`
- `camp feels like home between dangerous runs`

If the player instead feels:

- `I am still in a SaaS dashboard`
- `I am editing configs more than playing`
- `the chart is only wallpaper`

the game is off target.

## 3. Design Pillars

### 3.1 The chart is the world

BTC history is the map, terrain, progression track, and memory layer.

### 3.2 Time travel must feel physical

Moving right means going forward in time.
Moving left means review, retreat, or reread.

### 3.3 Position choices are combat verbs

The core player commands are:

- `LONG`
- `SHORT`
- `HOLD`
- `RUN`

No other input layer should compete with them in the first playable version.

### 3.4 Historical events are encounters

Real BTC events become:

- region identity
- environmental hazards
- miniboss patterns
- boss fights

### 3.5 Camp is the return anchor

Care, setup, feeding, and save flow belong in camp, not in disconnected journal-first surfaces.

## 4. World Structure

Cogochi uses three zoom levels.

### 4.1 `MACRO`

Scope:
full BTC history, roughly 2017 to 2026

Read:

- line-chart silhouette becomes mountains, valleys, and plateaus
- each era becomes a region
- selecting a region zooms into it

### 4.2 `MESO`

Scope:
months of daily or 4-hour candles inside one region

Read:

- candles become structures
- the player navigates toward camps, monuments, forges, and arenas
- region progress and unlock gates are visible here

### 4.3 `MICRO`

Scope:
15-minute or 1-hour candles for direct play

Read:

- candle bodies and wicks become immediate terrain
- the next hidden candle is the incoming threat or reward
- this is where the player fights normal encounters

## 5. Region Model

Suggested starter map:

- `2017 Q4`
  - rush mountain
  - early mania region
- `2018 Bear`
  - dark descent
  - long-survival and short discipline region
- `2019 Recovery`
  - false-start forest
  - trap-heavy region
- `2020 COVID`
  - crash dungeon
  - major boss region
- `2020-2021 Bull`
  - summit climb
  - momentum and overheat region
- `2022 LUNA`
  - ecosystem ruin
  - cascade region
- `2022 FTX`
  - prison undercity
  - extreme danger region
- `2023 Rebuild`
  - recovery road
  - pacing reset region
- `2024 ETF`
  - gate of approval and whipsaw
- `2024-2025`
  - new continent
  - high-volatility endgame path

Exact segmentation can still be tuned.
The important point is that era progression is world progression.

## 6. Core Loop Stack

### 6.1 Long-term loop

`unlock region` -> `clear zone` -> `defeat boss` -> `return to camp` -> `grow Cogochi` -> `reach the next era`

### 6.2 Session loop

`world map` -> `enter region` -> `walk candle terrain` -> `choose LONG/SHORT/HOLD/RUN` -> `resolve outcome` -> `return to camp`

### 6.3 Micro loop

`read current candle context` -> `hear Cogochi analysis` -> `choose command` -> `reveal next candle` -> `take HP/XP/gold consequence`

## 7. Player Verbs

The player primarily does the following:

1. choose a region
2. walk through price history
3. read support, resistance, and danger
4. choose `LONG`, `SHORT`, `HOLD`, or `RUN`
5. survive the result
6. care for the companion at camp
7. tune archetype and loadout between runs

The player is not directly placing live trades.

## 8. Combat Grammar

### `LONG`

Bet on upward continuation or rebound.

### `SHORT`

Bet on failure or downward continuation.

### `HOLD`

Preserve safety or wait for better information.

### `RUN`

Exit exposure and survive.

Regular encounters happen inside zone traversal.
Special boss fights can move to a dedicated scene.

## 9. Outcome Model

Cogochi uses an explicit survival model.

- HP represents portfolio stamina or survival health
- gold represents reward and progress currency
- XP represents growth

Wrong calls reduce HP.
Good calls preserve or restore HP.
Liquidation or catastrophic squeezes can zero out HP.

The exact numbers are tuning data.
The product truth is that judgment becomes survival.

## 10. Growth Model

### 10.1 Level bands

- `Fresh`
- `Tuned`
- `Specialized`
- `Signature`

### 10.2 Archetypes

- `CRUSHER`
- `RIDER`
- `ORACLE`
- `GUARDIAN`

### 10.3 Camp care

Camp handles:

- hunger
- energy
- mood
- setup
- save

Care should influence future runs, not exist as a detached idle loop.

## 11. Facilities

### `Camp`

- rest
- feed
- save
- quick setup

### `Forge`

- change archetype
- change indicators
- change doctrine
- upgrade loadout

### `Arena`

- region-end boss fight
- unlock gate to the next region

### `Monument`

- explain historical event
- grant lore and memory cards

## 12. Surfaces and Routes

Target route structure:

- `/`
  - macro world map
  - first-visit nursery and egg selection
- `/zone/[zoneId]`
  - region traversal and micro candle play
- `/boss/[bossId]`
  - special boss encounter cut-in
- `/camp`
  - care, setup, and save
- `/cogochi/[id]`
  - companion profile and progression
- `/passport/[id]`
  - public record and career history

Legacy routes such as `/roster`, `/lab`, `/field`, `/journal`, `/proof`, and `/agent/[id]` are migration-era routes, not final IA.

## 13. AI and Judgment Boundaries

Cogochi still uses AI companion behavior, but the AI layer is now support, not the main product read.

The AI companion may:

- comment on chart structure
- recognize patterns
- warn about traps
- unlock archetype-specific hints

The AI companion must not:

- replace the player's final command
- secretly own the trade decision
- turn the game into passive autoplay

## 14. Technical Constraints

- BTC history is fixed historical data
- the player never changes candles
- outcome rules must be deterministic
- current live market data must not contaminate historical truth
- Passport can remain as a public-facing history surface

## 15. MVP Scope

The MVP must prove:

1. the player can enter a macro BTC world map
2. the player can choose a region and zoom into it
3. the player can walk candle terrain in a micro slice
4. the player can choose `LONG`, `SHORT`, `HOLD`, or `RUN`
5. the game can reveal the next candle and apply HP, XP, and gold consequences
6. the player can return to camp and perform one care action
7. at least one historical event can work as a boss

## 16. Build Order

### Phase 1

- historical data
- zone and boss definitions
- world engine
- trade engine

### Phase 2

- macro world map on `/`
- region selection
- current position marker

### Phase 3

- `/zone/[zoneId]`
- micro traversal
- command dock
- trade result presentation

### Phase 4

- `/camp`
- onboarding
- care and setup

### Phase 5

- `/boss/[bossId]`
- boss engine
- boss clear and unlock flow

### Phase 6

- growth systems
- archetypes
- `/cogochi/[id]`
- legacy route cleanup

## 17. Acceptance Criteria

The design is correct only if a new player can say:

- `the BTC chart itself is the game world`
- `I move through time and price like a map`
- `LONG, SHORT, HOLD, and RUN are my core battle choices`
- `camp is where I recover and prepare`
- `historical market events feel like bosses`
- `this no longer reads like a trading dashboard`
