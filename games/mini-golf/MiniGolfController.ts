import type { GameController } from "../../core/GameEngine"
import type MiniGolfModel from "./MiniGolfModel"
import type { MiniGolfWinner } from "./MiniGolfModel"

export type MiniGolfControllerInput =
  | { type: "reset" }
  | { type: "finish"; winner: Exclude<MiniGolfWinner, null> }

export class MiniGolfController implements GameController {
  constructor(private readonly model: MiniGolfModel) {}

  public initialize(): void {
    this.model.initialize()
  }

  public update(): void {}

  public handleInput(input: MiniGolfControllerInput): void {
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

export default MiniGolfController
