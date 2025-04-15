/**
 * Input Manager
 *
 * Handles and normalizes user input across different input methods
 */
export class InputManager {
  private static instance: InputManager;

  private touchListeners: Map<string, (event: TouchEvent) => void> = new Map();
  private panListeners: Map<string, (gestureState: any) => void> = new Map();
  private keyListeners: Map<string, (event: KeyboardEvent) => void> = new Map();

  // Singleton pattern
  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager()
    }
    return InputManager.instance
  }

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Registers a touch event listener
   */
  public registerTouchListener(id: string, callback: (event: TouchEvent) => void): void {
    this.touchListeners.set(id, callback)
  }

  /**
   * Registers a pan gesture listener
   */
  public registerPanListener(id: string, callback: (gestureState: any) => void): void {
    this.panListeners.set(id, callback)
  }

  /**
   * Registers a keyboard event listener
   */
  public registerKeyListener(id: string, callback: (event: KeyboardEvent) => void): void {
    this.keyListeners.set(id, callback)
  }

  /**
   * Removes a touch event listener
   */
  public removeTouchListener(id: string): void {
    this.touchListeners.delete(id)
  }

  /**
   * Removes a pan gesture listener
   */
  public removePanListener(id: string): void {
    this.panListeners.delete(id)
  }

  /**
   * Removes a keyboard event listener
   */
  public removeKeyListener(id: string): void {
    this.keyListeners.delete(id)
  }

  /**
   * Handles a touch event
   */
  public handleTouchEvent(event: TouchEvent): void {
    this.touchListeners.forEach((callback) => {
      callback(event)
    })
  }

  /**
   * Handles a pan gesture
   */
  public handlePanGesture(gestureState: any): void {
    this.panListeners.forEach((callback) => {
      callback(gestureState)
    })
  }

  /**
   * Handles a keyboard event
   */
  public handleKeyEvent(event: KeyboardEvent): void {
    this.keyListeners.forEach((callback) => {
      callback(event)
    })
  }

  /**
   * Clears all listeners
   */
  public clearAllListeners(): void {
    this.touchListeners.clear()
    this.panListeners.clear()
    this.keyListeners.clear()
  }
}
