# Visual World Design

Status: canonical  
Scope: visual feel, camera, movement, environment density, coordinate readability, and UI tone for the chart world

## Purpose

Define how Cogochi should look and read on screen without changing the technical stack or the product thesis.

This document exists because battlefield rules alone are not enough.
The player must be able to read the screen as both a chart and a game world.

It defines:

- rendering priorities
- camera behavior
- movement readability
- world density
- UI layering
- the balance between chart legibility and game-world presence

## Non-Negotiable Constraint

Cogochi remains:

- SvelteKit
- TypeScript
- Canvas 2D
- chart-first battlefield

This document changes feel and readability, not engine choice.

## Core Feel Goal

The player should feel:

- "I am walking through a living market landscape"
- "my 3 agents are companions, not UI widgets"
- "the chart is history-rich terrain, not a black trading screen"
- "combat is a punctuating event inside an exploration and training loop"

The player should not feel:

- cyber terminal
- esports HUD
- sterile finance dashboard
- constant combat stress

## Experience Split

The game should alternate between two visual modes.

### Explore Mode

Primary mood:

- calm
- legible
- inviting
- world-first

Rules:

- full chart remains visible as terrain
- UI stays quiet
- movement is soft and readable
- companions idle, drift, and react with personality
- environment details carry memory of old positions and market events

### Clash Mode

Primary mood:

- tense
- precise
- high-contrast
- short-duration

Rules:

- active battle slice becomes emphasized
- tactical overlay may appear temporarily
- effect density rises only around the contested zone
- after the clash, the screen must relax back into Explore Mode

## Art Direction

### Palette

Base palette should be warm and earthy.

Preferred families:

- slate blue for deep background
- desaturated teal for market flow
- olive and sage for safe regions
- ochre and amber for opportunity
- brick and wine for danger
- cream and sand for panels and highlights

Avoid:

- neon cyan as default identity
- saturated red-green trading palette across the whole screen
- pure black backgrounds
- scanline and terminal effects as constant overlays

### Chart As World

The chart should read like terrain.

Mapping:

- candles become ridges, steps, walls, or soft slopes
- moving averages become old roads, wind paths, or magical current lines
- support becomes grounded platforms
- resistance becomes cliff walls or barricades
- liquidity zones become hazard flora, trap pits, or unstable crystal fields
- old entries become flags, scars, shrines, or faded markers

The player must recognize the underlying chart, but the screen should still feel like a world.

## Rendering Spec

### Internal Resolution

Recommended internal render target:

- `320x180` for strict retro look
- `480x270` for slightly richer readability

Use integer upscaling only.

### Pixel Rules

- all sprite work should align to a fixed pixel grid
- no subpixel scaling on character sprites
- camera smoothing is allowed, but sprite sampling must remain crisp
- background terrain can use limited subpixel motion only if it does not blur the pixel read

### Sprite Size

- player: `16x24` or `16x32`
- companions: `12x16` or `16x16`
- major structures: multiples of `16`

## Camera Spec

Camera should feel gentle, not tactical by default.

Rules:

- soft follow on player
- small look-ahead in move direction
- slight vertical easing when traversing chart slopes
- active clash zoom-in is allowed
- hard snap only on major commitment moments

Avoid:

- permanent full-screen shake
- aggressive zoom pulsing
- fighting-game style snap cuts in exploration

## Movement Spec

Movement must feel alive before it feels tactical.

Required states:

- idle
- walk
- run
- interact
- think
- commit-long
- commit-short
- hit
- recover

Required feel:

- gentle acceleration and deceleration
- idle bob or breathing
- visible foot planting on chart terrain
- small landing compression when dropping to lower price bands
- companion follow delay so the team feels organic

## Companion Feel Spec

The 3 trainable agents are companions first, roles second.

They must feel:

- loyal
- readable
- trainable
- emotionally distinct

They must not feel:

- floating badges
- interchangeable drones
- permanent combat summons

Behavior in Explore Mode:

- Scout roams slightly ahead, then returns
- Analyst pauses, points, or emits reading cues
- Risk lingers nearer to the player and warns around hazard zones

Behavior in Clash Mode:

- each companion briefly breaks formation to express role contribution
- they return to formation after the action resolves

## Environment Density Spec

The current prototypes are too sparse and too HUD-dominant to feel cozy.

Every active map slice should contain some mix of:

- path markers
- old trade flags
- tiny plants or ambient particles
- zone-specific props
- ruins or remnants of prior battles
- visual traces of support and resistance history

The battlefield should feel inhabited by memory.

## UI Tone Spec

UI should support the world, not dominate it.

Rules:

- default panels use muted surfaces and low-contrast borders
- pixel font for labels, softer mono or readable bitmap font for body copy
- key battle data stays visible, but noncritical chrome should stay quiet
- persistent top-and-bottom tactical bars should be minimized outside clashes
- reflections and rewards should feel like journal pages, field notes, or keepsakes

Avoid:

- always-on esports HUD
- trading terminal framing
- loud damage numbers everywhere
- constant flashing objective meters

## Audio Direction

Explore Mode:

- soft loops
- environmental ticks
- low-intensity ambient motifs

Clash Mode:

- short, sharp emphasis
- percussive but not metallic overload

Return to calm quickly after resolution.

## Acceptance Criteria

This spec is successful when:

- a screenshot without combat still feels like a place worth walking through
- the player and 3 companions look like a traveling team
- the chart remains readable without feeling like a finance UI screenshot
- entering combat feels like an escalation from exploration, not the permanent base state
- the player can imagine tending, training, and revisiting the same chart world over time
