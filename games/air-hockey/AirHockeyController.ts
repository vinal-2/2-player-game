import type { GameController } from "../../core/GameEngine"
import type AirHockeyModel from "./AirHockeyModel"

type PlayerId = "player1" | "player2"

type AirHockeyInput =
  | { type: "move"; player: PlayerId; x: number; y: number }
  | { type: "reset" }
  | { type: "mode"; mode: "friend" | "bot" }
  | { type: "difficulty"; level: "rookie" | "pro" | "legend" }

const BOT_SPEED: Record<"rookie" | "pro" | "legend", number> = {
  rookie: 260,
  pro: 320,
  legend: 420,
}

export class AirHockeyController implements GameController {
  private mode: "friend" | "bot"
  private difficulty: "rookie" | "pro" | "legend" = "pro"

  constructor(private readonly model: AirHockeyModel, mode: "friend" | "bot") {
    this.mode = mode
  }

  public initialize(): void {}

  public update(deltaTime: number): void {
    if (this.mode !== "bot") return

    const state = this.model.state
    const paddle = state.paddles.player2
    const { position: puckPosition } = state.puck

    const targetX = puckPosition.x
    const targetY = Math.min(state.boardHeight * 0.35, puckPosition.y)
    const speed = BOT_SPEED[this.difficulty]

    const nextX = this.lerp(paddle.position.x, targetX, deltaTime * speed / state.boardWidth)
    const nextY = this.lerp(paddle.position.y, targetY, deltaTime * speed / state.boardHeight)

    this.model.movePaddle("player2", nextX, nextY)
  }

  public handleInput(input: AirHockeyInput): void {
    switch (input.type) {
      case "move":
        if (input.player === "player2" && this.mode === "bot") {
          return
        }
        this.model.movePaddle(input.player, input.x, input.y)
        break
      case "reset":
        this.model.reset()
        break
      case "mode":
        this.mode = input.mode
        break
      case "difficulty":
        this.difficulty = input.level
        break
    }
  }

  public cleanup(): void {}

  private lerp(from: number, to: number, t: number) {
    return from + (to - from) * Math.min(1, Math.max(0, t))
  }
}

export default AirHockeyController
