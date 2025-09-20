# Snakes Duel Gameplay Spec (v0.1)

## Grid & Layout
- Target grid: 22 × 22 cells (adjustable via config) with 4 px gutter on phones and 6 px on tablets.
- Cell sizing adapts to available width; maintain square cells and center board vertically.
- Reserve top/bottom HUD bands for score, boost meter, and mode toggles.
- Segments animate using lerped translation between cell centers; support 60 FPS interpolation.

## Adaptive Pacing
- Tick speed scales with total apples eaten: start at 6 ticks/sec, ramp to 9 ticks/sec by 20 apples.
- Speed multiplier also increases slightly when snakes are within 3 cells of each other to heighten tension.
- Solo/bot mode: bot difficulty modifies pacing floor/ceiling (rookie: 5–7, legend: 6–10).

## Game Flow
1. Countdown (3 → 1) with fade-in overlay.
2. Game runs until a snake collides with wall, itself, or opponent.
3. Round summary screen with quick rematch / quit.
4. Support best-of N configuration (default 3).

## Controls & Modes
- Local two-player: mirrored swipe controls (bottom for P1, top inverted for P2).
- Solo/bot: bottom player is human, top controlled by AI pathfinding.
- Option to toggle left/right virtual d-pad if swipe testing reveals friction.

## Systems
- Apples spawn away from snake heads; ensure minimum distance of 3 cells.
- Handle simultaneous collisions deterministically (head-on ties result in draw rematch).
- Support cosmetic skins (color + trail) without gameplay impact.

## Next Steps
- Finalise visual mock-ups with art team.
- Prototype grid renderer to validate interpolation and tick pacing.

- Adaptive tick loop implemented in model (`SnakesDuelModel.step`) with ramp from 6→10 ticks/sec and tension multiplier (1.0–1.15).


- Collision handling implemented: wall/self/opponent/head-on tracked via `state.lastEliminated`; winners resolved when only one snake survives.
- Apple respawn fills random free cell immediately after consumption.

- Solo/bot mode exposes Rookie/Pro/Legend difficulty chips mirroring Spinner War approach.
