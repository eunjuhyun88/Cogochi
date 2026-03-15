# OpenClaw Adapter Notes

## Role

OpenClaw enriches Cogochi with:

- reflection language
- guidance phrasing
- memory retrieval summaries
- agent flavor and debate voice

## Non-Negotiables

- OpenClaw must not decide deterministic battle outcomes.
- OpenClaw must not change immutable price history.
- OpenClaw must not bypass keep, quarantine, or revert review.
- If OpenClaw is down, deterministic fallback remains valid.

## Runtime Inputs

- project context bundle
- distilled memory report
- current surface context
- selected historical proof frame

## Runtime Outputs

- reflection copy
- memory retrieval summary
- training hint candidates
- relay-formatted messages for squad orchestration
