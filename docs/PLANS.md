# Cogochi Plan System

Last updated: 2026-03-07

Plans are first-class repo artifacts.

## 1. Why

Complex agent-oriented work should not live only in transient chat context.

Plans let future runs answer:

- what was intended
- what changed
- what remains
- what technical debt was left behind

## 2. Plan types

### 2.1 Lightweight plan

Use for:

- small isolated edits
- one-file fixes
- fast refactors

Storage:

- may remain in the watch log only

### 2.2 Execution plan

Use for:

- multi-step architecture changes
- runtime contract work
- training pipeline changes
- benchmark or reliability work

Storage:

- `docs/exec-plans/active/`

After completion:

- move to `docs/exec-plans/completed/`

### 2.3 Tech debt entry

Use for:

- deferred cleanup
- known reliability gaps
- missing validation

Storage:

- `docs/exec-plans/tech-debt-tracker.md`

## 3. Required execution plan sections

Every execution plan should contain:

- problem statement
- scope
- non-goals
- files and systems affected
- acceptance criteria
- change log
- open risks

## 4. Naming

Recommended file name:

`YYYY-MM-DD-short-topic.md`

## 5. Current directories

- active: [exec-plans/active](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/exec-plans/active)
- completed: [exec-plans/completed](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/exec-plans/completed)
- debt tracker: [exec-plans/tech-debt-tracker.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/exec-plans/tech-debt-tracker.md)

## 6. Rule

If a task spans multiple services, routes, docs, or reliability assumptions, it should leave behind an execution plan file.
