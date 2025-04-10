import type { GameController } from "../../core/GameEngine";
import type { MiniGolfModel } from "./MiniGolfModel";
import { InputManager } from "../../utils/InputManager";

/**
 * Mini Golf Game Controller
 *
 * Handles user input and updates the game model
 */
export class MiniGolfController implements GameController {
  private model: MiniGolfModel;
  private inputManager: InputManager;

  constructor(model: MiniGolfModel) {
    this.model = model;
    this.inputManager = InputManager.getInstance();
  }

  public initialize(): void {
    this.inputManager.registerShotListener("golf", ({ direction, force }) => {
      this.handleInput({ type: "shot", direction, force });
    });
  }

  public handleInput(input: {
    type: string;
    direction?: number;
    force?: number;
  }): void {
    switch (input.type) {
      case "shot":
        const { direction, force } = input;
        this.hitBall(direction, force);
        break;
      case "reset":
        this.model.reset();
        break;
    }
  }

  private hitBall(direction: number, force: number): void {
    const speedMultiplier = 0.5;
    const xSpeed = Math.cos(direction) * force * speedMultiplier;
    const ySpeed = Math.sin(direction) * force * speedMultiplier;
    if (xSpeed !== undefined && ySpeed !== undefined) {
        this.model.hitBall(xSpeed, ySpeed);
        break;
      case "reset":
        this.model.reset();
        break;
    }
  }

  public cleanup(): void {
    this.inputManager.removeShotListener("golf");
  }
}