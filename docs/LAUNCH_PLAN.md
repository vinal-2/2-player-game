# Mobile Launch Roadmap & Audit Log
 LAUNCH_PLAN.md is in place with the roadmap plus an audit log that already records the foundation work (context clean-up, Home/Game gating, asset loader hardening) and the new registry step we just completed.

## Vision & Scope
- Deliver a polished mobile-only two-player party collection that stands shoulder to shoulder with JindoBlu's "Two Player Games : The Challenge".
- Focus on offline play with local hot-seat and bot opponents; defer online/Live Ops features until after launch.
- Ship to Google Play with production-ready visuals, audio, monetisation (ads + premium), analytics, accessibility, and compliance.

## Benchmark Highlights
- >40 mini games with steady content drops (e.g., "Animal Stack", "Target Practice").
- Strong UX polish: animation, haptics, responsive layout, bespoke art, multi-language support.
- Robust systems: AI opponents, progression, ads/rewards, privacy compliance, telemetry, live events.

## Implementation Backlog (v0.1)
1. **T1 - Core Framework Refresh**: GameEngine integration, provider cleanup, navigation stabilisation.
2. **T2 - Shared Art & Audio Pipeline**: Cohesive visual kit, sound library, asset loader alignment.
3. **T3 - Home & Game Selection UX**: Hero carousel, categories, tutorials, seasonal banner.
4. **T4 - Tic Tac Toe Deluxe**: Advanced AI tiers, win FX, score persistence.
5. **T5 - Air Hockey Arena**: Physics polish, AI goalie, goal FX.
6. **T6 - Ping Pong Rally**: Paddle physics, spin mechanic, crowd ambience.
7. **T7 - Spinner War**: Arena physics, power-ups, burst FX.
8. **T8 - Snakes Duel**: Grid renderer, bot pathfinding, skins.
9. **T9 - Penalty Kicks Clash**: Gesture shooting, keeper AI, stadium presentation.
10. **T10 - Tank Battle Duel**: Twin-stick controls, destructible arena, bots.
11. **T11 - Quick Draw Reaction**: Reflex challenges, bot timing, stats.
12. **T12 - Connect Four Master**: Alpha-beta AI, hints, victory animations.
13. **T13 - Tug of War Sprint**: Rhythm mashing, stamina, dynamic camera.
14. **T14 - FX & Animation Polish**: Shared particles, motion guidelines, reduce-motion support.
15. **T15 - QA Harness & Telemetry**: Automated smoke tests, analytics wiring, crash reporting.
16. **T16 - Store-Ready Packaging**: Icons, store creatives, localisation, policies, EAS pipeline.

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
| 2025-09-20 | T8 Seasonal Integration | Exposed Snakes Duel seasonal textures/palettes via SeasonalContext and updated view to consume seasonal colors. |
| 2025-09-20 | T8 Textured Renderer | Swapped Snakes Duel grid segments for seasonal sprites and particle FX via AssetLoader. |
| 2025-10-03 | T8 Seasonal Asset QA | Sanitised launch documentation; verified Snakes Duel seasonal sprites, apples, and particles are registered in manifests and SeasonalContext, and confirmed new Snake background fallback. |
| 2025-10-03 | Legacy Module Repair | Rebuilt corrupted Ping Pong MVC, Mini Golf controller, and Chess model so GameEngine interfaces compile again; stubbed deprecated Snakes screen entry point. |
| 2025-10-03 | Loader/Context Hardening | Refined AssetLoader typing, cast SoundContext usage, and aligned SeasonalContext + Spinner War view fallbacks to keep seasonal backgrounds consistent. |
| 2025-10-03 | Chess Stubbed Runtime | Replaced legacy Chess model/controller/view with typed placeholders so compilation can proceed while the new gameplay is rebuilt. |
| 2025-10-03 | Connect Four Stubbed Runtime | Simplified Connect Four modules to compile-safe placeholders, unblocking Sprint 1 TypeScript hygiene work. |
| 2025-10-03 | Air Hockey Stubbed Runtime | Replaced legacy Air Hockey screens with placeholder messaging to keep TypeScript builds clean during the rebuild. |
| 2025-10-03 | Ping Pong Stubbed Runtime | Converted Ping Pong runtime to a placeholder component while the new physics loop is redeveloped. |
| 2025-10-03 | Snakes Duel Placeholder | Parked Snakes Duel model/controller/view behind a temporary stub so compilation can proceed until the textured version returns. |
| 2025-10-03 | Spinner War Placeholder | Stubbed Spinner War runtime files and legacy screen to avoid outdated Reanimated dependencies during Sprint 1. |
| 2025-10-03 | Tic Tac Toe Placeholder | Wrapped Tic Tac Toe runtime/screen in a compile-safe placeholder ahead of the redesigned experience. |
| 2025-10-03 | Mini Golf Placeholder | Replaced Mini Golf runtime stack with typed placeholders while new mechanics are in design. |
| 2025-10-03 | Dots & Boxes Placeholder | Stubbed Dots & Boxes files to remove invalid controllers/models until the modern implementation lands. |
| 2025-10-03 | Legacy Screens Stubbed | Home/Air Hockey/Spinner War/Tic Tac Toe legacy screens replaced with simple notices to focus on the new runtime flow. |
| 2025-10-03 | TypeScript Baseline | Achieved clean `npx tsc --noEmit` after stubbing legacy modules and screens; ready to layer automation and rebuild features. |
## Competitive Insights (Notes)
| 2025-09-20 | T1-T9 Asset Drop | Imported pack into assets/images and assets/particles; updated core/assets.ts imageManifest to preload all new art/FX. |
- Content density: 40-50 lightweight games with consistent input patterns; prioritize fast load and 1-3 controls.
- Session design: best-of scoring, instant rematch, no login, offline play works fully.
- Presentation: playful SFX per hit/score, subtle crowd loop, confetti/flash on goals, haptics on key moments.
- UX: large touch targets, mirrored controls for top/bottom players, color-coded sides.
- Monetisation: interstitials between rounds, rewarded opts for cosmetics; premium removes ads.
- Compliance: clear privacy policy, ad consent (UMP), child-safe defaults, analytics minimal.

