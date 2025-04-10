ts
import type { GameController } from "../../core/GameEngine";
import type { DotsAndBoxesModel } from "./DotsAndBoxesModel";
import { InputManager } from "../../utils/InputManager";

/**
 * Dots and Boxes Game Controller
 *
 * Handles user input and updates the game model
 */
export class DotsAndBoxesController implements GameController {
  private model: DotsAndBoxesModel;
  private inputManager: InputManager;

  constructor(model: DotsAndBoxesModel) {
    this.model = model;
    this.inputManager = InputManager.getInstance();
  }

  /**
   * Initializes the controller
   */
  public initialize(): void {
    this.inputManager.registerLinePressListener("board", ({ from, to }) => {
      this.handleInput({ type: "linePress", from, to });
    });
  }

  /**
   * Handles any input
   */
  public handleInput(input: { type: string; from?: { x: number; y: number }; to?: { x: number; y: number } }): void {
    switch (input.type) {
      case "linePress":
        const { from, to } = input;
        this.model.makeMove({row1: from.y, col1: from.x, row2: to.y, col2: to.x, owner: null});
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
    this.inputManager.removeLinePressListener("board");
  }
}