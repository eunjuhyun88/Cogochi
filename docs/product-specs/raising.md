# Surface Spec: raising

- Status: proposed
- Canonical route entry: `/roster`
- Surface ID: `raising`

## Purpose
`raising` is the player-facing surface family that makes each agent feel like a named companion the player is actively raising, not a config row in a tool.

It must let the player:

- form attachment to individual agents quickly
- understand how an agent is changing over time
- perform one meaningful training action in a few interactions
- see that training show up in the next battle and reflection
- see visible character change, not only hidden stat change
- keep the chart-native battle fantasy intact

If `raising` feels like a pet widget, a spreadsheet editor, or a disconnected monster box, this surface has failed.

## Problem

The current Cogochi thesis is clear about training and reflection, but the emotional ownership loop needs a stronger player-facing shape.

Without a dedicated raising surface, the player risks seeing agents as:

- prompt presets
- stat bundles
- abstract battle units

That would break the trainer fantasy.

Cogochi needs a surface where the player can feel:

- "this is my agent"
- "I trained it this way"
- "it behaved differently because of that training"

## Primary Persona

- Role: crypto-native player who already spends time around charts and wants attachment plus skill growth
- JTBD: "When I revisit a chart scenario, I want to raise my agents like a traveling squad, so that I care about them and can improve their judgment over repeated runs."
- Current alternatives:
  - chart tools with no attachment loop
  - pet or monster games with no market-judgment meaning
  - autobattlers where training choices are shallow or hidden
- Why those fail:
  - chart tools feel sterile
  - pet sims do not improve judgment
  - autobattlers do not explain why an agent changed

## One-Line Definition

Cogochi `raising` is the trainer surface where the player names, tunes, bonds with, and grows pixel companions whose memory and doctrine changes become visible in the next chart battle.

## Core Outcome

After one short session, the player should be able to say:

- who this agent is
- what changed during training
- why that change matters in battle
- what to improve next

## Interaction Principles

- Attachment before depth: the player should care about the agent before reading advanced systems.
- One clear action per visit: each screen should funnel toward one meaningful training decision.
- Visible cause and effect: every training action should preview a likely battlefield consequence.
- Growth must materialize on the body: training should alter stance, accessory, mark, or keepsake state.
- Party over inventory: the active team should feel like companions traveling together, not stored units.
- Cozy but not passive: warmth and charm are allowed, but the surface must still prepare the player for judgment and battle.

## Meaningful Progression Model

The player should not only raise `power`.
The player should raise a companion whose judgment and identity become more distinct.

The minimum progression stack is:

1. `Loadout growth`
   - indicator, script, doctrine, memory emphasis, and risk style change capability
2. `Body growth`
   - sprite stance, accessory, aura, mark, or keepsake state changes visibly
3. `History growth`
   - memorable runs leave lesson ribbons, scars, badges, or notes behind
4. `Care pressure`
   - stale memory, blurred doctrine, shaken confidence, or squad friction create a meaningful next maintenance action

If progression only changes hidden evaluation numbers, attachment will collapse.
If progression only changes cosmetics, the training platform will feel fake.

## Transformation States

Each agent should move through readable, non-random growth states:

- `Fresh`
  - new or lightly trained
- `Tuned`
  - one doctrine or scenario tendency is starting to show
- `Specialized`
  - repeated proof has given the agent a clear battle identity
- `Signature`
  - the agent now carries visible keepsakes and a recognizable style that reflects the trainer's pattern

These states should be driven by repeated judged behavior, not arbitrary level milestones.

## Care Loop

Cogochi should borrow `come back and care` energy from tamagotchi, but use judgment-native maintenance instead of chores.

Care states:

- `memory drift`
- `doctrine blur`
- `confidence shake`
- `squad friction`

Care actions:

- `curate memory`
- `rewrite doctrine`
- `spar on a safe scenario`
- `restabilize role fit`

The player should leave a failed run with one clear care action, not just a lower score.

## Happy Path

1. The player lands on `/` or `/roster` and immediately sees the active party as named pixel companions with visible mood, role, and recent growth.
2. The player opens one agent card and reads a compact identity panel: role, bond, doctrine tendency, last lesson, and current training focus.
3. The player chooses one training verb such as `tune doctrine`, `curate memory`, `bind data`, or `spar`.
4. The surface previews what will likely improve, what tradeoff is introduced, and which upcoming scenario fit changes.
5. The player confirms the training action and sees a small but emotionally satisfying change in the agent card, portrait, sprite state, or journal trace.
6. The player runs the next battle and sees the companion express the trained tendency on the chart stage.
7. The result screen writes back a lesson and suggests one next raising action.

## Home Hub Continuity

`raising` should not live only in `/roster` or `/agent/[id]`.
The home route `/` should preview the same raising loop through a featured center-stage companion.

