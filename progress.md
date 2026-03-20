Original prompt: dinoCharactersVersion1.1.zip 에 들어 있는 dino pixel character assets를 Cogochi에 적용하고 싶다.

2026-03-12

- Confirmed the archive contents: four 24x24 sprite sheets (`doux`, `mort`, `tard`, `vita`), four matching GIFs, two Aseprite sources, a shadow sprite, and a changelog.
- Confirmed the repo currently has docs/tooling bootstrap but no runnable app surface, so the practical integration target is a static raising preview under `static/`.
- Decided to map the four dino variants to Cogochi-style party roles for a roster/raising preview:
  - `doux` -> scout
  - `mort` -> analyst
  - `tard` -> risk
  - `vita` -> executor
- Copied the four sprite sheets and shared shadow sprite into `static/assets/dino/`.
- Added a provenance note in `docs/references/imported/Cogochi_DinoAssets_20260312.md`.
- Built `static/dino-raising-preview/` with:
  - clickable roster cards
  - selected-agent display
  - four training actions
  - chart-aware training projection cards
  - full active-party strip
- Added URL-state support so specific preview states can be opened directly with `?agent=<id>&action=<id>`.
- Verified the preview visually with Playwright screenshots on:
  - `/static/dino-raising-preview/`
  - `/static/dino-raising-preview/?agent=vita&action=spar`
- Added one original bench mascot, `Coglet`, so the preview now keeps the dino set while also testing a Cogochi-native character silhouette.
- Expanded the original mascot direction into a full four-role Coglet family and added a family switch so the preview can swap between imported dino roles and original mascot roles.

TODO

- If the repo gets a real SvelteKit surface, migrate this preview into `/roster` and `/agent/[id]`.
- Decide whether to keep the four dino variants as temporary placeholders or formal starter archetypes.

2026-03-12

- Began bootstrapping the real app surface instead of extending the static preview further.
- Added a minimal SvelteKit runtime skeleton so the repo can host actual routes under `src/routes/`.
- Implemented a first owned-agent vertical slice:
  - `/`
  - `/roster`
  - `/agent/[id]`
  - `/lab`
- Added local-first stores for roster and lab state using `localStorage`.
- Added a deterministic compare engine that scores the same fixed scenario before and after a loadout change.
- Kept the scope intentionally narrow: this is not a full battle canvas yet, but it does prove the founder goal of `change setup -> compare capability`.

TODO

- Install dependencies and validate `npm run check` and `npm run build`.
- If the first routes work, add `/team` and then a true `/battle` evaluation console.
- Replace the deterministic compare stub with real engine-backed scenario traces once `src/lib/engine/` is implemented beyond placeholders.

2026-03-12

- Restored the imported dino family inside the real SvelteKit app, not just the legacy static preview.
- Added `Doux`, `Mort`, `Tard`, and `Vita` back into `starterAgents` as OpenClaw-owned agents mapped to the four squad roles.
- Added sprite metadata to `OwnedAgent` so the app knows how many frames a sheet contains.
- Replaced raw sprite-sheet `<img>` rendering with a cropped `PixelSprite` component so roster/detail cards show one crisp pixel frame instead of the whole strip.
- Reconciled persisted roster state so existing localStorage users automatically receive missing starter agents instead of staying stuck on an older Coglet-only roster.
- Reconciled lab state so the selected agent always falls back to a valid roster member and defaults to a dino starter on fresh state.
- Verified:
  - `npm run check`
  - `npm run build`
  - SSR output for `/roster` includes `Doux`, `Mort`, `Tard`, `Vita`, and `Imported dino`
  - preview screenshots saved to `.agent-context/browser-checks/roster-dino.png` and `.agent-context/browser-checks/agent-doux.png`

TODO

- Add a visible family filter or segmented switch inside the real `/roster` surface if the mixed roster starts feeling crowded.
- Consider animating idle frames in `PixelSprite` once the roster/detail surfaces are stable.

2026-03-12

- Added a first real `/battle` route so the product no longer stops at roster/lab compare surfaces.
- Introduced `src/lib/engine/battle-view.ts` to translate one owned agent + scenario into a deterministic chart-stage view model:
  - family squad resolution
  - scenario-specific chart candles
  - support/resistance/liquidation/objective zones
  - squad comms
  - command cards
  - phase trail
- Added `ChartBattlefield.svelte`:
  - dark chart-first stage
  - active slice highlight
  - visible block structures for support/wall/liquidation/objective
  - player pressure trail
  - rival downward pressure arrows
  - pixel dino/coglet companions over the active slice
- Added Battle navigation into the shell and entry links from hub/lab/agent detail.
- Hooked battle route state into `window.render_game_to_text` via `window.__cogochi_text_state`.
- Reference analysis from the user-provided images:
  - Keep: upward/downward pressure, literal wall/floor/trap nouns, readable verbs, strong top-vs-bottom ownership.
  - Reject: soft 3D mascot rendering style, overloaded labels everywhere, non-chart fantasy clutter.
- Verified:
  - `npm run check`
  - `npm run build`
  - `/battle` SSR contains `Battle Console`, `Decision Layer`, `Squad Comms`, and `Rival pressure slams downward`
  - preview screenshot saved to `.agent-context/browser-checks/battle-console.png`

TODO

- Add actual companion movement over time instead of only staged positions.
- Add wall break / trap collapse state transitions so results animate, not just render.
- Add a short-vs-long scenario switch test pass to confirm top-entry short fights read as clearly as bottom-entry long fights.

2026-03-12

- Upgraded `/battle` from a passive evaluation scene into a controllable command-loop closer to a Pokemon battle menu.
- Added `src/lib/engine/battle-session.ts`:
  - deterministic battle session bootstrap
  - command deck (`Focus Tap`, `Memory Pulse`, `Risk Veto`, `Retarget`)
  - turn-by-turn state updates for support, wall, trap, momentum, and rival pressure
  - win/loss resolution and battle log generation
- Added `src/lib/stores/battleStore.ts` so battle state lives in a store instead of route-local logic.
- Expanded `src/lib/engine/battle-view.ts` so the rendered battlefield now depends on session state:
  - selected command
  - last used command
  - zone strength
  - companion movement progress
  - latest battle log callout
- Updated `/battle`:
  - keyboard controls
    - `1-4` select command
    - arrow keys move selection
    - `Enter` executes
    - `R` resets the battle
  - command deck panel
  - turn counter
  - battle log panel
  - live support/wall/trap/momentum metrics
- Updated `ChartBattlefield.svelte`:
  - structure stacks now react to integrity/risk
  - companion and callout positions transition between turns
  - battlefield footer shows selected/used command state and battle meters
- Verified:
  - `npm run check`
  - `npm run build`
  - preview screenshot saved to `.agent-context/browser-checks/battle-control-console-full.png`
- Limitation:
  - headless screenshot verification worked, but direct scripted keypress automation through Playwright package import still failed in this environment because the `playwright` module is not locally resolvable from ad-hoc Node scripts.

TODO

- Add command execution animation states so one `Enter` press visibly advances the squad between frames, not just between static turn states.
- Add opponent-side units or hazard entities so commands feel like targetable encounters, not just pressure meters.
- Add a small target-selection sub-menu after `Retarget` or `Focus Tap` if you want it to feel even closer to classic Pokemon turn flow.

2026-03-12

- Reframed the product target as a `judgment tamagotchi` instead of only a configurable battle lab.
- Added a stable design doc for what makes the agent-training platform meaningful:
  - authored doctrine and setup
  - visible companion transformation
  - deterministic before/after proof
  - judgment-native care loop
  - persistent squad identity
- Added an active execution plan focused on reaching that loop end-to-end.
- Updated the founder goal, autoresearch org model, scorecard, and bottleneck ranking so `visible ownership + training proof + care loop` are now the primary optimization targets.
- Updated the raising evaluator and branch score script so they no longer over-credit the old static preview and now explicitly score:
  - ownership
  - training proof
  - transformation
  - care loop
  - session pull

TODO

- Add explicit growth and keepsake fields to the `OwnedAgent` runtime model.
- Render growth state and keepsakes in `/roster` and `/agent/[id]`.
- Make one training commit and one reflection outcome write a visible change plus a next care action.

2026-03-12

- Added a first runtime version of visible agent growth inside the real app.
- Extended `OwnedAgent` with:
  - `growthStage`
  - `keepsakes`
  - `careState`
  - `nextCareAction`
- Seeded both dino and Coglet starters with visible progression state instead of only hidden loadout state.
- Updated the roster and agent detail surfaces so growth state, keepsakes, and next care actions are now visible to the player.
- Updated training commit writeback so positive reruns can advance growth and mint keepsakes, while weak reruns create care-state follow-up actions.
- Re-ran the raising evaluator after the runtime change; the branch now satisfies the current transformation and care-loop checks under the new autoresearch rubric.

TODO

- Replace text-only keepsakes with real sprite overlays or accessory slots.
- Add explicit growth-state animation or silhouette changes in `PixelSprite`.
- Connect post-battle reflection so battle outcomes, not only lab commits, can mint keepsakes and care states.

2026-03-12

- Reviewed itch.io asset candidates to replace the temporary dino family.
- Locked the current asset strategy:
  - `Ninja Adventure - Asset Pack` as the fast CC0 prototype family
  - `LimeZu Modern Interiors + Modern Exteriors + Modern User Interface` as the preferred production family
  - `Pixel Plains` as reference only because its page forbids crypto/NFT/p2e/meta-related use
- Added a stable full-game direction doc for turning Cogochi into a real chart-native web game with:
  - `/field`
  - top-down travel
  - party follow
  - battle-gate entry
  - chart-slice motion verbs
  - return-to-care loop
- Added a dedicated `/field` surface spec.
- Added a detailed full-game autoresearch execution plan with:
  - route map
  - user journeys
  - action vocabulary
  - phase-by-phase task tree
  - worker roles
  - evaluator set
- Added new autoresearch worker manifests:
  - `asset-curator`
  - `field-loop-builder`
- Added a new field-loop evaluator:
  - `scripts/autoresearch/run-field-loop-eval.mjs`
  - `tools/field-loop-eval.json`
  - `npm run autoresearch:field`
- Updated the founder goal, org plan, scorecard, bottlenecks, and program so the next optimization target is now:
  - ship `/field`
  - remove dino placeholders from the active path

2026-03-20

- Began `chart-game-20260320` on branch `codex/chart-game` to turn `/field` into a true chart-command game loop instead of a travel-only surface.
- Added a deterministic field encounter engine in `src/lib/engine/field-encounter.ts` with:
  - frame-local `LONG` / `SHORT` / `HOLD` / `RUN` resolution
  - support / resistance / hazard reads derived from the next hidden candle
  - run stats for HP, gold, XP, cleared frames, and streaks
  - camp healing support
- Extended `FieldState` and `fieldStore` so the active historical frame now boots and advances an encounter without leaking scoring into the route.
- Updated `/field` to add:
  - a sacred bottom command dock
  - `1-4` hotkeys for the four commands
  - encounter-aware console copy and `render_game_to_text` state
  - a gate rule that blocks boss entry until the current slice is cleared
- Updated `FieldScene.svelte` so the active frame now shows:
  - revealed vs hidden candles
  - support / resistance / hazard guide lines
  - the recommended command directly on the chart
- Added controller-friendly dock navigation so the field test loop can move selection with arrow keys and resolve with `Enter` while travel remains on `WASD`.
- Verified:
  - `npm run check`
  - Playwright client pass on `/field` with command execution evidence:
    - `.agent-context/browser-checks/chart-game/shot-0.png`
    - `.agent-context/browser-checks/chart-game/state-0.json`
  - Playwright client pass on `/field` with clear-state evidence:
    - `.agent-context/browser-checks/chart-game-clear/shot-0.png`
    - `.agent-context/browser-checks/chart-game-clear/state-0.json`
  - `npm run build`

TODO

- Make travel and battle motion feel more animated between command resolutions, not just before and after each reveal.

TODO

