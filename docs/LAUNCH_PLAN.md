# Mobile Launch Roadmap & Audit Log
 LAUNCH_PLAN.md is in place with the roadmap plus an audit log that already records the foundation work (context cleanâ€‘up, Home/Game gating, asset loader hardening) and the new registry step we just completed.

## Vision & Scope
- Deliver a polished mobile-only two-player party collection that stands shoulder to shoulder with JindoBlu?s ?Two Player Games : The Challenge?.
- Focus on offline play with local hot-seat and bot opponents; defer online/Live Ops features until after launch.
- Ship to Google Play with production-ready visuals, audio, monetisation (ads + premium), analytics, accessibility, and compliance.

## Benchmark Highlights
- >40 mini games with steady content drops (e.g., ?Animal Stack?, ?Target Practice?).
- Strong UX polish: animation, haptics, responsive layout, bespoke art, multi-language support.
- Robust systems: AI opponents, progression, ads/rewards, privacy compliance, telemetry, live events.

## Implementation Backlog (v0.1)
1. **T1 ? Core Framework Refresh**: GameEngine integration, provider cleanup, navigation stabilisation.
2. **T2 ? Shared Art & Audio Pipeline**: Cohesive visual kit, sound library, asset loader alignment.
3. **T3 ? Home & Game Selection UX**: Hero carousel, categories, tutorials, seasonal banner.
4. **T4 ? Tic Tac Toe Deluxe**: Advanced AI tiers, win FX, score persistence.
5. **T5 ? Air Hockey Arena**: Physics polish, AI goalie, goal FX.
6. **T6 ? Ping Pong Rally**: Paddle physics, spin mechanic, crowd ambience.
7. **T7 ? Spinner War**: Arena physics, power-ups, burst FX.
8. **T8 ? Snakes Duel**: Grid renderer, bot pathfinding, skins.
9. **T9 ? Penalty Kicks Clash**: Gesture shooting, keeper AI, stadium presentation.
10. **T10 ? Tank Battle Duel**: Twin-stick controls, destructible arena, bots.
11. **T11 ? Quick Draw Reaction**: Reflex challenges, bot timing, stats.
12. **T12 ? Connect Four Master**: Alpha-beta AI, hints, victory animations.
13. **T13 ? Tug of War Sprint**: Rhythm mashing, stamina, dynamic camera.
14. **T14 ? FX & Animation Polish**: Shared particles, motion guidelines, reduce-motion support.
15. **T15 ? QA Harness & Telemetry**: Automated smoke tests, analytics wiring, crash reporting.
16. **T16 ? Store-Ready Packaging**: Icons, store creatives, localisation, policies, EAS pipeline.

