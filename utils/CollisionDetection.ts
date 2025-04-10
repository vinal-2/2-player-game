/**
 * Collision Detection Utility
 *
 * Provides various collision detection algorithms for 2D games
 */
export class CollisionDetection {
  /**
   * Checks if two rectangles are colliding
   */
  public static rectangleCollision(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number },
  ): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    )
  }

  /**
   * Checks if two circles are colliding
   */
  public static circleCollision(
    circle1: { x: number; y: number; radius: number },
    circle2: { x: number; y: number; radius: number },
  ): boolean {
    const dx = circle1.x - circle2.x
    const dy = circle1.y - circle2.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < circle1.radius + circle2.radius
  }

  /**
   * Checks if a point is inside a rectangle
   */
  public static pointInRectangle(
    point: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number },
  ): boolean {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
  }

  /**
   * Checks if a point is inside a circle
   */
  public static pointInCircle(
    point: { x: number; y: number },
    circle: { x: number; y: number; radius: number },
  ): boolean {
    const dx = point.x - circle.x
    const dy = point.y - circle.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= circle.radius
  }

  /**
   * Calculates the bounce angle when two objects collide
   */
  public static calculateBounceAngle(
    obj1: { x: number; y: number; vx?: number; vy?: number },
    obj2: { x: number; y: number; vx?: number; vy?: number },
  ): number {
    const dx = obj2.x - obj1.x
    const dy = obj2.y - obj1.y
    return Math.atan2(dy, dx)
  }
}