- Import the chosen itch prototype family into `static/assets/` and remove dino from the main path.
- Build the actual `/field` route with camp, lab, archive, and gate.
- Make battle results return to camp with keepsake and care writeback.

2026-03-20

- Followed `chart-game-20260320` with `battle-command-alignment-20260320` so `/battle` now speaks the same `LONG` / `SHORT` / `HOLD` / `RUN` grammar as `/field`.
- Replaced legacy battle command IDs across `src/lib/types.ts`, `src/lib/engine/battle-session.ts`, and `src/lib/engine/battle-view.ts` so recommendation, role copy, and deterministic resolution all align around the canonical four-command model.
- Updated `src/lib/stores/battleStore.ts` to use `cogochi.battle.v4` so stale local sessions from the legacy command deck do not leak into the new grammar.
- Reworked `src/routes/battle/+page.svelte` so the battle dock now reads as:
  - `Climb / LONG`
  - `Break / SHORT`
  - `Wait / HOLD`
  - `Escape / RUN`
- Tightened the battle route into the `immersive` shell and reduced the stage/menu height budget so the full 2x2 command deck stays visible without scrolling.
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright battle grammar/layout pass:
    - `.agent-context/browser-checks/battle-commands-v4/shot-0.png`
    - `.agent-context/browser-checks/battle-commands-v4/state-0.json`

TODO

- Add explicit between-turn animation beats on `/battle` so correct `LONG` / `SHORT` plays feel more physical than meter and log changes alone.

2026-03-20

- Added `premium-uiux-pass-20260320` to push the playable surfaces toward a `Nintendo-clear + Apple-polished` feel instead of stopping at functional readability.
- Reworked `src/components/shared/PageShell.svelte` so the whole product now shares one premium presentation layer:
  - calmer black-glass shell background
  - warmer metal highlights
  - cleaner navigation card depth and active-state feedback
- Reworked `src/routes/field/+page.svelte` and `src/components/shared/FieldScene.svelte` so `/field` now reads more like a premium toy-world screen:
  - brighter depth in the chart-world sky and terrain
  - tighter glass plaque and command dock surfaces
  - more tactile `LONG` / `SHORT` / `HOLD` / `RUN` buttons
  - denser, cleaner companion console chrome on the right rail
- Reworked `src/routes/battle/+page.svelte` and `src/components/shared/ChartBattlefield.svelte` so `/battle` now reads more like a polished JRPG cut-in:
  - stronger battlefield glass and metal layering
  - improved command-card contrast and command-specific tone backgrounds
  - more legible bottom action bar and toolbar controls
  - fixed the resolve label mapping so `HOLD` and `RUN` no longer fall back to legacy battle wording
- Verified:
  - `npm run check`
  - `npm run build`
  - Premium field browser pass:
    - `.agent-context/browser-checks/premium-uiux-field/shot-0.png`
    - `.agent-context/browser-checks/premium-uiux-field/state-0.json`
  - Premium battle settled browser pass:
    - `.agent-context/browser-checks/premium-uiux-battle-final/shot-0.png`
    - `.agent-context/browser-checks/premium-uiux-battle-final/state-0.json`

TODO

- Add one or two short transition animations between command selection and outcome reveal so the upgraded visuals also carry a stronger hit/response rhythm.

2026-03-12

- The previous `/field` work was too documentation-heavy and did not yet prove real movement. This pass corrected that by shipping an actual controllable dino field slice.
- Added the real `/field` route runtime:
  - `WASD` / arrow-key movement
  - `Shift` run modifier
  - `E` / `Enter` / `Space` interaction
  - 4-dino follow-party motion instead of static placement
  - camp / lab / archive / battle gate markers on the chartfield
- Added `src/lib/stores/fieldStore.ts` to own deterministic field stepping, follower spacing, node detection, and barrier collision.
- Added `src/components/shared/FieldScene.svelte` to render the chart-native top-down playfield with:
  - party sprites

2026-03-15

- Replaced the old `/` dashboard-style hero with a real trainer hub layout built around one featured agent.
- The new home route now has:
  - left state rail for bond, trust, memory quality, risk discipline, specialization, current form, and recent lesson
  - center stage with the featured character, three visible companions, keepsakes, and a deploy CTA
  - right action rail with tabbed `Customize`, `Care`, `Growth`, `Memory`, and `Doctrine` panels
  - bottom quick dock for gift / outfit / memory / train / team / deploy
  - lower sections for recommended proof routes and party swapping
- Kept the implementation scoped to `src/routes/+page.svelte` so it would not collide with the current shared-component field claim.
- Added lightweight home-hub interaction prototypes without changing persistence:
  - stage appearance preview modes
  - care verb preview modes
  - click a companion or squad card to feature that agent on the home stage
- Verified:
  - `npm run check`
  - `npm run build`
  - `npm run preview -- --host 127.0.0.1 --port 4173` (landed on `http://127.0.0.1:4176/`)
  - Playwright client screenshot + text state in `output/web-game/hub-home/`
  - full-page screenshot in `output/web-game/hub-home/full-page.png`
  - interaction check screenshot in `output/web-game/hub-home/interaction-check.png`
  - manual interaction assertion: clicking `Care` then `Mort` updated the featured heading to `Mort` with no console errors

TODO

- Persist home-hub customization and care preview choices if this should become real progression state instead of UI-only preview.
- Move the home-hub featured stage into a dedicated shared component once the current field/shared claim is no longer active.
- Expand `render_game_to_text` coverage for the hub if we want richer automated UI assertions than selected agent + scenario.

2026-03-15

- Added `src/lib/stores/hubStore.ts` so the home hub now owns its own persisted UI state instead of keeping panel/preview mode in route-local state.
- `hubStore` currently persists:
  - active hub panel
  - center-stage style preview mode
  - active care mode
- Updated `src/routes/+page.svelte` to use `hubStore` for all tab and quick-dock actions.
- Added a route-level `window.__cogochi_text_state` payload on `/` so the home surface now reports:
  - featured agent
  - active panel
  - style preview
  - care mode
  - care state
  - next care action
  - active scenario
  - recent lesson
  - weak link
  - keepsakes
  - companion names
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright client capture in `output/web-game/hub-home-persistence/`
  - manual persistence check via Playwright:
    - switched to `Care`
    - selected `Gift`
    - featured `Mort`
    - reloaded
    - confirmed `cogochi.hub.v1` and `cogochi.roster.v2` were both restored
    - confirmed `window.render_game_to_text()` returned `mode: "hub"` with the restored state
  - reload screenshot saved to `output/web-game/hub-home-persistence/reload-check.png`

TODO

- Decide whether style preview and care mode are only session-level UI memory or should eventually map to real progression/care mechanics.
- If home interactions become gameplay-relevant, promote `hubStore` contracts into a formal surface spec or store authority doc.

2026-03-15

- Wired runtime-generated memory outputs into the playable return loop instead of leaving them as offline artifacts.
- Added server-side runtime artifact loading:
  - `src/lib/server/runtimeArtifacts.js`
  - `src/routes/journal/+page.server.ts`
  - `src/routes/battle/+page.server.ts`
- Upgraded `/journal` into a real post-proof review surface:
  - return summary from battle query params
  - nightly distill goal
  - promotion rules
  - suggested next checks
  - indexed memory rails by tier
  - focused rail for the selected creature
- Upgraded `/battle` so verdict-complete battles can now hand off directly into `/journal` via `Open journal review`, while keeping direct field return as a secondary path.
- Updated runtime autoresearch readiness so it now checks runtime artifact consumption in journal and battle, not just artifact generation.
- Verified:
  - `npm run check`
  - `npm run build`

2026-03-15

- Applied the first real visual pass to `/battle` so the route reads more like a staged clash and less like a stacked analytics dashboard.
- Reworked `src/routes/battle/+page.svelte` into:
  - a stage-first main column
  - a compact side rail for captain call, battle log, and mutation pressure
  - a more menu-like four-card command deck
  - an integrated verdict block instead of a detached lower summary wall
- Kept the deterministic battle/store logic intact and limited the change to route hierarchy and styling.
- Sanitized runtime focus checks in the battle brief so internal file-path style messages no longer blow up the top hero area.
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright preview screenshots saved to:
    - `.agent-context/browser-checks/battle-visual-pass-preview/shot-0.png`
    - `.agent-context/browser-checks/battle-visual-pass-preview/shot-1.png`
  - `render_game_to_text` state advanced from turn 2 to turn 3 during the screenshot pass

TODO

- Compress the entry toolbar one more step if you want even more of the battlefield visible above the fold on laptop-height screens.
- Apply the same material split to `/journal` next so battle and return surfaces feel like two modes of one world.
  - `npm run runtime:all`
  - `npm run docs:refresh`
  - `npm run docs:check`
  - `npm run ctx:check -- --strict`
  - `npm run autoresearch:runtime`
  - `npm run autoresearch:score`
- Browser limitation:
  - Playwright launch is blocked in this sandbox by macOS Mach-port permission errors, so full interactive browser automation could not be rerun end-to-end here.
  - Journal verification used generated state/screenshot artifacts:
    - `.agent-context/browser-checks/runtime-journal/state-0.json`
    - `.agent-context/browser-checks/runtime-journal/shot-0.png`
    - `.agent-context/browser-checks/runtime-journal-return/state-0.json`
    - `.agent-context/browser-checks/runtime-journal-return/shot-0.png`

TODO

- Feed runtime distill hints into `/field` HUD so the return surface pressures the next gate choice even before opening `/journal`.
- Consider adding a battle result card that auto-focuses the specific runtime rail entry matching the weak gene instead of only showing generic distill checks.
  - trend lines
  - support / pit / resistance geometry
  - objective nodes
- Fixed a real input/testing bug:
  - `src/routes/+layout.svelte` had been overwriting `window.advanceTime` with a noop after mount, which made the field feel dead under deterministic browser tests
  - `/field` now keeps its own time-step hook, and restores the noop on cleanup
- Improved `/field` focus behavior so the stage claims focus on mount and is keyboard-ready immediately.
- Verified actual play behavior with Playwright:
  - `.agent-context/browser-checks/field-smoke/`
  - `.agent-context/browser-checks/field-move-run/`
  - `.agent-context/browser-checks/field-lab-run/`
- Verified that:
  - the dino squad moves across the field
  - the follower chain trails the leader
  - node range updates from `Camp` to `Keep moving`
  - moving onto `Lab Bench` and interacting transitions into `/lab`

TODO

- Make the field read more like a real game scene:
  - reduce oversized text cards inside the stage
  - give nodes clearer marker silhouettes
  - make party sprites larger and easier to read over the chart background
- Add direct `/field -> /battle -> /camp return` writeback so this becomes a complete loop instead of a route handoff.
- Add idle / walk animation polish and collision feedback so the field feels alive instead of only functional.

2026-03-12

- Optimized `/field` layout after user feedback that the screen felt clipped.
- Main changes:
  - moved `Field Log` out of the right sidebar and into its own full-width row below the stage
  - kept the two most important live cards (`Objective`, `Nearby Node`) beside the stage on desktop
  - lowered the stack breakpoint so 1024px-class laptop widths keep the game stage and key info side by side longer
  - added a sticky, internally scrollable desktop sidebar so the right panel no longer gets cut off on shorter viewports
  - tightened mobile shell spacing and nav pill sizing to reduce wasted height on small screens
- Verified responsive captures at:
  - `.agent-context/browser-checks/field-fit-final2-1180x720.png`
  - `.agent-context/browser-checks/field-fit-final2-1024x720.png`
  - `.agent-context/browser-checks/field-fit-final2-390x844.png`

TODO

- Reduce in-stage node copy density further so the chartfield reads more like a world and less like overlay cards.
- Consider shrinking or fading non-nearby node labels at narrow widths.

2026-03-12

