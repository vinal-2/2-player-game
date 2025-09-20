import type { GameController } from "../../core/GameEngine"
import type { SnakesDuelModel, SnakeRuntime } from "./SnakesDuelModel"
import { aStar, floodFillArea } from "./utils/pathfinding"

const BOT_CONFIG = {
  rookie: { replanInterval: 8, maxNodes: 160, floodNodes: 200, jitter: 0.3 },
  pro: { replanInterval: 6, maxNodes: 220, floodNodes: 260, jitter: 0.18 },
  legend: { replanInterval: 4, maxNodes: 280, floodNodes: 320, jitter: 0.08 },
} as const

type BotDifficulty = keyof typeof BOT_CONFIG

type ControllerEvent = {
  type: "ai_replan"
  difficulty: BotDifficulty
  reason: "path" | "fallback" | "cached"
}

export class SnakesDuelController implements GameController {
  private mode: "friend" | "bot"
  private difficulty: BotDifficulty = "pro"
  private frameCounter = 0
  private cachedPath: { steps: { x: number; y: number }[]; lastHead: { x: number; y: number } } | null = null
  private emitEvent: (event: ControllerEvent) => void = () => {}

  constructor(private readonly model: SnakesDuelModel, mode: "friend" | "bot") {
    this.mode = mode
  }

  public initialize(): void {
    this.frameCounter = 0
  }

  public update(_deltaTime: number): void {
    if (this.mode !== "bot" || this.model.state.status !== "running") {
      return
    }

    const config = BOT_CONFIG[this.difficulty]
    this.frameCounter += 1
    if (this.frameCounter % config.replanInterval !== 0) {
      return
    }

    const botSnake = this.model.state.snakes.find((snake) => snake.isBot)
    if (!botSnake) return

    const targetApple = this.model.state.apples[0]
    if (!targetApple) return

    const grid = this.projectGrid(botSnake)
    const head = botSnake.segments[0]

    const jitteredGoal = this.applyGoalJitter(targetApple, config.jitter)

    if (this.cachedPath && this.cachedPath.lastHead.x === head.x && this.cachedPath.lastHead.y === head.y) {
      const next = this.cachedPath.steps[1]
      if (next) {
        this.setDirectionTowards(botSnake, next)
        this.emitEvent({ type: "ai_replan", difficulty: this.difficulty, reason: "cached" })
        return
      }
    }

    const result = aStar({
      grid,
      start: head,
      goal: jitteredGoal,
      maxNodes: config.maxNodes,
    })

    if (!result || result.length < 2) {
      const safeDirection = this.findSafestDirection(botSnake, grid, config.floodNodes)
      if (safeDirection) {
        botSnake.direction = safeDirection
        this.emitEvent({ type: "ai_replan", difficulty: this.difficulty, reason: "fallback" })
      }
      return
    }

    this.cachedPath = {
      steps: result.map((node) => ({ x: node.x, y: node.y })),
      lastHead: { x: head.x, y: head.y },
    }

    const next = this.cachedPath.steps[1]
    if (next) {
      this.setDirectionTowards(botSnake, next)
      this.emitEvent({ type: "ai_replan", difficulty: this.difficulty, reason: "path" })
    }
  }

  public setMode(mode: "friend" | "bot"): void {
    this.mode = mode
    this.cachedPath = null
  }

  public setDifficulty(level: BotDifficulty): void {
    this.difficulty = level
    this.cachedPath = null
  }

  public setEventEmitter(emitter: (event: ControllerEvent) => void) {
    this.emitEvent = emitter
  }

  public handleInput(): void {}
  public cleanup(): void {}

  private setDirectionTowards(snake: SnakeRuntime, target: { x: number; y: number }): void {
    const head = snake.segments[0]
    const dx = target.x - head.x
    const dy = target.y - head.y

    if (Math.abs(dx) > Math.abs(dy)) {
      snake.direction = dx > 0 ? "right" : "left"
    } else if (Math.abs(dy) > 0) {
      snake.direction = dy > 0 ? "down" : "up"
    }
  }

  private applyGoalJitter(goal: { x: number; y: number }, jitter: number) {
    if (jitter <= 0) return goal
    const offsetX = Math.round((Math.random() - 0.5) * jitter * 2)
    const offsetY = Math.round((Math.random() - 0.5) * jitter * 2)
    return { x: goal.x + offsetX, y: goal.y + offsetY }
  }

  private projectGrid(botSnake: SnakeRuntime): number[][] {
    const { gridWidth, gridHeight } = this.model
    const projection = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0))

    this.model.state.snakes.forEach((snake) => {
      snake.segments.forEach((segment, index) => {
        const value = snake.id === botSnake.id && index === 0 ? 0 : 2
        if (segment.y >= 0 && segment.y < gridHeight && segment.x >= 0 && segment.x < gridWidth) {
          projection[segment.y][segment.x] = value
        }
      })
    })

    return projection
  }

  private findSafestDirection(
    botSnake: SnakeRuntime,
    grid: number[][],
    floodLimit: number,
  ): "up" | "down" | "left" | "right" | null {
    const head = botSnake.segments[0]
    const options: Array<{ dir: "up" | "down" | "left" | "right"; score: number }> = []

    const moves = [
      { dir: "up" as const, dx: 0, dy: -1 },
      { dir: "down" as const, dx: 0, dy: 1 },
      { dir: "left" as const, dx: -1, dy: 0 },
      { dir: "right" as const, dx: 1, dy: 0 },
    ]

    for (const move of moves) {
      const nx = head.x + move.dx
      const ny = head.y + move.dy
      if (!grid[ny] || grid[ny][nx] === 2) continue
      const score = floodFillArea(grid, { x: nx, y: ny }, floodLimit)
      options.push({ dir: move.dir, score })
    }

    if (options.length === 0) return null
    options.sort((a, b) => b.score - a.score)
    return options[0].dir
  }
}
