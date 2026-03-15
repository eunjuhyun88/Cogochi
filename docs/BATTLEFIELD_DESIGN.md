# Battlefield Design

Status: canonical  
Last updated: 2026-03-08

## 1. Purpose

This document defines how a crypto price chart becomes a playable battlefield.

It exists to solve four missing pieces:

- how the chart reads as terrain
- how a long or short position is visibly expressed
- how the player avatar and 3 companion agents operate on the field
- how battle outcomes become learning and progression instead of monetary payout

This document is the canonical battlefield contract.
It defines battle grammar and chart translation rules, not rendering implementation details and not code architecture ownership.

## 2. Core Thesis

The chart is not decoration.
The chart is the map, terrain, history layer, and combat lane.

The player does not change the market.
The player chooses where to commit, where to hold, where to retreat, and how to train a squad to read and survive the market better.

The battlefield must always communicate:

- what part of history is visible
- where the current active combat zone is
- where a long or short thesis was committed
- which side currently owns vertical pressure
- what the companions are contributing to the decision

## 3. Design Goals

- The player must be able to say, at a glance, "a long was committed there" or "that short got trapped there."
- The whole chart must remain recognizable as BTC or another coin chart, even during combat.
- Battle must feel like interpretation of market structure, not abstract fantasy combat detached from price action.
- The 3 companion agents must feel useful and trainable, not cosmetic followers.
- Match rewards must reinforce learning quality, team cohesion, and doctrine growth, not fake profit.

## 4. Non-Goals

- This is not a live trading simulator.
- This is not paper trading with a skin.
- The player does not directly move candles or rewrite price history.
- The player does not earn real money from battle outcomes.
- The battlefield should not become a generic RPG map with a chart wallpaper behind it.

## 5. Battlefield Coordinate Model

### 5.1 Axes

- `X axis`: time progression
- `Y axis`: price level

### 5.2 Ownership Read

- player squad pressure generally rises from lower regions toward upper regions
- rival squad pressure generally descends from upper regions toward lower regions
- long commitment usually attempts upward territory capture
- short commitment usually attempts downward pressure or denial

This vertical read is more important than clean left-to-right readability.

### 5.3 Visible Layers

The battlefield always renders three simultaneous layers:

1. `History Layer`
   - the broader chart history
   - faded but readable
   - used for market context and memory
2. `Active Zone Layer`
   - the current battle slice
   - high contrast
   - where units move and commit
3. `Tactical Overlay Layer`
   - temporary grid, position markers, danger zones, path indicators
   - appears only when decisions or clashes need precision

## 6. Chart Terrain Grammar

### 6.1 Candle Terrain

- `Bull Candle`
  - rising support energy
  - easier upward movement
  - improves long commitment stability
- `Bear Candle`
  - downward compression
  - easier descent or short pressure
  - increases knockback risk for weak longs
- `Large Body Candle`
  - momentum lane
  - faster movement but higher commitment cost
- `Long Wick`
  - unstable footing
  - signals rejection, trap, fake breakout, or panic sweep
- `Tight Candle Cluster`
  - range box
  - low mobility, high setup potential

### 6.2 Structural Terrain

- `Support Platform`
  - safe foothold
  - grants brace and recovery
- `Resistance Wall`
  - hard barrier
  - must be broken, bypassed, or respected
- `Breakout Gate`
  - threshold object
  - if captured, grants momentum swing
- `Range Box`
  - compressed neutral zone
  - favors setup, feint, and trap play
- `Long Liquidation Trap`
  - punishes overextended longs
- `Short Liquidation Trap`
  - punishes overextended shorts
- `Volume Spring`
  - burst source that launches units vertically
- `Volatility Storm`
  - unstable region with movement and targeting variance
- `Funding Bias Beam`
  - directional pressure modifier
- `Macro Shock Beacon`
  - scripted event anchor that changes local rules

### 6.3 Terrain Rule

Every visible terrain object must answer:

- can units stand on it
- does it push upward or downward
- does it grant safety or danger
- does it invite long, short, or hold

