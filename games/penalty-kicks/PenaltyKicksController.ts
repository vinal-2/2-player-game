import type { GameController } from "../../core/GameEngine"
import type { PenaltyKicksModel } from "./PenaltyKicksModel"

export class PenaltyKicksController implements GameController {
  constructor(private readonly model: PenaltyKicksModel, private mode: "friend" | "bot") {}

  public initialize(): void {
    // TODO: register gesture listeners once control scheme is defined
  }

  public update(_deltaTime: number): void {
    // placeholder; keeper AI will live here
  }

  public setMode(mode: "friend" | "bot"): void {
    this.mode = mode
  }

  public handleInput(): void {
    // inputs will be wired during implementation
  }

  public cleanup(): void {
    // unregister listeners when added
  }
}
