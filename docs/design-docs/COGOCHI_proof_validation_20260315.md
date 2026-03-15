# COGOCHI proof validation 20260315

Last updated: 2026-03-15

## 1. Core Decision

Cogochi needs a concrete historical validation system.

Player-facing name:

- `proof`

System-facing name:

- `historical validation`
- `game-native backtest`

Both refer to the same layer.

## 2. Why This Layer Exists

Without a concrete proof layer:

- battle feels like spectacle only
- raising feels cosmetic
- future public credibility is fake
- any market layer becomes untrustworthy

Proof is the layer that turns:

- mutation
- memory
- doctrine
- battle

into a stable validation story.

## 3. System Model

```text
Draft mutation
  -> bind proof pack
  -> freeze historical inputs
  -> run deterministic clashes
  -> score judgment quality
  -> recommend keep / quarantine / revert
  -> write proof artifact
  -> feed journal / future passport / future market
```

## 4. What A Proof Pack Is

A proof pack is:

- a named set of historical BTC frames
- a target weakness or mutation family
- a weighted metric profile
- one stable validation contract

It is not:

- arbitrary candle browsing
- live data scanning
- open-ended trading simulation

## 5. Data Contract

Minimum contract:

- pack id
- mode
- case list
- metric weights
- target weak links
- recommended gate
- public-ready flag

Each case must include:

- frame id
- frame title
- frame date label
- mapped scenario id
- objective
- note

## 6. Metric Policy

Primary:

- read accuracy
- risk discipline
- trap avoidance
- retrieval quality
- explanation consistency
- squad coordination

Secondary:

- shadow return

Rule:

`shadow return can support proof but never define it alone`

This prevents Cogochi from collapsing into a pure finance optimizer.

## 7. Frontend / Backend Split

### Frontend

Frontend shows:

- the candidate creature
- the pack
- the cases
- the metrics
- the route into battle

### Shared deterministic domain

Shared domain defines:

- proof pack structure
- case mapping
- metric weights
- compare contracts

### Backend runtime

Backend later computes:

- SignalSnapshot per case
- retrieval freeze
- aggregated proof artifact
- public passport summaries

## 8. Relation To Battle

Battle is still one clash at a time.

Proof wraps battle with:

- why this clash matters
- what larger bundle it belongs to
- how the verdict should be interpreted

This means:

- `/battle` remains readable and game-like
- `/proof` remains structured and validation-heavy

## 9. Relation To Future Market Layer

Future market surfaces must consume proof artifacts such as:

- proven frames
- pack completion
- verdict history
- trust movement

They must not:

- redefine scoring
- override mutation truth
- use popularity as evaluation authority

## 10. Concrete Next Build Order

1. ship `/proof` as a first-class route
2. define proof packs and metric weights in shared domain
3. let battle deep-links carry proof context
4. write proof artifacts into journal/passport surfaces
5. only then design public market layers
