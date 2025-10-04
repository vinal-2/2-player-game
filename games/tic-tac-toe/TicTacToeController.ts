import type { GameController } from "../../core/GameEngine"
import type TicTacToeModel from "./TicTacToeModel"

export class TicTacToeController implements GameController {
  constructor(private readonly model: TicTacToeModel) {}

  public initialize(): void {
    this.model.initialize()
  }

  public update(): void {}

  public handleInput(): void {}

  public cleanup(): void {}
}

export default TicTacToeController
