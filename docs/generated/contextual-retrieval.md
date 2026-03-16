# Contextual Retrieval

This generated artifact summarizes the query-time retrieval index for canonical docs.

## Retrieval Model

- Retrieval mode: deterministic contextual BM25
- Chunk context: path, authority, section headings, and surface ownership are prepended before indexing
- Goal: reduce full-doc scanning when the agent is uncertain what to open next

## Index Stats

- Source docs indexed: `81`
- Chunks indexed: `1356`
- Chunk size (words): `120`
- Overlap size (words): `30`
- Default top-k: `5`

## Top Indexed Paths

| Path | Chunk Count |
| --- | --- |
| `runtime/generated/project-context-bundle.md` | 227 |
| `docs/design-docs/COGOCHI_trainer_hub_character_layout_20260315.md` | 54 |
| `docs/exec-plans/active/COGOCHI_full_game_autoresearch_20260312.md` | 52 |
| `docs/design-docs/COGOCHI_battle_screen_layout_20260316.md` | 42 |
| `docs/design-docs/COGOCHI_gameplay_first_loop_redesign_20260316.md` | 41 |
| `docs/design-docs/COGOCHI_pokemon_grade_game_target_20260313.md` | 41 |
| `docs/design-docs/COGOCHI_chart_world_jrpg_reset_20260316.md` | 40 |
| `docs/MASTER_GAME_SPEC.md` | 40 |
| `docs/design-docs/COGOCHI_visual_system_direction_20260315.md` | 39 |
| `runtime/generated/memory-index.md` | 37 |
| `docs/AGENT_SYSTEM_DESIGN.md` | 36 |
| `docs/exec-plans/active/COGOCHI_terminal_doctrine_prd_20260315.md` | 36 |
| `docs/design-docs/atlas-judgment-evolution.md` | 33 |
| `docs/design-docs/chartfield-fullgame-direction.md` | 32 |
| `docs/exec-plans/active/COGOCHI_autoresearch_org_20260312.md` | 28 |

## Commands

- `npm run retrieve:query -- --q "<term>"`
- `npm run registry:serve` then `GET /retrieve?q=<term>`

## Limits

- This is a lexical/contextual bootstrap index, not an embedding+rereank system.
- For very large repos, the JSON index may later move to runtime-only storage.

