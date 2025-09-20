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

