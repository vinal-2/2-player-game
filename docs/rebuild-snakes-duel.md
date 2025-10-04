# Snakes Duel Rebuild Brief

## Objective
Restore Snakes Duel as the flagship seasonal arena with textured snakes, adaptive AI, and telemetry hooks.

## Scope
- Recreate grid renderer with seasonal sprite variants (body/head/turn/tail) using SeasonalContext.
- Reinstate snake physics (movement ticks, collisions, apple growth, rematch flow).
- Reintroduce bot pathfinding (A*/flood safety) with Rookie/Pro/Legend tuning.
- Restore analytics events: snakes_round_start, snakes_apple_eaten, snakes_collision, snakes_round_end, snakes_ai_replan.
- Wire countdown/rematch overlays, apple splash FX, and haptic feedback.

## Assets Needed
- Seasonal snakes (existing)
- Apple sprites (existing)
- Explosion particle sheet (existing)
- Grid backplates (existing)

## Engineering Tasks
- Scaffold new SnakesDuelModel/Controller/View atop current placeholder.
- Integrate seasonal textures via SeasonalContext.getSnakesDuelTheme.
- Implement AI pathfinding module (Star, loodFill) with telemetry triggers.
- Reinstate analytics/haptics hooks in screen.
- Add integration tests: round start/reset, apple growth, collision outcomes.

## Risks
- Pathfinding performance at high device load.
- Asset alignment (rotations, scaling) on low-res devices.
- Haptics availability on older Android hardware.

## Acceptance
- 
pm run verify passes with rebuilt code.
- Manual smoke: apple growth, collision outcomes, seasonal swaps.
- Telemetry logs emitted for round start/end, apple eaten, collisions, AI replan.
