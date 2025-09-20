import { PanResponder, type PanResponderGestureState } from "react-native"

import type { GameController } from "../../core/GameEngine"
import type { AirHockeyModel } from "./AirHockeyModel"

export type AirHockeyDifficulty = "rookie" | "pro" | "legend"

const BOT_DIFFICULTY_MAP: Record<AirHockeyDifficulty, number> = {
  rookie: 0.35,
  pro: 0.6,
  legend: 0.85,
}

export class AirHockeyController implements GameController {
  private model: AirHockeyModel
  private gameMode: "friend" | "bot"
  private botDifficulty: AirHockeyDifficulty = "pro"

  private player1Start = { x: 0, y: 0 }
  private player2Start = { x: 0, y: 0 }

  public readonly player1PanHandlers: any
  public readonly player2PanHandlers: any

  constructor(model: AirHockeyModel, gameMode: "friend" | "bot") {
    this.model = model
    this.gameMode = gameMode

    const player1Responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        this.player1Start.x = this.model.state.player1Paddle.x
        this.player1Start.y = this.model.state.player1Paddle.y
      },
      onPanResponderMove: (_, gestureState) => {
        this.handlePlayer1Pan(gestureState)
      },
      onPanResponderRelease: () => {
        this.player1Start.x = this.model.state.player1Paddle.x
        this.player1Start.y = this.model.state.player1Paddle.y
      },
    })

    const player2Responder = PanResponder.create({
      onStartShouldSetPanResponder: () => this.gameMode === "friend",
      onPanResponderGrant: () => {
        this.player2Start.x = this.model.state.player2Paddle.x
        this.player2Start.y = this.model.state.player2Paddle.y
      },
      onPanResponderMove: (_, gestureState) => {
        if (this.gameMode === "friend") {
          this.handlePlayer2Pan(gestureState)
        }
      },
      onPanResponderRelease: () => {
        this.player2Start.x = this.model.state.player2Paddle.x
        this.player2Start.y = this.model.state.player2Paddle.y
      },
    })

    this.player1PanHandlers = player1Responder.panHandlers
    this.player2PanHandlers = player2Responder.panHandlers
  }

  public initialize(): void {
    // nothing additional
  }

  public update(deltaTime: number): void {
    if (this.gameMode === "bot" && this.model.state.gameActive) {
      this.model.updateBotPaddle(BOT_DIFFICULTY_MAP[this.botDifficulty])
    }
  }

  private handlePlayer1Pan(gestureState: PanResponderGestureState): void {
    if (!this.model.state.gameActive) return

    const targetX = this.player1Start.x + gestureState.dx
    const targetY = this.player1Start.y + gestureState.dy
    this.model.movePlayer1Paddle(targetX, targetY)
  }

  private handlePlayer2Pan(gestureState: PanResponderGestureState): void {
    if (!this.model.state.gameActive || this.gameMode !== "friend") return

    const targetX = this.player2Start.x + gestureState.dx
    const targetY = this.player2Start.y + gestureState.dy
    this.model.movePlayer2Paddle(targetX, targetY)
  }

  public setBotDifficulty(level: AirHockeyDifficulty): void {
    this.botDifficulty = level
  }

  public handleInput(): void {
    // handled via pan responders
  }

  public cleanup(): void {
    // nothing to clean for PanResponder
  }
}
