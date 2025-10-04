import type { GameController } from "../../core/GameEngine"
import type SpinnerWarModel from "./SpinnerWarModel"

export class SpinnerWarController implements GameController {
  constructor(private readonly model: SpinnerWarModel) {}

  public initialize(): void {
    this.model.initialize()
  }

  public update(): void {}

  public handleInput(): void {}

  public cleanup(): void {}
}

export default SpinnerWarController
