# Visual World Design

Status: canonical  
Last updated: 2026-03-16  
Scope: world readability, zoom presentation, HUD tone, character motion, and boss-cut-in feel

## 1. Purpose

Define how the chart-world version of Cogochi should look on screen.

This document exists because the product is no longer a set of detached surfaces.
The player must feel like they are inside Bitcoin history.

## 2. Core Feel Goal

The player should feel:

- `I am walking through a mythologized market landscape`
- `my Cogochi is a real travel companion`
- `the chart remains legible while still feeling like a world`
- `combat is a direct reading of the next candle, not a dashboard panel`

The player should not feel:

- SaaS product UI
- finance terminal
- esports overlay
- abstract tactical board detached from BTC history

## 3. Presentation Modes

### 3.1 Macro World Map

Mood:

- adventurous
- geographic
- legible at a glance

Read:

- one silhouette line across the whole screen
- regions rendered as mountain chains, valleys, ruined zones, or gates
- clear current location marker
- locked and cleared regions visible from afar

### 3.2 Zone Traverse

Mood:

- exploratory
- focused
- lightly dangerous

Read:

- candles become structures and stepping terrain
- landmarks appear as real props in the chart world
- the screen is mostly world, not chrome

### 3.3 Micro Combat

Mood:

- tense
- immediate
- readable

Read:

- the current candle terrain dominates the center
- command dock is fixed and clear
- one Cogochi bark line explains the current tension

### 3.4 Boss Cut-In

Mood:

- ceremonial
- dramatic
- historical

Read:

- hero panel versus boss panel
- chart background remains visible
- boss identity is unmistakable

## 4. Camera Rules

### Macro

- wide framing
- current marker visible without clutter

### Zone

- soft follow
- readable terrain ahead
- gentle anticipation in move direction

### Micro

- slightly tighter follow
- enough look-ahead to read the next revealed candle

### Boss

- staged presentation
- deliberate focus shifts
- no over-shaky camera

## 5. Character Rules

The main Cogochi should read as:

- cute
- vulnerable
- persistent
- capable of growth

Companions or support sprites should never overpower the main avatar.
The player's eyes should always know which body is theirs.

## 6. Terrain Translation Rules

### Macro

- line-chart slopes become landmass silhouette
- peaks feel like mountains
- crashes feel like ravines or scarred cliffs

### Meso

- candle clusters become architecture
- major moves become towers, ridges, broken stairways, or walls

### Micro

- each candle body becomes standable ground or a pressure column
- long wicks feel unstable
- support lines feel like shelves or bridges
- resistance lines feel like walls or gates

## 7. HUD Rules

The screen should carry a simple HUD:

- Cogochi name
- level
- HP
- gold
- current market frame label
- map button or zoom access

The HUD must stay lightweight.
The chart world should own most of the screen.

## 8. Command Dock Rules

The bottom command dock is sacred.

It must always make `LONG`, `SHORT`, `HOLD`, and `RUN` readable in one glance.

Rules:

- equal visual weight
- strong readability
- controller and keyboard friendly
- short Korean and English sublabels acceptable

No secondary analytics panel should compete with the dock in the first playable loop.

## 9. Boss Screen Rules

Boss cut-ins should feel like JRPG encounters born from real BTC history.

Rules:

- hero and boss panels visibly oppose each other
- chart background remains tied to the actual event
- boss title should carry the real historical label
- command set remains unchanged

The boss screen is presentation escalation, not rules escalation by interface bloat.

## 10. Palette Direction

Use a clear market-world palette:

- deep slate and muted midnight for distance
- sand, stone, and warm gray for traversable terrain
- green accents for long opportunity
- wine, brick, and rust for danger
- gold for reward and unlocks

Avoid:

- pure trading red-green takeover
- neon cyberpunk terminal framing
- flat black dashboards

## 11. Motion Direction

Movement should feel:

- stepped
- readable
- lightly bouncy

Outcome animation should feel:

- sharp on success
- painful on liquidation or squeeze
- short enough to preserve loop speed

Boss motion may be more dramatic, but normal play should stay readable and quick.

## 12. UI Tone

UI must support the world, not dominate it.

Rules:

- most of the screen is map, terrain, or candle space
- panels should feel like game overlays, not productivity cards
- support and resistance labels may appear in-world
- history notes may appear as monuments, boards, or plaques

Avoid:

- sidebars that permanently steal stage area
- dense comparison tables during active play
- multi-panel analytics layouts

## 13. Acceptance Criteria

This spec is successful when:

- a macro screenshot reads like a playable map of BTC history
- a zone screenshot reads like candle terrain, not a charting app
- a micro screenshot reads like a game with four battle commands
- a boss screenshot reads like a historical JRPG encounter
- none of the above read like a SaaS dashboard
