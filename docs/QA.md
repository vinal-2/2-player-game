# QA Checklist

## Core Games
- Tic Tac Toe: AI difficulty sweep, win-line FX, score persistence.
- Air Hockey: Verify goal FX rotation, goalie difficulty tiers, puck reset.
- Ping Pong: Spin clamp, ambience toggle, rally milestone cues.
- Spinner War: Bot tiers, power-up spawn cadence, impact FX pulse.

## Snakes Duel (Prep)
- Countdown → adaptive pacing tick validation.
- Apple spawn spacing and adaptive speed ramp.
- Bot pathfinding tiers (Rookie/Pro/Legend) simulate expected difficulty.
- Collision handling: wall, self, opponent, head-on draw.
- Telemetry events: `snakes_round_start`, `snakes_apple_eaten`, `snakes_collision`, `snakes_ai_replan`.

## General
- Seasonal backgrounds load for each game.
- Difficulty selections persist between sessions.
- Analytics events fire without duplicate spam.

### Snakes Duel Pathfinding
- [ ] Validate A* helper: path exists when clear, returns null when blocked.
- [ ] Flood-fill area returns reasonable cell counts (<300) for crowded boards.

### Snakes Duel Skins
- [ ] Verify P1/P2 skin chips persist across reset and app relaunch.
- [ ] Ensure seasonal background swap remains visible behind board.

### Snakes Duel Movement
- [ ] Verify snakes advance per tick and grow on apple consumption.
- [ ] Confirm wall/self/opponent collisions end the round and winner recorded.
- [ ] Head-on collision produces draw (no winner).
- [ ] Countdown overlay appears before each round; Rematch button restarts countdown.
- [ ] Apple splash FX renders and clears; haptics trigger on apple/collision.

### Snakes Duel Difficulty & Telemetry
- [ ] Switch Rookie/Pro/Legend and verify bot behaviour changes (replan cadence).
- [ ] Confirm analytics events fire for apple_eaten, collision, round_end, snakes_ai_replan, snakes_ai_escape (use debug logs).
@codex