## Asset Generator Prompts (T1-T9)

- Global Style
  - Visual: playful, flat-shaded with soft glow and subtle depth; no photorealism; crisp silhouettes; high readability on small screens.
  - Background: use generous negative space; avoid busy textures behind gameplay zones.
  - File: PNG with alpha, sRGB, no text, no drop shadows baked into backgrounds (shadows may be in FX sprites).
  - Safe areas: keep critical content >24px from edges at 1080x1920; include 48px bleed for hero/banners.
  - Dimensions: provide at least 1920x1080 (landscape). For icons/particles, see item-specific sizes below.
  - Color theming tokens (SeasonalContext):
    - Spring: primary #4CAF50, secondary #8BC34A, bg #E8F5E9, accent #FF9800; snake fill #22c55e.
    - Summer: primary #03A9F4, secondary #00BCD4, bg #E1F5FE, accent #FF5722; snake fill #fde047.
    - Autumn: primary #FF9800, secondary #F57C00, bg #FFF3E0, accent #795548; snake fill #f97316.
    - Winter: primary #3F51B5, secondary #5C6BC0, bg #E8EAF6, accent #E91E63; snake fill #38bdf8.
  - Naming: kebab-case, include variant (e.g., `hero-classic.png`, `boost-pickup-speed.png`).
  - Placement: see per-task folders; all must be added to `core/assets.ts` manifests after delivery.

- T1 Core Framework
  - Prompt: "Minimal mobile UI chrome (top/bottom bars, panel backgrounds) in flat playful style. Transparent PNG, no text labels, rounded corners 16-24px radius. Colors neutral slate with subtle glow accents."
  - Size/format: panels at 1600x320 and 1200x400; store in `assets/images/ui/`.

- T2 Shared Art & Icons
  - Prompt: "Icon set for buttons/toggles (play, settings, back, trophy, star). Flat vector-like, 2-color max plus alpha, match seasonal palette accents. Transparent PNG."
  - Sizes: 256x256 base; export 128x128 if needed. Folder `assets/images/ui/`.

- T3 Home & Selection
  - Hero banner prompt: "Wide hero illustration for party games; bold shapes, flat shading, center-weighted composition, leave edges clean for UI. Seasonal variants using palette tokens."
  - Sizes: 1920x900 hero (`assets/images/home/hero-*.png`).
  - Category glyphs prompt: "Simple, bold glyphs for categories (puzzle, reflex, sports, board)."
  - Sizes: 256x256 (`assets/images/home/categories/`).
  - Seasonal banner prompt: "Thin seasonal banner, abstract motif per season, high readability." Size: 1600x300 (`assets/images/seasonal/`).

