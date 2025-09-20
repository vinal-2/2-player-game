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
]
