# Penalty Kicks Clash Spec (v0.1)

## Vision
Deliver a two-player (or vs bot) penalty shootout experience with quick rounds, skill-based swiping, and celebratory FX akin to mobile football titles.

## Core Loop
1. Countdown (3 → 1) overlay.
2. Shooter swipes to aim/power; keeper reacts (player or bot).
3. Update score and rotate roles after each shot.
4. After N shots (default 5), present round summary with rematch option.

## Controls
- Shooter: swipe direction & length = target zone + power.
- Keeper (local P2): tap/drag to choose dive direction.
- Keeper (bot): difficulty tiers influence reaction time and dive bias.

## Bot Difficulty Targets
- Rookie: noticeable delay, predictable dive bias.
- Pro: moderate reaction, weighted random dives.
- Legend: anticipates shot lanes using recent player trends.

## FX & Audio
- Net shake & crowd roar on goals.
- Keeper save particles + haptic pulse.
- Stadium ambience loop with toggle support.

## Telemetry
- `penalty_shot` { result: "goal" | "save" | "miss", lane, difficulty }
- `penalty_round_end` { shooterScore, keeperScore, winner }

## Next Steps
- Build placeholder runtime (model/controller/view/screen) and register game.
- Align with art for goal/keeper assets and crowd overlays.
- Prototype swipe detection & bot heuristics.
