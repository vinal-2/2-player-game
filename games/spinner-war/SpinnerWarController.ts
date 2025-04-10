import type { GameController } from "../../core/GameEngine";
import type { SpinnerWarModel } from "./SpinnerWarModel";
import { InputManager } from "../../utils/InputManager";

/**
 * Spinner War Game Controller
 *
 * Handles user input and updates the game model
 */
export class SpinnerWarController implements GameController {
  private model: SpinnerWarModel;
  private inputManager: InputManager;
  private moveSpeed = 1;
  private pushForce = 0.2;
  

  constructor(model: SpinnerWarModel) {
    this.model = model;
    this.inputManager = InputManager.getInstance();
  }

  /**
   * Initializes the controller
   */
  public initialize(): void {
    // Register input handlers
    this.inputManager.registerPanListener("player1Spinner", (gestureState) =>
      this.handlePan("player1", gestureState),
    );
    this.inputManager.registerPanListener("player2Spinner", (gestureState) =>
      this.handlePan("player2", gestureState),
    );
    this.inputManager.registerPressListener("player1Spinner", () => this.handlePress("player1"));
    this.inputManager.registerPressListener("player2Spinner", () => this.handlePress("player2"));


  }

  /**
   * Updates the controller
   */
  public update(deltaTime: number): void {}

  private handlePan = (player: "player1" | "player2", gestureState: any): void => {
    this.handleInput({ type: `pan${player}`, gestureState });
  };

  private handlePress = (player: "player1" | "player2"): void => {
    this.handleInput({ type: `push${player}` });
  };

  private handleRotate = (player: "player1" | "player2"): void => {
    this.handleInput({ type: `rotate${player}` });
  }


  /**
   * Handles any input
   */
  public handleInput(input: any): void {
    if (!this.model.state.gameActive) return;

    switch (input.type) {
      case "pushplayer1":
        this.model.movePlayer1(0, -this.pushForce);
        break;
      case "pushplayer2":
        this.model.movePlayer2(0, -this.pushForce);
        break;
      case "panplayer1":
        this.model.movePlayer1(input.gestureState.dx * this.moveSpeed, input.gestureState.dy * this.moveSpeed);
        break;
      case "panplayer2":
        this.model.movePlayer2(input.gestureState.dx * this.moveSpeed, input.gestureState.dy * this.moveSpeed);
        break;
      case "rotateplayer1":
        this.model.movePlayer1(this.moveSpeed, 0);
        break;
      case "rotateplayer2":
        this.model.movePlayer2(this.moveSpeed, 0);
        break;
    }
  }

  /**
   * Cleans up the controller
   */
  public cleanup(): void {
    this.inputManager.removePanListener("player1Spinner");
    this.inputManager.removePanListener("player2Spinner");
    this.inputManager.removePressListener("player1Spinner");
    this.inputManager.removePressListener("player2Spinner");
  }
}