- Refactored `/field` away from the card-heavy dashboard look and into a chart-first battlefield surface.
- Removed the big external text panels and rebuilt the page as one dominant stage with small diegetic HUD overlays only.
- Reworked the in-stage HUD:
  - top-left: tiny mode / objective / scenario chips
  - top-right: compact control hints
  - bottom-left: squad rail with pixel portraits and role marks
  - bottom-right: interaction prompt or objective fallback
- Reworked `FieldScene` to remove text-heavy world cards:
  - barrier labels removed
  - node descriptions removed
  - nodes now render as compact beacon pylons with glyphs only
  - agent nameplates removed from the battlefield
  - leader now uses a small gold marker instead of a text tag
- Tightened the stage width so the field reads like one focused chart arena instead of a wide panel with dead space.
- Verified:
  - desktop screenshots:
    - `.agent-context/browser-checks/field-stage-first-tight-1180x720.png`
    - `.agent-context/browser-checks/field-stage-first-live/shot-0.png`
  - mobile screenshot:
    - `.agent-context/browser-checks/field-stage-first-tight-390x844.png`
  - movement still works after the HUD refactor:
    - `state-0.json` in `.agent-context/browser-checks/field-stage-first-live/`

TODO

- Mobile still compresses the battlefield hard because the field renderer is fixed to the 912x540 internal coordinate space. A real camera/scale system is the next structural fix.
- Add actual clash cues on the field:
  - downward enemy pressure
  - breakout sparks
  - trap pulses
  - battle-gate approach animation

2026-03-12

- Expanded the actual chartfield traversal space instead of only polishing the camera:
  - world size increased from `1824x1080` to `2736x1620`
  - movement speeds increased so the larger field does not feel sluggish
  - camp, lab, archive, gate, and barrier placements were spread across the wider field
- Fixed the field camera bug:
  - camera now uses the real scene viewport size instead of the whole world dimensions
  - grid and world layers now move with the camera, so traversal reads like movement through a chart battlefield instead of a static panel
- Broke the field surface out wider and taller:
  - `/field` now uses a wider shell than the standard app pages
  - the viewport height is explicitly sized so the battlefield does not collapse to a shallow strip
- Reframed the field visuals around actual chart frames:
  - added `src/lib/engine/chart-frame-model.ts` as shared candle generation for field and battle
  - `/battle` now consumes shared scenario candles instead of its own local template builder
  - `/field` now renders real scenario candlesticks and frame windows instead of abstract trend scribbles
  - the visible chart windows tint by frame tone (`bull`, `bear`, `flat`)
  - the active frame follows the party position across the BTC scenario
- Increased field readability:
  - field dinos enlarged to `84px`
  - node beacons enlarged
  - start and moved states are visibly different because the chart candles and frame windows shift under the camera
- Verified:
  - `npm run check`
  - `npm run build`
  - direct browser screenshots:
    - `.agent-context/browser-checks/field-btc-frame-start/shot-0.png`
    - `.agent-context/browser-checks/field-btc-frame-move/shot-0.png`
  - direct movement state:
    - `.agent-context/browser-checks/field-btc-frame-move/state-0.json`

TODO

- Bind chartfield frame selection more explicitly to named BTC historical windows instead of only interpolated scenario candles.
- Convert more barriers into candle-native geometry so support/resistance feel less like generic panels and more like price structures.
- Add a visible frame label or encounter cue when the squad crosses into a new chart window.

2026-03-12

- Replaced the synthetic BTC frame windows with actual historical BTC `15m` windows on `/field`.
- Added a shared history-frame model in `src/lib/engine/chart-frame-model.ts` with six real BTC event slices:
  - China Crackdown Flush
  - FTX Collapse Flush
  - Bank Crisis Rebound
  - ETF Headline Whipsaw
  - Spot ETF Approval Whipsaw
  - ATH Sweep Reversal
- Each BTC frame now carries:
  - exact UTC window label
  - event title
  - event note
  - real OHLCV candle data
- `/field` no longer renders BTC as one synthetic continuous line.
  - it now renders separate historical chart panels across the traversable world
  - active panel selection follows the player position
  - a history card shows the current event name, date range, and explanation
- Verified visually:
  - start state: `.agent-context/browser-checks/field-history-start/shot-0.png`
  - moved state: `.agent-context/browser-checks/field-history-move/shot-0.png`
  - moved state switched to `ETF Headline Whipsaw`

TODO

- Surface the active historical frame name in the top HUD chips too, not only inside the in-stage history card.
- Bind battle-gate entry to the currently active historical BTC frame so the battle route inherits the same real window.
- Replace generic field barriers with more candle-native support/resistance structures per event frame.

2026-03-12

- Added a new Atlas-to-Cogochi evolution architecture so the product can represent AI learning as a visible game loop instead of hidden prompt tuning.
- New canonical additions:
  - `docs/design-docs/atlas-judgment-evolution.md`
  - `docs/product-specs/evolution.md`
- Reframed the product/autoresearch docs around:
  - `4 visible companions + 25-node internal judgment council`
  - `trust weights` as player-readable instincts
  - `keep / revert / quarantine` mutation verdicts on fixed historical proof packs
  - `proven frames` as named BTC history slices that validate growth
- Updated the autoresearch operating docs:
  - `program.md`
  - founder goal
  - scorecard
  - ranked bottlenecks
- Extended the branch evaluator to score:
  - mutation proof readiness
  - trust calibration readiness
  - explanation clarity readiness
- Kept the work scoped to design and evaluation structure so implementation can expand from a stable game-facing contract.

TODO

- Add `trustWeight`, `weakLink`, `mutations`, and `provenFrames` to the owned-agent runtime model.
- Ship `Evolution Log` and `Mutation Bench` UI on `/agent/[id]` and `/lab`.
- Make `/battle` explanations cite trusted voices and proven historical frames directly.

2026-03-12

- Implemented the first real evolution runtime on top of the earlier Atlas-style design.
- Expanded `OwnedAgent` with:
  - `trustWeight`
  - `trustedInstincts`
  - `weakLink`
  - `provenFrames`
  - `mutations`
- Extended the deterministic eval engine so each report now carries:
  - trusted instincts
  - weak link and weak-link gene
  - captain call
  - objection
  - reference proof frame
- Added deterministic mutation verdicts:
  - `ACCEPTED`
  - `REVERTED`
  - `QUARANTINED`
- `rosterStore.applyTraining()` now behaves like a mutation proof step:
  - accepted mutations promote the loadout and can mint keepsakes
  - reverted or quarantined mutations do not promote the loadout
  - every attempt writes mutation history and proven-frame history
- Updated the real app UI:
  - `/roster` now surfaces trust and weak-link hints
  - `/agent/[id]` now includes Brain Garden, Proven Frames, Evolution Log, and Mutation Bench sections
  - `/lab` now reads as a mutation bench instead of a generic tuning form
  - `/battle` now cites proof frame, weak link, trusted instincts, and mutation review context
- Browser verification:
  - `.agent-context/browser-checks/evolution-agent-doux/shot-0.png`
  - `.agent-context/browser-checks/evolution-lab/shot-0.png`
  - `.agent-context/browser-checks/evolution-battle/shot-0.png`
  - lab commit smoke check confirmed verdict + latest proof text appears after pressing `Run mutation proof`

TODO

- Add explicit manual `Keep / Revert / Quarantine` controls instead of auto-deciding at commit time.
- Make battle-side execution write back directly into the same mutation review flow instead of only lab commits.
- Add sprite overlay rendering so accepted mutation categories visibly change the actual pixel body, not only chips and text.

- Converted the chartfield into a real battle-entry loop instead of a disconnected field mock:
  - `/field` now always renders named BTC historical frames instead of borrowing the current lab scenario
  - the active BTC frame maps into a battle scenario and is passed into `/battle?entry=field&frame=...`
  - `/battle` now uses the selected historical frame as the stage context and can return back to `/field`
  - returning from battle now writes a readable field-state message such as `The squad returned from Bank Crisis Rebound with a clean finish.`
- Strengthened the eval loop to match the new runtime:
  - `run-field-loop-eval.mjs` now checks for active historical-frame battle entry, field-side BTC history rendering, and return-to-field support
  - `evolution.md` now explicitly requires explaining why the captain made the call
- Browser verification:
  - `.agent-context/browser-checks/field-battle-return-loop/battle-entry.png`
  - `.agent-context/browser-checks/field-battle-return-finished/battle-finished.png`
  - `.agent-context/browser-checks/field-battle-return-finished-2/field-after-return.png`

- Closed more of the playable loop instead of just refining the shell:
  - terminal battle outcomes now write back into the owned agent state through `rosterStore.applyBattleOutcome()`
  - battle writeback updates trust, mutation history, proven frames, care state, next care action, and recent lesson
  - battle sessions now track `writebackApplied` so the same result is not recorded twice
  - the battle UI now surfaces a `Battle writeback` block after the result is recorded
- Added visible pixel-body mutation overlays in `PixelSprite`:
  - `INDICATOR` -> antenna/lens
  - `DOCTRINE` -> crest
  - `SCRIPT` -> scarf
  - `MEMORY` -> satchel/sigil
  - `RISK` -> shell
  - `COORDINATION` -> halo
  - strained care states add a damage marker
  - higher growth stages add stronger aura/drop-shadow treatment
- Browser verification:
  - `.agent-context/browser-checks/battle-writeback-sprite-mutation/agent-before.png`
  - `.agent-context/browser-checks/battle-writeback-sprite-mutation/battle-after.png`
  - `.agent-context/browser-checks/battle-writeback-sprite-mutation/agent-after.png`
  - `.agent-context/browser-checks/battle-writeback-sprite-mutation/state.json`

TODO

- Add explicit manual `Keep / Revert / Quarantine` controls instead of only auto-resolution.
- Make field/camp surfaces show the latest mutation or repair need without opening agent detail.
- Replace CSS overlay approximations with real per-family pixel accessory sheets once the visual language is locked.

2026-03-13

- Closed the missing manual mutation verdict loop instead of leaving evolution on auto-pilot.
- `/lab` now exposes explicit trainer-controlled mutation verdicts:
  - `Keep mutation`
  - `Quarantine`
  - `Revert mutation`
- `/battle` no longer auto-writes terminal outcomes into the roster:
  - the player must now choose a verdict before `Return to field` unlocks
  - battle writeback respects the chosen override
- Extended the eval engine and stores so verdict overrides reuse the same proof comparison while changing:
  - decision
  - visible effect
  - decision reason
  - writeback behavior
- Verified the real flows with browser automation:
  - field movement smoke check:
    - `.agent-context/browser-checks/field-manual-verdict-loop/shot-0.png`
    - `.agent-context/browser-checks/field-manual-verdict-loop/state-0.json`
  - lab quarantine override:
    - `.agent-context/browser-checks/manual-verdict-lab/lab-after-quarantine.png`
    - `.agent-context/browser-checks/manual-verdict-lab/roster-storage.json`
  - battle quarantine override and return loop:
    - `.agent-context/browser-checks/manual-verdict-battle/battle-terminal.png`
    - `.agent-context/browser-checks/manual-verdict-battle/battle-after-quarantine.png`
    - `.agent-context/browser-checks/manual-verdict-battle/field-after-return.png`
    - `.agent-context/browser-checks/manual-verdict-battle-v2/battle-after-quarantine-state.json`
    - `.agent-context/browser-checks/manual-verdict-battle-v2/field-after-return-state.json`
- Found and fixed one messaging gap:
  - field return messaging used raw `WIN/LOSS` only
  - it now also carries the trainer verdict, so `QUARANTINED` returns read as review states instead of clean wins
- Verified again after the fix:
  - battle text state now reports `Trainer verdict: mutation quarantined`
  - field text state now reports `The squad returned from Bank Crisis Rebound; the field proof stays in review.`

TODO

- Surface the latest mutation verdict on the field itself with a minimal world-space badge instead of only through hidden state and battle/lab cards.
- Replace CSS mutation overlays with true pixel accessory sheets so the dino bodies evolve with cleaner silhouette changes.
- Add a manual `Keep / Quarantine / Revert` review surface on `/agent/[id]` so history can be managed outside the battle and lab routes.

