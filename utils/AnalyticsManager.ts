/**
 * Analytics Event
 */
export interface AnalyticsEvent {
  name: string
  params?: Record<string, any>
  timestamp: number
}

/**
 * Analytics Manager
 *
 * Handles tracking and reporting of analytics events
 */
export class AnalyticsManager {
  private static instance: AnalyticsManager
  private events: AnalyticsEvent[] = []
  private isEnabled = true
  private userId: string | null = null
  private sessionId: string
  private batchSize = 10
  private flushInterval = 30000 // 30 seconds
  private flushTimeoutId: NodeJS.Timeout | null = null

  // Singleton pattern
  public static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager()
    }
    return AnalyticsManager.instance
  }

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.scheduleFlush()
  }

  /**
   * Generates a unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  /**
   * Sets the user ID
   */
  public setUserId(userId: string | null): void {
    this.userId = userId
  }

  /**
   * Enables or disables analytics
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * Tracks an event
   */
  public trackEvent(name: string, params?: Record<string, any>): void {
    if (!this.isEnabled) return

    const event: AnalyticsEvent = {
      name,
      params: {
        ...params,
        sessionId: this.sessionId,
        userId: this.userId,
      },
      timestamp: Date.now(),
    }

    this.events.push(event)

    // Flush if we've reached the batch size
    if (this.events.length >= this.batchSize) {
      this.flush()
    }
  }

  /**
   * Schedules a flush
   */
  private scheduleFlush(): void {
    if (this.flushTimeoutId) {
      clearTimeout(this.flushTimeoutId)
    }

    this.flushTimeoutId = setTimeout(() => {
      this.flush()
      this.scheduleFlush()
    }, this.flushInterval)
  }

  /**
   * Flushes events to the server
   */
  public async flush(): Promise<void> {
    if (this.events.length === 0) return

    const eventsToSend = [...this.events]
    this.events = []

    try {
      // In a real app, you would send these events to your analytics service
      console.log("Sending analytics events:", eventsToSend)

      // Simulate API call
      // await fetch('https://your-analytics-api.com/events', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ events: eventsToSend }),
      // });
    } catch (error) {
      // If sending fails, add the events back to the queue
      console.error("Error sending analytics events:", error)
      this.events = [...eventsToSend, ...this.events]
    }
  }

  /**
   * Sets the batch size
   */
  public setBatchSize(size: number): void {
    this.batchSize = size
  }

  /**
   * Sets the flush interval
   */
  public setFlushInterval(interval: number): void {
    this.flushInterval = interval
    this.scheduleFlush()
  }

  /**
   * Cleans up the analytics manager
   */
  public cleanup(): void {
    if (this.flushTimeoutId) {
      clearTimeout(this.flushTimeoutId)
    }

    // Flush any remaining events
    this.flush()
  }
}