- T4 Tic Tac Toe Deluxe
  - Board/pad prompt: "Premium tic-tac-toe board and subtle background, soft highlights, neutral slate + accent." Size: 1920x1080 (`assets/images/tic-tac-toe/`).
  - Win-line FX prompt: "Glowing sweep line particle, 8 frames sprite sheet, transparent." Size: 512x512, 4x2 grid (`assets/particles/tictactoe-win.png`).
  - Confetti: 256x256 bursts (`assets/particles/tictactoe-confetti.png`).

- T5 Air Hockey Arena
  - Arena prompt: "Air hockey table top with goals; clean fibers, neutral field; no brand marks." 1920x1080 (`assets/images/air-hockey/arena.png`).
  - Goal light loop: "Radial glow loop, 6 frames." Sprite sheet 512x512 (6x1) (`assets/particles/air-hockey/goal-light.png`).
  - Puck trail: 256x128 streak (`assets/particles/air-hockey/puck-trail.png`).
  - Sparks: 256x256 burst (`assets/particles/air-hockey/sparks.png`).

- T6 Ping Pong Rally
  - Table/court: 1920x1080 seasonal variants (`assets/images/ping-pong/table-*.png`).
  - Crowd parallax: two layers 1920x1080 with top alpha fade (`assets/images/ping-pong/crowd-layer-{near,far}.png`).
  - Paddle trail: 256x128 (`assets/particles/ping-pong/paddle-trail.png`).
  - Spin FX: 256x256 ring sprites (`assets/particles/ping-pong/spin.png`).
  - Prompt style: "Clean sports table, soft ambient vignette, flat shading; match season accents."

- T7 Spinner War
  - Arena backgrounds: 1920x1080 (`assets/images/spinner-war/arena-*.png`).
  - Boost pickup icons: 128x128 per type (`assets/images/spinner-war/boost-*.png`).
  - Impact burst: 512x512 sprite sheet 4x4 (`assets/particles/spinner-war/impact-burst.png`).
  - Haptic overlay: 1920x1080 subtle vignette (`assets/images/spinner-war/overlay-vignette.png`).
  - Prompt: "Futuristic arena panels, bright boosts, clean impact bursts; flat neon accents on dark slate."

- T8 Snakes Duel
  - Grid backplates: 1920x1080 seasonal variants (`assets/images/snakes-duel/grid-*.png`).
  - Seasonal apples: 128x128 seasonal fruit icons (`assets/images/snakes-duel/apple-*.png`).
  - Explosion overlays: 256x256 (`assets/particles/snakes-duel/explosion.png`).
  - Prompt: "Arcade snake set: flat sprites, crisp edges, strong season colors; transparent backgrounds."

- T9 Penalty Kicks
  - Stadium/pitch: 1920x1080 (`assets/images/penalty-kicks/stadium-*.png`).
  - Characters: keeper/shooter poses (front/side) 512x512 each (`assets/images/penalty-kicks/characters/*.png`).
  - Goal net overlay: 1920x1080 transparent (`assets/images/penalty-kicks/net-overlay.png`).
  - Ball trail: 256x64 streak (`assets/particles/penalty-kicks/ball-trail.png`).
  - Confetti: 512x512 burst (`assets/particles/penalty-kicks/confetti.png`).
  - Prompt: "Bright stadium scene, crowd abstracted; flat, clean shapes; accent colors from season; transparent FX sprites."

- Export & Integration Checklist
  - Place files in the listed folders; use PNG+alpha.
  - Add `require("../assets/...png")` entries to `core/assets.ts:imageManifest` (and to `particleManifest` for FX ids).
  - If seasonal variants, extend `contexts/SeasonalContext.tsx` maps and consume via appropriate screens/views.
  - Validate on device: check contrast against UI, readability at 360dp width, and safe areas.
