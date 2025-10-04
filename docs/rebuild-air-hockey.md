# Air Hockey Rebuild Brief

## Objective
Reintroduce Air Hockey with tuned physics, goalie AI, and celebratory FX that match the updated two-player framework.

## Scope
- Rebuild model/controller/view using new GameEngine contracts.
- Restore paddle physics, friction, puck clamping, goal detection, and difficulty tiers.
- Rewire seasonal backgrounds and arena assets through SeasonalContext.
- Reinstate goal FX (lights, sparks), multichannel audio, haptics, and analytics events.
- Provide bot goalie behaviours for Rookie/Pro/Legend.

## Assets Needed
- Arena backplate (existing)
- Goal light animation (existing)
- Puck trail & sparks (existing)
- Difficulty icons (TBD)

## Engineering Tasks
- Implement AirHockeyModel tick loop (puck physics, collisions, goal handling).
- Add AirHockeyController input handlers for paddles + bot logic.
- Design scoreboard/reset flow and integrate SoundContext/Analytics.
- Unit/integration tests: paddle collision, goal scoring, bot chase fairness.

## Risks
- Physics tuning across devices with different refresh rates.
- Maintaining stable performance while running Reanimated effects.

## Acceptance
- 
pm run verify and placeholder tests pass.
- Manual smoke: paddle control, scoring, bot difficulty change, analytics logging.