If the object cannot answer those four questions, it should not exist in MVP.

## 7. Position Event Grammar

This is the most important missing layer in the current design.

### 7.1 Long Commit

Meaning:
- the player believes this region should be defended and pushed upward

Visual:
- green position marker planted from below
- upward thrust line or banner
- squad compresses, then surges upward

Gameplay:
- starts a territory push
- creates a `Long Commitment Zone`
- may trigger clash if rival pressure is present

### 7.2 Short Commit

Meaning:
- the player believes this region should fail or be forced downward

Visual:
- red marker dropped from above
- downward strike line
- squad leans and descends with pressure effect

Gameplay:
- starts a pressure collapse attempt
- creates a `Short Commitment Zone`
- may trigger clash if defenders are present

### 7.3 Hold

Meaning:
- the player chooses not to force a thesis yet

Visual:
- neutral stance
- companions spread, scan, and pulse information

Gameplay:
- increases information quality
- reduces immediate reward
- improves safety and confidence recovery

### 7.4 Breakout Claim

Meaning:
- the player tries to convert a resistance threshold into owned territory

Visual:
- wall fracture
- rails or shards flying upward
- team silhouette crosses the line

Gameplay:
- if successful, objective swing and momentum bonus
- if failed, recoil, hesitation, and exposure

### 7.5 Rejection

Meaning:
- price touched a level but could not own it

Visual:
- bounce spark
- wall flash
- body knockback

Gameplay:
- confidence loss for the aggressor
- counter window for the defender

### 7.6 Liquidation

Meaning:
- a badly overcommitted position gets structurally punished

Visual:
- formation collapse
- sudden downward or upward devour effect
- companion panic or scatter animation

Gameplay:
- heavy HP and confidence damage
- memory writeback candidate
- strong reflection reward if survived and learned from

## 8. Player and Companion Model

### 8.1 Field Composition

The player field presence is:

- `Player Avatar`
- `Companion 1`
- `Companion 2`
- `Companion 3`

The player avatar is the visible executor of commitment.
The companions are the trainable agents.

### 8.2 Companion Roles

MVP roles:

- `Scout`
  - discovers candidate zones
  - extends visible battle forecast
- `Analyst`
  - strengthens long or short thesis confidence
  - increases interpretation quality
- `Risk`
  - warns of trap, liquidation, or failed chase
  - improves retreat timing and survival

### 8.3 Formation Rule

Default field read:

- player avatar stays at the center of the micro formation
- companions occupy stable follow offsets
- during commitment, one or more companions break formation briefly to express role contribution

Example:

- Scout dashes ahead to mark a breakout gate
- Analyst projects a thesis line onto a resistance wall
- Risk drops a warning dome over a liquidation trap

Companions should not constantly run independently in MVP.
They should mostly read as "decision satellites" attached to the player.

## 9. Movement Model

### 9.1 Traversal States

- `Traverse`
  - moving across chart terrain
  - no precise combat overlay
- `Aim`
  - choosing a position to commit
  - tactical overlay appears
- `Clash`
  - battle logic active
  - high readability, short duration
- `Resolve`
  - outcome display
  - damage, objective shift, memory candidate display
- `Retreat`
  - fallback or reset motion

### 9.2 Vertical Movement

Units may:

- stand directly on a candle close line
- hover slightly above structure lines
- drop below the close line when losing ground
- leap between support footholds

This means the field is not a strict platformer surface.
It is a readable tactical motion layer derived from price structure.

### 9.3 Tactical Lock

Inspired by tactical RPG readability, the active battle slice may enter `Tactical Lock`.

In this mode:

- a soft grid overlays the active chart zone
- movement is shown in discrete local tiles
- the full chart remains visible underneath
- AP, action ranges, and hazard zones become explicit

Use this mode only when:

- the player is selecting commit direction
- a clash is about to begin
- a special skill requires precise local placement

Do not keep the grid on permanently.
The chart must remain the primary visual identity.

## 10. Battle Trigger Rules

Battle does not happen on every candle.
Battle starts when a decision is contested or risky enough to matter.

### 10.1 Trigger Families

