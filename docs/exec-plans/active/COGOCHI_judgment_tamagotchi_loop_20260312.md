# Cogochi Judgment Tamagotchi Loop Plan

Last updated: 2026-03-12

## Outcome

Turn Cogochi into a meaningful agent-training platform by making one loop real:

`author my agent -> care/train it -> see visible character change -> run controllable chart battle -> inspect proof -> choose the next care action`

## Why This Matters

Right now the product already points in the right direction:

- owned agents exist
- doctrine and loadout tuning exist
- deterministic compare exists
- controllable chart battle exists

What still makes the loop feel incomplete is that the player cannot yet say:

- `this agent changed because of me`
- `I can see that change on the character`
- `I want to come back and maintain this squad`

Without that, Cogochi risks staying a clever setup console instead of becoming a real judgment RPG.

## Product Test

The loop is good only if all are true:

1. the agent feels authored
2. the agent visibly changes
3. the same scenario proves the change
4. failure creates a meaningful next care action
5. history accumulates on the roster over time

## Phase Plan

### Phase 1. Authored Agent Surface

Player outcome:

- create or choose one owned agent
- set indicator, script, doctrine, and memory emphasis

Exit criteria:

- one owned-agent setup surface exists in app code
- one before/after compare exists for a fixed scenario
- one clear battle entry exists from the raising loop

### Phase 2. Visible Transformation

Player outcome:

- after training or battle, one visible body or keepsake change appears

Exit criteria:

- agent state model contains explicit growth or keepsake fields
- `/roster` and `/agent/[id]` render the growth state
- training or reflection writes one visible change target

### Phase 3. Training Proof

Player outcome:

- the player reruns the same scenario and understands the delta

Exit criteria:

- one benchmark path shows before/after battle differences
- battle log or compare view attributes the delta to specific changes
- controllable battle remains deterministic

### Phase 4. Care Loop

Player outcome:

- a bad or stale state produces a meaningful maintenance action

Exit criteria:

- at least one maintenance state exists, such as memory drift or doctrine blur
- reflection recommends a specific care action
- returning to the app has a valid `do this next` reason

### Phase 5. Persistent Squad Identity

Player outcome:

- the roster looks traveled, specialized, and personally shaped

Exit criteria:

- memorable runs generate keepsakes, marks, or ribbons
- squad-level chemistry or cohesion appears in UI
- at least one agent reaches a recognizable signature state

## Immediate Build Order

1. add transformation fields to the owned-agent state model
2. render growth state and keepsake placeholders in `/roster` and `/agent/[id]`
3. make training commit write one visible delta candidate
4. make reflection write one care action candidate
5. connect the compare view and battle log back to the visible change

## Autoresearch Rules For This Plan

The director should reject changes that:

- improve polish but not ownership
- improve combat feel but not training proof
- add pet-care flavor without judgment meaning
- increase complexity without creating a stronger next action

The director should prefer changes that:

- make one new visible growth state real
- make one existing setup knob easier to prove in battle
- make one failed run generate a better care action
- increase squad identity without obscuring chart readability

## Success Metric For This Plan

For the current phase, the branch is moving in the right direction if:

- ownership and transformation readiness rise
- training-to-battle proof rises
- care loop readiness rises
- the raising evaluator can explicitly explain what is still missing

## Non-Goals For This Phase

- random evolution trees
- open-world traversal
- idle hunger meters
- fake PnL progression
- high-polish VFX before visible growth is real
