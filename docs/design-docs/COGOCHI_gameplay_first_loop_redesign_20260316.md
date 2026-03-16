# Cogochi Gameplay-First Loop Redesign

Status: proposed  
Scope: player minute-to-minute play, session structure, surface priorities, and game-feel reset  
Depends on: `docs/MASTER_GAME_SPEC.md`, `docs/AGENT_SYSTEM_DESIGN.md`, `docs/BATTLEFIELD_DESIGN.md`, `docs/VISUAL_WORLD_DESIGN.md`, `docs/design-docs/judgment-tamagotchi-loop.md`, `docs/design-docs/chartfield-fullgame-direction.md`

## Purpose

This document resets Cogochi from the actual play experience outward.

The current docs correctly say:

- judgment RPG
- train -> battle -> reflect -> improve
- chart-native battlefield
- judgment tamagotchi

But the player-facing loop is still too diffuse.
Too much of the product reads like:

- a configurable AI lab
- a battle report viewer
- a field wrapper around menus

This document defines the more useful question:

`What does the player do in the next 3 minutes, and why is that fun?`

## The Real Product Read

Cogochi should not feel like:

- "I optimize four agents in a lab and then inspect the result"

Cogochi should feel like:

- "I lead a small judgment squad through a chart-world"
- "I decide whether this next setup is worth entering"
- "I commit to one thesis under pressure"
- "my squad comes back changed, shaken, or sharpened"
- "I make one meaningful care decision before the next run"

Short version:

`travel -> read -> commit -> survive consequence -> care -> go again`

That is the actual game.
Training depth matters, but it should support that loop, not replace it.

## Diagnosis: Why The Current Shape Still Feels Wrong

### 1. The loop is too lab-first

The docs say training is the core product.
That part is true systemically, but it is dangerous experientially.

If the player spends too much time editing prompts, doctrine, and memory before they have attachment and rhythm, the game reads as:

- AI ops
- tuning console
- simulation setup

The player must earn the desire to optimize through repeated field-and-clash play first.

### 2. Battle verbs are still too tool-like

The current battle vocabulary is too close to system verbs and not close enough to embodied play verbs.

What the player should feel:

- hold
- commit
- brace
- cut
- break through

What they should not feel first:

- classifier adjustment
- tool pipeline invocation
- post-hoc analysis panel interaction

### 3. Field is at risk of becoming a wrapper

If field exists only to walk toward another menu, it becomes decorative overhead.

Field must answer:

- where the squad is going
- why that destination matters now
- what happened to the squad on the last return

### 4. Journal and care are still too informational

Return should not feel like:

- reading a log
- reviewing a report

Return should feel like:

- someone in the squad needs attention
- one lesson is pressing
- one repair or next attempt is obvious

### 5. Lab is too frequent in the imagined session rhythm

`Lab every run` makes the product cerebral and slow.

The better rhythm is:

- most runs = home/field/battle/journal/care
- some runs = deeper lab intervention

Lab should be a strategic depth layer, not the default heartbeat.

## Target Aesthetic Mix

Primary:

- `Fantasy`: these are my traveling judgment companions
- `Challenge`: every gate asks me to read the setup correctly

Secondary:

- `Discovery`: chart structure and squad tendencies reveal themselves over repeated runs
- `Expression`: my doctrine and care style shape what the squad becomes

Avoid optimizing primarily for:

- `Submission`: idle pet maintenance
- `Narrative`: lore-heavy progression detached from play
- `Sensation`: flashy combat with weak judgment readability

## Design Pillars

### 1. One Run, One Thesis

Each meaningful run should revolve around one clear question:

- take the long
- take the short
- hold and wait

If the player cannot state the thesis in one sentence, the run is too muddy.

### 2. Every Clash Must Cost Something

A clash should always change at least one of:

- confidence
- care state
- memory quality
- keepsake/body state
- squad trust

No "nothing happened" runs.

### 3. Return Should Pull The Player Forward

Journal/camp return must immediately create one desire:

- repair
- retry
- prove
- restabilize

Never just summarize.

### 4. Lab Is Strategic, Not Constant

The player should feel smart for choosing when to go deep.

Lab is for:

- pattern correction
- specialist shaping
- doctrine rewrite
- memory surgery

Lab is not the default click after every single clash.

### 5. The Chart Must Stay Legible As Terrain And Decision Space

The world can be cozy.
The companions can be charming.
But the player must still be able to say:

- where support was
- where resistance broke
- where the trap was
- where the wrong read started

## The New Core Player Role

The player is not mainly:

- an AI engineer
- a dashboard operator
- a passive trainer

The player is:

- `captain`
- `caretaker`
- `judgment coach`

That means every session should ask for three kinds of decisions:

1. `Navigation decision`
   - where do we go next
2. `Commitment decision`
   - what thesis do we enter with
3. `Care decision`
   - what do I fix or reinforce after the result

If a screen does not support one of those three decisions, it is probably secondary.

## The New Loop Stack

### Micro Loop: 45 to 90 seconds

`read gate -> choose thesis -> spend 1 to 2 interventions -> resolve consequence`

Player actions:

- inspect the gate
- choose long, short, or hold
- use a small command set during the clash
- receive a readable consequence

Desired feeling:

- quick tension
- readable stakes
- no report sprawl

### Core Session Loop: 6 to 12 minutes

`return to camp -> choose one destination -> travel with squad -> enter one clash -> choose one care action -> queue next destination`

This should be the dominant session shape.

Not:

- roster -> lab -> roster -> compare -> battle -> dashboard

But:

- camp -> field -> gate -> clash -> journal/care -> camp

### Meta Loop: several sessions

`grow a signature squad -> stabilize specialist identities -> unlock harder gate types -> carry scars/keepsakes/history -> prove judgment quality across harsher frames`