## Audit Log
| Date (UTC) | Item | Notes |
|------------|------|-------|
| 2025-09-20 | Setup | Created roadmap file, documented backlog and benchmark goals. |
| 2025-09-20 | Foundations | Updated core contexts (`GameContext`, `SoundContext`, `AdContext`), gated Home/Game UI, hardened asset loader. |
| 2025-09-20 | Registry | Added game registry + manifest, centralised component registration, and ensured App initialises it. |
| 2025-09-20 | Runtime | Standardised GameScreen runtime props, refactored core games to `GameRuntime` API, added engine unregister support. |
| 2025-09-20 | T2 Art/Audio | Added asset manifest, updated loaders & theme palette scaffolding for shared art/audio pipeline. |
| 2025-09-20 | T3 Home UX | Rebuilt Home screen with featured carousel, category chips, tutorial overlay, and seasonal banner using new theme. |
| 2025-09-20 | T4 TicTacToe | Added AI difficulty tiers, win-line FX, and persistent scoreboard for Tic Tac Toe. |
| 2025-09-20 | T5 Air Hockey | Upgraded physics (friction, bounce), smarter goalie AI, goal FX, and difficulty controls. |
| 2025-09-20 | T6 Ping Pong | Added spin mechanics, adaptive bot, rally tracking, and ambient presentation polish. |
| 2025-09-20 | Competitive Audit | Benchmarked JindoBlu/JindoJindo "Two Player Games": breadth (40+ minis), fast rounds (<60s), simple controls, strong tactile/audio feedback, minimal friction to start, offline-first; noted store assets, ratings prompts, privacy policy, COPPA considerations. |
| 2025-09-20 | T5/T6 Code Review | Verified Air Hockey physics/AI, Ping Pong collision and scoring; identified gaps: missing spin parameterization, crowd ambience hooks, goal FX SFX variations, and difficulty tuning exposure in UI. |
| 2025-09-20 | T5 Physics Tuning | Increased friction slightly, raised min/max puck speed, stronger paddle influence; prepped cleaner round reset. |
| 2025-09-20 | T5 Goal FX/AI | Added alternating goal SFX fallback; refined goalie focus zone, prediction steps, and chase speed by difficulty and puck speed. |
| 2025-09-20 | T6 Ambience Start | Added subtle periodic crowd ambience cue in Ping Pong screen.
| 2025-09-20 | T6 Spin/Angle | Implemented explicit spin with decay and stronger hit-angle based on paddle offset/velocity; added on-screen ambience toggle.
| 2025-09-20 | T7-A Start | Added Spinner War arena physics: wall bounce with damping, spinner knockback impulse, impact callback for FX hooks.
| 2025-09-20 | T7-A FX Hook | Wired Screen to onImpact: plays collision SFX and added burst overlay pulse in View.
| 2025-09-20 | T7-B Power-up | Added timed speed-boost pickup spawning/decay, pickup detection, and UI indicator; plays impact cue on pickup.
| 2025-09-20 | T7-C Burst FX | Threaded explicit impact pulse from Screen to View using ref; added subtle shake and burst overlay.
| 2025-09-20 | T7-D Difficulty | Persisted bot difficulty, tuned jitter/accel caps, added edge braking and impact cooldown to avoid pinning.
| 2025-09-20 | T7-E Seasonal/Boost UI | Wired SeasonalContext background, per-player boost rings/bars, distinct pickup SFX.
| 2025-09-20 | T5 Goal FX Refresh | Rotating goal SFX trio, persisted difficulty preference, goalie chase lane clamp.
| 2025-09-20 | T6 Balance QA | Clamped spin ceiling, raised vertical pace floor, tightened ambience cue timer handling.
| 2025-09-20 | T8 Prep Workboard | Drafted Snakes Duel specs (grid, bot, art, telemetry) and placeholder runtime scaffold.
| 2025-09-20 | T8-B Pathfinding Helpers | Implemented A* and flood-fill utilities for Snakes Duel bot planning; docs/QA updated.
| 2025-09-20 | T8-B Controller Wiring | Integrated pathfinding helpers into bot controller with fallback flood-fill safe moves.
| 2025-09-20 | T8 Adaptive Pacing/Skins | Added model tick-rate ramp and cosmetic skin selection with persistence.
| 2025-09-20 | T8 Prep Workboard | Defined Snakes Duel prep tasks (grid spec, bot plan, skins brief, skeleton, telemetry).

## Competitive Insights (Notes)
- Content density: 40ï¿½50 lightweight games with consistent input patterns; prioritize fast load and 1ï¿½3 controls.
- Session design: best-of scoring, instant rematch, no login, offline play works fully.
- Presentation: playful SFX per hit/score, subtle crowd loop, confetti/flash on goals, haptics on key moments.
- UX: large touch targets, mirrored controls for top/bottom players, color-coded sides.
- Monetisation: interstitials between rounds, rewarded opts for cosmetics; premium removes ads.
- Compliance: clear privacy policy, ad consent (UMP), child-safe defaults, analytics minimal.

## Next Objectives
- T5 polish: monitor goalie fairness after tuning; explore layered cheer FX if players request more hype.
- T6 polish: run extended rally QA; consider adding bot tier for solo mode.
- T7 Spinner War backlog: evaluate additional power-ups, haptics, and boost balance post QA (T7-A/B/C/D/E completed).
- T8 Snakes Duel: scope grid renderer, bot pathfinding, and cosmetic skins for implementation kickoff.

