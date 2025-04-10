import { AccessibilityInfo } from "react-native"

/**
 * Accessibility Manager
 *
 * Handles accessibility features and settings
 */
export class AccessibilityManager {
  private static instance: AccessibilityManager
  private isScreenReaderEnabled = false
  private isReduceMotionEnabled = false
  private isHighContrastEnabled = false

  // Singleton pattern
  public static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager()
    }
    return AccessibilityManager.instance
  }

  private constructor() {
    this.initialize()
  }

  /**
   * Initializes the accessibility manager
   */
  private async initialize(): Promise<void> {
    // Check if screen reader is enabled
    this.isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled()

    // Listen for screen reader changes
    AccessibilityInfo.addEventListener("screenReaderChanged", this.handleScreenReaderChanged)

    // Check if reduce motion is enabled
    this.isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled()

    // Listen for reduce motion changes
    AccessibilityInfo.addEventListener("reduceMotionChanged", this.handleReduceMotionChanged)
  }

  /**
   * Handles screen reader changes
   */
  private handleScreenReaderChanged = (isEnabled: boolean): void => {
    this.isScreenReaderEnabled = isEnabled
  }

  /**
   * Handles reduce motion changes
   */
  private handleReduceMotionChanged = (isEnabled: boolean): void => {
    this.isReduceMotionEnabled = isEnabled
  }

  /**
   * Checks if screen reader is enabled
   */
  public getIsScreenReaderEnabled(): boolean {
    return this.isScreenReaderEnabled
  }

  /**
   * Checks if reduce motion is enabled
   */
  public getIsReduceMotionEnabled(): boolean {
    return this.isReduceMotionEnabled
  }

  /**
   * Sets high contrast mode
   */
  public setHighContrastMode(enabled: boolean): void {
    this.isHighContrastEnabled = enabled
  }

  /**
   * Checks if high contrast mode is enabled
   */
  public getIsHighContrastEnabled(): boolean {
    return this.isHighContrastEnabled
  }

  /**
   * Gets accessible colors based on current settings
   */
  public getAccessibleColors(): {
    primaryColor: string
    secondaryColor: string
    textColor: string
    backgroundColor: string
  } {
    if (this.isHighContrastEnabled) {
      return {
        primaryColor: "#FFFFFF",
        secondaryColor: "#FFFF00",
        textColor: "#FFFFFF",
        backgroundColor: "#000000",
      }
    }

    return {
      primaryColor: "#2196F3",
      secondaryColor: "#FF9800",
      textColor: "#333333",
      backgroundColor: "#FFFFFF",
    }
  }

  /**
   * Gets animation duration based on reduce motion setting
   */
  public getAnimationDuration(defaultDuration: number): number {
    return this.isReduceMotionEnabled ? 0 : defaultDuration
  }

  /**
   * Creates accessible props for a component
   */
  public createAccessibleProps(
    label: string,
    hint?: string,
    role?: "none" | "button" | "link" | "search" | "image" | "text" | "adjustable",
  ): {
    accessible: boolean
    accessibilityLabel: string
    accessibilityHint?: string
    accessibilityRole?: "none" | "button" | "link" | "search" | "image" | "text" | "adjustable"
  } {
    const props: any = {
      accessible: true,
      accessibilityLabel: label,
    }

    if (hint) {
      props.accessibilityHint = hint
    }

    if (role) {
      props.accessibilityRole = role
    }

    return props
  }

  /**
   * Cleans up the accessibility manager
   */
  public cleanup(): void {
    AccessibilityInfo.removeEventListener("screenReaderChanged", this.handleScreenReaderChanged)
    AccessibilityInfo.removeEventListener("reduceMotionChanged", this.handleReduceMotionChanged)
  }
}
