# Snakes Duel Bot Pathfinding Plan (v0.1)

## Objectives
- Deliver three AI tiers (Rookie, Pro, Legend) for launch.
- Balance pursuit of apples with opponent avoidance and self-preservation.

## Core Algorithm
- Represent grid as cost map updated every tick (occupancy + projected trails).
- Use hybrid approach:
  - Primary: A* search from head to nearest viable apple using Manhattan heuristic.
  - Secondary: Flood-fill safety score to evaluate fallback routes when apples are unsafe.
- Cache path for 2–3 ticks; re-plan when apple changes, collision predicted, or path blocked.

## Difficulty Tuning
- Rookie: lower search depth, inject random detours, slower reaction window (re-plan every 4 ticks).
- Pro: full A* depth with mild randomness, re-plan every 2 ticks.
- Legend: anticipates opponent by adding opponent-head penalty map, re-plan each tick, occasionally attempts cut-offs.

## Anti-Trap Logic
- Detect potential dead-ends via flood-fill area check; trigger escape routine instead of greedily chasing apple.
- Add tail-chasing heuristic to follow own tail when board is dense.

## Performance Considerations
- Limit A* node expansion (cap ~200 nodes per tick) to maintain smooth frame rate.
- Precompute neighbour offsets and re-use node objects from pool to reduce GC.
- Run AI updates on model update tick to keep deterministic outputs.

## Telemetry Hooks
- Emit events: `snakes_ai_replan`, `snakes_ai_escape`, `snakes_ai_collision` with difficulty context.

## Next Steps
- Prototype grid cost map and benchmark node expansion on target devices.
- Implement A* utility module in `games/snakes-duel/utils/pathfinding.ts` (planned).

## Implementation Status
- A* core + flood-fill helpers scaffolded in `games/snakes-duel/utils/pathfinding.ts` with neighbour pooling and expansion caps (250/300).
- Controller integrates helpers with Rookie/Pro/Legend configs, goal jitter, and flood-fill fallback; emits `snakes_ai_replan` + `snakes_ai_escape` telemetry.
- Next: unit tests for tight corridors/head-on scenarios and heuristic tuning for higher tiers.
- Controller now invokes A* helpers every 6 ticks with flood-fill fallback; collision integration next step.
- Difficulty config: rookie(8-frame replan, low node cap), pro(6-frame), legend(4-frame) with goal jitter; controller now honours selection.
