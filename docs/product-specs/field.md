# Surface Spec: field

- Status: proposed
- Canonical route entry: `/field`
- Surface ID: `field`

## Purpose

`field` is the surface family that makes Cogochi feel like a real web game instead of a set of disconnected management screens.

It must let the player:

- move through a chart-native top-down world
- travel with a four-slot squad
- see where the next clash is happening
- enter battle from the world instead of from a sterile menu
- return to camp with a new lesson and next care action

If `field` feels like a generic town map, a dead lobby, or a detached route hub, this surface has failed.

## Problem

The current runtime proves roster, lab, and battle ideas, but the loop still feels too menu-like.

Without a true field layer, the player does not get:

- travel attachment
- party presence
- calm-between-clashes pacing
- a satisfying return loop after battle

That blocks the product from feeling like a judgment RPG.

## Primary Persona

- Role: crypto-native player who wants a gameful training loop, not only a chart tool
- JTBD: "When I come back to train my agents, I want to walk my squad through a readable chart world, so that battles feel like destinations and my agents feel like companions."
- Current alternatives:
  - menu-heavy prototypes
  - cozy top-down RPGs with no judgment meaning
  - chart tools with no travel or squad fantasy
- Why those fail:
  - menu-heavy prototypes break immersion
  - cozy RPGs lose the chart-native thesis
  - chart tools have no party identity or session rhythm

## One-Line Definition

Cogochi `field` is the chart-world surface where the player leads a four-slot squad through a top-down market landscape, enters clash gates, and returns with reflection and care pressure.

## Core Outcome

After one short session, the player should be able to say:

- where their squad is going
- why this next chart clash matters
- what changed after the last battle
- what they should do next before re-entering the gate

## Interaction Principles

- Travel matters: battle should be approached, not teleported to by default.
- Chart-first terrain: the world must still read as transformed chart structure.
- Quiet exploration: the field should calm the player before the next clash.
- One clear destination: each visit should surface one best next objective.
- Squad presence over UI chrome: companions should do more emotional work than HUD elements.
- Return loop clarity: after battle, the player must know where to go to repair, tune, or re-enter.
- Runtime guidance stays in-world: the nightly distill and next proof pressure should point to a field node without forcing the player into `/journal` first.
- The next node should read as a beacon in the world, not only as a HUD sentence.

## Happy Path

1. The player enters `/field` at camp with the active squad already visible.
2. The field highlights one meaningful next destination such as the lab bench, archive well, or battle gate.
3. A runtime cue on the field names the next best repair or proof node after the latest return.
4. The player walks the squad through a compact chart-shaped path and sees companion follow behavior.
5. The player interacts with one care or training node if needed.
6. The player reaches the battle gate and enters a clash with clear terrain and objective cues.
7. The battle resolves and writes back a lesson, keepsake chance, and care state.
8. The player returns to camp or journal space and receives one recommended next action.

## Key Areas

### `Camp`

Purpose:
restore orientation and show squad state

### `Archive Well`

Purpose:
inspect or curate memory

### `Lab Bench`

Purpose:
edit doctrine, script, indicator, and risk

### `Battle Gate`

Purpose:
enter the next scenario from the world

### `Journal Board`

Purpose:
read the last lesson and next care action

## Must Have

- A top-down field route exists in app code.
- The active squad is visible as a four-slot travel party.
- Party members have readable follow behavior and role flavor.
- The field has at least one battle gate, one care/training node, and one return point.
- The chart shape remains visible in terrain height, walls, and hazard placement.
- Explore Mode and Clash Mode feel distinct but connected.
- The player can enter battle from the field and return with updated squad state.
- The field shows the next best destination without loud quest UI.
- The field consumes runtime distill output and turns it into a visible next-node cue on the HUD.
- The field consumes runtime distill output and turns it into a visible next-node beacon in world-space.
- If the player returns from battle with a `ProofArtifact`, the field uses that artifact as the first source of truth for return framing instead of rebuilding the result from scattered query params.
- canonical post-verdict return from battle should usually carry `artifact` as the main transport token and only fall back to raw `return/verdict/frame/gate` fields for older links or non-artifact entry paths.

## Should Have

- Simple idle behavior at camp.
- A safe spar gate distinct from the main battle gate.
- Small world memories such as markers, flags, or shrines from prior runs.
- Leader swap or quick squad reorder.
- Soft day/night or scenario mood tinting.

## Won't Have In v1

- a large open world
- NPC quest chains
- random enemy swarms
- full action combat on the overworld
- jump puzzles or precision platforming
- crafting or inventory economy

## Non-Goals

- turning Cogochi into a generic cozy RPG
- hiding battle entry behind long travel chores
- replacing chart meaning with arbitrary fantasy terrain
- using the field as decoration while all real interaction stays in menus

## Done Means

- The player can travel with the squad in a real field route.
- The player can identify camp, care, and battle destinations without opening a separate menu.
- The field gives the session a calmer rhythm before and after clashes.
- Entering battle from the field feels more meaningful than launching it from a dropdown.
- The field writes back to roster, care, and reflection instead of acting like a dead wrapper.
- The player can see the next repair or proof target directly from the field after returning from a clash.

## Context Contracts

### Routes

- `/field`
  - top-down travel, interact nodes, battle gate entry, return loop
- depends on:
  - `/roster`
  - `/agent/[id]`
  - `/lab`
  - `/battle`

### Stores

- `rosterStore`
  - active squad, growth state, visible changes
- `labStore`
  - next training edits and care actions
- `battleStore`
  - current clash entry and result return
- `proofStore`
  - canonical proof/battle result packet used for field return framing
- future likely store:
  - `fieldStore`

### Dependencies On Other Specs

- `field` depends on `core` for session framing.
- `field` depends on `raising` for squad attachment and care meaning.
- `field` depends on `docs/BATTLEFIELD_DESIGN.md` and `docs/VISUAL_WORLD_DESIGN.md` for chart-to-world translation.

## Deep Links

- `docs/product-specs/core.md`
- `docs/product-specs/raising.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`
- `docs/design-docs/chartfield-fullgame-direction.md`
- `docs/design-docs/judgment-tamagotchi-loop.md`