2026-03-15

- Pulled the runtime loop out of `/journal` and into `/field` so the chart world now tells the player where to go next without forcing an extra menu hop.
- Added a real server load for `/field`:
  - runtime artifacts now load on the route
  - field return context now comes from server data instead of ad-hoc client query parsing
- Added a top-right in-world `Distill cue` HUD card on `/field`:
  - chooses the next node from verdict state plus the leader's current care state
  - shows one next runtime check from nightly distill
  - keeps the current runtime goal visible on the field itself
- Synced field objective pressure with runtime guidance:
  - accepted proof pushes the squad toward `Battle Gate`
  - quarantined proof pushes toward `Journal Board`
  - reverted proof pushes toward `Lab Bench`
  - care-state drift can redirect to `Archive Well`, `Camp`, or `Spar Gate`
- Updated the field/runtime specs and evaluators so this is now part of the product contract instead of only a UI polish change.
- Verified:
  - `npm run check`
  - `npm run build`
  - `npm run runtime:all`
  - `npm run docs:refresh`
  - `node scripts/dev/refresh-context-retrieval.mjs`
  - `node scripts/dev/refresh-context-registry.mjs`
  - `node scripts/dev/refresh-context-value-demo.mjs`
  - `npm run docs:check`
  - `npm run ctx:check -- --strict`
  - `npm run autoresearch:runtime`
  - `npm run autoresearch:field`
  - `npm run autoresearch:raising`
  - `npm run autoresearch:score`
- Result:
  - `runtime-readiness = 1.0`
  - `field-loop = 1.0`
  - `raising = 0.966`
  - `totalScore = 0.997`

TODO

- Put the runtime cue into world-space markers or beacon FX instead of only the HUD card.
- Feed the chosen runtime check directly into battle pre-brief text so proof objectives feel more authored.
- Replace text-heavy distill phrasing with more game-like verbs once the next encounter layer is deeper.

2026-03-15

- Moved runtime direction one layer deeper into the playable loop:
  - `FieldScene` now renders the active runtime target as a world-space beacon instead of only a HUD destination
  - the squad gets a subtle guide arc toward the current proof or repair node
  - the current runtime action verb now appears over the node itself (`prove`, `review`, `reset`, `anchor`, `tune`, `regroup`, `rehearse`)
- Added a true battle entry brief:
  - `/battle` now opens with a short pre-brief card that names the immediate clash purpose
  - the brief folds together gate type, care-state repair pressure, and one advisory runtime check
  - runtime remains advisory only and does not override deterministic battle scoring
- Raised the contracts accordingly:
  - `field` spec now requires world-space beaconing, not just HUD guidance
  - `battle` spec now requires a short entry brief
  - field/runtime evaluators now verify world-space beacons and battle pre-brief support
- Verified:
  - `npm run check`
  - `npm run build`
  - `npm run runtime:all`
  - `npm run docs:refresh`
  - `npm run autoresearch:runtime`
  - `npm run autoresearch:field`
  - `npm run autoresearch:score`
- Result:
  - `runtime-readiness = 1.0`
  - `field-loop = 1.0`
  - `totalScore = 0.976`

TODO

- Make proof beacons react to distance and pulse harder when the player enters the right historical frame.
- Push the battle brief into world transition timing so gate entry feels like an encounter, not a page swap.
- Add true encounter-specific verbs and effects per gate instead of one shared beacon grammar.

2026-03-15

- Reviewed `/Users/ej/Downloads/files (3).zip` as advisory input rather than canonical product truth.
- Accepted the architecture improvements that fit the current repo direction:
  - clearer frontend/backend separation
  - stronger shared deterministic domain language
  - explicit future `proof` lane instead of vague backtest naming
  - cleaner service/runtime boundaries
- Rejected the imported product drift that conflicts with the canonical judgment RPG:
  - NFT ownership thesis
  - token economy
  - copytrading marketplace-first positioning
  - real-money execution framing
- Updated `CLAUDE.md` so frontend/backend separation is now an explicit repo rule, not an implied preference.
- Updated `docs/TECH_ARCHITECTURE.md` to reflect the new split:
  - frontend = routes/components/stores
  - shared domain = engine/types
  - backend = server routes/lib/server/services/runtime/scripts
- Added a stable review doc:
  - `docs/design-docs/COGOCHI_zip_review_20260315.md`

TODO

- Add a first-class `proof` surface spec so the adopted validation lane becomes canonical beyond architecture docs.
- Continue moving memory/runtime reads out of client stores and into server/runtime boundaries.
- Keep imported business-model docs advisory only unless L0 product truth changes.

2026-03-15

- Clarified the hybrid thesis after revisiting the imported PRD and product pressure.
- Decided that Cogochi should combine the two directions, but in strict order:
  - judgment RPG core first
  - proof and credibility layer second
  - market and monetization layer third
- Added `docs/design-docs/COGOCHI_hybrid_game_market_20260315.md` to make that sequencing explicit.
- Relaxed the earlier zip review stance:
  - marketplace, public track record, and monetization ideas are no longer treated as universally rejected
  - they remain rejected as the core product thesis
  - they are now allowed as downstream layers built on top of proof

TODO

- Promote `proof` into a first-class route and surface spec so the hybrid stack has a real Layer B.
- Keep core surfaces game-first even when market-facing expansion docs are added later.
- If a future `/market` surface appears, require it to consume proof artifacts rather than define evaluation truth.

2026-03-15

- Promoted `proof` from a vague concept into the concrete validation/backtest lane for the repo.
- Added a first-class `/proof` route backed by shared deterministic proof-pack definitions:
  - fixed BTC historical frame bundles
  - explicit weak-link targets
  - weighted judgment metrics
  - `SPAR / PROOF / GAUNTLET` modes
- Added a stable execution document for how proof should be built and expanded:
  - `docs/exec-plans/active/COGOCHI_proof_validation_execution_20260315.md`
- Made proof visible in repo metadata and navigation:
  - `context-kit.json` now registers `proof` as a real surface
  - harness pages include `/proof`
  - home, lab, and agent detail now link into proof
- Added a dedicated autoresearch evaluator:
  - `scripts/autoresearch/run-proof-readiness.mjs`
  - `tools/proof-readiness.json`
  - `npm run autoresearch:proof`
- Updated runtime/score aggregation so proof is now part of the branch-quality read, not an ignored side doc.

TODO

- Upgrade `/proof` from opener-launch shell to true multi-case runner with aggregated verdicts.
- Write a stable proof artifact after pack completion so journal/passport surfaces consume one object instead of one clash.
- Add future `SignalSnapshot` freeze and retrieval-freeze services on the backend side without moving scoring into routes.

2026-03-15

- Canonicalized the terminal-driven product direction instead of letting it drift into a broker console or marketplace-first pitch.
- Added `docs/exec-plans/active/COGOCHI_terminal_doctrine_prd_20260315.md` to define the integrated product thesis:
  - natural-language doctrine authoring
  - deterministic overlay rendering via `OverlaySpec`
  - Pine-style export drafts as user artifacts, not in-app runtime truth
  - proof as the game-native backtest/validation contract
  - agent writeback only after keep/quarantine/revert verdicts
- Explicitly fixed three ambiguous areas in the product story:
  - the terminal is an authoring surface, not the product itself
  - Lightweight Charts rendering must use repo-owned overlay specs, not pretend to execute Pine natively
  - `AutoResearch` in MVP means strategy formation, mutation review, and bounded evolution, not full custom foundation-model pretraining per user
- Repositioned public proof, passport, and future market/rental ideas as Layer C outputs that consume proof rather than defining evaluation truth.

TODO

- Build the actual doctrine terminal inside `/lab` around the PRD contracts in the new doc.
- Add backend contracts for `DoctrineSession`, `OverlaySpec`, `PineDraft`, and `ProofArtifact`.
- Wire saved doctrine sessions directly into `/proof` pack binding and journal writeback.

2026-03-15

- Shipped the first frontend/backend-split `Doctrine Terminal` scaffold inside `/lab`.
- Added shared contracts to `src/lib/types.ts`:
  - `DoctrineSession`
  - `DoctrineTerminalResult`
  - `OverlaySpec`
  - `PineDraft`
  - `DoctrineSessionStatus`
- Extended `labStore` so doctrine work is no longer ephemeral UI-only text:
  - save doctrine sessions per agent
  - reload prior sessions
  - bind a saved doctrine session into the active mutation draft
- Added a backend-owned deterministic terminal service:
  - `src/lib/server/doctrineTerminal.ts`
  - keyword-based doctrine interpretation
  - overlay spec generation
  - Pine-style export drafts
  - evidence-frame suggestions from existing BTC history frames
- Added a real backend route:
  - `src/routes/api/doctrine-terminal/+server.ts`
  - keeps prompt interpretation out of the frontend
- Added `src/routes/lab/+page.server.ts` so `/lab` now receives quick-prompt seed data from the backend side.
- Added `src/components/shared/DoctrineTerminalPanel.svelte` and integrated it into `/lab`:
  - natural-language prompt input
  - quick prompts
  - criteria explanation
  - overlay-spec readability
  - Pine draft preview
  - saved session history
  - bind-to-draft action
- Promoted `/lab` into a first-class surface spec with `docs/product-specs/lab.md`.

TODO

- Carry the bound doctrine session into `/proof` so the chosen candidate is visible at proof entry, not only as an updated draft.
- Replace the deterministic keyword matcher with a backend provider adapter while preserving the same contracts.
- Render overlay specs directly on the chart canvas instead of only as readable layer cards.

2026-03-15

- Upgraded the doctrine terminal from text-only cards into a real preview and proof handoff surface.
- Added `recommendedProofPackId` to doctrine results so one saved session can carry its own proof recommendation:
  - `src/lib/types.ts`
  - `src/lib/server/doctrineTerminal.ts`
- Added a reusable historical-frame overlay preview component:
  - `src/components/shared/DoctrineOverlayPreview.svelte`
  - renders `OverlaySpec` on top of actual BTC frame candles from `chart-frame-model`
- Upgraded `DoctrineTerminalPanel`:
  - selectable evidence-frame preview
  - session-aware proof link with `agent + session + pack`
  - visible proof-pack recommendation
- Upgraded `/lab`:
  - `Open proof packs` now preserves the active doctrine session when present
  - mutation bench shows the current doctrine handoff candidate
- Upgraded `/proof`:
  - accepts `agent`, `session`, and `pack` query state
  - keeps doctrine-session context visible while switching proof packs
  - shows the handed-off doctrine overlay preview beside the proof candidate read

TODO

- Carry the same doctrine-session context through `/battle` and back into journal/writeback so the full verdict story stays attached.
- Replace the deterministic keyword matcher with a backend provider adapter while preserving the same contracts.
- Move the overlay preview from SVG card rendering into the shared chart canvas layer when the lab scene is upgraded.

2026-03-15

- Closed the next doctrine loop: `/proof -> /battle -> /journal -> writeback` now carries one session context instead of dropping back to a generic battle result.
- Extended battle session state to persist doctrine context:
  - `doctrineSessionId`
  - `doctrineSessionTitle`
  - `doctrineSessionPackId`
- Upgraded `/proof` battle launch so entry links now pass `agent + session + pack`.
- Upgraded `/battle`:
  - reads doctrine context from route query
  - keeps the handed-off doctrine session visible in the battle brief
  - writes doctrine session title into battle writeback language
  - preserves the same context when moving to `/journal` or back to `/field`
- Upgraded `/journal`:
  - reads returned doctrine context
  - shows the carried doctrine candidate after battle return
  - re-renders the doctrine overlay preview on the returned frame
  - links back to `/lab` with the same `agent + session`
- Added light `/lab` query sync so battle/journal return links can reopen the same agent and doctrine session directly.

TODO

- Carry doctrine-session context into the deterministic battle resolution/report object itself so future analytics and export surfaces do not rely on route query alone.
- Replace the deterministic keyword matcher with a backend provider adapter while preserving the same contracts.
- Move the overlay preview from SVG card rendering into the shared chart canvas layer when the lab scene is upgraded.

