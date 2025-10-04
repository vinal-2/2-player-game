import type { GameController } from "../../core/GameEngine"
import type DotsAndBoxesModel from "./DotsAndBoxesModel"
import type { DotsWinner } from "./DotsAndBoxesModel"

export type DotsAndBoxesControllerInput =
  | { type: "reset" }
  | { type: "finish"; winner: Exclude<DotsWinner, null> }

export class DotsAndBoxesController implements GameController {
  constructor(private readonly model: DotsAndBoxesModel) {}

  public initialize(): void {
    this.model.initialize()
  }

  public update(): void {}

  public handleInput(input: DotsAndBoxesControllerInput): void {
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

export default DotsAndBoxesController