The meta loop is about building:

- a squad identity
- a style of play
- a personal field manual

## The 10-Minute Session Prototype

This is the intended gold-path session.

### Minute 0 to 1: Return

The player lands in home/camp.

They should immediately see:

- who is stressed
- what the last clash changed
- one highlighted next destination

Allowed actions:

- pat/care equivalent
- quick role check
- quick swap
- accept the next destination

Not allowed:

- drowning in analytics
- being asked to open four management panels first

### Minute 1 to 3: Travel

The player walks the squad through the field.

Travel should deliver:

- calm pacing
- attachment to the party
- visible approach to risk

During travel, the player can make one light decision:

- inspect a memory shrine
- touch a care node
- bypass it and head straight to gate

### Minute 3 to 5: Gate Read

At the clash gate, the game presents one clear setup:

- bullish pressure with trap risk
- bearish collapse opportunity
- unstable fakeout where hold may be best

This is where the player chooses the thesis:

- `Long`
- `Short`
- `Hold`

This decision should happen before the full clash UI opens.

That makes judgment the center of the run.

### Minute 5 to 6: Clash

The clash should be short.

The player already chose the thesis.
Now they are managing execution and survival.

Recommended clash verbs:

- `Commit`
  - push the chosen thesis
- `Brace`
  - protect against trap or liquidation
- `Read`
  - improve clarity instead of forcing action
- `Cut`
  - abort or reduce damage before collapse

These are better than abstract tool verbs because they map to embodied intent.

### Minute 6 to 8: Consequence

The clash resolves into one strong result:

- breakthrough
- rejection
- trap survival
- collapse

The player must see:

- where the call worked or failed
- who in the squad contributed
- what the squad now carries back

### Minute 8 to 10: Care

The player returns to journal/camp and makes one meaningful care choice:

- stabilize confidence
- prune drifted memory
- sharpen doctrine
- keep the scar and push onward

This closes the loop.

The session should end with:

- one visible squad state change
- one queued next destination

## Surface Role Reset

### `/`

Primary role:

- `return hub`

It should answer:

- who needs attention
- what changed last run
- where the next best destination is

`/` should not try to be the full management center.

### `/field`

Primary role:

- `main playable session surface`

It should answer:

- where the squad is going
- what type of gate is ahead
- whether the player detours for care or goes straight in

Field is not decoration.
Field is the main connective tissue of the product.

### `/battle`

Primary role:

- `short execution test`

It should answer:

- can this thesis survive contact with the chart

Battle should be short, physical, and easy to read.
It should stop behaving like the longest or most analytical screen.

### `/journal`

Primary role:

- `emotionally charged consequence screen`

It should answer:

- what just happened to my squad
- what needs care next

Journal should feel like aftercare, not recordkeeping.

### `/lab`

Primary role:

- `deep intervention room`

It should answer:

- do I need to rewrite something fundamental

Lab should be used:

- after repeated problems
- when specializing
- when proof failure reveals a structural weakness

Lab should not be required after every normal run.

### `/roster` and `/agent/[id]`

Primary role:

- `attachment and party shaping`

These screens should support:

- identity
- swap decisions
- bond
- long-term specialist shaping

They should not become the main moment-to-moment flow.

## Battle Redesign Rules

### Rule 1: Thesis Is Chosen Before The Clash

Long, short, or hold should be a gate decision, not a mid-fight abstraction.

### Rule 2: Clash Commands Must Be Human, Not Systemic

Prefer:

- Commit
- Brace
- Read
- Cut

Avoid leading with:

- Memory Pulse
- Focus Tap
- Retarget

Those may still exist internally or as secondary flavor, but they should not be the first language the player meets.

### Rule 3: One Clash Should Not Need A Spreadsheet To Understand

After the clash, the player should explain the result from the stage itself.

### Rule 4: Verdict Should Change The Body Or Care State

A result should leave:

- a keepsake
- a scar
- a stress state
- a trust change
- a doctrine pressure

Not just a summary packet.

### Implemented First Pass: Battle Turn Contract

The first shipped battle reset on 2026-03-16 applies these rules directly to `/battle`.

The surface now leads with:

- one turn question
- one success condition
- one failure condition
- one recommended answer
- one four-beat clash ribbon

The dossier is no longer always open.
The chart and command deck now read first, and the analytical panel becomes an on-demand overlay instead of the default battle posture.

## Care Redesign Rules

Care is not fluff.
Care is how the player metabolizes failure and success.

Use four care states as the stable foundation:

- `Confidence Shake`
- `Memory Drift`
- `Doctrine Blur`
- `Squad Friction`

Every failed or stressful clash should resolve into one of these.

Every return screen should surface one care action first, not five equivalent utilities.

## What To De-Emphasize

### De-emphasize in the default session

- deep lab tuning
- proof-as-a-report framing
- analytics-heavy battle chrome
- abstract mutation language before the player feels consequence

### Emphasize in the default session

- field travel
- gate choice
- thesis commitment
- short clash
- care and return

## Implementation Implications

If this redesign is accepted, implementation priority should change to:

1. make `/field` the default heartbeat of a session
2. move battle to a shorter, thesis-first clash model
3. turn `/journal` into a stronger consequence-and-care screen
4. reduce how often `/lab` is required in the primary loop
5. update `/` so it behaves like a return hub, not a generalized dashboard

## Acceptance Test

The redesign is working only if a player can say this after one short session:

- "We went to that gate because it looked like a good long."
- "The squad got punished because I committed too early."
- "Now this agent is shaken, so I should stabilize it before the next gate."

If the player instead says:

- "I changed some settings and checked a result screen."

then the game is still too tool-like.