2026-03-15

- Replaced the last scattered result handoff with a canonical `ProofArtifact` packet.
- Added `ProofArtifact` and `ProofState` shared contracts plus a dedicated `proofStore`.
- Upgraded battle verdict writeback so one accepted/quarantined/reverted result records:
  - doctrine session title and normalized intent
  - proof pack and frame context
  - mutation identity and visible effect
  - trust delta and growth-stage delta
- Upgraded `/journal` to consume the active proof artifact first, with route query only as fallback.
- This closes the first export-ready result path for future passport/public proof surfaces without forcing those surfaces to reconstruct state from battle query params.

TODO

- Let `/field` consume `ProofArtifact` directly instead of only verdict/frame query state.
- Add a public/passport-facing proof card surface that reads straight from `proofStore` or a future backend adapter.
- Move artifact persistence behind a backend memory/passport adapter when proof history leaves client-only scope.

2026-03-15

- Extended the canonical result packet into the field loop.
- `/field` now accepts `artifact` in return context and, when present, derives gate/outcome/verdict/frame labels from the stored `ProofArtifact` instead of rebuilding them from query strings.
- This keeps the world-return cue aligned with the same result packet already used by `/journal`, while still preserving query-based fallback for older links and direct field entry.

2026-03-15

- Reduced the canonical post-verdict handoff payload.
- Once battle has written a `ProofArtifact`, return links to `/journal` and `/field` now prefer `artifact + agent/session/pack` and stop duplicating `return/verdict/frame/gate`.
- The raw return summary fields still remain as fallback support for legacy links and non-artifact entry paths, but they are no longer the primary transport contract in the main loop.

TODO

- Remove the remaining redundant return query fields once all battle/journal/field entry paths rely on `artifact`.
- Promote `ProofArtifact` from client store into a backend/passport persistence adapter for public proof history.

2026-03-15

- Added the first `passport` surface family on top of canonical `ProofArtifact` history.
- Extended `proofStore` with passport selectors:
  - per-agent proof ledger
  - public-ready proof ledger
  - per-agent passport summary
  - recent public proof cards
- Added `/passport` squad overview:
  - one booklet card per creature
  - recent public-ready proof ledger preview
- Added `/passport/[id]` detail:
  - latest public-ready proof hero
  - public ledger first
  - trainer-only/private proof ledger second
- Added shared proof booklet components:
  - `ProofPassportAgentCard`
  - `ProofPassportArtifactCard`
- Wired nav and agent detail links into the new surface.
- Registered `passport` as a first-class surface in `context-kit.json`.

TODO

- Move passport history behind a backend persistence/export adapter once proof leaves client-local scope.
- Add shareable public proof cards or passport snapshots once the backend adapter exists.

2026-03-15

- Promoted passport from a client-only booklet to a snapshot export flow.
- Added `proofStore.getPassportSnapshotInput(agent)` so the client can export canonical public-ready proof history without rebuilding rules outside the store.
- Added backend export adapter:
  - `src/lib/server/passportExport.ts`
  - persists sanitized public snapshots to `runtime/generated/passports`
- Added `POST /api/passport/export`:
  - accepts one agent passport snapshot input
  - re-checks `publicReady` pack status on the server
  - writes a shareable snapshot
- Added public share surface:
  - `/passport/public/[id]`
  - reads exported snapshot server-side
  - shows only public-ready proof cards
- Upgraded `/passport/[id]` with `Export public card` and `Open public card` controls.

TODO

- Replace local snapshot files with a durable backend/passport store once proof history leaves single-browser scope.
- Add signed or share-tokenized passport links if public sharing leaves localhost/dev usage.

2026-03-15

- Added server-managed passport registry semantics on top of exported snapshots.
- Passport export now preserves a registry entry with:
  - `publishStatus`
  - `shareToken`
  - `publishedAt`
  - `updatedAt`
- Added `POST /api/passport/publish` to activate a share-token route for an exported passport snapshot.
- Added `GET /api/passport/[id]` metadata return for:
  - draft/published state
  - share link recovery after refresh
- Added share-safe route:
  - `/passport/share/[token]`
  - only resolves published passports, not draft snapshots
- Upgraded `/passport/[id]` controls:
  - export draft card
  - open preview card
  - publish share link
  - open share card once published

TODO

- Replace opaque stored share tokens with signed tokens or permissioned share objects if passport sharing leaves local/dev trust boundaries.
- Move registry/index persistence from local runtime files to a durable backend store when multi-user sync becomes real.

2026-03-15

- Reframed the current visual direction around `2D + 2.5D presentation` rather than a fully 3D pivot.
- Updated the shared shell so `/field` and `/battle` now sit inside a warmer trainer-journal frame instead of an ops-console frame.
- Reworked `FieldScene` toward a Pokemon-like chart route:
  - daylight palette
  - softer route cards and HUD chips
  - visible cloud/prop density
  - shrine-like node treatment
  - gentler barrier rendering so the chart still reads as terrain
- Reworked `ChartBattlefield` toward a short JRPG encounter:
  - warm sky/terrain stage
  - chart line as ridge/route instead of neon graph
  - companion plates and callouts with softer pixel-RPG framing
  - compact footer focused on phase/meter/current order instead of duplicating the full command deck inside the stage
- Updated `/battle` presentation:
  - added a non-blank loading fallback while the deterministic session hydrates
  - changed the command deck to a 2x2 encounter menu closer to classic JRPG readability
- Verified:
  - `npm run check`
  - `npm run build`
  - field screenshots in `output/web-game/field-before/`, `output/web-game/field-after/`, and `output/web-game/field-final/`
  - battle screenshots in `output/web-game/battle-before/` and `output/web-game/battle-after/`

TODO

- Push the `field` route one step further from abstract chart columns into path/ledge silhouettes so support shelves read immediately as traversable ground.
- Capture a lower viewport battle screenshot or element-focused shot so the refreshed battlefield itself is easier to review without manual scrolling.

2026-03-15

- Shifted from visual direction work into actual `route-encounter-build` implementation on the live surfaces.
- Reworked the early field route layout in `src/lib/stores/fieldStore.ts` so camp, journal, lab, archive, spar gate, and battle gate now sit on a clearer left-to-right traversal line.
- Updated `src/components/shared/FieldScene.svelte` to render:
  - a visible route track with checkpoints
  - thicker terrain ribbons derived from chart slices
  - node pads and contextual labels
  - a more forward-biased camera so the player sees more of the path ahead
- Updated `src/routes/field/+page.svelte` so the route HUD is smaller and the party strip moved into the top route kit instead of covering the bottom-left play area.
- Updated `src/routes/battle/+page.svelte` so the encounter header, selectors, meters, and battlefield now sit in one above-the-fold stage panel before the command menu.
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright screenshot in `output/web-game/field-actual-build-3/`
  - Playwright screenshot in `output/web-game/battle-actual-build/`

TODO

- Push the field spawn/camera composition one more step so the in-world party silhouette reads as strongly as the HUD on first load.

2026-03-15

- Added a focused follow-up pass for first-load field composition.
- Updated `src/components/shared/FieldScene.svelte` camera bias so the leader sits lower in the viewport on first load and the camp/start route reads in-world instead of being hidden under HUD.
- Reduced movement look-ahead intensity to keep explore-mode camera gentler and closer to the visual-world contract.
- Verified:
  - `npm run check`
  - Playwright screenshot in `output/web-game/field-camera-composition-1/`

TODO

- Re-run a longer headed browser pass later if we want to tune movement-time camera composition further; first-load composition is the main fix that landed here.

2026-03-15

- Checked coordination state before continuing:
  - `npm run coord:list` returned no active claims
  - recent watch-log work on this branch was centered on `/` hub implementation/persistence and git bootstrap, so the next safe slice stayed off the home route
- Claimed `battle-encounter-feel` and kept edits inside `ChartBattlefield` + `/battle`.
- Added a stronger encounter read to `src/components/shared/ChartBattlefield.svelte`:
  - trainer-vs-rival duel strip over the stage
  - centered turn banner
  - rival emblem / role card so the battle has an opposing presence before reading side rails
  - in-stage selected-command plaque so the current order feels part of the encounter, not only part of the lower menu
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright screenshot in `output/web-game/battle-encounter-feel/`

TODO

- If battle gets another pass, convert the abstract rival emblem into one or two reusable enemy archetype silhouettes so each scenario feels less generic.

2026-03-15

- Checked coordination again before continuing:
  - active claim now sits on `hub-home-actions`
  - owned paths include `src/lib/stores`, `src/lib/data`, `src/lib/types.ts`, and `src/routes/+page.svelte`
  - stayed out of those boundaries and limited the next change to `src/components/shared/ChartBattlefield.svelte`
- Added reusable rival silhouettes directly inside the battle stage:
  - `Warden`
  - `Lancer`
  - `Seer`
- Result:
  - the stage now shows a visible opposing lineup instead of only abstract rival pressure copy and one emblem
  - the fight reads more like a battle scene even before reading the right rail
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright screenshot in `output/web-game/battle-enemy-silhouettes/`

TODO

- If the home claim clears later, consider moving rival-archetype definitions into a shared battle presentation contract instead of keeping them local to `ChartBattlefield`.

2026-03-15

- Connected home-hub `Style` and `Care` actions to durable roster state instead of leaving them as UI-only preview:
  - extended `OwnedAgent` with persistent `homeStyle`, `lastCareMode`, and `recentCareSummary`
  - seeded all starter agents with home-shell defaults and care-summary text
  - added roster reconciliation defaults so older `localStorage` payloads still hydrate safely
- Added real home action mutations in `src/lib/stores/rosterStore.ts`:
  - `setAgentHomeStyle(agentId, homeStyle)`
  - `applyCareAction(agentId, careMode)`
  - targeted care now clears matching `careState`s (`note` repairs memory/doctrine drift, `rest` repairs tension/friction, `gift` repairs confidence shake)
  - `note` now writes a real home-note memory card into the agent memory bank
  - untargeted / already-clear care actions have minimal or no stat gain so the hub cannot be spammed into free power
- Updated `/` so the home hub now:
  - syncs the right-rail selected style/care verb from the featured agent's durable state
  - saves style choices immediately to the active agent
  - applies care explicitly via `Apply Gift/Rest/Lesson note`
  - shows `Home care` on the left rail and `Recent care result` on the right rail
  - exports richer `render_game_to_text` state (`homeStyle`, `lastCareMode`, `recentCareSummary`)
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright client capture in `output/web-game/hub-home-actions/client-care/`
  - custom Playwright verification in `output/web-game/hub-home-actions/`
    - forced featured agent to `Coglet Risk`
    - applied targeted `Lesson note`
    - confirmed `MEMORY_DRIFT -> CLEAR`
    - saved `Archive look`
    - reloaded and confirmed both care/style persistence
    - confirmed no console errors

TODO

- Decide whether quick-dock `Gift` should stay a panel shortcut or become a true one-click care action now that writeback exists.
- If home style should affect sprite overlays rather than only stage framing, move `homeStyle` into `PixelSprite`/accessory rendering next.

2026-03-16

- Landed the next trainer-hub visual step: saved home style now changes the actual creature body presentation, not only the hub background.
- Updated `src/components/shared/PixelSprite.svelte`:
  - added optional hub-only `homeStyle` adornments
  - `field` now adds a travel harness + pack read
  - `archive` now adds note-tab / tag read
  - `proof` now adds sash + medal read
  - kept this scoped behind a `presentation="hub"` prop so battle/field sprites do not inherit extra home-shell chrome by accident
- Updated `/` so only trainer-hub sprite instances use the new hub presentation:
  - featured center sprite
  - hovering companions
  - lower squad cards
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright client smoke capture in `output/web-game/hub-style-overlays/client-smoke-final2/`
  - manual Playwright visual/state pass in:
    - `output/web-game/hub-style-overlays/final/proof-full.png`
    - `output/web-game/hub-style-overlays/final/field-full.png`
    - `output/web-game/hub-style-overlays/final/states.json`
  - confirmed `stylePreview: proof -> field` with no console errors

