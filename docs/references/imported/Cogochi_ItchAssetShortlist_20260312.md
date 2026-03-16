# Cogochi Itch.io Asset Shortlist

Date reviewed: 2026-03-12
Reviewer: Codex
Purpose: replace the temporary dino direction with itch.io-sourced pixel assets that fit a chart-native web game and do not obviously conflict with the current product direction.

## Selection Rule

Cogochi needs one coherent pixel family for:

- top-down exploration
- party-follow movement
- portrait and roster identity
- battle overlays and UI frames

Do not mix unrelated packs in the same runtime surface.
Use one family for prototype speed, then either keep it or replace it with one stronger production family.

## Recommended Prototype Family

### `Ninja Adventure - Asset Pack` by pixel-boy

Source:

- <https://pixel-boy.itch.io/ninja-adventure-asset-pack>

Why it is the best prototype replacement for `dino`:

- the page states the pack is released under `CC0`
- the page states it can be used in commercial games
- it already covers `16x16`, `Top-Down`, `Tilemap`, `Tileset`, and `User Interface`
- it is one pack instead of a fragmented shopping list
- it is free or pay-what-you-want, so it removes purchase friction from the next implementation cycle

Prototype use in Cogochi:

- replace starter dino placeholders with humanoid field-ready agents
- bootstrap `/field` quickly with walk, follow, and interact states
- reuse window frames and simple UI pieces for dialogue, camp, and battle prompts
- borrow environment tiles only as prototype world material, not as final thematic identity

Known downside:

- the fantasy-adventure tone is not the final best fit for a chart-native modern judgment RPG
- it is best for fast implementation and feel validation, not necessarily the final shipped visual identity

## Recommended Production Family

Use LimeZu as the likely final production direction if the product keeps a cozy modern town / lab / city-edge feel.

### `Modern Interiors - RPG Tileset [16x16]` by LimeZu

Source:

- <https://limezu.itch.io/moderninteriors>

Relevant fit signals from the page:

- described as `16x16 tilesets for your top-down game`
- includes a character generator system
- includes `100+ outfits`, `200 hairstyles`, `80 accessories`, and multiple character animations
- has a paid license section that says the asset can be edited and used in commercial or non-commercial projects

Use for:

- lab
- archive
- camp room
- agent portrait and body generator
- accessory-driven visible growth pipeline

### `Modern Exteriors - RPG Tileset [16x16]` by LimeZu

Source:

- <https://limezu.itch.io/modernexteriors>

Relevant fit signals from the page:

- described as `16x16 tilesets for your top-down game`
- includes streets, buildings, and city details
- includes animated vehicles from cars to trucks
- has a paid license section that says the asset can be edited and used in commercial or non-commercial projects

Use for:

- `/field`
- trainer plaza
- battle gate approach zones
- city-edge chart terrain wrappers

### `Modern User Interface - RPG asset pack [16x16]` by LimeZu

Source:

- <https://limezu.itch.io/modernuserinterface>

Relevant fit signals from the page:

- described as `16x16 assets for your top-down game`
- includes various window frames and styles
- includes `42` buttons and props for shops and inventories
- includes a portrait generator synced with `Modern Interiors`
- has a paid license section that says the asset can be edited and used in commercial or non-commercial projects

Use for:

- dialogue windows
- field prompts
- party and roster UI chrome
- battle command frame styling

## Rejected For Direct Use

### `Pixel Plains - Top-Down Asset Pack` by SnowHex

Source:

- <https://snowhex.itch.io/pixel-plains?utm_source=Pinterest&utm_medium=organic>

Why it should not be imported directly:

- the page explicitly says the assets cannot be used in a `crypto, NFT, p2e, or meta-related project`

It remains useful as:

- a structural field-reference
- a mood reference for cozy top-down travel

It should not be copied into runtime assets unless the creator gives separate permission.

## Decision

For the next implementation phase:

1. use `Ninja Adventure` as the no-friction prototype family to replace dino placeholders
2. treat `LimeZu Modern Interiors + Modern Exteriors + Modern User Interface` as the preferred production family
3. keep `Pixel Plains` as reference only

## Adoption Rule

No asset should enter `static/assets/` until:

1. the exact pack page is recorded here
2. the intended use surface is recorded
3. the license is reviewed against the current product context
4. the pack family is assigned to either `prototype` or `production`
