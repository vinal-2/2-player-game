# Mobile Launch Roadmap & Audit Log

## Vision & Scope
- Deliver a polished mobile-only two-player party collection that stands shoulder to shoulder with JindoBlu’s “Two Player Games : The Challenge”.
- Focus on offline play with local hot-seat and bot opponents; defer online/Live Ops features until after launch.
- Ship to Google Play with production-ready visuals, audio, monetisation (ads + premium), analytics, accessibility, and compliance.

## Benchmark Highlights
- >40 mini games with steady content drops (e.g., “Animal Stack”, “Target Practice”).
- Strong UX polish: animation, haptics, responsive layout, bespoke art, multi-language support.
- Robust systems: AI opponents, progression, ads/rewards, privacy compliance, telemetry, live events.

## Implementation Backlog (v0.1)
1. **T1 – Core Framework Refresh**: GameEngine integration, provider cleanup, navigation stabilisation.
2. **T2 – Shared Art & Audio Pipeline**: Cohesive visual kit, sound library, asset loader alignment.
3. **T3 – Home & Game Selection UX**: Hero carousel, categories, tutorials, seasonal banner.
4. **T4 – Tic Tac Toe Deluxe**: Advanced AI tiers, win FX, score persistence.
5. **T5 – Air Hockey Arena**: Physics polish, AI goalie, goal FX.
6. **T6 – Ping Pong Rally**: Paddle physics, spin mechanic, crowd ambience.
7. **T7 – Spinner War**: Arena physics, power-ups, burst FX.
8. **T8 – Snakes Duel**: Grid renderer, bot pathfinding, skins.
9. **T9 – Penalty Kicks Clash**: Gesture shooting, keeper AI, stadium presentation.
10. **T10 – Tank Battle Duel**: Twin-stick controls, destructible arena, bots.
11. **T11 – Quick Draw Reaction**: Reflex challenges, bot timing, stats.
12. **T12 – Connect Four Master**: Alpha-beta AI, hints, victory animations.
13. **T13 – Tug of War Sprint**: Rhythm mashing, stamina, dynamic camera.
14. **T14 – FX & Animation Polish**: Shared particles, motion guidelines, reduce-motion support.
15. **T15 – QA Harness & Telemetry**: Automated smoke tests, analytics wiring, crash reporting.
16. **T16 – Store-Ready Packaging**: Icons, store creatives, localisation, policies, EAS pipeline.

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
