import type { GameModel } from "../../core/GameEngine"

export type ChessWinner = "white" | "black" | "draw" | null

export interface ChessState {
  status: "idle" | "running" | "finished"
  winner: ChessWinner
}

export class ChessModel implements GameModel {
  public isActive = false
  public state: ChessState = {
    status: "idle",
    winner: null,
  }

  private notifyGameOver: (winner: "white" | "black" | "draw") => void = () => {}

  public setOnGameOver(listener: (winner: "white" | "black" | "draw") => void) {
    this.notifyGameOver = listener
  }

  public initialize(): void {
    this.isActive = true
    this.reset()
  }

  public update(): void {
    // Placeholder model has no runtime updates yet
  }

  public reset(): void {
    this.state = { status: "running", winner: null }
  }

  public finish(winner: "white" | "black" | "draw"): void {
    this.state = { status: "finished", winner }
    this.notifyGameOver(winner)
  }
}

export default ChessModel
