import type { GameModel } from "../../core/GameEngine"

export type DotsWinner = "player1" | "player2" | "draw" | null

export interface DotsAndBoxesState {
  status: "idle" | "running" | "finished"
  winner: DotsWinner
}

export class DotsAndBoxesModel implements GameModel {
  public isActive = false
  public state: DotsAndBoxesState = {
    status: "idle",
    winner: null,
  }

  private notifyGameOver: (winner: "player1" | "player2" | "draw") => void = () => {}

  public setOnGameOver(listener: (winner: "player1" | "player2" | "draw") => void) {
    this.notifyGameOver = listener
  }

  public initialize(): void {
    this.isActive = true
    this.reset()
  }

  public update(): void {}

  public reset(): void {
    this.state = { status: "running", winner: null }
  }

  public finish(winner: "player1" | "player2" | "draw"): void {
    this.state = { status: "finished", winner }
    this.notifyGameOver(winner)
  }
}

export default DotsAndBoxesModel