## Design Asset Requirements (T1-T9)
- **T1 Core Framework Refresh**: No art deliverables; ensure any shared UI chrome updates land in `assets/ui/` with entries added to `core/assets.ts` if new imagery ships alongside framework tweaks.
- **T2 Shared Art & Audio Pipeline**: Provide UI kit (buttons, chips, panels) and global iconography saved under `assets/images/ui/`; register additions in `core/assets.ts:imageManifest` and extend shared styles in `styles/` as needed.
- **T3 Home & Game Selection UX**: Deliver hero artwork per featured slot (`assets/images/home/hero-*.png`), category glyphs (`assets/images/home/categories/`), and seasonal banner variants (`assets/images/seasonal/banner-*.png`); update `core/assets.ts` and `HomeScreen` hero manifest when files land.
- **T4 Tic Tac Toe Deluxe**: Supply deluxe board/background textures (`assets/images/tic-tac-toe/board-*.png`), win-line FX sprite sheet (`assets/particles/tictactoe-win.png`), and celebratory confetti; wire through `core/assets.ts` and reference inside `TicTacToeView` FX hooks.
- **T5 Air Hockey Arena**: Need arena mats, goal light animations, puck trails, and spark bursts. Place boards in `assets/images/air-hockey/`, particles in `assets/particles/air-hockey/`, and add to `core/assets.ts` plus `AirHockeyView` particle map.
- **T6 Ping Pong Rally**: Provide table skins, crowd silhouettes/loop layers, paddle trail sprites, and spin FX (`assets/images/ping-pong/`, `assets/particles/ping-pong/`). Register in `core/assets.ts` and hook via `PingPongView` ambience/FX pipeline.
- **T7 Spinner War**: Deliver arena backgrounds, boost pickup icons, impact burst sheets, and haptic cue overlays. Store imagery in `assets/images/spinner-war/` and particles in `assets/particles/spinner-war/`; update `core/assets.ts` plus the boost manifest in `SpinnerWarView`.
- **T8 Snakes Duel**: Seasonal snake bodies/trails already landed. Remaining needs: grid backplates, seasonal apple variants (`assets/images/snakes-duel/grid-*.png`, `assets/images/snakes-duel/apple-*.png`), and explosion overlays (`assets/particles/snakes-duel/`). Append to manifests and reference via `getSnakesDuelTheme` once provided.
- **T9 Penalty Kicks Clash**: Request pitch/stadium backgrounds (`assets/images/penalty-kicks/stadium-*.png`), keeper/player spritesheets (`assets/images/penalty-kicks/characters/`), goal net overlays, ball trails (`assets/particles/penalty-kicks/ball-trail.png`), and celebration confetti. When assets arrive, register in `core/assets.ts`, extend `SeasonalContext` if seasonally themed, and wire through forthcoming `PenaltyKicksView` FX hooks.
## Next Objectives
- Stand up automation: add `npm run verify` (tsc) and a GitHub Actions workflow to gate PRs.
- Document placeholder coverage and decide the rebuild order for returning game runtimes.
- Kick off art/runtime scoping for the first reclaimed title (target: Snakes Duel).

### Sprint 2 (2025-10-04 - 2025-10-18)
- **Goal**: Lock in the verification pipeline and produce a concrete rehabilitation plan for the next production-ready game.
- **Workstreams**
  - *Automation*: add `npm run verify`, update README/QA guidance, and create a CI workflow that runs install + verify on pushes/PRs.
  - *Game rehab planning*: author mini design briefs for Snakes Duel and Air Hockey revivals, including asset needs and engineering tasks.
  - *Documentation*: annotate the placeholder strategy in docs and backlog tickets so collaborators know which modules require rebuilds.
- **Acceptance criteria**
  - `npm run verify` exists and passes locally/CI.
  - `.github/workflows/verify.yml` runs install + verify for pull requests.
  - Docs (README + docs/LAUNCH_PLAN.md) include rebuild sequencing and placeholder tracker.

## Notes
- Session work (this chat): consolidated Ping Pong into MVC; tuned Air Hockey physics (friction 0.9965, damping 0.965, speed caps), ensured goal reset stability.
- Spinner War: persisted bot difficulty, added cooldown, seasonal arena background, boost UI rings/bars.
- Air Hockey: rotating goal SFX trio, stored difficulty preference, tighter goalie lane clamp.
- Ping Pong: clamped spin, raised vertical pace floor, tidied ambience cue timer.
- Snakes Duel: adaptive grid renderer with skin selection, seasonal sprite/particle theming via SeasonalContext + AssetLoader, countdown/restart overlays, full movement & collision loop, Rookie/Pro/Legend bot tuning, and telemetry events wired to analytics.



### T9 Penalty Kicks Workboard
- T9-A: Spec & Placeholder (completed)
  - Goal: Capture shootout mechanics and create skeleton model/controller/view/screen.
  - Acceptance: docs/penalty-kicks-spec.md drafted; placeholder runtime registered and visible in manifest. **Done**
- T9-B: Swipe Interaction Prototype (in progress)
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