TODO

- If the player should feel outfit changes in more than the hub, thread `homeStyle` into `/agent/[id]` and `/journal` next with a softer presentation mode.
- If style should become more than silhouette accessories, add true per-style sprite accessory slots or layered pixel assets instead of CSS-only adornments.

2026-03-16

- Extended saved home-style presence beyond `/` so it survives on lower-intensity surfaces instead of disappearing outside the hub.
- Updated `src/components/shared/PixelSprite.svelte` with a softer `presentation="detail"` mode that reuses the same `field/archive/proof` adornment language without overpowering detail surfaces.
- Updated `src/components/shared/AgentSpriteCard.svelte`, `src/routes/agent/[id]/+page.svelte`, and `src/routes/journal/+page.svelte` so:
  - agent detail cards show the saved home-style chip
  - agent detail now includes a `Saved presence` read tied to `recentCareSummary`
  - journal portrait and summary rail carry the saved style presence too
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright client smoke in `output/web-game/style-presence-secondary/agent-smoke/`
  - visual/state review in:
    - `output/web-game/style-presence-secondary/agent-doux.png`
    - `output/web-game/style-presence-secondary/journal.png`
    - `output/web-game/style-presence-secondary/states.json`

TODO

- If saved style should feel more physical, replace CSS adornments with true accessory layers or sprite parts.
- If more surfaces inherit saved presence later, keep the softer `detail` presentation as the default outside the hub.

2026-03-16

- Turned the home quick dock into a real care shortcut instead of only a panel-navigation strip.
- Updated `src/lib/stores/rosterStore.ts` so `applyCareAction()` now returns result metadata (`targetedAction`, `resolved`) alongside previous/next agent snapshots.
- Updated `src/routes/+page.svelte` so:
  - dock `Gift` now applies immediate care writeback
  - dock `Memory` now applies immediate `Lesson note` writeback
  - the route records a small care receipt with `steady/resolved/partial` tone
  - `render_game_to_text` now exports the current care receipt for automation
  - the dock shows a persistent action receipt panel instead of silent state mutation
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright client smoke in `output/web-game/home-style-actions/smoke/`
  - custom Playwright verification in:
    - `output/web-game/home-style-actions/home-after-gift.png`
    - `output/web-game/home-style-actions/home-after-memory.png`
    - `output/web-game/home-style-actions/agent-doux.png`
    - `output/web-game/home-style-actions/journal.png`
    - `output/web-game/home-style-actions/states.json`

TODO

- If `Rest` should also become one-click, decide whether it belongs in the dock or stays in the care rail to avoid accidental taps.
- If quick actions should target off-stage agents, expose a squad-level care shortcut instead of forcing the featured-agent swap first.

2026-03-16

- Reworked `/` again with a game-feel-first pass because the previous home hub still read too much like a product dashboard.
- Used the game-feel frame explicitly:
  - primary aesthetics pushed toward `Fantasy` + `Competence`
  - less explainer copy, more `room / sortie / command deck / quest board` language
  - stronger visual hierarchy around the lead companion and departure route
- Overhauled `src/routes/+page.svelte`:
  - replaced the plain hero with a `Tonight's Briefing` + `Active sortie` split
  - upgraded the center stage into a darker world room with terrain, signal pulses, route/focus/form callouts, and a stronger featured-agent pedestal
  - reframed the left rail as `Trainer Console` and the right rail as `Command Deck`
  - converted the lower dock into a `command strip` with subtitle labels so actions read more like game verbs than app buttons
  - retitled lower sections into `Quest Board` and `Travel Bench`
  - tightened panel copy so it reads like a game hub, not a settings surface
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright client smoke in `output/web-game/hub-gamefeel-overhaul/smoke/`
  - visual/state review in:
    - `output/web-game/hub-gamefeel-overhaul/hub-home.png`
    - `output/web-game/hub-gamefeel-overhaul/hub-home-care.png`
    - `output/web-game/hub-gamefeel-overhaul/state-summary.json`

TODO

- The global `PageShell` nav still reads more like a utility header than an in-world game bar; if the whole app should match this home tone, that shell is the next surface to redesign.
- `/field`, `/battle`, and `/journal` now need a matching tone pass so the app does not regress back to product-UI language when leaving the hub.

2026-03-16

- Continued the battle visual pass to make the clash read more like an active encounter instead of a static chart card.
- Updated `src/components/shared/ChartBattlefield.svelte`:
  - added ally engagement lanes that curve from companions into the clash focus
  - added rival counter-lanes into the same focus so the contested zone reads as a real exchange
  - added a floating `Resolve` pill near the objective gate tied to command/outcome state
  - added motion cues for impact rings, sparks, ally bob, and rival hover
- Kept the scope battle-only so the current home/agent/journal work on the branch stayed untouched.
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright capture in:
    - `output/web-game/battle-hit-resolve-pass/shot-0.png`

TODO

- If the engagement lanes should read more strongly on first viewport, lower the center callout stack around the clash so more of the lines survive above the fold.
- If battle starts feeling too panel-heavy again, move the command deck closer to a true bottom battle menu instead of a separate section below the stage.

2026-03-16

- Rebuilt the ongoing `/battle` command flow so it reads like a JRPG bottom battle menu instead of a detached admin panel.
- Updated `src/routes/battle/+page.svelte`:
  - moved the active command deck into a stage-attached bottom menu shell
  - split the bottom menu into a dialogue pane plus a compact 2x2 command pad
  - kept verdict/writeback follow-up as separate panels that appear only after the clash resolves
  - compressed the stage and bottom menu spacing so the command pad is visible in the first viewport
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright capture in:
    - `output/web-game/battle-bottom-menu-pass-3/shot-0.png`

TODO

- If you want the Pokemon feel pushed harder, the next pass should collapse `Reset`, `Journal`, and `Return to field` into a smaller utility strip and reserve the bottom menu for four battle verbs only.
- The battle page still inherits one unrelated home-route warning (`src/routes/+page.svelte` unused selector) during checks; it is outside this pass.

2026-03-16

- Continued the `/battle` command-menu pass to make the attached bottom menu read faster in the first viewport.
- Updated `src/routes/battle/+page.svelte`:
  - remapped the four command cards into shorter battle verbs (`Push`, `Read`, `Guard`, `Shift`) with shorter flavor copy
  - compressed the route header controls into a tighter inline row
  - reduced stage height and hid duplicated in-stage battlefield chrome so the bottom command area starts higher on screen
  - separated confirm actions from utility actions so the main battle verb remains visually dominant
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright captures in:
    - `output/web-game/battle-verb-menu-pass-4/shot-0.png`
    - `output/web-game/battle-verb-menu-pass-5/shot-0.png`

TODO

- If the command pad still needs to be fully visible on shorter laptop heights, the next safe pass is reducing `PageShell` hero/nav height or collapsing the right rail into tabs instead of shrinking the battlefield further.

2026-03-16

- Added a battle-only compact shell pass so `/battle` gives more first-viewport space back to the command deck.
- Updated `src/components/shared/PageShell.svelte`:
  - added a `compact` mode that reduces shell padding, brand chrome, status-pill size, and nav-pill height
  - migrated the shared shell from deprecated `<slot>` rendering to `{@render children?.()}` so checks are back to zero warnings
- Updated `src/routes/battle/+page.svelte`:
  - enabled `compact` shell mode for battle only
  - tightened the stage header, hid the extra gate-note line, reduced selector card padding, and shortened utility labels
  - lowered the stage footprint slightly so the bottom command area starts higher in the viewport
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright capture in:
    - `output/web-game/battle-compact-shell-pass/shot-0.png`

TODO

- If you want the full 2x2 command pad visible without any scroll on shorter screens, the next clean move is collapsing the right rail into one switchable card stack instead of shrinking the battlefield further.

2026-03-16

- Collapsed the `/battle` right rail into a single tabbed dossier so the clash page reads lighter above the fold.
- Updated `src/routes/battle/+page.svelte`:
  - replaced the stacked right-rail cards with one switchable panel using `Captain`, `Comms`, `Stakes`, and `Memory` tabs
  - widened the right dossier column and narrowed the main battle column slightly so the battlefield height drops without turning into noise
  - clamped the battle summary to two lines and lowered the battlefield stage footprint again so the bottom command deck starts higher in the viewport
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright default capture in:
    - `output/web-game/battle-rail-tabs-pass/final/shot-0.png`
- Note:
  - selector-driven Playwright tab clicking located the tab buttons but timed out before completing the click, so the visual pass is verified on the default `Captain` tab and the tab interaction still deserves one follow-up browser check.

TODO

- If you want the full bottom menu completely above the fold on 720px-tall displays, the next step is turning the selected-command dialog into a thinner strip or moving the `Confirm` row into the command grid band.

2026-03-16

- Reframed `/battle` again so it reads like a command theater instead of a product console.
- Updated `src/routes/battle/+page.svelte`:
  - changed the stage copy from control-panel language into `Command Theater`, `Squad Captain`, `Comms Feed`, `Proof Stakes`, and `Field Memory Rail`
  - shifted the battle header, selector cards, bottom menu, and right rail into a darker in-world palette that matches the trainer-hub tone
  - translated runtime-heavy focus cues into player-facing room/proof language so the battle briefing no longer breaks immersion with product terminology
  - kept deterministic control flow unchanged; arrow/enter command stepping still advances turn state and selected command normally
- Updated `src/components/shared/ChartBattlefield.svelte`:
  - deepened the battlefield card, turn banner, and command plaque styling so the stage feels embedded in the same command-room world
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright action loop on dev server:
    - `output/web-game/battle-gamefeel-pass/dev-client/shot-0.png`
    - `output/web-game/battle-gamefeel-pass/dev-client/state-0.json`
  - Full-page captures on dev server:
    - `output/web-game/battle-gamefeel-pass/dev-full/battle.png`
    - `output/web-game/battle-gamefeel-pass/dev-full/field.png`
- Note:
  - `vite preview` servers kept breaking after rebuilds because stale hashed asset requests hit replaced build output. Final visual verification for this pass used `vite dev` instead, after `npm run build` had already succeeded.

TODO

- If the battle page still feels too dense on shorter laptop heights, collapse the right rail into one switchable dossier stack instead of shrinking the stage again.
- If the rest of the app should fully match this tone, the next highest-value surfaces are `/field` beacon/runtime copy and the global `PageShell` shell warning cleanup.

2026-03-16

- Reframed `/field` so it reads like a trail route instead of a runtime dashboard.
- Updated `src/routes/field/+page.svelte`:
  - translated return messages, cue copy, and runtime focus checks into field-side trail/beacon language
  - stopped exposing raw `runtime.distill.goal` text in the field UI and `render_game_to_text`; the route now emits a player-facing trail rule instead
  - renamed the top cards and controls to `Trail Board`, `Scout Beacon`, `Walk`, `Sprint`, and `Cross`, and tuned the card styling toward journal-note / field-note surfaces
  - cleaned up awkward route summary phrasing (`Holding at Camp`) and kept movement / gate transitions unchanged
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright dev-server capture in:
    - `output/web-game/field-gamefeel-pass/field.png`
    - `output/web-game/field-gamefeel-pass/state.json`
    - `output/web-game/field-gamefeel-pass/console.json`
- Note:
  - the field surface now reads closer to the battle/home tone, but the biggest remaining non-game chrome is still the shared top `PageShell` header above the route stage.

TODO

- Reframe the shared `PageShell` header/nav so `/field`, `/battle`, and the hub stop opening with product-shell language before the in-world surface begins.

2026-03-16

