# Cogochi Trainer Hub Character Layout

Status: proposed  
Scope: `/` trainer hub, hub-facing raising UI, customization/state layout, return-loop framing  
Depends on: `docs/product-specs/core.md`, `docs/product-specs/raising.md`, `docs/MASTER_GAME_SPEC.md`, `docs/AGENT_SYSTEM_DESIGN.md`

## Purpose

This document defines the missing trainer-hub layout that turns Cogochi's home surface into a true character-raising screen instead of a summary dashboard.

The player request is explicit:

- keep one owned character at the visual center
- show readable stats on the left
- let the player customize, gift, tune, and grow that character from the same screen
- send the player into battle from that home state
- return from battle with visible character change

If the home surface still reads like analytics chrome with a mascot attached, this direction has failed.

## Core Thesis

Cogochi should not hide its main emotional payload in subpages.

The home surface should immediately say:

- `this is my agent`
- `this is how it is doing`
- `this is how I can care for or improve it`
- `this is the next thing we are going to do together`

The correct home pattern is:

`left = state`  
`center = ownership and character`  
`right = action and change`

This is closer to a trainer room, character station, or companion care bay than to a menu hub.

## Problem

Current Cogochi docs already define:

- trainer ownership
- raising and care
- field travel
- battle proof
- reflection and writeback

But the home layout contract is still too abstract.

Without a concrete trainer-hub composition:

- `/` risks becoming a dashboard
- `/roster` risks carrying too much attachment weight alone
- customization feels bolted on
- stats and care actions get buried behind tabs
- battle return has no strong emotional landing zone

The player should not need to mentally assemble the product fantasy from three different screens.

## One-Line Definition

Cogochi `trainer hub` is the center-character home screen where the player reads one owned agent's current state, customizes and tunes it, sees the active party around it, and launches the next battle or proof loop.

## Relationship To Existing Surface Specs

- `core` owns the home route and overall trainer-state framing.
- `raising` owns attachment, care, visible growth, and agent-specific training meaning.
- this document defines the concrete home-screen composition that connects those two surfaces.

This does not replace `/roster` or `/agent/[id]`.
It gives `/` a stronger emotional and functional identity.

## Emotional Goals

The player should feel:

- `my main companion is alive here`
- `the rest of my squad belongs with it`
- `I can read what changed at a glance`
- `if I tweak something, I will see it immediately`
- `after battle, I come back here to absorb the result`

The player should not feel:

- `this is a shell page before the real screens`
- `the creature is decorative while the real game is in panels`
- `customization and training are disconnected systems`

## Screen Architecture

### Base Layout

```text
┌────────────────────────────────────────────────────────────────────┐
│ Top Bar                                                           │
│ trainer name | season/progress | currencies | recommended next run │
├────────────────────────────────────────────────────────────────────┤
│ Left Rail              Center Stage               Right Rail       │
│ state and history      owned character            change panel     │
│ readable stats         active squad               customization     │
│ recent lessons         reactive idle              growth verbs      │
│ care pressure          equipment preview          memory/doctrine   │
├────────────────────────────────────────────────────────────────────┤
│ Bottom Dock                                                        │
│ gift | outfit | memory | train | team | log | deploy               │
└────────────────────────────────────────────────────────────────────┘
```

### Layout Rule

The center stage must be visually dominant.

Approximate width split:

- left rail: 25 percent
- center stage: 45 percent
- right rail: 30 percent

On smaller screens:

- center stage stays first
- left and right rails collapse into bottom-sheet or tabbed drawers
- `deploy` remains pinned and always reachable

## Center Stage

### Role

The center stage is the ownership anchor.
It is where the player reads the companion as a body, not as a row.

### Must Show

- one primary owned agent at large scale
- up to three visible squad companions around it
- idle animation or mood reaction
- currently equipped visible items or growth markers
- one immediate context cue:
  - battle-ready
  - care needed
  - fresh lesson
  - specialization ready

### Interaction Rules

- clicking the main body opens quick interaction actions, not a generic details modal
- changing outfit, gift, keepsake, or role kit must update the stage immediately
- post-battle changes should first appear here before the player reads deeper notes

### Stage Composition

- main agent in the center
- companions at stable side or rear offsets
- environment props reflect current hub mode:
  - lamp, notebook, bench, flags, memory tags, training props
- no heavy HUD framing inside the stage

### Stage States

- `calm`
  - normal hub idle
- `focused`
  - player is tuning or previewing a growth change
- `ready`
  - deploy recommended or proof queued
- `care`
  - memory drift, doctrine blur, or confidence shake needs attention
- `return`
  - battle just ended; new lesson or reward is being applied

## Left Rail: State Panel

### Role

The left side exists to answer:

- how is this agent doing right now
- what changed recently
- is something healthy, risky, or neglected

It should read like a trainer clipboard, not a devtool inspector.

### State Groups

#### 1. Identity

- agent name
- archetype or family
- functional role
- combat expression role
- current specialization title

#### 2. Headline Stats

These are the first-read stats.

- `Level`
- `Bond`
- `Memory Quality`
- `Risk Discipline`
- `Specialization Progress`
- `Current Form`

These should be shown as bars, badges, or short labels rather than raw numbers only.

#### 3. Recent Result

- last battle outcome
- last lesson title
- current recommended next action
- recent mood or confidence state

#### 4. Care Pressure

- memory drift
- doctrine blur
- confidence shake
- squad friction

Each should display as:

- clear
- watch
- act now

#### 5. Expanded Detail

This is collapsible and not required for first read.

- artifact quality
- doctrine profile
- scenario affinity
- recent training history
- proof streak or validation history

### Left Rail Rule

The player should understand state without reading internal model terms like:

- embedding health
- retrieval token budget
- inference variance

Those may exist deeper in the system, but not in the first-read rail.

## Right Rail: Change Panel

### Role

The right side is for agency.
This is where the player changes what the character is wearing, carrying, remembering, or preparing for.

### Primary Tabs

#### `Customize`

- outfit
- role kit accessory
- keepsake slots
- skin variants
- idle expression set

#### `Care`

- gift
- calm
- restabilize
- bond interaction
- lesson review shortcut

#### `Growth`

- specialization node
- signature move progress
- stat-facing growth preview
- next unlock preview

#### `Memory`

- recent memory cards
- curate or pin
- suppress stale lesson
- highlight next useful recall

#### `Doctrine`

- prompt tone
- tactical tendency
- risk posture
- upcoming scenario fit

### Interaction Rules

- the right rail must preview the likely result before confirmation
- every change should answer `why this matters in battle`
- body-facing changes must visually echo on the center stage immediately
- judgment-facing changes must show a concise battle consequence preview

## Bottom Dock

The bottom dock holds fast verbs.

Recommended actions:

- `Gift`
- `Outfit`
- `Memory`
- `Train`
- `Team`
- `Log`
- `Deploy`

Rules:

- `Deploy` is always the strongest CTA
- the other actions should feel like prep or care, not route changes
- the dock should not become a crowded tab bar with ten equal items

## Top Bar

Keep the top bar lightweight.
It should show only:

- trainer identity
- trainer progression currencies
- current active objective
- one recommended next proof or battle

Avoid filling this area with battle analytics.

## Stats Model

The hub should use two stat layers.

### Player-Legible Stats

These are always visible.

| Stat | Meaning | Typical source |
| --- | --- | --- |
| Level | overall growth and unlock threshold | agent XP |
| Bond | trust and emotional sync | repeated use, gifts, good care |
| Memory Quality | how reliably the right lesson comes back | curation and durable reflection |
| Risk Discipline | how well the agent avoids bad commitments | battle outcomes and doctrine tuning |
| Specialization | how distinct the role identity has become | repeated validated role play |
| Form | current health of care state | recent wins, losses, care actions |

### Advanced Internal Stats

These are optional and shown only in deeper panels.

- doctrine stability
- scenario affinity
- artifact quality
- proof confidence
- validation streak

The home surface should not lead with these.

## Customization Model

Customization must be present, but it must not collapse judgment progression into vanity dressing.

### Cosmetic Layer

- outfits
- palettes
- scarves, badges, harnesses
- room props
- idle emotes

### Growth Layer

- role kit overlays
- specialization markers
- memory charms
- signature move cues
- proven-frame or lesson keepsakes

### Rule

Cosmetic changes can reinforce attachment.
Growth changes must reflect judged behavior.

Do not let pure gift or outfit usage directly increase battle quality.

## Reward Economy Split

Use separate reward tracks so the home hub can support both care fantasy and judgment progression.

### Trainer Rewards

- `Research`
- `Unlock Progress`
- `Style Materials`
- `Hub Props`

### Agent Rewards

- `XP`
- `Bond`
- `Memory Cards`
- `Specialization Progress`
- `Artifact Fragments`

### Reward Rule

The player should feel:

- `my judgment improved the character`

not:

- `my fake profit purchased power`

Rewards should come from:

- judgment quality
- discipline quality
- squad fit
- reflection quality

not raw PnL fantasy.

## Battle Return Loop

The hub is not only a launch pad.
It is the return surface.

### Required Return Sequence

1. battle resolves
2. player returns to hub center stage
3. the main agent reacts first
4. one reward or lesson is staged visually
5. left rail updates state
6. right rail proposes one best next action

### Return Feel Examples

- success:
  - brighter posture
  - new keepsake tag
  - specialization progress spark
- failure with learning:
  - slumped or shaken idle
  - warning note or cracked ribbon
  - one clear repair action highlighted

### Rule

Failure should still produce a meaningful home-state update if the player extracted a useful lesson.

## Route Relationship

### `/`

Acts as the trainer hub and first landing page.

It should prioritize:

- current main companion
- active squad
- immediate readiness
- next deploy path
- latest lesson

### `/roster`

Acts as the broader stable and comparison view.

It should prioritize:

- browsing multiple owned agents
- swapping the featured hub agent
- comparing role and growth differences

### `/agent/[id]`

Acts as the deep individual page.

It should prioritize:

- detailed history
- memory bank inspection
- longer-form doctrine editing
- validation history

### `/lab`

Acts as the heavy tuning space.

It should prioritize:

- multi-step doctrine edits
- data and memory operations
- scenario-targeted training experiments

## MVP Scope

### Must Ship

- center-stage featured agent on `/`
- left-side readable state rail
- right-side customization and growth tabs
- visible active squad around the main agent
- one deploy CTA
- post-battle return update on the same screen
- reward separation between trainer and agent growth

### Should Ship

- gift interaction
- outfit preview
- keepsake slots
- recommended next action
- care pressure display

### Later

- room or dorm customization
- richer dialogue system
- seasonal hub themes
- expanded idle behavior sets
- per-agent room states

## Non-Goals

- turning the home hub into a broker dashboard
- making customization the main power source
- forcing players into long chore loops before battle
- replacing `/roster` or `/agent/[id]` with one overloaded mega-screen
- overfilling the home surface with advanced model diagnostics

## Acceptance Questions

The layout is working only if most first-time viewers can answer these quickly:

1. Which character is mine right now?
2. How is it doing?
3. What can I change from this screen?
4. Where do I go next?
5. What changed after the last battle?

If the player needs to open `/roster`, `/lab`, and `/journal` before those answers become clear, the trainer hub is still too weak.
