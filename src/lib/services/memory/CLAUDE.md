# Memory Service Guardrails

This directory is the memory and writeback boundary.

## Owns

- agent memory writeback
- reflection artifact persistence
- memory shaping and retrieval preparation
- tier assignment across `M0`, `M30`, `M90`, and `M365`
- source attribution across `SEED`, `TRAINING`, `BATTLE`, and `DISTILL`

## Must Not Do

- treat runtime memory as primary product truth
- ingest current market data into RAG in ways that contaminate evaluation
- overwrite agent history without an explicit writeback rule
- decide battle results

## Required Invariants

- memory is supportive context, never final authority
- writeback must be attributable to a battle, training, or reflection event
- retrieval should improve explanation and continuity, not change immutable market facts
- raw market input and reflected interpretation must remain distinguishable
- runtime distillation must consume this layer, not replace it

## If You Change This Layer

Re-check:

1. RAG contamination risk
2. writeback attribution
3. boundary between memory, evaluation, and battle resolution
