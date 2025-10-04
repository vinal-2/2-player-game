import type { GameController } from "../../core/GameEngine"
import type PingPongModel from "./PingPongModel"

export type PingPongControllerInput =
  | { type: "reset" }

export class PingPongController implements GameController {
  constructor(private readonly model: PingPongModel) {}

  public initialize(): void {
    this.model.initialize()
  }

  public update(): void {}

  public handleInput(input: PingPongControllerInput): void {
    if (input.type === "reset") {
      this.model.reset()
    }
  }

  public cleanup(): void {}
}

export default PingPongController
