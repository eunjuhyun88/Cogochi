# Cogochi Battle Screen Layout

Status: proposed surface contract  
Scope: `/zone/[zoneId]` micro combat, result posture, and `/boss/[bossId]` cut-in battle  
Depends on: `docs/MASTER_GAME_SPEC.md`, `docs/AGENT_SYSTEM_DESIGN.md`, `docs/BATTLEFIELD_DESIGN.md`, `docs/VISUAL_WORLD_DESIGN.md`, `docs/design-docs/COGOCHI_chart_world_jrpg_reset_20260316.md`

## Purpose

This document fixes what the battle screen actually is in the chart-world reset.

The previous battle-layout doc was still shaped around an older `/battle` route:

- thesis-first clash panel
- app-like header and dossier behavior
- a dedicated battle surface detached from zone traversal

That is no longer the target.

In the chart-world version, ordinary combat is not a separate dashboard scene.
It is the `MICRO` layer inside zone traversal.
The player is still standing on BTC history.
Only boss events escalate into a dedicated cut-in battle scene.

## One-Line Definition

Cogochi battle is a chart-terrain encounter where the player stands on the current candle, hears one short advisory line, and answers with `LONG`, `SHORT`, `HOLD`, or `RUN`.

## Route Ownership

### Default combat

Lives inside:

- `src/routes/zone/[zoneId]/+page.svelte`

This route owns:

- `MESO` traversal
- transition into `MICRO` playable candle terrain
- normal encounter command flow
- post-command reveal and result state

### Boss combat

Lives inside:

- `src/routes/boss/[bossId]/+page.svelte`

This route owns:

- historical boss cut-in
- multi-turn scripted phases
- boss HP and special attacks

### Canonical migration rule

`/battle` is no longer the target player-facing surface for standard play.
If it survives during migration, it should behave only as a temporary harness or staging route.

## Screen Pillars

### 1. The player must still feel on-map

Normal combat should look like:

- the same chart world
- the same candle terrain
- the same avatar body

It must not feel like a jump into a financial sub-app.

### 2. The current footing and next danger must be visible

The player should immediately see:

- where the Cogochi is standing now
- what support or resistance matters now
- where the next candle threat is coming from

### 3. Four commands are sacred

The primary command row is only:

- `LONG`
- `SHORT`
- `HOLD`
- `RUN`

No second combat verb set should compete with those in the first playable version.

### 4. The Cogochi bark must be short and useful

One line.
Fast read.
Half emotion, half read.

Good:

- `지지선이 가까워... 반등할까?`
- `거래량이 죽고 있어. 함정 같아.`
- `여기선 도망이 맞아.`

Bad:

- multi-line analysis blocks
- runtime logs
- doctrine essays

### 5. Results happen on the stage, not in a report rail

When the player is right:

- the chart should visibly reward the call
- the avatar should move with the reveal
- HP, gold, and XP should update in place

When the player is wrong:

- the terrain should hurt
- the hit should read as market consequence

## Canonical Battle Modes

### Mode A. Micro Traverse Combat

This is the default battle posture.

Use when:

- the player is in a normal playable slice
- the next 1 to 3 candles will resolve the call
- no special boss script is active

### Mode B. Result Posture

This appears immediately after a command resolves.

Use when:

- the next candle bundle has been revealed
- HP, gold, XP, or liquidation outcome is known
- the player must decide whether to keep going, hold, or run

### Mode C. Boss Cut-In

This is reserved for:

- `COVID Crash`
- `LUNA Collapse`
- `FTX Collapse`
- `ATH Dragon`
- any future named historical boss encounter

