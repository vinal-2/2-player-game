/**
 * Object Pool
 *
 * Manages reusable game objects to reduce garbage collection
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (obj: T) => void
  private maxSize: number

  /**
   * Creates a new object pool
   * @param createFn Function to create a new object
   * @param resetFn Function to reset an object before reuse
   * @param initialSize Initial size of the pool
   * @param maxSize Maximum size of the pool
   */
  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 0, maxSize = 100) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize

    // Pre-populate the pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  /**
   * Gets an object from the pool or creates a new one if the pool is empty
   */
  public get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  /**
   * Returns an object to the pool
   */
  public release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj)
      this.pool.push(obj)
    }
  }

  /**
   * Clears the pool
   */
  public clear(): void {
    this.pool = []
  }

  /**
   * Gets the current size of the pool
   */
  public size(): number {
    return this.pool.length
  }
}