- Reworked the shared shell so the app opens on a darker world-atlas header instead of a pale product dashboard.
- Updated `src/components/shared/PageShell.svelte`:
  - renamed the shared zones and route notes into more world-first language (`Trainer Commons`, `Trail Route`, `Command Theater`, `Rule Forge`, `Return Ledger`)
  - replaced the generic status pills with per-surface world states such as `Beacon locked`, `Clash live`, and `Room lights on`
  - restyled the nav chrome into a darker atlas board with crest markers and more tactile active-state pills so `/`, `/field`, and `/battle` all pick up the same game shell immediately
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright dev-server captures in:
    - `output/web-game/shell-gamefeel-pass/home.png`
    - `output/web-game/shell-gamefeel-pass/field.png`
    - `output/web-game/shell-gamefeel-pass/battle.png`
    - `output/web-game/shell-gamefeel-pass/home.json`
    - `output/web-game/shell-gamefeel-pass/field.json`
    - `output/web-game/shell-gamefeel-pass/battle.json`
- Note:
  - the shell no longer reads like a neutral SaaS header, but the nav still occupies meaningful vertical space on shorter displays; if more space is needed, the next clean move is a route-aware condensed atlas mode for `/field` and `/battle`.

TODO

- If first-viewport density is still too high, add a second `PageShell` density tier for travel/clash surfaces instead of shrinking the actual game stages again.

2026-03-16

- Added a second `PageShell` density tier so travel and clash routes keep the world-atlas tone without spending as much vertical space.
- Updated `src/components/shared/PageShell.svelte`:
  - added a `condensed` mode alongside the existing `compact` mode
  - condensed mode collapses the atlas header into a tighter one-line board on desktop by hiding subtitles, shrinking route pills, and moving the route list into the same band as the surface title/status
- Updated route usage:
  - `src/routes/field/+page.svelte` now uses `<PageShell condensed>`
  - `src/routes/battle/+page.svelte` now uses `<PageShell compact condensed>`
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright dev-server captures in:
    - `output/web-game/condensed-atlas-pass/field.png`
    - `output/web-game/condensed-atlas-pass/battle.png`
    - `output/web-game/condensed-atlas-pass/field.json`
    - `output/web-game/condensed-atlas-pass/battle.json`
- Note:
  - the condensed atlas recovers meaningful first-viewport space on `/field` and `/battle` without dropping back to dashboard chrome; if more space is still needed, the next step should be surface-specific hero compression inside those routes, not another global shell shrink.

TODO

- If battle still needs a little more first-viewport room on shorter displays, trim the route-local battle hero/header before touching `PageShell` again.

2026-03-16

- Tightened the `/battle` route-local hero and selector band after the condensed atlas pass.
- Updated `src/routes/battle/+page.svelte`:
  - reduced the chip stack to the gate + frame identity only
  - shortened the selector labels to `Lead` and `Slice`
  - compressed hero spacing, title size, summary line height, selector card padding, and selector widths
  - lowered the battlefield stage minimum height slightly so the command grid starts higher without changing the command deck structure itself
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright dev-server capture in:
    - `output/web-game/battle-hero-condense-pass/battle.png`
    - `output/web-game/battle-hero-condense-pass/battle.json`
- Note:
  - the main remaining first-viewport cost on `/battle` is now the left dialog panel inside the bottom menu shell; if more space is needed, the next safe move is merging that dialog into a thinner strip instead of shrinking the battlefield further.

TODO

- If battle still needs to climb higher on shorter displays, compress the bottom-menu dialog block before touching the stage size again.

2026-03-16

- Wrote a stable battle-screen design document instead of continuing incremental visual tweaks without a fixed target.
- Added:
  - `docs/design-docs/COGOCHI_battle_screen_layout_20260316.md`
- Updated:
  - `docs/design-docs/index.md`
- The new battle-screen doc locks the intended `/battle` silhouette as:
  - thin clash strip
  - dominant chart stage
  - pinned bottom command dock
  - optional dossier overlay
  - verdict sheet replacing command mode after resolution
- It also fixes the information hierarchy:
  - always visible: thesis, danger, active slice, squad, four primary commands
  - on demand only: detailed rationale, logs, metrics, runtime advisory notes
  - hidden from default clash posture: permanent right rail, dropdown-heavy selectors, repeated summary chrome
- Verified:
  - `npm run docs:refresh`
  - `npm run docs:check`
- Note:
  - this doc is the new layout contract; the next real `/battle` implementation pass should remove the default route-hero posture and treat the dossier as an overlay, not a permanent column.

TODO

- Use `docs/design-docs/COGOCHI_battle_screen_layout_20260316.md` as the source of truth for the next `/battle` rebuild instead of continuing spacing-only passes.

2026-03-16

- Tightened the `/battle` bottom action area into a single slim toolbar so the command deck reads more like a Pokemon-style battle menu instead of stacked app controls.
- Updated `src/routes/battle/+page.svelte` only:
  - merged separate confirm and utility rows into one `battle-bottom-menu__toolbar`
  - shortened the action labels (`Reset clash` -> `Reset`) and turned the controls hint into inline hotkey pills
  - compressed the battle dialog, footnote, stage min-height, and command-card sizing so more of the command menu appears in the first viewport
- Coordination note:
  - checked `npm run coord:list` first and saw an active `shell-gamefeel-pass` claim on `src/components/shared/PageShell.svelte`, so this pass stayed inside the battle route and avoided the shared shell file
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright dev-server captures in:
    - `output/web-game/battle-toolbar-pass/shot-0.png`
    - `output/web-game/battle-toolbar-pass/state-0.json`
    - `output/web-game/battle-toolbar-pass-final/shot-0.png`
    - `output/web-game/battle-toolbar-pass-final/state-0.json`
- Note:
  - the action area is now structurally slimmer, but the biggest remaining first-viewport cost on `/battle` is still the left dialog block above the command cards; the next clean move is to merge that copy into a thinner strip or fold it into the stage band.

TODO

- If `/battle` still feels too tall, collapse the left dialog into a single encounter strip before shrinking the chart stage again.

2026-03-16

- Reclaimed the stale `battle-hero-condense-pass` lease, re-checkpointed it, and kept the next pass constrained to `src/routes/battle/+page.svelte`.
- Compressed the `/battle` hero band into a thinner encounter strip:
  - moved the gate chips into a compact eyebrow row with the `Encounter` kicker
  - converted the `Lead` / `Slice` selectors from stacked mini-cards into horizontal pill-like controls
  - reduced the header title scale and hid the extra summary line so the stage starts sooner in the viewport
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright dev-server capture in:
    - `output/web-game/battle-hero-condense-pass/shot-0.png`
    - `output/web-game/battle-hero-condense-pass/state-0.json`
- Note:
  - this pass produced a visible improvement: the battle header now reads like an encounter strip and exposes more of the command grid above the fold without touching the shared shell.

TODO

- If `/battle` still needs more first-viewport room, compress the bottom-left command dialog width before shrinking the stage itself.

2026-03-16

- The previous complaint was correct: the recent battle passes had mostly been route-local micro-compression, so the screen still read like the same dashboard skeleton.
- Ran a structural redesign pass instead of another micro-adjustment:
  - added a `minimal` density mode to `src/components/shared/PageShell.svelte`
  - switched `/battle` to `<PageShell compact condensed minimal>` so the top atlas bar collapses into a much shorter one-line shell
  - restructured the desktop battle layout in `src/routes/battle/+page.svelte` so the stage becomes the dominant full-width surface and the dossier turns into a floating HUD card instead of a persistent right-side column
  - increased battle-stage width/height and compressed the dossier chrome so the viewport reads more like a game screen and less like a two-column app panel
- Verified:
  - `npm run check`
  - `npm run build`
  - Playwright dev-server capture in:
    - `output/web-game/battle-structural-redesign-pass/shot-0.png`
    - `output/web-game/battle-structural-redesign-pass/state-0.json`
- Note:
  - this is the first pass where the change is structurally visible; the main remaining issue is that the floating dossier still covers a chunk of the chart on desktop, so the next pass should decide whether that card becomes even smaller or collapses behind a toggle.

TODO

- Decide whether the floating battle dossier should stay always visible on desktop or collapse behind a single `Dossier` toggle so more of the chart remains unobstructed.

2026-03-16

- Stepped back from surface-by-surface tweaking and rewrote the intended game loop from the player's actual experience outward.
- Added `docs/design-docs/COGOCHI_gameplay_first_loop_redesign_20260316.md` to define the new primary read:
  - `travel -> read -> commit -> survive consequence -> care -> go again`
  - core session should default to `camp -> field -> gate -> clash -> journal/care -> camp`
  - `/field` becomes the main playable heartbeat instead of a wrapper
  - `/battle` becomes a short thesis-first clash instead of the longest analytical screen
  - `/journal` becomes consequence-and-care instead of log review
  - `/lab` becomes a deeper intervention space after repeated problems, not the default post-run destination
- Locked a stronger player-role definition:
  - captain
  - caretaker
  - judgment coach
- Locked three session-defining player decisions:
  - where to go next
  - what thesis to enter with
  - what to care for after the result

TODO

- If this redesign is accepted, update `docs/MASTER_GAME_SPEC.md`, `docs/product-specs/core.md`, `docs/product-specs/field.md`, `docs/product-specs/battle.md`, and `docs/product-specs/journal.md` to match it.
- Translate the new thesis-first clash model into concrete `/battle` command/flow changes.
- Re-center `/` around return pressure and next destination instead of broad dashboard summary.

2026-03-16

- Promoted the gameplay-first redesign into canonical product truth instead of leaving it as an additive design note.
- Rewrote `docs/MASTER_GAME_SPEC.md` so the game is now defined around:
  - `my squad -> my next gate -> my thesis -> my consequence -> my care decision`
  - `camp -> field travel -> gate read -> clash -> journal and care -> camp`
  - captain / caretaker / judgment coach as the main player role
- Rewrote the surface specs for `core`, `field`, `battle`, and `journal` so their responsibilities now align with the new heartbeat:
  - `/` = return hub
  - `/field` = main playable heartbeat
  - `/battle` = short thesis-first clash
  - `/journal` = consequence-and-care
- Verified:
  - `npm run docs:refresh`
  - `npm run docs:check`
  - `npm run ctx:check -- --strict`
- Note:
  - the design reset is now canonical; the next major work is implementation alignment, especially `/`, `/field`, `/battle`, and `/journal` flow/UI changes against these specs.

TODO

- Rewrite the actual `/` surface around return pressure, featured consequence, and next destination.
- Translate the thesis-first clash spec into concrete `/battle` interaction and pacing changes.
- Tighten `/field -> /battle -> /journal -> /` so the runtime flow matches the new canonical loop instead of the older lab-first structure.

2026-03-16

- Rewrote `docs/design-docs/COGOCHI_battle_screen_layout_20260316.md` so it now matches the chart-world reset instead of the older thesis-first `/battle` dashboard shape.
- The new battle-screen contract now fixes:
  - normal combat belongs inside `/zone/[zoneId]` micro traversal, not a detached standard `/battle` route
  - the canonical normal-play silhouette is `top HUD -> dominant chart stage -> one-line bark strip -> four-command dock`
  - the only primary commands are `LONG`, `SHORT`, `HOLD`, and `RUN`
  - post-command resolution becomes a short result posture with in-world outcome feedback
  - boss encounters escalate into `/boss/[bossId]` cut-ins without changing the four-command grammar

- The product direction was reset again, this time more radically: the previous split trainer, field, journal, and proof framing is no longer the target game.
- Added `docs/design-docs/COGOCHI_chart_world_jrpg_reset_20260316.md` to capture the new core definition:
  - real BTC history is the world map
  - the player travels across macro, meso, and micro chart zoom levels
  - normal play uses `LONG`, `SHORT`, `HOLD`, and `RUN` as the core battle commands
  - camp becomes the main care and setup anchor
  - major historical events become boss encounters
- Added `docs/exec-plans/active/COGOCHI_chart_world_reset_execution_20260316.md` to break the reset into six implementation phases:
  - data and engines
  - macro world map
  - zone play
  - camp and onboarding
  - boss encounters
  - growth and cleanup
