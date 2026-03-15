# CLAUDE.md

This repository is configured with Memento Kit.

## Project Info

- Name: `Cogochi v1`
- Summary: `Cogochi v1 workspace bootstrapped with Memento Kit.`
- Stack: `TBD`
- Phase: `initial bootstrap`
- Deadline: `TBD`

## Start Here

1. `README.md`
2. `AGENTS.md`
3. `docs/README.md`
4. `docs/SYSTEM_INTENT.md`
5. `ARCHITECTURE.md`

## File Map

| Need | Open |
| --- | --- |
| collaboration rules | `README.md`, `AGENTS.md` |
| runtime context memory | `.agent-context/briefs/`, `.agent-context/handoffs/` |
| architecture map | `ARCHITECTURE.md` |
| system intent | `docs/SYSTEM_INTENT.md` |
| doc router | `docs/README.md` |
| active plans | `docs/exec-plans/active/` |
| surface specs | `docs/product-specs/` |
| generated maps | `docs/generated/` |
| prompts | `prompts/` |

## Context Discipline

- Treat the current git worktree rooted at this repository as the canonical implementation target.
- Do not start in `docs/archive/`.
- Do not treat `.agent-context/` as authority.
- Use `ctx:checkpoint` for semantic memory.
- Use `ctx:compact` and `ctx:restore` instead of relying on long chat history.