## Desktop Silhouette: Micro Traverse Combat

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🐳 [Name] Lv.5  HP ████████░░ 780   💰 2,450                 [🗺]      │
│  BTC/USDT 15m   2020-03-12 14:30   Zone: COVID Crash                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   cloud / depth / skyline noise kept quiet                               │
│                                                                          │
│        current candle terrain                                            │
│      support shelf / resistance wall / liquidation pit                   │
│                                                                          │
│                     🐳 current avatar footing                             │
│                                                                          │
│      partially hidden next candle threat on the right edge               │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  🐳 "지지선이 가까워... 반등할까?"                                       │
├──────────────────────────────────────────────────────────────────────────┤
│  [ LONG ]      [ SHORT ]      [ HOLD ]      [ RUN ]                     │
│  매수!           매도!           관망            도망!                    │
└──────────────────────────────────────────────────────────────────────────┘
```

## Zone Breakdown

### Zone A. Top HUD

Purpose:

- instant orientation
- survival state
- historical frame label

Must show:

- Cogochi name
- level
- HP bar and current HP number
- gold
- market pair and interval
- current historical timestamp
- map or zoom button

May show in low emphasis:

- current zone label
- current stance icon if already committed

Must not show:

- side metrics panels
- large chip collections
- selector dropdowns
- permanent tactical dossier

### Zone B. Chart Stage

Purpose:

- own the screen
- make the candle terrain readable as terrain and as market structure

Must show:

- visible candle terrain
- Cogochi body on the current candle
- one clear support or resistance read if relevant
- one clear danger object if relevant
- partially hidden incoming candle or event direction

Permitted in-world callouts:

- `Support $5,800`
- `Resistance $6,140`
- `Liquidation $5,200`
- `Trap zone`

Must avoid:

- opaque floating cards over the center
- permanent sidebars
- multiple explanation widgets that steal width from the stage

### Zone C. Bark Strip

Purpose:

- carry the emotional and informational read

Rules:

- single line by default
- max two short clauses
- should point to the tension, not summarize the entire slice

Tone examples:

- `지금은 밀리면 끝이야.`
- `반등 자리 같아도 거래량이 약해.`
- `숏 스퀴즈 냄새가 나.`

### Zone D. Command Dock

Purpose:

- present the only meaningful choice the player must make now

Rules:

- four equal cards
- always visible without scroll
- keyboard and controller readable
- Korean subtitle acceptable below English verb

Recommended bindings:

- `1` = `LONG`
- `2` = `SHORT`
- `3` = `HOLD`
- `4` = `RUN`
- arrows or shoulder inputs cycle focus
- confirm selects

Each card should contain:

- verb
- one short Korean subtitle
- one-line flavor or risk cue

Each card should not contain:

- analytics tables
- leverage forms
- deep setup menus

## Layout Ratios

Desktop target:

- top HUD: `56-72px`
- chart stage: `60-65%` of first viewport
- bark strip: `56-84px`
- command dock: `132-180px`

The full command row must be visible on `1440x900` without scroll.

Mobile target:

- HUD compresses to two rows
- stage remains dominant
- bark strip stays one line or collapses into speech bubble overlay
- command dock becomes a `2x2` card grid

## Stage Read Rules

### Current candle

The current candle must answer:

- where can I stand
- which way is pressure leaning
- how dangerous is staying here

### Next candle

The next candle should not fully reveal before commitment.
It should be sensed as:

- silhouette
- shadow
- partial wick
- incoming motion cue

The player should feel anticipation, not omniscience.

### Support and resistance

These should appear as in-world geometry:

- shelves
- gates
- walls
- bridges

Not as detached analytics labels.

## Normal Encounter Interaction Loop

### Beat 1. Read

Show:

- current terrain
- active hazard labels
- bark line

### Beat 2. Commit

Player selects:

- `LONG`
- `SHORT`
- `HOLD`
- `RUN`

Immediate response:

- selected card locks
- Cogochi stance animates
- stage anticipates incoming candle reveal

### Beat 3. Reveal

Reveal:

- next `1-3` candles depending on encounter type

Rules:

- reveal sequentially, not as an instant summary wall
- move the avatar with the terrain if the call is right
- play a hit or damage response if the call is wrong

### Beat 4. Resolve

Update:

- HP
- gold
- XP
- stance continuity

### Beat 5. Next choice

Offer:

- continue with current run
- `HOLD`
- `RUN`
- or return to free traversal if the encounter ended

## Result Posture

After reveal, the screen should briefly shift into a result-forward layout.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  🐳 Lv.5  HP 780→820   💰 2,450→2,490   XP +25                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  updated candle terrain                                                  │
│  avatar moved to new footing                                             │
│  market consequence is visible on the stage                              │
│                                                                          │
│              ┌────────────────────────────────────┐                      │
│              │ HIT! 매수 성공! +4.2%              │                      │
│              │ HP +40  💰 +40  XP +25            │                      │
│              └────────────────────────────────────┘                      │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  [ 계속 진행 ]                           [ 여기서 RUN ]                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### Result rules

Success state should feel:

- upward
- light
- quick
- rewarding without stopping the loop too long

Failure state should feel:

- sharp
- painful
- clearly tied to the player read

Liquidation state should feel:

- heavy
- final
- impossible to confuse with ordinary damage

### Result timing

Target:

- small outcome: under `1.2s`
- heavy hit: under `1.8s`
- liquidation or boss phase break: may extend, but should still remain readable

## Boss Cut-In Layout

Boss fights are the only time normal zone combat becomes a dedicated screen.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  HERO PANEL                                 BOSS PANEL                   │
│  🐳 Cogochi Lv.18                           😈 COVID Crash               │
│  HP ██████░░                                HP ██████████                │
│                                                                          │
│                [ actual historical chart background ]                    │
│                                                                          │
│                 🐳  ───── LOCK-ON ─────  😈                              │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  "COVID Crash가 -30% 매도 폭격을 시작했다!"                              │
├──────────────────────────────────────────────────────────────────────────┤
│  [ LONG ]      [ SHORT ]      [ HOLD ]      [ RUN ]                     │
│  역발상 매수      같이 매도       폭풍 버티기       전부 현금화            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Boss rules

Must show:

- hero HP
- boss HP
- boss name using the real historical event label
- current boss phase if relevant
- same four commands as normal play
- real chart background from the actual event window

Must not introduce:

- an entirely different verb set
- detached JRPG stats unrelated to chart history
- decorative fantasy bosses disconnected from BTC history

## Command Semantics

### `LONG`

Read:

- bet on rebound or continuation up
- aggressive climb

### `SHORT`

Read:

- bet on breakdown or continuation down
- pressure move

### `HOLD`

Read:

- no forced entry
- wait or keep current posture stable

### `RUN`

Read:

- close exposure
- survive and preserve

## Motion and Feedback Rules

### Avatar movement

- short step forward on success
- slide or stagger on damage
- strong knockback only on liquidation-tier events

### Candle reveal

- one-by-one unfold
- never cover the whole stage with summary chrome

### Damage and reward

- HP loss should flash near the body or danger zone
- reward should pulse near the successful move path
- bark may update once, but should not become chatter

## Non-Goals

- a right-side analytics dossier during active combat
- a dashboard header before the stage
- route-local form controls inside the battle posture
- separate combat verbs unrelated to `LONG`, `SHORT`, `HOLD`, `RUN`
- a normal encounter screen that feels disconnected from traversal

## Acceptance Criteria

This doc is successful when:

- a screenshot of normal play looks like a character standing on BTC candle terrain
- the player can identify the current footing, the next threat, and the command row in one glance
- the battle surface reads like part of `/zone/[zoneId]`, not a separate app
- the result state clearly shows `what happened` before any deeper explanation
- the boss cut-in feels like a historical JRPG encounter without abandoning the chart-world grammar
