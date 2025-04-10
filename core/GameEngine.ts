/**
 * Core Game Engine
 *
 * This class serves as the central game engine that manages the game loop,
 * physics calculations, and coordinates between game models and views.
 */
export class GameEngine {
  private static instance: GameEngine
  private gameLoopId: number | null = null
  private lastFrameTime = 0
  private gameModels: Map<string, GameModel> = new Map()
  private gameControllers: Map<string, GameController> = new Map()
  private fps = 60
  private isRunning = false

  // Singleton pattern
  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine()
    }
    return GameEngine.instance
  }

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Registers a game model and its controller with the engine
   */
  public registerGame(id: string, model: GameModel, controller: GameController): void {
    this.gameModels.set(id, model)
    this.gameControllers.set(id, controller)
  }

  /**
   * Starts the game loop for a specific game
   */
  public startGame(gameId: string): void {
    if (this.isRunning) {
      this.stopGame()
    }

    const model = this.gameModels.get(gameId)
    const controller = this.gameControllers.get(gameId)

    if (!model || !controller) {
      console.error(`Game with ID ${gameId} not found`)
      return
    }

    this.isRunning = true
    this.lastFrameTime = performance.now()

    // Initialize the game
    model.initialize()
    controller.initialize()

    // Start the game loop
    this.gameLoop()
  }

  /**
   * The main game loop
   */
  private gameLoop = (): void => {
    const now = performance.now()
    const deltaTime = (now - this.lastFrameTime) / 1000 // Convert to seconds
    this.lastFrameTime = now

    // Update all active games
    for (const [id, model] of this.gameModels.entries()) {
      if (model.isActive) {
        const controller = this.gameControllers.get(id)
        if (controller) {
          // Update game state
          model.update(deltaTime)
          // Update controller
          controller.update(deltaTime)
        }
      }
    }

    // Continue the loop if the game is still running
    if (this.isRunning) {
      this.gameLoopId = requestAnimationFrame(this.gameLoop)
    }
  }

  /**
   * Stops the current game
   */
  public stopGame(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId)
      this.gameLoopId = null
    }
    this.isRunning = false

    // Reset all active games
    for (const [id, model] of this.gameModels.entries()) {
      if (model.isActive) {
        model.isActive = false
      }
    }
  }

  /**
   * Pauses the current game
   */
  public pauseGame(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId)
      this.gameLoopId = null
    }
    this.isRunning = false
  }

  /**
   * Resumes the current game
   */
  public resumeGame(): void {
    if (!this.isRunning) {
      this.isRunning = true
      this.lastFrameTime = performance.now()
      this.gameLoop()
    }
  }

  /**
   * Sets the target frames per second
   */
  public setFPS(fps: number): void {
    this.fps = fps
  }
}

/**
 * Base Game Model Interface
 *
 * All game models should implement this interface
 */
export interface GameModel {
  isActive: boolean
  initialize(): void
  update(deltaTime: number): void
  reset(): void
}

/**
 * Base Game Controller Interface
 *
 * All game controllers should implement this interface
 */
export interface GameController {
  initialize(): void
  update(deltaTime: number): void
  handleInput(input: any): void
}

/**
 * Base Game View Interface
 *
 * All game views should implement this interface
 */
export interface GameView {
  render(): void
  update(state: any): void
}
