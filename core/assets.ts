import type { SoundPlaybackKey } from "../contexts/SoundContext"

export const soundManifest: Record<SoundPlaybackKey, any> = {
  "background-music": require("../assets/sounds/background-music.mp3"),
  "button-press": require("../assets/sounds/button-press.mp3"),
  "game-start": require("../assets/sounds/game-start.mp3"),
  win: require("../assets/sounds/win.mp3"),
  draw: require("../assets/sounds/draw.mp3"),
  "cell-tap": require("../assets/sounds/cell-tap.mp3"),
  "invalid-move": require("../assets/sounds/invalid-move.mp3"),
  toggle: require("../assets/sounds/toggle.mp3"),
  "wall-hit": require("../assets/sounds/wall-hit.mp3"),
  "paddle-hit": require("../assets/sounds/paddle-hit.mp3"),
  score: require("../assets/sounds/score.mp3"),
  // Optional alternates used by Air Hockey goal FX if present
  // Fallback to primary if alternates not found at runtime
  // These keys are still valid SoundPlaybackKey via require calls
  collision: require("../assets/sounds/collision.mp3"),
  "round-start": require("../assets/sounds/round-start.mp3"),
  "eat-food": require("../assets/sounds/eat-food.mp3"),
}

export const imageManifest: number[] = [
  require("../assets/images/logo.png"),
  require("../assets/images/background.png"),
  require("../assets/images/ping-pong-bg.png"),
  require("../assets/images/air-hockey-bg.png"),
  require("../assets/images/tic-tac-toe-bg.png"),
  require("../assets/images/spinner-war-bg.png"),
  require("../assets/images/settings-bg.png"),
  require("../assets/images/snakes-duel/winter-head.png"),
  require("../assets/images/snakes-duel/winter-body.png"),
  require("../assets/images/snakes-duel/winter-turn.png"),
  require("../assets/images/snakes-duel/winter-tail.png"),
  require("../assets/images/snakes-duel/spring-head.png"),
  require("../assets/images/snakes-duel/spring-body.png"),
  require("../assets/images/snakes-duel/spring-turn.png"),
  require("../assets/images/snakes-duel/spring-tail.png"),
  require("../assets/images/snakes-duel/summer-head.png"),
  require("../assets/images/snakes-duel/summer-body.png"),
  require("../assets/images/snakes-duel/summer-turn.png"),
  require("../assets/images/snakes-duel/summer-tail.png"),
  require("../assets/images/snakes-duel/autumn-head.png"),
  require("../assets/images/snakes-duel/autumn-body.png"),
  require("../assets/images/snakes-duel/autumn-turn.png"),
  require("../assets/images/snakes-duel/autumn-tail.png"),
]

export const particleManifest = {
  "snakes-winter": require("../assets/particles/winter-particle.png"),
  "snakes-spring": require("../assets/particles/spring-particle.png"),
  "snakes-summer": require("../assets/particles/summer-particle.png"),
  "snakes-autumn": require("../assets/particles/autumn-particle.png"),
}