## Notes
- Session work (this chat): consolidated Ping Pong into MVC; tuned Air Hockey physics (friction 0.9965, damping 0.965, speed caps), ensured goal reset stability.
- Spinner War: persisted bot difficulty, added cooldown, seasonal arena background, boost UI rings/bars.
- Air Hockey: rotating goal SFX trio, stored difficulty preference, tighter goalie lane clamp.
- Ping Pong: clamped spin, raised vertical pace floor, tidied ambience cue timer.
- Snakes Duel: documented grid/adaptive pacing plan, wired bot pathfinding helpers, added adaptive tick loop + skin selection UI, and captured telemetry prep.

## QA Checklist (2025-09-20)
- Spinner War: Rookie/Pro/Legend distinct behaviors; no wall pinning post-impact; pickups spawn 12â€“20s and boost bars drain smoothly.
- Air Hockey: goal SFX cycle through trio; goalie recovers on fast shots; rookie win rate around 60% in ad-hoc matches.
- Ping Pong: spin remains readable; ambience toggle immediate; rally milestones fire at 6/10; reset resumes without artifacts.

## Workboard Template (Use For T7â€“T16)
- Task IDs: Use target prefix (e.g., T7-A) and keep items â‰¤1â€“2h.
- For each item include: Goal, Acceptance, Files, Test.

### <TARGET> Workboard
- <TARGET>-A: <Short Title>
  - Goal: <actionable outcome>
  - Acceptance: <measurable criteria>
  - Files: <paths>
  - Test: <manual steps>
- <TARGET>-B: <Short Title>
  - Goal:
  - Acceptance:
  - Files:
  - Test:

---

### T7 Spinner War Workboard
- T7-A: Arena Physics
  - Goal: Add velocity, drag, wall collisions with damping, and spinner-vs-spinner knockback.
  - Acceptance: Spinners move with momentum, bounce off walls, and knock each other back on collision without tunneling.
  - Files: games/spinner-war/SpinnerWarModel.ts, games/spinner-war/SpinnerWarController.ts, games/spinner-war/SpinnerWarView.tsx
  - Test: Drive two spinners into walls and into each other at angles; observe energy loss and stable positions.
- T7-B: Power-up Spawn (Speed Boost)
  - Goal: Periodic pickup spawns; collecting applies a timed speed multiplier with visual indicator.
  - Acceptance: Only one pickup at a time; boost applies for N seconds and decays smoothly.
  - Files: Model (spawn/state), View (render), Controller (collect)
  - Test: Observe spawn, collect, see boost, then return to normal.
- T7-C: Burst FX
  - Goal: Impact FX on high-energy collisions plus slight camera shake.
  - Acceptance: FX triggers above threshold; small shake; no spam.
  - Files: View, optional Haptics hook
  - Test: Hard hit shows FX; soft grazes donâ€™t.
- T7-D: Difficulty Tuning
  - Goal: Rookie/Pro/Legend bot with error offsets and speed caps.
  - Acceptance: Rookie beatable consistently; Legend challenging.
  - Files: Controller + Model caps
  - Test: Play 3 rounds per tier.
- T7-E: Presentation Polish
  - Goal: SFX for hits/pickups, arena seasonal background, boost badge UI.
  - Acceptance: Audio/visual cues present; no overlap with BG music.
  - Files: View + SoundContext + assets
  - Test: Verify SFX/visuals appear at appropriate moments.

