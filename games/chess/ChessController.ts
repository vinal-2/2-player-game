import type { GameController } from "../../core/GameEngine";
import type { ChessModel } from "./ChessModel";
import { InputManager } from "../../utils/InputManager";

/**
 * Chess Game Controller
 *
 * Handles user input and updates the game model
 */
export class ChessController implements GameController {
  private model: ChessModel;
  private inputManager: InputManager;

  constructor(model: ChessModel, mode?: "friend" | "bot") {
    this.model = model;
    this.inputManager = InputManager.getInstance();
  }

  /**
   * Initializes the controller and registers the cell press listener.
   */
  
  public selectPiece(row: number, col: number): void {
      this.model.selectPiece(row, col);
  }

  public makeMove(toRow: number, toCol: number): void {
      this.model.makeMove(toRow, toCol);
  }

  public initialize(): void {
    this.inputManager.registerMovePieceListener("board", ({ from, to }) => {
      this.handleInput({ type: "movePiece", from, to });
    });
  }

  /**
   * Handles any input
   */
  public handleInput(input: {
    type: string;
    from?: { x: number; y: number };
    to?: { x: number; y: number };
  }): void {
    switch (input.type) {
      case "cellPress":
        const { from } = input;
        this.selectPiece(from.y, from.x);
        break;
      case "movePiece":
        const { from, to } = input;
        this.makeMove(to.y, to.x);
        
        break;
      case "reset":
        this.model.reset();
        break;
    }
  }

  /**
   * Cleans up the controller
   */
  public cleanup(): void {
    this.inputManager.removeAllListeners("board")
  }
}