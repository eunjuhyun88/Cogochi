# Cogochi Visual System Direction

Status: stable design direction
Last updated: 2026-03-15

## Purpose

Define one executable visual system for Cogochi so the current prototype stops reading like three different products:

- a cozy field mockup
- a battle analytics console
- a clean journal dashboard

This document does not replace the canonical battlefield or world rules.
It translates them into a shared visual language for:

- `/field`
- `/battle`
- `/journal`
- `/agent/[id]`
- `/lab`

## Why This Needs Its Own Direction

The current prototype already proves useful product ideas:

- the field has calm travel and readable companions
- the battle screen proves deterministic command logic
- the journal surfaces next care pressure clearly

But the screens still feel visually disconnected.
The player can understand the logic without fully feeling that they are raising one squad through one world.

Current gap summary:

1. The field is closest to the intended fantasy, but still feels sparse and node-driven rather than memory-rich.
2. The battle surface is mechanically strong, but too much of the screen reads like a report viewer below the stage.
3. The journal is clear, but it feels like an operations dashboard instead of a return shrine, notebook, or keepsake table.
4. Growth is mostly explained with text chips instead of visible body, gear, marker, and world changes.

## Target Player Read

Within 10 seconds, the player should feel:

- "This is one world made from chart history."
- "These creatures are my squad, not four icons attached to tools."
- "Battle is a short spike of tension inside a calmer raising loop."
- "What changed after the last proof is visible on the creature or in the world."

If the player instead feels:

- "This is a nice dashboard with sprites."
- "Battle is the real game and everything else is admin."
- "Journal is a card grid of summaries."

then the visual system has failed.

## Primary Aesthetic Mix

Following the MDA rule, Cogochi should optimize for two primary aesthetics only:

1. `Discovery`
   - walking through readable chart history
   - noticing old scars, flags, traps, and proof remnants
2. `Challenge`
   - one short clash with clear vertical ownership and readable commitment risk

Supporting emotional outcome:

- `Ownership`
  - not a separate aesthetic target
  - an earned result created by visible growth, keepsakes, and repeat contact with the same squad

## North Star

Cogochi should look like:

`a warm chart diorama where a small loyal squad crosses remembered market terrain, enters a brief high-contrast clash, and returns carrying visible proof scars and keepsakes`

This means:

- world first, HUD second
- creature first, panel second
- memory traces first, abstract data chrome second

## Non-Negotiable Visual Rules

1. The chart must remain legible as the underlying terrain.
2. Vertical pressure ownership must be instantly readable in battle.
3. The field must relax the screen before and after clashes.
4. Growth must write onto the body, the kit, or the world, not only onto text.
5. Runtime guidance must appear as in-world signals or paper-like notes, not as command-center chrome.

## Rendering Decision

Cogochi should stay `2D-first` with `2.5D presentation accents`.

This means:

- canvas, SVG, and pixel-sprite layers remain the primary rendering stack
- depth is suggested through parallax, layered terrain, shadows, plate silhouettes, and camera easing
- the product should not pivot to full 3D scene rendering for the current alpha target

Reason:

- the chart must keep reading as time/price structure
- battle clarity depends on clean vertical ownership
- field attachment depends more on silhouette, pacing, and readable props than on polygon depth
- web performance and asset throughput are materially better under the current 2D stack

Short version:

- `2D logic`
- `2.5D feeling`
- not `full 3D conversion`

## Cross-Surface Integration Contract

Visual work must compose across surfaces instead of producing one-off mockup styles.

Rules:

- `/field` is the emotional baseline and should set the palette and material language for the rest of the product
- `/battle` may sharpen contrast, but it should still feel like the same world zoomed into a clash
- `/journal`, `/agent/[id]`, and `/lab` should inherit the same shell, paper, and keepsake language instead of falling back to generic dashboard panels
- shared shell styling belongs in `src/app.css` and `src/components/shared/PageShell.svelte`
- field-world staging belongs in `src/components/shared/FieldScene.svelte`
- battle-stage staging belongs in `src/components/shared/ChartBattlefield.svelte`
- route files should orchestrate overlays and controls, not redefine the visual system from scratch

Acceptance read:

- a player can move from field to battle and still feel they are inside one product
- a contributor can change one surface without accidentally inventing a new visual language

## Current Visual Diagnosis

### What Already Works

- The warm cream and moss palette already separates Cogochi from a finance dashboard.
- Pixel companions in the field already create the strongest sense of attachment in the prototype.
- The battle chart stage already communicates top-versus-bottom ownership better than earlier menu-first screens.

### What Is Off-Target

#### 1. One card language is doing every job

The same rounded translucent panel language appears in exploration, battle, journal, and mutation contexts.
That makes every surface feel equally "app-like".

#### 2. The battle surface spends too much attention below the fold

The chart stage is strong, but too many secondary panels compete with it.
The current read is:

- top: good battlefield
- bottom: analytics console

Battle should instead read:

- stage
- command choice
- verdict pressure
- only then deeper explanation

#### 3. The field is readable but not inhabited enough

The field still lacks enough persistent memory props:

- old flags
- prior proof scars
- support shrines
- trap flora
- camp-specific silhouettes

Without those, the world reads more like a route mockup than a lived-in chartland.

#### 4. Journal clarity is high but emotional weight is low

The journal currently explains what happened.
It does not yet feel like the place where a creature's learning becomes a keepsake.

## Visual Mode System

The whole product should operate in three visual modes.

### 1. Explore Mode

Routes:

- `/field`
- calm sections of `/roster`
- calm sections of `/agent/[id]`

Read:

- 75 to 85 percent of attention on the world or creature
- quiet top-left guidance
- minimal bottom chrome

Mood:

- warm
- breathable
- memory-rich

### 2. Clash Mode

Routes:

- `/battle`
- high-pressure moments in `/proof`

Read:

- 60 to 70 percent of attention on the active stage
- command deck as the main secondary read
- battle explanation compressed into fewer, stronger blocks

Mood:

- tense
- precise
- short

### 3. Return Mode

Routes:

- `/journal`
- post-verdict sections of `/agent/[id]`

Read:

- one latest verdict first
- one next care action second
- history as shelf, rail, or spread, not equal-priority dashboard tiles

Mood:

- reflective
- relieved
- slightly ceremonial

## Shared Visual Tokens

### Color Roles

- `deep slate`
  - deep background, clash stage, night memory
- `sage / moss`
  - safe ground, care, stable trust
- `ochre / amber`
  - objective, opportunity, promoted mutation
- `brick / wine`
  - trap, rejection, care debt, failed overreach
- `mist teal`
  - guidance, scout reads, runtime cue trails
- `cream / paper`
  - journal surfaces, notes, proof cards, keepsake labels

Rule:

- do not use saturated green and red as the full product identity
- reserve the strongest red/green contrast for local battle moments

### Shape Language

- `support`
  - broad rounded base blocks
- `resistance`
  - vertical slabs, barricades, cliff faces
- `objective`
  - banners, beams, stamped markers
- `liquidation / trap`
  - toothed edges, unstable shards, broken rails
- `memory`
  - flags, shrines, string tags, faded tracks
- `care`
  - bowls, tents, benches, soft lamps, wrapped notes

### Surface Materials

- `world`
  - matte, dusty, slightly fogged
- `clash`
  - dark glass and sharp highlight
- `journal`
  - paper, card, stitched cloth, stamp ink
- `mutation bench`
  - specimen tray, drafting board, clipped notes

## Surface-Specific Direction

### `/field`

Goal:

- feel like the true session home

Design rules:

1. Keep one compact route card in the upper-left, not a stacked mission HUD.
2. Replace abstract node identity with prop identity:
   - camp = tent, kettle, lamp, bedroll
   - lab = bench, antenna, tool rack
   - archive = stone well, shelves, hanging tags
   - journal = notice board, pinned paper, wax seal
   - gate = tall split marker, chain, pressure beam
3. Add proof remnants to the ground:
   - accepted mutation flags
   - reverted scar markers
   - proven frame sigils
4. Let runtime cues appear as beams, ribbons, fireflies, or pinned notes leading to a node.
5. Keep the party readable at all times; companions should do more work than labels.

Field layout ratio:

- 80 percent world
- 10 percent route card
- 10 percent local node prompt and party status

### `/battle`

Goal:

- feel like a short judged confrontation, not a report page

Design rules:

1. The stage must dominate the viewport, especially on first load.
2. The command deck should read like a battle menu, not a form:
   - four strong action tiles
   - one selected state
   - one execution prompt
3. Collapse secondary panels into three roles only:
   - captain call
   - mutation or verdict pressure
   - recent battle log
4. Move deep explanation behind expandable or later sections so the first screen stays battle-first.
5. Keep top-versus-bottom ownership brutally clear:
   - player pressure from below
   - rival pressure from above
6. After verdict, use a stamped outcome moment before routing onward:
   - KEEP
   - REVERT
   - QUARANTINE

Battle layout ratio:

- 65 percent stage
- 20 percent command deck and verdict pressure
- 15 percent deeper explanation

### `/journal`

Goal:

- feel like a return altar, notebook, and care station

Design rules:

1. The first block is one creature, one verdict, one next care action.
2. Replace dashboard-style equal cards with a visual hierarchy:
   - hero verdict card
   - care queue rail
   - keepsake shelf
   - older proof stack
3. Treat accepted mutations like keepsakes:
   - framed card
   - pinned tag
   - stamp
   - attached frame name
4. Care debt should feel tangible:
   - wrinkled note
   - cracked badge
   - faded trust ribbon
5. Use paper and board materials instead of generic app cards.

Journal layout ratio:

- 45 percent hero verdict
- 25 percent care queue
- 30 percent history and keepsakes

### `/agent/[id]` and `/lab`

Goal:

- make growth visible before the player enters proof

Design rules:

1. The creature portrait must be larger and more central than any numeric summary.
2. Growth must use layered body signals:
   - base body
   - role kit
   - mutation accessory
   - keepsake slot
3. Proven frames should appear as stamps, charms, or banner tags, not only text chips.
4. The mutation bench should read like a crafted experiment table:
   - current weak instinct
   - proposed change
   - projected visible change
   - bound proof pack
5. When a change is unproven, its visual treatment should look provisional.

## Sprite and Prop System

To keep placeholder assets usable while enabling visible evolution, every creature should support a simple layered stack:

1. `base body`
2. `role kit`
3. `mutation overlay`
4. `keepsake or proven-frame charm`

This allows the team to keep one body family while still showing:

- role identity
- trust growth
- accepted mutations
- care damage

The world should use a matching prop kit:

- camp props
- lab props
- archive props
- gate props
- proof remnant props

## Motion Language

### Explore Motion

- idle bob
- short glance turns
- companion lag and regroup
- slow node pulse
- drifting dust or spores in safe zones

### Clash Motion

- commit squash then launch
- barrier crack or rebound
- quick callout burst
- brief recoil on failed push
- verdict stamp with one strong settle frame

### Return Motion

- note pin
- stamp press
- ribbon tie
- charm hang
- creature relax or slump depending on care state

Rule:

- do not fill the product with constant animation
- keep motion meaningful and tied to state change

## Typography Direction

Use three reading roles only:

1. `display labels`
   - pixel or bitmap-styled
   - short words only
2. `body and guidance`
   - readable sans
   - calm tone
3. `chart and proof values`
   - mono or tabular treatment

Do not let battle copy blocks become the dominant visual mass.

## What To Avoid

- equal-width dashboard card grids as the default layout language
- permanent white or cream app cards inside clash mode
- neon terminal motifs
- finance-red-versus-finance-green as the whole brand
- floating badges that replace companion behavior
- text chips used as the only visible proof of growth

## Execution Priority

### Phase 1: Layout and Material Split

- separate field, clash, and journal material systems
- reduce battle below-fold density
- increase journal hierarchy

### Phase 2: In-World Identity

- add node prop kit
- add proof remnant kit
- add runtime cue world signals

### Phase 3: Visible Growth

- add layered sprite stack
- add keepsake and mutation overlays
- write proven frames onto creatures and field props

## Acceptance Checks

The direction is working when a first-time viewer can answer these quickly:

1. Where do I go next?
2. Which part of the chart is dangerous?
3. Which creature just changed?
4. What did the last proof decide?
5. Why does the field feel like the same world as the battle?

If those answers require reading several panels, the visual system still needs work.