- T8 Snakes Duel Workboard (Prep)
  - T8-A: Grid Renderer Spec (completed)
    - Goal: Define board sizing, scaling for phone/tablet, and segment animation requirements.
    - Acceptance: Document grid config (cell size, padding), growth animation rules, collision detection approach. **Done** â€“ see `docs/snakes-duel-spec.md` and placeholder grid renderer in `SnakesDuelView`.
    - Files: docs/snakes-duel-spec.md, games/snakes-duel/
    - Test: Visual smoke â€“ placeholder board renders correctly across phone/tablet sizes.
  - T8-B: Bot Pathfinding Plan (in progress)
    - Goal: Prototype core A* + flood-fill helpers for AI tiers and wire baseline direction updates.
    - Acceptance: `games/snakes-duel/utils/pathfinding.ts` exports reusable functions; controller uses helpers for directional planning; docs updated. **In progress** â€“ helpers + controller wiring done, collision handling pending.
    - Files: games/snakes-duel/utils/pathfinding.ts, games/snakes-duel/SnakesDuelController.ts, docs/snakes-duel-bot.md
    - Test: Unit test or manual validation with mock grid (todo).
  - T8-C: Skins & Theming Brief (in progress)
    - Goal: Define snake skins palette, unlock rules, and seasonal overrides; expose selection UI.
    - Acceptance: Skins brief documented; Snakes Duel screen allows P1/P2 selection with persistence. **Partial** â€“ UI implemented, art delivery pending.
    - Files: docs/snakes-duel-art.md, games/snakes-duel/SnakesDuelView.tsx, SnakesDuelScreen.tsx
    - Test: Manual check â€“ select skins, reset, relaunch.
  - T8-D: Runtime Skeleton Setup (in progress)
    - Goal: Create placeholder model/controller/view files with adaptive pacing tick loop.
    - Acceptance: Game loads with placeholder board; model tick loop ramps from 6â†’10; no crashes. **Partial** â€“ adaptive pacing implemented; movement/collisions TODO.
    - Files: games/snakes-duel/*
    - Test: Launch Snakes Duel placeholder â€“ verify tick rate label increments towards 10 after seeding apples.
- T8-B: Bot Pathfinding Plan
  - Goal: Outline AI difficulty tiers using A* or heuristic flood fill for apple targeting and opponent avoidance.
  - Acceptance: Written plan with algorithms, data structures, and performance considerations.
  - Files: docs/snakes-duel-bot.md (new)
  - Test: Peer review or checklist approval.
- T8-C: Skins & Theming Brief
  - Goal: Define snake skins palette, unlock rules, and seasonal overrides to align with art pipeline.
  - Acceptance: Visual brief referencing existing theme tokens and asset requirements.
  - Files: docs/snakes-duel-art.md (new)
  - Test: Art lead sign-off or TODO conversion.
- T8-D: Runtime Skeleton Setup
  - Goal: Create placeholder model/controller/view files with TODOs and register in manifest.
  - Acceptance: Game loads with placeholder board, no crashes, ready for incremental delivery.
  - Files: games/snakes-duel/*, games/manifest.ts
  - Test: Launch Spinner War followed by Snakes Duel placeholder without runtime errors.
- T8-E: QA & Telemetry Hooks Plan
  - Goal: Identify telemetry events and automated smoke steps for Snakes Duel rollout.
  - Acceptance: Checklist added to docs/QA.md and analytics event list updated.
  - Files: docs/QA.md, docs/snakes-duel-telemetry.md
  - Test: Checklist reviewed by QA/analytics stakeholders.


## Assessment Summary  - Original plan with all blueprints before edits where made

The current Expo app is a thin shell: only four games are partially wired, yet contexts/GameContext.tsx:94 and later reference seven additional titles that have no implementations, so the catalog and UI are already out of sync.
Audio, asset loading, and accessibility scaffolds are unsound: contexts/SoundContext.tsx:20 exports only named values but screens import a default (screens/TicTacToeScreen.tsx:7, screens/SpinnerWarScreen.tsx:17, etc.), and every file under assets/sounds/ is a 0â€‘byte placeholder, so the sound system will throw at runtime.
The supposed core engine (core/GameEngine.ts) is unused; each mini-game reimplements its own loop and navigation, and duplicate files (e.g. games/ping-pong/PingPongGame.tsx vs PingPongScreen.tsx) show the architecture never converged.
Monetisation/ads are fake: components/AdModal.tsx always locks the user in a 30s modal with no SDK integration, while contexts/AdContext.tsx simply sets timersâ€”this will not pass Play Store policies.
Build packaging is incomplete: there is no EAS workflow, store listing assets, privacy policy, or consent handling, and Expo 52 needs a thorough compatibility pass before shipping.
Benchmark Findings (JindoBlu â€œTwo Player Games : The Challengeâ€)

Play Store listing (playstore_jindoblu.html) shows >40 mini games, constant content drops (â€œNew game: Animal Stackâ€, â€œTarget Practiceâ€), robust offline play, and both local PvP and AI opponents.
Live ops elements include coins/unlocks, daily challenges, cosmetic customization, leaderboards/achievements, and parental safety cuesâ€”top reviews highlight variety, steady updates, and solo bot play.
Production polish: responsive haptics and SFX, animated transitions, branded art, rewarded/Interstitial ads with gating, GDPR/CCPA consent, analytics, multilingual support, adaptive icons, and store screenshots in multiple aspect ratios.
Gap Analysis

Content: need a minimum viable catalog (10â€“12 polished mini games) with difficulty curves and AI; current repo only sketches four and leaves others undefined (contexts/GameContext.tsx:94 onwards).
Presentation: bespoke art, cohesive themes, localized copy, and performant animations are missing; exported assets are placeholders and there is no typography system.
Tech foundations: fix navigation stack, centralize game loop, normalize state management, and replace fake services (ads, analytics, storage) with production-ready SDKs.
Compliance: implement privacy policy, telemetry consent, offline-safe error handling, accessibility options, and crash reporting before Play Store submission.
Tooling: establish CI/CD with EAS, automated tests, device farm smoke tests, and regression coverage.
Recommended Roadmap

Foundations (Week 1â€“2) â€“ Stabilize architecture (GameEngine integration, context fixes, type-safe navigation), replace placeholder assets with temp real files, and stand up real analytics/error logging.
Content Build (Week 3â€“6) â€“ Design & implement a prioritized mini-game set (tic-tac-toe, air hockey, ping pong, spinner war, snake, connect four, quick reflex titles), including shared systems (scoreboard, bot AI, match rules, achievements).
UX & Polish (Week 5â€“7) â€“ Art direction, animation guidelines, responsive layout, accessibility toggles, vibration/sound design, tutorial flows, and offline-ready state management.
Monetisation & Live Ops (Week 6â€“8) â€“ Integrate approved ad SDK (AdMob/Unity), add premium upgrade, coin economy, daily challenges, progression save, and parental gates.
Compliance & Release (Week 8â€“9) â€“ Produce store listing assets, localization, privacy policy, consent dialog, QA matrix (manual + automated), Play Integrity checks, and final build submission.
Housekeeping

Research artifacts playstore_app.html and playstore_jindoblu.html are untracked; keep or delete as needed before committing.
Next natural step: confirm which mini-games anchor the MVP, then lock scope for the foundations milestone; I can draft detailed implementation tickets once we agree on that list.


## Implementation Backlog (Draft) - before any ediits. Please review code for updates and align this @codex

T1 â€“ Core Game Framework Refresh

Stabilise core/GameEngine.ts and navigation. Provide hooks for per-game loops, pause/resume, and shared HUD overlays.
Standardise context APIs (SoundContext, AdContext, GameContext) with proper default exports and TypeScript types.
Acceptance: All scenes run via the engine; no screen imports SoundContext as default; TypeScript passes in npx tsc.
Dependencies: None; unblocker for all game tickets.
T2 â€“ Shared Art & Audio Pipeline

Commission/prepare a cohesive art kit: UI chrome, buttons, scoreboards, icons, arenas, backgrounds, particle textures.
Populate assets/images/ and assets/sounds/ with production-ready files; update AssetLoader.ts manifests.
Acceptance: expo start shows branded visuals; SFX play without runtime warnings; Lottie or RN animation assets checked in.
T3 â€“ Home & Game Selection UX

Rebuild screens/HomeScreen.tsx to showcase game cards (carousel + grid) with previews, difficulty tags, and quick-play.
Add tutorial modal, settings shortcut, seasonal banner stubs, and smooth navigation into GameScreen.
Acceptance: Light/ performant animations (<16â€¯ms/frame), accessible labels, controller test passes on Android/iOS.
T4 â€“ Tic Tac Toe Deluxe

Implement polished board, win-line animation, particle confetti, undo (hot seat), and three bot levels (random, rule-based, minimax).
Integrate haptics/audio cues and scoreboard persistence.
Acceptance: Beatable AI tiers, 60â€¯fps on mid-tier device, full-screen in landscape & portrait.
Depends on T1â€“T3.
T5 â€“ Air Hockey Arena

Physics (paddle inertia, puck friction), dual-touch controls, AI goalie with adjustable aggression, goal explosion FX.
Add cinematic intro camera pan, scoreboard, sudden-death mode.
Acceptance: Collision glitch-free for 5 min session; AI difficulty toggles; haptic on goals.
Depends on T1, T2.
T6 â€“ Ping Pong Rally

Side-view table tennis: paddle drag, spin mechanic, rally multiplier, bot AI with error curve.
Animated audience backdrop, smash VFX, reactive soundtrack layer.
Acceptance: Bot rallies >10 hits; smashes trigger unique SFX; metrics logged via Analytics.
Depends on T1â€“T3.
T7 â€“ Spinner War (Beyblade-style)

Implement arena with physics, spin decay, power-ups, and burst particle effects.
Provide bot strategy (charge vs dodge) and two-player drag controls.
Acceptance: No clipping through arena walls; matches conclude <60â€¯s; win replay camera.
Depends on T1, T2.
T8 â€“ Snakes Duel

Rewrite screens/SnakesScreen.tsx using engine: grid renderer, swipe/virtual D-pad, bot pathfinding with difficulty.
Add food spawn animation, themed skins, slow-mo finish.
Acceptance: 30â€¯fps+ on low-end; players can swap sides; analytics logs route length.
Depends on T1, T2.
T9 â€“ Penalty Kicks Clash

New mini-game: alternating shooter/keeper. Gesture-based shot aiming, keeper predictive AI, scoreboard best-of-5.
Stadium ambience, crowd cheers, replay slow-mo.
Acceptance: Swipe controls intuitive (tutorial); bot difficulty adjustable; audio mix balanced.
Depends on T1, T2.
T10 â€“ Tank Battle Duel

Top-down arena shooter: twin-stick controls (drag pads), destructible obstacles, ricochet physics, bot patrol AI.
Effects: muzzle flash, screen shake, hit markers.
Acceptance: Multiplayer responsive under 60â€¯fps; bot can flank player; match summary screen.
Depends on T1, T2.
T11 â€“ Quick Draw Reaction

Reflex mini-game: countdown cues, random events (tap/hold/swipe), failing conditions, leaderboards stub.
Provide bot reaction times per difficulty.
Acceptance: Reaction time captured per round; two-player simultaneous input accurate.
Depends on T1, T3.
T12 â€“ Connect Four Master

Gravity-based board, drop animation, AI with alpha-beta pruning, hint overlay.
Add undo (bot only), highlight potential wins, celebratory animation.
Acceptance: Hard AI wins â‰¥80â€¯% vs medium; board transitions glitch-free.
Depends on T1â€“T3.
T13 â€“ Tug of War (Tap Sprint)

Button-mash style race: stamina meter, obstacles, bot rhythm patterns, dynamic camera zoom.
Progress bar overlay, cheering crowd, vibration feedback.
Acceptance: UI mirrors JindoBlu tempo; performance consistent across device classes.
Depends on T1, T2.
T14 â€“ FX & Animation Polish Pass

Add global transitions (page fades, parallax), shared particle library, haptics per event, audio ducking.
Ensure all games meet animation guidelines (duration caps, reduce-motion support).
Acceptance: QA checklist of cues complete; accessibility toggle disables motion instantly.
Depends on initial game implementations (T4â€“T13).
T15 â€“ QA Harness & Telemetry

Build Jest + Detox smoke suite for navigation and per-game sanity checks.
Instrument analytics events (start, end, match stats) and error logging (Sentry or similar).
Acceptance: CI pipeline running tests; analytics verified via development dashboard.
Depends on T1, partial on game tickets for event triggers.
T16 â€“ Store-Ready Packaging

Prepare app.json metadata, adaptive icons, feature graphics, localized strings (EN + 2 locales).
Write privacy policy, COPPA-friendly settings, and ensure app size under Play Store thresholds.
Acceptance: eas build --platform android succeeds; Play Console pre-launch report expected to pass (target).
Depends on T2, T14, T15.
Let me know if you want to prioritise or split these further (e.g., art/audio handled in separate sprint).

Next step from that log is to resume with the highestâ€‘priority backlog item (T1: core framework refresh beyond registry wiring), now that the plan file is there. Let me know when youâ€™re ready and Iâ€™ll pick up from that entry.


## notes from previous chat:
Core Runtime Upgrades

GameScreen.tsx:12 now consumes a typed GameMode/GameRuntimeEvent, funnels start/exit through shared callbacks, and hands the registry component a standard prop set (gameId, mode, onExit, onEvent). Hardware/back navigation now toggles the briefing via handleExitGame.
core/gameRuntime.ts defines the canonical runtime props & event types; core/gameRegistry.ts, games/registerGames.ts, and App.tsx:21 hook everything together.
Playable titles (games/air-hockey/AirHockeyScreen.tsx, games/tic-tac-toe/TicTacToeScreen.tsx, games/spinner-war/SpinnerWarScreen.tsx, games/ping-pong/PingPongScreen.tsx) now accept the runtime props, dispatch analytics/events via onEvent, and unregister themselves via the new GameEngine.unregisterGame / stopGame(gameId) (see core/GameEngine.ts:54).
games/manifest.ts + core/gameCatalog.ts feed contexts/GameContext.tsx:13, giving one source of truth for metadata/gating.
Art & Audio Pipeline Scaffolding

core/assets.ts and core/theme.ts centralise SFX/image manifests and palette choices; utils/AssetLoader.ts:6 now preloads via that manifest, and contexts/SoundContext.tsx:14 pulls background music from it.
screens/HomeScreen.tsx:20 imports the palette so primary surfaces use palette.midnight/deepBlue, aligning with the forthcoming visual kit. Audit entries (docs/LAUNCH_PLAN.md) now track Foundations â†’ Registry â†’ Runtime â†’ T2 Art/Audio.
Next Steps (T3 onward)

T3 â€“ Home & Game Selection UX: redesign the Home experience (carousel, categories, tutorial overlay) using the new theme palette + manifest hooks.
T4 â€“ Tic Tac Toe Deluxe: upgrade AI tiers, add win-line FX, persist scoresâ€”now easy to extend thanks to the unified runtime.
Continue marching through T5â€“T16 to reach the 95â€¯% parity/launch-ready target (physics polish, new mini-games, monetisation, QA, store assets, etc.).
No automated tests were run yet; plan to bring a Jest/Detox harness online during T15. Everything is logged in docs/LAUNCH_PLAN.md for ongoing traceability.

T3 (Home & Game Selection UX) is up next. Iâ€™ll start by redesigning the Home experienceâ€”carousel, category chips, tutorial overlay, seasonal bannerâ€”using the shared palette/manifest. Once thatâ€™s in, Iâ€™ll move straight into T4 (Tic Tac Toe Deluxe) for AI polish, win FX, and score persistence, and keep working down the backlog item-by-item. Iâ€™ll log each milestone in docs/LAUNCH_PLAN.md as we go.

Home UX Overhaul (T3)

Rebuilt the landing page (screens/HomeScreen.tsx) around the new theme palette: added a featured-game carousel, live category chips, seasonal banner, premium CTA, recent-play tiles, tutorial overlay (persisted via AsyncStorage), and gating badges for premium / coming-soon titles.
Centralised asset & colour metadata (core/assets.ts, core/theme.ts) and updated utils/AssetLoader.ts plus contexts/SoundContext.tsx to consume the shared manifests, keeping audio/image preloading consistent across screens.
Logged the milestone in docs/LAUNCH_PLAN.md so the roadmap now reflects the completed T3 work.
Tic Tac Toe Deluxe (T4)

Upgraded the model (games/tic-tac-toe/TicTacToeModel.ts) with difficulty-aware bot logic (easy/medium/hard using minimax for hard), a broadcastable state change hook, and minimax-based win detection that leaves the UIâ€™s winningCells intact.
Enhanced the controller (games/tic-tac-toe/TicTacToeController.ts) with difficulty control, adaptive bot delays, and debounced move scheduling; added persistence + difficulty analytics in TicTacToeScreen.tsx (scores saved/restored via AsyncStorage, runtime events fired on game over and difficulty swaps).
Polished the view (games/tic-tac-toe/TicTacToeView.tsx) with animated win-line pulses, difficulty chips, updated scoreboard styling, and bot labelling, delivering the expected â€œdeluxeâ€ presentation.
Recorded the T4 completion in the audit log.
Next Targets

T5 â€“ Air Hockey Arena: tighten physics, goalie AI, goal FX.
T6 â€“ Ping Pong Rally: paddle physics, spin mechanic, crowd ambience.
Continue through T7+ to close the remaining launch backlog.
Run tests / preview: start Expo (yarn --cwd frontend start) to verify the new Home flow, difficulty toggles, and Tic-Tac-Toe persistence in-device.

Good plan. I audited T5/T6 code, logged gaps, and set next objectives.

What Iâ€™ve done

Launch plan updates:
Added â€œCompetitive Auditâ€ and â€œT5/T6 Code Reviewâ€ entries to docs/LAUNCH_PLAN.md:41.
Added a â€œCompetitive Insights (Notes)â€ section with actionable benchmarks.
Added â€œNext Objectivesâ€ listing precise T5/T6/T7 polish targets.
Findings (quick)

Air Hockey (T5): Solid physics pass exists in games/air-hockey with friction, wall damping, collision normal reflection, goalie AI prediction. Gaps: more noticeable goal SFX variation, fine-tune paddle influence/friction, ensure difficulty chips fully wired in screen.
Ping Pong (T6): Two implementations are present:
games/ping-pong/PingPongGame.tsx: implements bounce-angle-by-hit-position and paddle-hit SFX, but seems to be a standalone view/game loop.
games/ping-pong/PingPongController.ts (contains model class): simpler axis flips, no spin mechanic, fixed speeds. Needs consolidation and spin/crowd ambience features.
Spinner War (T7): Files exist but need arena physics tuning, power-ups, and impact FX.
Next steps Iâ€™ll tackle (small, focused patches)

Air Hockey polish (T5):
Expose goal SFX variations via SoundContext and trigger in AirHockeyModel.handleGoal.
Slightly adjust paddleInfluence and friction for crisper rebounds.
Confirm difficulty chips from AirHockeyView.tsx propagate to controller (if any wiring gap in Screen).
Ping Pong upgrades (T6):
Unify to one flow (prefer the controller+model+view pattern).
Add spin: modulate outgoing angle by paddle vertical movement at impact; add spin decay.
Add looping crowd ambience with start/stop hooks in View; ensure volume control via SoundContext.
Improve rally tracking and feedback (subtle flash/haptic on long rallies).
Spinner War (T7):
Arena friction and edge knockback in model.
Simple timed power-up (speed boost, weight) and burst FX trigger in view.
Quick question (to align before I start patching)

For Ping Pong, should I retire the standalone PingPongGame.tsx in favor of Controller/Model/View pattern, or keep both and link one as the active Screen? If you prefer consolidation, Iâ€™ll remove the redundant file and update PingPongScreen.tsx to the MVC version.
If that sounds good, Iâ€™ll proceed with:

T5: add goal SFX variety + tweak physics.
T6: consolidate to MVC and implement spin + ambience.
T7: core arena physics + one basic power-up.
Iâ€™ll keep updating docs/LAUNCH_PLAN.md after each patch so progress is preserved.

Confirmed. I removed the redundant PingPongGame.tsx and kept the MVC pattern in place.

Changes made

Deleted games/ping-pong/PingPongGame.tsx.
Verified games/ping-pong/PingPongScreen.tsx already implements a full MVC-like flow with state, inputs, bot logic, and SFX. No changes needed there yet.
Minor annotation tweak in games/ping-pong/PingPongController.ts to clarify the model is kept.
Updated log in docs/LAUNCH_PLAN.md:43 to record the T6 cleanup.
Next steps (as agreed)

Air Hockey (T5): add goal SFX variety, tune friction/paddle influence, confirm difficulty chips wiring from View to Controller.
Ping Pong (T6): keep MVC Screen; add explicit spin param and decay, crowd ambience loop via SoundContext, rally polish.
Spinner War (T7): core arena physics + one basic power-up + burst FX.
Iâ€™ll update docs/LAUNCH_PLAN.md after each patch so progress is captured.
Shall I proceed with the Air Hockey physics + AI polish next?
- Snakes Duel: drafted pathfinding helpers (A*, flood-fill) and captured next integration steps.
