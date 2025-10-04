import type { GameController } from "../../core/GameEngine"
import type ConnectFourModel from "./ConnectFourModel"
import type { ConnectFourWinner } from "./ConnectFourModel"

export type ConnectFourControllerInput =
  | { type: "reset" }
  | { type: "finish"; winner: Exclude<ConnectFourWinner, null> }

export class ConnectFourController implements GameController {
  constructor(private readonly model: ConnectFourModel) {}

  public initialize(): void {
    this.model.initialize()
  }

  public update(): void {
    // No runtime loop required for placeholder
  }

  public handleInput(input: ConnectFourControllerInput): void {
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

export default ConnectFourController
