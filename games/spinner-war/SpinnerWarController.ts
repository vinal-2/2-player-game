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
  private mode: "friend" | "bot";
  private botDifficulty: "rookie" | "pro" | "legend" = "pro";
  private impactCooldown = 0;
 

  constructor(model: SpinnerWarModel, initialMode: "friend" | "bot" = "friend") {
    this.model = model;
    this.inputManager = InputManager.getInstance();
    this.mode = initialMode;
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
  public update(deltaTime: number): void {
    if (this.mode !== "bot" || !this.model.state.gameActive) return;
    if (this.impactCooldown > 0) {
      this.impactCooldown -= 1;
    }
    const s = this.model.state;
    const me = s.player2;
    const foe = s.player1;
    const targetX = foe.x * 0.7 + s.areaCenterX * 0.3;
    const targetY = foe.y * 0.7 + s.areaCenterY * 0.3;

    const dx = targetX - me.x;
    const dy = targetY - me.y;
    const dist = Math.max(Math.hypot(dx, dy), 0.0001);
    let aimX = dx / dist;
    let aimY = dy / dist;

    const difficultyMap = {
      rookie: { jitter: 0.24, accel: 0.1, vmax: 1.8 },
      pro: { jitter: 0.12, accel: 0.16, vmax: 2.5 },
      legend: { jitter: 0.05, accel: 0.2, vmax: 3.1 },
    } as const;
    const cfg = difficultyMap[this.botDifficulty];

    aimX += (Math.random() - 0.5) * cfg.jitter;
    aimY += (Math.random() - 0.5) * cfg.jitter;

    // soften pursuit near arena boundary
    const distToCenter = Math.hypot(me.x - s.areaCenterX, me.y - s.areaCenterY);
    const edgeBuffer = s.areaRadius - me.radius * 1.4;
    let accel = cfg.accel;
    if (distToCenter > edgeBuffer) {
      accel *= 0.45;
      aimX += (s.areaCenterX - me.x) * 0.004;
      aimY += (s.areaCenterY - me.y) * 0.004;
    }

    if (this.impactCooldown > 0) {
      accel *= 0.4;
    }

    this.model.movePlayer2(aimX * accel, aimY * accel);

    const v2x = s.player2.vx;
    const v2y = s.player2.vy;
    const speed = Math.hypot(v2x, v2y);
    if (speed > cfg.vmax) {
      const scale = cfg.vmax / speed;
      s.player2.vx *= scale;
      s.player2.vy *= scale;
    }
  }

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
    switch (input.type) {
      case "reset":
        this.model.reset();
        return;
      case "modebot":
        this.setMode("bot");
        return;
      case "modefriend":
        this.setMode("friend");
        return;
      case "difficultyrookie":
        this.botDifficulty = "rookie";
        return;
      case "difficultypro":
        this.botDifficulty = "pro";
        return;
      case "difficultylegend":
        this.botDifficulty = "legend";
        return;
      case "impactcooldown":
        this.impactCooldown = Math.max(this.impactCooldown, input.frames ?? 12);
        return;
    }

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

  public registerImpact(energy: number): void {
    this.impactCooldown = Math.max(this.impactCooldown, Math.ceil(6 + energy));
  }

  public setMode(mode: "friend" | "bot"): void {
    this.mode = mode;
  }

  public setDifficulty(level: BotDifficulty): void {
    this.botDifficulty = level;
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
