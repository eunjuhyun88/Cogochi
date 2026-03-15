# Surface Spec: journal

- Status: active
- Canonical route entry: `/journal`
- Surface ID: `journal`

## Purpose

`journal` is the return-pressure surface that turns a finished proof run into one obvious next action.

It must let the player:

- see the latest accepted, reverted, or quarantined mutation
- see which historical frame shaped the current body
- understand current care pressure
- choose the next repair, spar, or proof step

If `journal` feels like a dump of logs instead of a compelling return point, it has failed.

## Core Outcome

After opening `/journal`, the player should immediately know:

- what just happened
- what changed on the creature
- what to do next

## Must Have

- latest mutation and frame surfaced first
- current care action above older history
- direct links back to lab, field, and battle
- handed-off doctrine session remains readable after battle return
- latest `ProofArtifact` is the first source of truth for mutation/result context; route query is fallback only
- visible trust and body-change story
- runtime distill guidance surfaced as an advisory rail
- memory index tiers translated into one obvious next repair or proof step
- canonical battle return should normally arrive with `artifact` plus lightweight identity context, not a second duplicated outcome summary

## Context Contracts

## Routes

- `/journal`

## Stores

- `rosterStore`
- `labStore`
- `proofStore`

## Deep Links

- `docs/product-specs/evolution.md`
- `docs/design-docs/judgment-tamagotchi-loop.md`
- `docs/exec-plans/active/COGOCHI_pokemon_grade_autoresearch_20260313.md`
