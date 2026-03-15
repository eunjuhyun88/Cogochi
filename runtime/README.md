# Cogochi Runtime Layer

This folder applies the Memento runtime pattern to Cogochi.

The repo now has three explicit layers:

1. `Core`
   - canonical product truth in repo docs and app code
2. `Memory`
   - owned-agent memory writeback in `src/lib/services/memory/`
3. `Runtime`
   - boot bundles, memory indexing, distillation, and adapter-facing prompts in `runtime/`

## Why This Exists

Cogochi is not just a web UI.
It is a judgment RPG with:

- a deterministic evaluation loop
- an owned-agent memory loop
- an optional OpenClaw runtime path

Those concerns should not be mixed inside routes or stores.

## Contracts

- `runtime/runtime-config.json`
  - declares core docs, memory sources, generated outputs, and adapter mode
- `runtime/prompts/`
  - runtime-facing prompts for boot, distill, and relay
- `runtime/jobs/`
  - runnable job contracts
- `runtime/scripts/`
  - repo-local scripts that generate boot bundles and memory reports
- `runtime/generated/`
  - generated runtime artifacts for inspection

## Commands

```bash
npm run runtime:check
npm run runtime:bundle
npm run runtime:index
npm run runtime:distill
npm run runtime:all
```

`runtime:all` should succeed without a live OpenClaw endpoint.
The deterministic game loop remains the source of truth.
