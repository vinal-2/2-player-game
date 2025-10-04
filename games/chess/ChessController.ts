import type { GameController } from "../../core/GameEngine"
import type { ChessModel, ChessWinner } from "./ChessModel"

export type ChessControllerInput =
  | { type: "reset" }
  | { type: "finish"; winner: Exclude<ChessWinner, null> }

export class ChessController implements GameController {
  constructor(private readonly model: ChessModel) {}

  public initialize(): void {
    this.model.initialize()
  }

  public update(): void {
    // No-op for placeholder implementation
  }

  public handleInput(input: ChessControllerInput): void {
    switch (input.type) {
      case "reset":
        this.model.reset()
        break
      case "finish":
        this.model.finish(input.winner)
        break
    }
  }

  public cleanup(): void {}
}

export default ChessController
