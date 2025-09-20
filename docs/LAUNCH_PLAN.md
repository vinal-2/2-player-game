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
| 2025-09-20 | T8 Movement/Collisions | Implemented snake movement loop, collision resolution, and apple respawn; updated specs/QA.
| 2025-09-20 | T8 Prep Workboard | Defined Snakes Duel prep tasks (grid spec, bot plan, skins brief, skeleton, telemetry).

## Competitive Insights (Notes)
- Content density: 40ï¿½50 lightweight games with consistent input patterns; prioritize fast load and 1ï¿½3 controls.
- Session design: best-of scoring, instant rematch, no login, offline play works fully.
- Presentation: playful SFX per hit/score, subtle crowd loop, confetti/flash on goals, haptics on key moments.
- UX: large touch targets, mirrored controls for top/bottom players, color-coded sides.
- Monetisation: interstitials between rounds, rewarded opts for cosmetics; premium removes ads.
- Compliance: clear privacy policy, ad consent (UMP), child-safe defaults, analytics minimal.

## Next Objectives
- T5 polish: monitor goalie fairness after tuning; consider layered cheer FX if players request more hype.
- T6 polish: run extended rally QA; evaluate adding bot tier for solo mode.
- T7 Spinner War backlog: evaluate additional power-ups, haptics, and boost balance post QA (T7-A/B/C/D/E completed).
- T8 Snakes Duel: harden movement/collision loop, finish bot difficulty tuning (rookie/pro/legend), integrate telemetry events, and coordinate skin asset delivery.

## Notes
- Session work (this chat): consolidated Ping Pong into MVC; tuned Air Hockey physics (friction 0.9965, damping 0.965, speed caps), ensured goal reset stability.
- Spinner War: persisted bot difficulty, added cooldown, seasonal arena background, boost UI rings/bars.
- Air Hockey: rotating goal SFX trio, stored difficulty preference, tighter goalie lane clamp.
- Ping Pong: clamped spin, raised vertical pace floor, tidied ambience cue timer.
- Snakes Duel: adaptive grid renderer with skin selection, bot pathfinding helpers wired into controller, movement/collision loop with apple respawn, telemetry hooks captured.

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


