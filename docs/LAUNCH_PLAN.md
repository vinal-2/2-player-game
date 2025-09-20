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
| 2025-09-20 | T8 Difficulty UI | Added bot difficulty chips, AI telemetry events, and persistence for Snakes Duel. |
| 2025-09-20 | Spinner War Fixes | Removed stray module identifiers, enabled reset handling, honoured initial VS Bot mode, and added mode/difficulty highlights. |
| 2025-09-20 | T8 Snakes Polish | Added apple splash FX with haptics, rematch overlay controls, AI telemetry escape event, and art handoff checklist. |
| 2025-09-20 | T9 Kickoff | Added Penalty Kicks spec, placeholder runtime, and registry entry. |

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
- T8 Snakes Duel: await art/FX delivery, run final smoke QA, and prep summary ahead of T9 kickoff.

## Notes
- Session work (this chat): consolidated Ping Pong into MVC; tuned Air Hockey physics (friction 0.9965, damping 0.965, speed caps), ensured goal reset stability.
- Spinner War: persisted bot difficulty, added cooldown, seasonal arena background, boost UI rings/bars.
- Air Hockey: rotating goal SFX trio, stored difficulty preference, tighter goalie lane clamp.
- Ping Pong: clamped spin, raised vertical pace floor, tidied ambience cue timer.
- Snakes Duel: adaptive grid renderer with skin selection, countdown/restart overlays, full movement & collision loop, Rookie/Pro/Legend bot tuning, and telemetry events wired to analytics.



### T9 Penalty Kicks Workboard
- T9-A: Spec & Placeholder (completed)
  - Goal: Capture shootout mechanics and create skeleton model/controller/view/screen.
  - Acceptance: docs/penalty-kicks-spec.md drafted; placeholder runtime registered and visible in manifest. **Done**
- T9-B: Swipe Interaction Prototype (pending)
  - Goal: Implement swipe detection for shooter and placeholder keeper dive.
  - Acceptance: Debug overlay shows shot vector and keeper response.
- T9-C: Bot Difficulty Plan (pending)
  - Goal: Outline bot keeper heuristics for Rookie/Pro/Legend tiers.
  - Acceptance: Document updated with reaction/dive behaviour; controller uses config map.
- T9-D: Art & FX Handoff (pending)
  - Goal: Define required goal/keeper assets, crowd FX, and haptics mapping.
  - Acceptance: Checklist added to art brief with deadlines.
- T9-E: QA & Telemetry Prep (pending)
  - Goal: Add QA checklist items and telemetry event list for Penalty Kicks.
  - Acceptance: docs/QA.md and telemetry doc updated.

