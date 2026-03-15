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
  - make travel and battle motion real

TODO

- Import the chosen itch prototype family into `static/assets/` and remove dino from the main path.
- Build the actual `/field` route with camp, lab, archive, and gate.
- Make battle results return to camp with keepsake and care writeback.

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
