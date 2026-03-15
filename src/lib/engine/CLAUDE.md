# Engine Guardrails

This directory is the deterministic rules zone.

## Owns

- judgment quality calculation
- battle resolution
- score formulas
- outcome explanation primitives

## Must Not Do

- read UI state directly from routes or components
- own rendering code
- hide outcome changes behind random rolls by default
- depend on RAG or live model calls for core resolution

## Required Invariants

- identical input must produce identical output
- price input is read-only
- scoring logic must stay typed and explainable
- stores may call engine code, but engine code must not depend on stores

## If You Change This Layer

Re-check:

1. deterministic outcome behavior
2. score breakdown readability
3. separation from route and store concerns
