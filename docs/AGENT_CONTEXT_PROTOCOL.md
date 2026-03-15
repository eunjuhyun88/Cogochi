# Agent Context Protocol

Scope: current git worktree rooted at this repository

## 1) Purpose

Prevent context loss and reduce restart cost across long-running agent work.

## 2) Context Architecture

- `snapshot`: machine state
- `checkpoint`: semantic memory
- `brief`: fast resume
- `handoff`: fuller transfer
- `resume`: active-work bundle
- `claim`: multi-agent ownership and path boundary
- `work item`: dependency-aware queue state

## 3) Core Commands

- `npm run ctx:save`
- `npm run ctx:checkpoint`
- `npm run ctx:compact`
- `npm run ctx:resume`
- `npm run ctx:restore -- --mode brief`
- `npm run ctx:restore -- --mode handoff`
- `npm run ctx:check -- --strict`
- `npm run coord:claim`
- `npm run coord:check`
- `npm run coord:release`
- `npm run orch:work`
- `npm run orch:list`
- `npm run orch:check`

## 4) Rules

- use checkpoints for non-trivial work
- use `ctx:resume` first so claim/work pointers drive the active bundle
- use briefs for fast resume when the active work id is already obvious
- keep pinned facts durable and minimal
- do not commit runtime memory
- do not work on a feature branch without an active coordination claim
- use orchestration when path ownership alone cannot explain next-up work
