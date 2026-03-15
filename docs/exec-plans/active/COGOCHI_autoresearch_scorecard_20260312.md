# Cogochi Autoresearch Scorecard

Last updated: 2026-03-12

## Purpose

This scorecard defines how OpenClaw-style autoresearch accepts or rejects changes in this repository.

The goal is not to maximize one local metric.

The goal is to move the branch closer to the founder goal in a measurable, repeatable way.

## Hard Gates

All accepted changes should satisfy:

1. `program.md` exists and remains aligned with the founder goal
2. `docs/exec-plans/active/COGOCHI_founder_goal_20260312.md` exists
3. `npm run docs:check` passes
4. route/store/engine boundaries are not violated
5. deterministic battle evaluation remains intact

## Weighted Score

Use this weighted score after the hard gates pass:

| Dimension | Weight | Meaning |
| --- | ---: | --- |
| Founder outcome progress | 18 | Does the branch move the product toward the current Pokemon-grade alpha target? |
| World-first session loop | 18 | Does play start in the field, reach a clash quickly, and return with a next action? |
| Encounter legibility | 15 | Does each clash have one clear objective, danger source, and success or failure cue? |
| Agent ownership and visible growth | 14 | Does the agent feel authored, ownable, and visibly changed over time? |
| Evolutionary mutation loop | 12 | Can the system identify a weak link, mutate one gene, and keep or revert it against a proof pack? |
| Return-pressure clarity | 10 | Does the result create a compelling next move on camp or journal return? |
| Trust and explanation clarity | 8 | Can the player understand which instincts are trusted and why the captain made the call? |
| Memory, care, and runtime readiness | 5 | Do failures, doctrine drift, and runtime distillation create meaningful next maintenance actions without breaking deterministic truth? |
| Game feel and implementation quality | 5 | Does the loop feel like a real game while staying bounded, explainable, and maintainable? |

## Report Sources

The current score is assembled from:

- `.agent-context/autoresearch/openclaw-health.latest.json`
- `.agent-context/autoresearch/battle-benchmark.latest.json`
- `.agent-context/autoresearch/field-loop-eval.latest.json`
- `.agent-context/autoresearch/proof-readiness.latest.json`
- `.agent-context/autoresearch/raising-eval.latest.json`
- `.agent-context/autoresearch/runtime-readiness.latest.json`
- `.agent-context/autoresearch/score.latest.json`
- `.agent-context/autoresearch/decision.latest.json`

## Acceptance Rule

The default acceptance rule is:

- reject if any hard gate fails
- otherwise accept only if total score improves over the current baseline

The baseline is stored in:

- `.agent-context/autoresearch/baseline.json`

## Phase Weights

For the current phase, prefer this optimization order:

1. world-first loop closure
2. encounter objective readability
3. visible evolution plus mutation proof
4. return-pressure clarity
5. trust calibration and orchestration clarity
6. training-to-battle proof
7. asset coherence and movement readability
8. visual polish

If a change improves polish but not the loop, it should usually lose.
