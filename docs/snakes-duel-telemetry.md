# Snakes Duel Telemetry Plan (v0.1)

## Event Catalog
- `snakes_round_start` { mode, difficulty, skins }
- `snakes_apple_eaten` { player, length, tickRate }
- `snakes_collision` { loser, cause: "wall" | "self" | "opponent", length }
- `snakes_draw` { reason: "head_on" | "timeout" }
- `snakes_speed_change` { tickRate }
- `snakes_ai_replan` { difficulty, reason }

## Session Metrics
- Track average round duration, apples per minute, and quit rate before finish.
- Compare solo vs two-player usage to prioritise future updates.

## Implementation Notes
- Use `AnalyticsContext.trackEvent` within model/controller to emit events.
- Debounce high-frequency events (apple eaten) if necessary by batching every 3 ticks.

## QA Hooks
- Add smoke test steps to docs/QA.md covering round start, apple consumption, collision, and telemetry validation via debug overlay.

## Next Steps
- Align event names with analytics backend schema.
- Update `docs/QA.md` with Snakes Duel checklist.
- Model emits apple, collision, round_end events; screen funnels to analytics/onEvent.
