# Surface Spec: evolution

- Status: proposed
- Canonical route entry: `/agent/[id]`
- Supporting routes: `/lab`, `/battle`, `/journal`
- Surface ID: `evolution`

## Purpose

`evolution` is the surface family that makes AI learning feel like creature growth instead of hidden model tuning.

It must let the player:

- see what an agent learned
- see which internal instincts are currently trusted
- inspect accepted and reverted mutations
- prove that a mutation changed battle behavior on a fixed frame
- leave every run with one clear next evolution or care action

If this surface feels like a metrics dashboard, a raw prompt editor, or an opaque lab console, it has failed.

## Problem

The current raising loop explains that agents can change, but the player still needs a clearer answer to:

- what exactly changed in the brain
- why that change survived
- how that change affected the next battle

Without an explicit evolution surface, AI learning risks reading like:

- hidden stat growth
- backend prompt tweaking
- decorative accessory unlocks

Cogochi needs a visible mutation and trust loop so the player feels they are raising a judgment creature, not just editing configs.

## Primary Persona

- Role: chart-native player who wants to feel ownership over a personal AI squad
- JTBD: "When I test a new idea on a historical chart frame, I want to see which part of my agent improved or failed, so I can keep the good mutation and reject the weak one."
- Current alternatives:
  - agent dashboards that hide prompt history
  - quant tools that optimize for returns without attachment
  - pet games that show growth without proof
- Why those fail:
  - dashboards do not create emotional ownership
  - quant tools do not explain behavior in creature language
  - pet games do not prove judgment quality

## One-Line Definition

Cogochi `evolution` is the trainer-facing mutation and trust surface where the player sees an agent's internal voices, battle-tested frames, accepted mutations, and body changes align into one readable growth story.

## Core Outcomes

After one short evolution loop, the player should be able to say:

- which instinct was weak
- what mutation was attempted
- whether it was kept or reverted
- what battle frame proved it
- how the agent now looks different

## Interaction Principles

- One mutation at a time: never ask the player to interpret several changed genes at once.
- Proof before prestige: a mutation is only meaningful if a fixed frame validated it.
- Creature language over ML jargon: the player raises instincts, not tensor weights.
- Visual and behavioral sync: accepted mutations must change both body and battle explanation.
- Orchestration is visible: the captain call and trusted voices must read as a game mechanic.

## Happy Paths

### Journey A: Mutation Review

1. The player opens `/agent/[id]`.
2. The page shows the current body, growth stage, trust badges, and strongest proven frames.
3. The player sees one highlighted weak link or unstable instinct.
4. The player taps `Open Mutation Bench`.
5. The system shows one proposed change and which frame pack will validate it.
6. The player accepts the experiment and moves to `/lab` or `/battle`.

### Journey B: Proof Run

1. The player enters `/battle` from the mutation bench.
2. The battle screen shows the active historical frame and the favored captain call.
3. During the clash, the player sees which voices supported or resisted the command.
4. The run ends with a result plus plain-language explanation.
5. The player gets `Keep`, `Revert`, or `Quarantine`.

### Journey C: Daily Return

1. The player returns to `/roster` or `/journal`.
2. One agent has a new accepted mutation, proven frame badge, or repair need.
3. The player opens that agent, reads the latest lesson, and chooses one next action.
4. The session naturally points into one more spar, proof run, or memory repair.

### Journey D: Loss Recovery

1. A proof run fails.
2. The summary names the weak link and why the mutation lost.
3. The agent gains `confidence shake`, `doctrine blur`, or another care state.
4. The player can immediately revert, quarantine, or schedule a safer spar.

## Key Surfaces

### `/roster`

Must communicate:

- current party
- trust badges
- strongest proven frame per agent
- latest accepted mutation or current weak link
- whether an agent is stable, shaky, or awaiting review

Core action:

- choose which agent to evolve, repair, or prove next

### `/agent/[id]`

Must communicate:

- large portrait or bust sprite
- current growth stage
- trusted voices or instincts
- weak link
- proven frames
- accepted and reverted mutation counts
- latest captain call summary
- recommended next action

Required modules:

- `Brain Garden`
- `Trust Strip`
- `Proven Frames`
- `Evolution Log`
- `Mutation Bench`

Core action:

- choose one next mutation or repair action

### `/lab`

Must communicate:

- the proposed mutation
- the exact gene being changed
- expected battle delta
- proof pack that will validate it
- possible visual change if accepted
- revert risk

Core action:

- commit one mutation experiment

### `/battle`

Must communicate:

- current historical proof frame
- current captain call
- voice support versus objections
- live command choice
- why the final action happened
- whether the proof is trending toward keep or revert

Core action:

- execute the proof run and review the verdict

### `/journal`

Must communicate:

- accepted mutations timeline
- reverted mutations timeline
- proven frame history
- current trust movement
- recent care states and repair actions

Core action:

- inspect the squad's long-term learning story

## Action Vocabulary

Player-facing verbs should converge on:

| Verb | Meaning | Result |
| --- | --- | --- |
| `Inspect Brain` | view trusted instincts and weak link | context |
| `Propose Mutation` | pick one targeted change | draft mutation |
| `Bind Proof Pack` | choose fixed historical frames | evaluation target |
| `Run Proof` | enter battle validation | keep or revert candidate |
| `Keep Mutation` | promote the change | trust up, body writeback |
| `Revert Mutation` | discard the change | history entry, no body promotion |
| `Quarantine` | keep the lesson but not the body writeback | unstable result |
| `Restabilize` | repair after failed proofs | care loop |

## Functional Requirements

### Mutation Bench

Must:

- allow exactly one mutation proposal at a time
- show which gene changes
- show why this is the current weak link
- show which proof pack will be used
- show projected body delta if accepted

### Trust Strip

Must:

- list the currently loudest voices or instincts
- show the quietest or degraded voice
- update after proof runs
- avoid raw percentage spam in the primary read

### Proven Frames

Must:

- show named BTC history frames
- mark whether the current build passed or failed there
- make it obvious which frames shaped the current creature identity

### Evolution Log

Must:

- separate accepted, reverted, and quarantined mutations
- show when and why each decision happened
- keep a readable creature-history story instead of a generic audit log

### Captain Call Read

Must:

- summarize which internal voices won the debate
- explain why the captain made the call
- show one objection if a risky decision survived
- connect the final action to prior proven frames when relevant

## Must Have

- a player-readable mutation bench
- a player-readable trust display
- accepted versus reverted mutation history
- named proven historical frames
- battle proof that references learned instincts or prior frames
- at least one visible body change tied to accepted mutation categories
- one clear weak link surfaced after a failed proof

## Should Have

- captain call summaries with short role-specific flavor
- small sprite overlays or keepsakes linked to mutation categories
- confidence and stability states that alter idle or stance
- quick links from battle verdict to mutation review
- a journal view that feels like a field notebook instead of a table

## Won't Have In v1

- fully autonomous live-market deployment
- complex portfolio sizing minigames
- several simultaneous mutation branches per agent
- twenty-five visible sub-agents on screen
- hidden keep or revert decisions with no player review

## Non-Goals

- turning Cogochi into a hedge-fund dashboard
- replacing creature growth with pure backtest charts
- treating mutations as cosmetic loot
- forcing the player to read full prompt diffs as the main UI

## Done Means

- the player can identify one weak link in under thirty seconds
- one mutation proposal is understandable without reading raw prompt text
- a proof run can end in keep, revert, or quarantine
- the player can point to one proven frame that shaped the current agent
- an accepted mutation can be seen on the body, in the log, and in battle explanation
