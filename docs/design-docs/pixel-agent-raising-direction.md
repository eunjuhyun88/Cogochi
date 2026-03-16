# Pixel Agent Raising Direction

Status: proposed  
Scope: raising surfaces and companion-facing UI  
Depends on: `docs/VISUAL_WORLD_DESIGN.md`, `docs/BATTLEFIELD_DESIGN.md`, `docs/product-specs/raising.md`

## Purpose

This document defines how Cogochi should use polished pixel art to make agent raising feel warm, ownable, and game-like without turning the product into a detached retro homage.

The goal is not "make it look like Pokemon."
The goal is:

- immediate attachment
- clear sprite readability
- durable charm across repeated sessions
- seamless continuity between raising surfaces and chart battle scenes

## Core Thesis

The agent sprite is the emotional anchor.
The chart is still the battlefield.

Pixel art should increase ownership and warmth around the agent, while the chart remains the spatial and tactical truth.

If the pixels overpower the chart, this direction has failed.
If the chart stays readable but the agent feels lifeless, this direction has failed.

## Desired Emotional Read

The player should feel:

- "this little thing is mine"
- "it has habits"
- "it remembers what happened"
- "it got stronger because I trained it"

The player should not feel:

- "this is a random mascot sticker"
- "this is a nostalgia skin pasted over a chart tool"
- "this is a pet sim that forgot the battle layer"

## Pixel Art Principles

### 1. Silhouette first

Every agent must be identifiable from silhouette before detail.

Rules:

- one dominant body shape
- one readable head or face anchor
- one asymmetrical accent for role identity
- no noisy micro-detail that disappears at small scale

### 2. Limited palette, high taste

The sprites should feel intentional, not muddy.

Rules:

- 5 to 8 core colors per agent body
- 1 role accent color family
- 1 highlight tone for charm or memory glow
- avoid full-rainbow noise
- avoid automatic gradients

### 3. Crisp pixels, soft shell

The sprite itself should remain strict pixel art.
The surrounding UI shell may be soft, premium, and slightly tactile.

Rules:

- nearest-neighbor scaling only
- integer scale only
- no blurred sprite transforms
- no subpixel motion on the sprite layer
- surrounding cards and panels may use soft shadows and rounded hardware-like framing

### 4. Animation with restraint

The charm comes from tiny motions, not constant movement.

Rules:

- idle: 4 to 6 frames
- blink or face twitch: 2 to 3 frames
- walk: 4 frames
- emote or training cue: 3 to 5 frames
- battle tell: short and legible, never effects soup

## Recommended Asset Sizes

For MVP, keep one asset ladder:

- `world sprite`: 24x24 px
- `profile sprite`: 48x48 px
- `hero portrait panel`: 96x96 px
- render scale target in UI: 3x or 4x integer scale

Why:

- 24x24 is large enough for personality
- 48x48 supports agent detail without exploding production cost
- 96x96 lets the user feel ownership on detail screens

## Visual Language By Surface

### `/roster`

Goal:
the stable should feel like a warm team shelf, not a database

Direction:

- use grid or shelf-like cards with large sprite presence
- show nickname first, systems second
- show one visible mood or lesson chip
- let active party members feel physically grouped

### `/agent/[id]`

Goal:
this is where attachment locks in

Direction:

- large sprite or bust on the left
- journal or field-note panel on the right
- one visible "current growth" marker
- small idle animation always present
- training action buttons feel like caring for a specialist, not editing JSON

### `/lab`

Goal:
training should feel hands-on and craft-like

Direction:

- present actions as benches, stations, or indexed modules
- each action has one sprite reaction preview
- use tiny pixel props like notebooks, chips, ribbons, data capsules, or tuning rigs
- avoid clinical terminal framing

### `/team`

Goal:
the party should feel like a bonded travel group

Direction:

- show the four agents together in one shared composition
- use position spacing to imply squad chemistry
- represent missing role coverage visually, not only with text

## Chart Compatibility Rules

The chart remains the battlefield grammar.

Rules:

- raising surfaces can be character-forward, but battle surfaces must remain chart-forward
- sprite size in battle must never obscure critical candle structure
- companions should stand on or near readable chart structures, not float arbitrarily
- role effects should reinforce terrain meaning instead of replacing it
- resistance, support, trap, and breakout markers must stay more legible than decorative particles

## Detail Quality Bar

To feel polished, the sprite work needs deliberate craft.

Required:

- clean outlines with controlled line weight
- selective interior shading
- minimal but intentional anti-jag correction by hand
- accessory and role markers that read at small scale
- one charming face cue or motion cue per agent

Avoid:

- pillow shading
- AI-generated texture noise
- too many accessory bits
- mixed resolutions inside one sprite
- trying to fake polish with filters

## Theme Direction

The closest target mood is:

- retro handheld intimacy
- quiet, premium shell
- field notebook warmth
- tactical seriousness underneath the charm

This means:

- muted backgrounds
- restrained highlight colors
- tactile panel edges
- pixel characters as the emotional focus
- chart overlays as the strategic focus

## OpenClaw-Style Starter Direction

For a starter companion similar to the reference:

- keep the body geometry simple and sturdy
- enlarge one facial cue so the expression survives small sizes
- give it one memorable gait or idle bounce
- attach role identity through one visible accessory, marking, or orbiting cue
- make growth changes readable through silhouette additions before color swaps

Good growth cues:

- scarf or harness upgrade
- memory charm
- antenna or sensor growth
- stance confidence change
- small companion tool or badge

Bad growth cues:

- giant armor piles
- anime VFX aura covering the sprite
- random palette swaps with no role meaning

## Production Guidance

For early implementation:

- lock one starter species and one alternate palette family first
- make one excellent sprite set before building many average ones
- test the sprite at actual UI size before approving detail
- review all assets against both light UI panels and chart backgrounds

## Acceptance Criteria

This direction is correct when:

- a player instantly wants to click an agent card because the sprite feels alive
- the agent remains readable at both roster size and battle size
- training feels emotionally satisfying before the battle begins
- battle still reads as chart-native after companions are added
- the overall UI feels premium and intentional rather than generic retro cosplay
