import type { GameController } from "../../core/GameEngine";
import type { ConnectFourModel } from "./ConnectFourModel";
import { InputManager } from "../../utils/InputManager";

/**
 * Connect Four Game Controller
 *
 * Handles user input and updates the game model
 */
export class ConnectFourController implements GameController {
  private model: ConnectFourModel;
  private inputManager: InputManager;

  constructor(model: ConnectFourModel) {
    this.model = model;
    this.inputManager = InputManager.getInstance();
  }

  /**
   * Initializes the controller
   */
  public initialize(): void {
    this.inputManager.registerPressListener("board", (column) => {
      this.handleInput({ type: "cellPress", column });
    });
  }

  /**
   * Handles any input
   */
  public handleInput(input: any): void {
    switch (input.type) {
      case "cellPress":
        const { column } = input;
        this.model.makeMove(column);
        break;
      case "reset":
        this.model.reset();
        break;
      default:
        break;
    }
  }

  /**
   * Cleans up the controller
   */
  public cleanup(): void {
    this.inputManager.removePressListener("board");
  }
}