- `Contested Commitment`
  - player long or short overlaps rival ownership
- `Breakout Attempt`
  - player challenges a resistance or support threshold
- `Trap Activation`
  - commitment intersects liquidation zone or false move zone
- `Volatility Event`
  - scripted movement spike destabilizes local terrain
- `Opportunity Clash`
  - a rare high-value zone appears and both sides converge

### 10.2 Non-Battle Moments

These should remain exploration or scouting:

- low-signal noise regions
- flat range zones with no commitment
- post-result cooldown movement

This prevents the game from turning every movement beat into meaningless combat.

## 11. Match State Machine

Recommended player-facing phase order:

1. `Survey`
   - read chart and visible structures
2. `Mark`
   - Scout and Analyst identify candidate commitment zones
3. `Commit`
   - player chooses long, short, or hold
4. `Clash`
   - local battle resolves against opposing pressure
5. `Resolve`
   - objective, HP, confidence, and zone ownership update
6. `Reflect`
   - lesson cards and companion growth are awarded

Internal system alignment can still map these onto:

- OBSERVE
- RETRIEVE
- REASON
- DECIDE
- RESOLVE
- REFLECT

## 12. Objective and Failure Model

### 12.1 What Victory Means

Victory is not "made money."
Victory means:

- committed in a structurally valid place
- survived the risk profile
- correctly captured or defended territory
- coordinated the squad well
- extracted useful learning

### 12.2 What Score Should Measure

- structural correctness of entry
- thesis quality
- timing quality
- risk discipline
- survival
- companion coordination
- memory value generated

### 12.3 Failure States

- `Bad Thesis`
  - entered against obvious structure
- `Late Chase`
  - entered too late into exhaustion
- `Trap Death`
  - ignored warning signs
- `Panic Exit`
  - abandoned good structure too early
- `Coordination Failure`
  - companions were trained badly or brought the wrong composition

Failure must still reward understanding, if the player extracted a useful lesson.

## 13. Reward Model

The game rewards learning and team building.

### 13.1 Persistent Rewards

- `Agent XP`
- `Bond`
- `Confidence ceiling`
- `Memory Cards`
- `Doctrine unlock progress`
- `Artifact drops`
- `Scenario mastery`

### 13.2 Memory Card Types

- `Support Respect`
- `Failed Breakout`
- `Trap Avoidance`
- `Late Entry Punishment`
- `Momentum Confirmation`
- `Range Patience`

These are not lore collectibles.
They are training assets that affect future matches.

## 14. UI and UX Contract

### 14.1 Required Battlefield UI

- chart background with visible historical structure
- active battle slice emphasis
- player avatar and 3 companions
- current commitment marker
- rival pressure indicator
- objective meter
- HP and confidence displays
- companion role indicators
- event log
- reflection summary after match

### 14.2 Layout Rule

- the chart must remain readable as a chart first
- combat overlays must feel like tactical instrumentation on top of the chart
- old commitment markers should fade, not disappear
- the player should see both present tension and historical context at once

### 14.3 Visual Priority

Priority from highest to lowest:

1. current commitment and danger
2. player avatar and companions
3. active structures in the battle slice
4. objective and health feedback
5. historical background chart
6. secondary particles and decorative effects

## 15. MVP Definition

MVP battlefield should support:

- one coin chart at a time
- visible historical chart backdrop
- active combat slice on top of it
- player avatar plus 3 companions
- long, short, and hold
- support, resistance, breakout, and liquidation zone types
- one short clash loop
- one reflection and memory reward loop

MVP does not need:

- live market sync
- full open-world exploration
- fully autonomous companions
- dozens of companion classes
- deep economy or gacha systems

## 16. Acceptance Criteria

This rulebook is correctly implemented when a new player can look at a battle scene and immediately understand:

- which part of the chart is the current combat zone
- whether a long or short was just committed
- whether the team is attacking upward or being forced downward
- what each of the 3 companions is helping with
- whether the result was a good read, bad read, trap, or breakthrough

If the player only sees "RPG units over a finance background," the implementation has failed.
