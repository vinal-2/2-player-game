import type { GameModel } from "../../core/GameEngine"

export type SpinnerWarWinner = "player1" | "player2" | "draw" | null

export interface SpinnerWarState {
  status: "idle" | "running" | "finished"
  winner: SpinnerWarWinner
}

export class SpinnerWarModel implements GameModel {
  public isActive = false
  public state: SpinnerWarState = {
    status: "idle",
    winner: null,
  }

  public initialize(): void {
    this.isActive = true
    this.reset()
  }

  public update(): void {}

  public reset(): void {
    this.state = { status: "running", winner: null }
  }
}

export default SpinnerWarModel
