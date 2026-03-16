# Cogochi Founder Goal

Last updated: 2026-03-12

## Current Goal

Build the first `Pokemon-grade alpha` of Cogochi where the player can move through a chart-native world with a four-agent squad, reach a clash quickly, choose one clear encounter action, resolve a mutation verdict, see the creature visibly change or destabilize, and return to camp already knowing the next best action.

## Product Definition

The product the founder wants is:

- a game about creating `my own AI agent`
- a system where my chart habits, rules, indicators, scripts, and playbooks shape that agent
- a game where I travel with that squad instead of only clicking through menus
- a loop where that shaping becomes visible on the companion, not only inside hidden config
- a loop where the agent is tested, reflected on, and improved
- a loop where the system can identify the current weak link and propose one bounded mutation
- a loop where accepted mutations and trusted instincts are visible to the player
- a readable chart-native battle layer that proves whether the training setup worked

In short:

`camp -> route -> gate -> clash -> verdict -> visible writeback -> camp return -> next action`

## What Must Exist In The Vertical Slice

### 1. Owned Agent Creation

The player can create or select an owned agent built on top of an OpenClaw starter runtime or deterministic fallback.

### 2. Personal Training Knobs

The player can change at least these knobs:

- doctrine or prompt framing
- indicator profile
- script profile
- memory set
- risk style

### 3. Memory And RAG Loop

The agent can retrieve:

- prior failure cases
- prior success cases
- user-authored notes
- playbook fragments

Current market state must stay direct input, not RAG.

### 4. Visible Growth And Keepsakes

The player can see at least one visible change caused by training or battle history:

- stance or sprite state shift
- accessory, aura, or role mark
- lesson ribbon, badge, or keepsake
- named growth state such as `Fresh`, `Tuned`, or `Specialized`

### 4.5 Mutation And Trust Loop

The player can inspect:

- the current weak link
- the currently trusted instincts or voices
- accepted versus reverted mutations
- at least one proven historical frame attached to the current build

### 5. Deterministic Evaluation

The player can send the agent into a fixed historical chart scenario and get:

- what the agent saw
- what memory it used
- why it made the decision
- how that decision performed

### 5.5 Field Travel Loop

The player can:

- move through a compact top-down chart world
- see the active squad as a travel party
- enter battle from a gate in the world
- return from battle with updated squad state

### 6. Comparison Loop

After changing one or more training knobs, the player can rerun evaluation and compare:

- before vs after
- what changed
- why the capability changed

### 7. Care Loop

After a failed run or stale state, the player gets one meaningful next maintenance action such as:

- curate memory
- rewrite doctrine
- spar a safer scenario
- repair squad fit

## What Counts As Done For This Phase

This phase is complete when one player can:

1. spawn into a field or camp surface and understand the next goal within `10 seconds`
2. reach the first meaningful clash within `2 minutes`
3. move with a visible four-agent squad
4. visit at least one support node before battle
5. enter a `spar gate` or `proof gate` from the world
6. fight one clash with one obvious objective
7. choose `Keep`, `Quarantine`, or `Revert`
8. see the result affect body, history, or care pressure
9. return to camp or journal and immediately read the next best action
10. complete the whole loop in `2 to 5 minutes`

## Hard Constraints

- Cogochi remains a judgment RPG, not a chart terminal
- the chart remains the battlefield
- battle remains deterministic
- current market data does not contaminate RAG evaluation
- OpenClaw may enrich the loop, but deterministic fallback must exist
- v1 does not require pretraining a model from scratch
- tamagotchi-like return pressure must come from judgment care, not idle chores
- Pokemon-grade means loop completeness and attachment quality, not content volume or IP mimicry
- asset choice must be compatible with the project's crypto-adjacent context

## What Not To Optimize

Do not optimize for these at the expense of the founder goal:

- raw battle spectacle
- idle pet affection loops
- fake PnL theater
- model cleverness with no explainability
- win rate improvements that make the agent less understandable
- cosmetic growth with no battle proof
- hidden mutation loops with no visible trust or keep or revert history
- field art that does not create a better travel or battle loop

## Tie-Break Rules

When tradeoffs conflict:

1. choose world-first loop closure over local metric improvement
2. choose explainable improvement over opaque improvement
3. choose visible growth plus battle proof over hidden power gain
4. choose route-and-encounter readability over menu convenience
5. choose return-pressure clarity over raw battle spectacle
6. choose a narrower shipped loop over a broader fake loop
