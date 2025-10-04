import type { GameController } from "../../core/GameEngine"
import type { Direction, SnakeId, SnakesDuelModel } from "./SnakesDuelModel"

const BOT_REPLAN_INTERVAL = 0.2 // seconds

export class SnakesDuelController implements GameController {
  private mode: "friend" | "bot"
  private difficulty: "rookie" | "pro" | "legend" = "pro"
  private replanTimer = 0

  constructor(private readonly model: SnakesDuelModel, mode: "friend" | "bot") {
    this.mode = mode
    if (mode === "bot") {
      this.model.setSnakeAsBot("player2", true)
    } else {
      this.model.setSnakeAsBot("player2", false)
    }
  }

  public initialize(): void {
    this.replanTimer = 0
  }

  public update(deltaTime: number): void {
    if (this.mode !== "bot") return

    this.replanTimer += deltaTime
    if (this.replanTimer >= BOT_REPLAN_INTERVAL) {
      this.replanTimer = 0
      this.planBotMove()
    }
  }

  public handleInput(input: { type: "direction"; snakeId: SnakeId; direction: Direction } | { type: "reset" }): void {
    if (input.type === "reset") {
      this.model.reset()
      return
    }

    if (input.snakeId === "player2" && this.mode === "bot") {
      return
    }

    this.model.setPlayerDirection(input.snakeId, input.direction)
  }

  public setMode(mode: "friend" | "bot") {
    this.mode = mode
    this.model.setSnakeAsBot("player2", mode === "bot")
  }

  public setDifficulty(level: "rookie" | "pro" | "legend") {
    this.difficulty = level
  }

  public cleanup(): void {}

  private planBotMove() {
    const state = this.model.state
    const bot = state.snakes.find((snake) => snake.id === "player2")
    if (!bot) return
    const target = state.apples[0]
    if (!target) return

    const head = bot.segments[0]
    const dx = target.x - head.x
    const dy = target.y - head.y

    const possible: Direction[] = []
    if (Math.abs(dx) >= Math.abs(dy)) {
      possible.push(dx > 0 ? "right" : "left")
      possible.push(dy > 0 ? "down" : "up")
    } else {
      possible.push(dy > 0 ? "down" : "up")
      possible.push(dx > 0 ? "right" : "left")
    }

    if (this.difficulty !== "legend") {
      possible.push("up", "down", "left", "right")
    }

    for (const direction of possible) {
      const next = this.peek(head, direction)
      if (!this.isDanger(next)) {
        this.model.setPlayerDirection("player2", direction)
        return
      }
    }
  }

  private peek(head: { x: number; y: number }, direction: Direction) {
    switch (direction) {
      case "up":
        return { x: head.x, y: head.y - 1 }
      case "down":
        return { x: head.x, y: head.y + 1 }
      case "left":
        return { x: head.x - 1, y: head.y }
      case "right":
        return { x: head.x + 1, y: head.y }
    }
  }

  private isDanger(position: { x: number; y: number }) {
    const { gridWidth, gridHeight, snakes } = this.model.state
    if (position.x < 0 || position.y < 0 || position.x >= gridWidth || position.y >= gridHeight) {
      return true
    }
    return snakes.some((snake) => snake.segments.some((segment) => segment.x === position.x && segment.y === position.y))
  }
}

export default SnakesDuelController