- Rewrote the canonical L0 and L1 docs to match the new direction:
  - `docs/MASTER_GAME_SPEC.md`
  - `docs/AGENT_SYSTEM_DESIGN.md`
  - `docs/BATTLEFIELD_DESIGN.md`
  - `docs/VISUAL_WORLD_DESIGN.md`
- Rewrote the short surface specs so they now describe the target IA instead of the previous split-screen structure:
  - `core` = `/` macro world map
  - `field` = `/zone/[zoneId]`
  - `battle` = `/boss/[bossId]`
  - `raising` = `/camp` and `/cogochi/[id]`
  - `proof` and `journal` = deprecated standalone surfaces, absorbed into world, camp, boss, and passport flow

TODO

- Port the actual route tree from the current `/field`, `/battle`, `/lab`, `/journal` implementation to `/`, `/zone/[zoneId]`, `/boss/[bossId]`, `/camp`, and `/cogochi/[id]`.
- Define the first playable `zones.ts`, `bosses.ts`, `world-engine.ts`, and `trade-engine.ts` contracts.
- Replace the current page shell and dashboard UI with a world-first game shell.

2026-03-16

- Used the user-provided PDF screenshot as a visual reference and treated it as a cue to stop polishing the old bright dashboard composition.
- Rebuilt `src/components/shared/PageShell.svelte` into a leaner dark command bar instead of a giant atlas-and-tabs banner.
- Rewrote `src/routes/+page.svelte` into a darker single-focus home screen:
  - one dominant stage instead of multiple competing panels
  - chart-world screen with embedded terminal overlay, route tags, bark strip, and companion focus
  - tighter right rail for sortie dossier, selected module controls, and route radar
- Reduced the old "trainer room SaaS" read by:
  - removing the oversized tab board feel
  - collapsing the home information hierarchy around one active route
  - shifting tone closer to a dark command video / embedded ops screen reference
- Left the deeper route migration untouched for now:
  - `/field`, `/battle`, `/journal`, `/lab` still follow the older runtime structure
  - this pass only improves the shell and `/` entry feel
- Verified:
  - `npm run check`
  - `npm run build`
  - preview screenshot saved to `output/web-game/pdf-home-refresh-3/shot-0.png`

TODO

- Port the same visual simplification into `/field` so the world itself, not the overlays, owns the screen.
- Reduce the remaining surface sprawl in `/battle` and reframe it as either boss cut-in or route-local escalation.
- Start Phase 1 runtime migration for the chart-world reset instead of only restyling the old route tree.

2026-03-16

- Continued the PDF-driven reset into `/field` and `/battle`.
- Reworked `src/routes/field/+page.svelte` from stacked cream cards into:
  - compact top HUD
  - small right-side dossier
  - single bottom dock for interact/control hints
- Recolored `src/components/shared/FieldScene.svelte` into a darker chart-world palette so the route finally feels like a night traversal instead of a pastel infographic.
- Reworked `/battle` at `src/routes/battle/+page.svelte` to reduce preamble chrome:
  - removed the bulky contract-card + phase-ribbon stack
  - replaced it with a thinner brief strip
  - increased battlefield height
  - darkened the stage rendering with stronger stage-first emphasis
- Verified with fresh screenshots:
  - `output/web-game/field-after-reset/shot-0.png`
  - `output/web-game/battle-after-reset/shot-0.png`
- Verified:
  - `npm run check`
  - `npm run build`

TODO

- `/battle` still needs a deeper route-level redesign because the command grammar is still legacy (`Focus/Memory/Risk/Retarget`) instead of canonical `LONG/SHORT/HOLD/RUN`.
- `PageShell` on dense surfaces still eats more vertical space than ideal; a battle/field-specific ultra-compact shell variant would help.
- Start replacing route-era UI cleanup with real Phase 1 chart-world runtime work (`zones`, `bosses`, `world-engine`, `trade-engine`).

2026-03-17

- Pulled in a new visual reference set from `/Users/ej/Desktop/스크린샷 2026-03-16 오후 11.31.07.pdf`.
- The strongest reusable pattern in that PDF was not the exact art style but the screen grammar:
  - one large playable world surface
  - one right-side companion/agent console
  - controls and status compressed to the perimeter
- Reworked `src/routes/field/+page.svelte` to follow that structure:
  - turned `/field` into a split layout with a large world stage on the left and a dedicated companion console on the right
  - removed the old floating right dossier from inside the stage
  - moved route read, companion state, action CTA, and party roster into the side console
- Continued the battle cleanup:
  - darkened `src/components/shared/ChartBattlefield.svelte` so the battlefield base, fighter cards, callouts, and chart sky no longer read like light paper cards
  - kept `src/routes/battle/+page.svelte` stage-first shell pass in place and verified the darker battlefield component inside it
- Verified with fresh screenshots:
  - `output/web-game/field-reference-pass-2/shot-0.png`
  - `output/web-game/battle-reference-pass-2/shot-0.png`
- Verified:
  - `npm run check`
  - `npm run build`

TODO

- Push the same `world + right companion console` grammar into `/` so the macro map matches `/field`.
- Rebuild `/battle` around canonical `LONG / SHORT / HOLD / RUN` commands; visual tone is closer now, but the interaction grammar is still old.
- Decide which elements from the reference are product-level:
  - definitely keep: right companion console, fuller world stage, compressed chrome
  - probably avoid copying directly: generic browser-video framing, third-party web3 UI details, unrelated staking/dashboard modules

- Took `/field` one more step toward the Pancake Town reference rather than stopping at a generic split layout.
- Reworked `src/routes/field/+page.svelte` so the route now reads as:
  - immersive map-first shell with hidden top nav
  - one small floating route plaque on the stage
  - one right-side trail console with stacked chat bubbles, action CTA, keycaps, party strip, and fake composer
- Re-tuned `src/components/shared/FieldScene.svelte` toward a brighter daytime overworld:
  - warmer sand / aqua sky palette
  - lighter route and node treatment
  - reduced chart padding and adjusted camera framing
  - added landmark silhouettes near camp, journal, lab, archive, spar gate, and battle gate so the route feels like places instead of abstract pins
- Verified with fresh browser harness captures:
  - `.agent-context/harness/immersive-field-vibe-pass-20260317-v5/browser/screenshots/page_field.png`
- Verified:
  - `npm run check`
  - `npm run build`
  - `bash scripts/dev/run-browser-context-harness.sh --run-id immersive-field-vibe-pass-20260317-v5 --base-url http://127.0.0.1:4198 --page /field`

2026-03-20

- Tightened route continuity instead of doing another pure visual pass.
- Reworked `/` so the macro world now leads with a single `Resume Loop` mission strip:
  - primary CTA goes into `/field`
  - `/battle`, `/lab`, and `/proof` now inherit the selected `agent / session / pack` context
  - the previous footer CTA cluster is demoted to support links so the next move reads clearly
- Reworked `/journal` into a real return deck:
  - added one recommended next-move block with `Resume field loop`
  - `Return to field` / `Open lab` now preserve `artifact / agent / session / pack` context
  - syncing the selected agent back into roster/lab state on entry so the room no longer feels detached
- Reworked `/field` route continuity:
  - `+page.server.ts` now parses `agent / session / pack`
  - field party leadership now honors incoming `agent`
  - battle, journal, and lab exits preserve current route context instead of collapsing to bare paths
  - the old `history.replaceState('/field')` reset now preserves contextual query state
- Verified:
  - `npm run check`
  - `npm run build`
  - browser review artifacts at:
    - `.agent-context/browser-checks/flow-opt-review/home/shot-0.png`
    - `.agent-context/browser-checks/flow-opt-review/field/shot-0.png`
    - `.agent-context/browser-checks/flow-opt-review/journal/shot-0.png`
    - `.agent-context/browser-checks/flow-opt-review/battle/shot-0.png`
    - matching `state-0.json` files in each folder

TODO

- If we want the macro route to feel fully diegetic, the global route tab strip in `PageShell` should eventually collapse further on `/` as well.
- The route-context query builder is duplicated across `/`, `/field`, and `/journal`; move it into a shared helper before the next big navigation pass.
- `/battle` still benefits from direct full-page Playwright fallback because the generic canvas-oriented client can capture the loading placeholder too early.

- Ran an Apple-clean simplification pass instead of another effect-heavy visual pass.
- Reworked `src/components/shared/PageShell.svelte` so non-immersive routes now read like one calm product shell:
  - reduced the brand block to `Cogochi + current zone`
  - collapsed status chrome to one pill
  - turned the heavy route grid into a compact horizontal pill dock
- Reworked `/` in `src/routes/+page.svelte` so the hub is easier to scan:
  - removed the stage-side risk/future/terminal/squad overlays
  - kept the mission strip and main companion as the dominant read
  - folded squad switching into the `Active Sortie` card
  - removed the old `Route Radar` card
- Reworked `/field` in `src/routes/field/+page.svelte` for one-decision clarity:
  - `FieldScene` now follows the context-selected party instead of the fallback party
  - trail console now shows fewer bubbles, no topic/tool noise, no fake composer, and one explicit helper line
  - right console palette is calmer black-metal instead of the previous purple-heavy treatment
- Reworked `/journal` in `src/routes/journal/+page.svelte` into a faster return room:
  - moved the `Recommended next move` strip higher so the return CTA is visible immediately
  - compressed the note board and tightened highlight cards
  - replaced the separate lower ledgers/history sections with one summary grid
- Verified:
  - `npm run check`
  - `npm run build`
  - browser review artifacts at:
    - `.agent-context/browser-checks/apple-clean-pass/home/shot-0.png`
    - `.agent-context/browser-checks/apple-clean-pass/field/shot-0.png`
    - `.agent-context/browser-checks/apple-clean-pass/journal-v2/shot-0.png`
    - `.agent-context/browser-checks/apple-clean-pass/battle/shot-0.png`
    - matching `state-0.json` files in each folder

TODO

- The global shell is much better, but if the home route should feel even more Apple-like, the nav dock can shrink to icon-first with a single overflow menu.
- `/journal` is now action-forward, but the care queue still competes visually with the return CTA; next pass could demote it into a lighter secondary rail.

2026-03-20

- Ran a fusion clean-up pass so the product reads more like one judgment loop than several adjacent dashboards.
- Reworked `/` in `src/routes/+page.svelte`:
  - changed the hero to explicit loop language: `Read the shelf. Make one call.`
  - added a three-beat `Read / Call / Return` strip inside the mission card
  - renamed secondary room modules so the dock reads more like game verbs and less like admin panels
  - tightened the right rail around one `Judgment Loop` explainer plus lighter `Camp Prep`
- Reworked `/field` in `src/routes/field/+page.svelte`:
  - added a hard unresolved-slice travel lock so `E` and the right CTA cannot move the player while the command dock still owns the decision
  - rewrote the top plaque to carry route context instead of repeating the same encounter title/clue already shown in the dock
  - changed the console prompt to `Next move`, swapped the helper keyline based on current mode, and trimmed the footer down to route-relevant status only
- Reworked `/battle` in `src/routes/battle/+page.svelte`:
  - compressed the top summary from three pills to two: `Chart read` and `Best answer`
  - renamed controls to `Companion` and `Chart`, added select `aria-label`s, and changed `Dossier` to `Guide`
  - let the turn question breathe to two lines instead of clipping too early
- Verified:
  - `npm run check`
  - `npm run build`
  - browser review artifacts at:
    - `.agent-context/browser-checks/uiux-fusion-pass/home/shot-0.png`
    - `.agent-context/browser-checks/uiux-fusion-pass/field/shot-0.png`
    - `.agent-context/browser-checks/uiux-fusion-pass/battle/shot-0.png`
    - matching `state-0.json` files in each folder
  - dev server is running at `http://127.0.0.1:4198/`

TODO

- `/battle` still has some chart-side callout overlap on narrower widths; the next polish pass should reduce side-panel stacking density inside `ChartBattlefield.svelte`.
- The shared route/context URL builder is still duplicated across routes and should be centralized before another loop-wide navigation refactor.
