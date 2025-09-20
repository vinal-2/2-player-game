# Penalty Kicks Telemetry (draft)

## Events
- `penalty_shot` { result: "goal" | "save" | "miss", lane: "left" | "center" | "right", power, difficulty }
- `penalty_round_end` { shooterScore, keeperScore, winner }
- `penalty_mode_toggle` { mode }
- `penalty_difficulty` { level }

## Integration Notes
- Emit `penalty_shot` immediately after resolving the shot outcome.
- Emit `penalty_round_end` once the shootout concludes.
- Mode/difficulty events can reuse existing analytics helpers from other games.
- Hook telemetry through `PenaltyKicksScreen` similar to Snakes Duel.

## QA Hooks
- Add checklist items covering shot telemetry per outcome and round summary emit.
