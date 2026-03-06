# Cogochi Reliability And Eval Noise Control

Last updated: 2026-03-07

This document defines how Cogochi separates genuine agent improvement from runtime noise.

## 1. Problem

An eval result is not only about the model.

It is also affected by:

- provider latency
- local machine load
- memory pressure
- cache warmup
- timeout behavior
- fallback frequency

If these are not controlled, benchmark comparisons become misleading.

## 2. Reliability principle

Every eval run must be interpreted as:

`agent quality + retrieval quality + runtime conditions + infrastructure noise`

The system must record enough metadata to separate those factors later.

## 3. Performance profiles

Cogochi uses named profiles instead of pretending every run is equally clean.

### 3.1 `local-fast`

Purpose:

- quick feedback during active iteration

Constraints:

- heuristic or local runtime allowed
- no promotion decisions
- failures are informative, not authoritative

### 3.2 `local-reference`

Purpose:

- stable local benchmarking

Constraints:

- same provider and model for the whole run
- low background load
- no concurrent heavy jobs
- suitable for prompt and retrieval comparisons

### 3.3 `ci-benchmark`

Purpose:

- promotion gating

Constraints:

- fixed runtime config
- fixed benchmark pack version
- fixed scenario seeds
- fixed timeout policy
- fallback rate must stay below threshold

## 4. Benchmark run manifest

Every benchmark run must emit a manifest.

```json
{
  "runId": "eval-20260307-001",
  "profile": "local-reference",
  "benchmarkPackId": "bench-v1-core",
  "artifactId": "artifact-20260307-001",
  "runtime": {
    "mode": "OLLAMA",
    "baseUrl": "http://127.0.0.1:11434",
    "modelId": "qwen2.5:7b-instruct",
    "temperature": 0.2,
    "timeoutMs": 20000
  },
  "system": {
    "cpuLoadPct": 42,
    "memoryUsedGb": 8.4,
    "warmCache": true
  },
  "startedAt": 1772862000000,
  "finishedAt": 1772862600000
}
```

## 5. Required runtime metadata

Store these with each benchmark run:

- provider mode
- model id
- timeout
- fallback count
- invalid JSON count
- average latency
- p95 latency
- benchmark pack id
- scenario seed version

## 6. Fail-fast rules

Abort benchmark runs if any of the following is true:

- runtime health test fails
- provider cannot produce valid JSON in warmup
- fallback rate exceeds `10%`
- invalid JSON rate exceeds `5%`
- average latency exceeds profile budget by `25%`

## 7. Headroom rules

Promotion comparisons require:

- p95 latency within profile limit
- no more than `10%` performance regression in latency from baseline
- enough free memory to avoid repeated timeout variance

## 8. Frozen comparison rule

Promotion comparisons are only valid when all of these are frozen:

- benchmark pack id
- scenario set
- provider mode
- model id
- timeout policy
- artifact under test

## 9. Snapshot rule for async PvP

Async PvP must use immutable snapshots.

Freeze:

- prompt fingerprint
- retrieval policy version
- artifact id
- scenario id
- benchmark pack version

Do not evaluate live mutable agents against stale snapshots.

## 10. Logging requirements

During benchmark and async PvP runs, record:

- run manifest
- per-scenario latency
- per-scenario fallback flag
- per-agent trace validity
- final metrics

## 11. Promotion safety rule

If the runtime profile is noisier than allowed, the system must:

- keep the run result for debugging
- mark it non-authoritative
- prevent auto-promotion

## 12. Implementation rule

Promotion code must read this file before making artifact decisions.