That means the player should be able to do the following without leaving the home hub:

- read headline raising state
- perform one care or customization action
- preview one visible change
- move directly into deploy or deeper raising screens

The detailed layout contract for that home composition lives in:

- `docs/design-docs/COGOCHI_trainer_hub_character_layout_20260315.md`

## Key Screens

### `/roster`

Purpose:
show the full raising stable as a living party, not a storage box

Must communicate:

- each agent's name and pixel identity
- role and specialization
- bond level
- current training focus
- current growth state
- visible keepsake or appearance change
- recent lesson or mood tag
- whether the agent is in the active squad

Core action:
select one agent to inspect or one swap for the active party

### `/agent/[id]`

Purpose:
make one agent feel deeply owned and legible

Must communicate:

- portrait or bust-scale pixel sprite
- who the agent is
- what it remembers
- how it tends to behave
- what just changed
- which growth state or visible mutation it is in
- which keepsakes or field marks it has earned
- which training action is most relevant now

Core action:
choose the next training action for this specific agent

### `/lab`

Purpose:
execute explicit raising actions with visible tradeoffs

Must communicate:

- training verbs
- projected effects
- cost or cooldown
- recent experiments
- visible transformation preview
- next recommended scenario fit

Core action:
commit one training change and return to squad prep

### `/team`

Purpose:
make the four-slot squad feel like a bonded travel party

Must communicate:

- current role slots
- synergy and coverage
- weak matchups
- companion chemistry and scenario fit
- whether the team looks like a traveled squad instead of four unrelated units

Core action:
lock the party for the next battle

## Must Have

- Each agent has a stable visual identity with name, role, and readable sprite silhouette.
- The raising surfaces show bond, training focus, and recent lesson without forcing deep menus.
- The raising surfaces show at least one visible body or keepsake change tied to training progress.
- The player can perform one meaningful training action in three interactions or fewer.
- Training previews explain a likely battle consequence in player language.
- The active party feels like companions traveling together across surfaces.
- The next battle or scenario entry is always reachable from the raising flow.
- Reflection after battle points back to a specific raising action.
- A failed run surfaces one care action such as memory curation or doctrine repair.

## Should Have

- Tiny sprite-state changes after training, such as stance, accessory, badge, or aura cue.
- A journal-like lesson ribbon per agent.
- Party idle scenes where companions subtly animate together.
- A "best next training action" recommendation based on the last battle.
- Lightweight keepsakes such as ribbons, marks, or field notes that record memorable runs.
- Growth-state titles such as `Fresh`, `Tuned`, `Specialized`, or `Signature`.

## Won't Have In v1

- wild capture loop
- open-world town traversal as the main loop
- random evolution trees disconnected from judgment quality
- gacha acquisition
- breeding systems
- idle tamagotchi care meters
- long chore loops before battle entry
- meaningless XP bars with no visible or behavioral consequence

## Non-Goals

- turning Cogochi into a pure monster battler
- hiding training behind passive auto-progression
- reducing agents to cute mascots with no doctrine or memory meaning
- replacing the chart battle with a detached overworld RPG
- imitating Pokemon structure so closely that chart-native judgment stops mattering

## Done Means

- A new player forms attachment to at least one agent in under a minute.
- The player can explain one difference between two agents without reading internal config language.
- One completed training action clearly suggests a battle consequence.
- The player can point to one visible change on the companion after a meaningful training or battle cycle.
- The active party is readable as a bonded squad rather than a list of slots.
- The raising flow feeds naturally into battle and reflection instead of competing with them.

## Context Contracts

### Routes

- `/roster`
  - roster browsing, active squad inclusion, quick raising summary
- `/agent/[id]`
  - identity, memory, doctrine tendency, recent lesson, next action
- `/lab`
  - training verbs, preview, confirmation, recent experiments
- `/team`
  - party composition and scenario fit
- supporting route:
  - `/battle`

### Stores

- `rosterStore`
  - agent identity, roster membership, last lesson, progression summary
- `labStore`
  - training actions, preview state, experiment history
- `squadStore`
  - active party selection, slot fit, synergy state
- `matchStore`
  - scenario relevance, last result, battle follow-through

### Dependencies On Other Specs

- `raising` depends on `core` for trainer hub entry and session continuity.
- `raising` depends on the battle layer to prove training effects.
- `raising` must stay consistent with `docs/VISUAL_WORLD_DESIGN.md` companion feel rules.

## Deep Links

- `docs/product-specs/core.md`
- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`
- `docs/design-docs/pixel-agent-raising-direction.md`
- `docs/design-docs/judgment-tamagotchi-loop.md`
- `docs/design-docs/COGOCHI_trainer_hub_character_layout_20260315.md`
