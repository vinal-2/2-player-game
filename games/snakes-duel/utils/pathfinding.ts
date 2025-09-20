export type GridCellState = 0 | 1 | 2

export interface PathNode {
  x: number
  y: number
  g: number
  h: number
  f: number
  parent?: PathNode
}

const neighbourOffsets = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
]

const makeKey = (x: number, y: number) => `${x}:${y}`

export const manhattan = (ax: number, ay: number, bx: number, by: number) => Math.abs(ax - bx) + Math.abs(ay - by)

export const aStar = ({
  grid,
  start,
  goal,
  maxNodes = 250,
}: {
  grid: GridCellState[][]
  start: { x: number; y: number }
  goal: { x: number; y: number }
  maxNodes?: number
}): PathNode[] | null => {
  const height = grid.length
  const width = grid[0]?.length ?? 0
  const open: PathNode[] = []
  const openSet = new Map<string, PathNode>()
  const closedSet = new Set<string>()

  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: manhattan(start.x, start.y, goal.x, goal.y),
    f: 0,
  }
  startNode.f = startNode.g + startNode.h

  open.push(startNode)
  openSet.set(makeKey(startNode.x, startNode.y), startNode)

  let expanded = 0

  while (open.length > 0 && expanded < maxNodes) {
    open.sort((a, b) => a.f - b.f)
    const current = open.shift()!
    const currentKey = makeKey(current.x, current.y)
    openSet.delete(currentKey)
    closedSet.add(currentKey)

    if (current.x === goal.x && current.y === goal.y) {
      const path: PathNode[] = []
      let node: PathNode | undefined = current
      while (node) {
        path.push(node)
        node = node.parent
      }
      return path.reverse()
    }

    expanded += 1

    for (const offset of neighbourOffsets) {
      const nx = current.x + offset.x
      const ny = current.y + offset.y

      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      if (grid[ny][nx] === 2) continue

      const neighbourKey = makeKey(nx, ny)
      if (closedSet.has(neighbourKey)) continue

      const tentativeG = current.g + 1
      let neighbour = openSet.get(neighbourKey)

      if (!neighbour) {
        neighbour = {
          x: nx,
          y: ny,
          g: tentativeG,
          h: manhattan(nx, ny, goal.x, goal.y),
          f: 0,
          parent: current,
        }
        neighbour.f = neighbour.g + neighbour.h
        open.push(neighbour)
        openSet.set(neighbourKey, neighbour)
      } else if (tentativeG < neighbour.g) {
        neighbour.g = tentativeG
        neighbour.parent = current
        neighbour.f = neighbour.g + neighbour.h
      }
    }
  }

  return null
}

export const floodFillArea = (grid: GridCellState[][], start: { x: number; y: number }, maxNodes = 300): number => {
  const height = grid.length
  const width = grid[0]?.length ?? 0
  const queue: { x: number; y: number }[] = [start]
  const visited = new Set<string>([makeKey(start.x, start.y)])
  let count = 0

  while (queue.length > 0 && count < maxNodes) {
    const { x, y } = queue.shift()!
    count += 1

    for (const offset of neighbourOffsets) {
      const nx = x + offset.x
      const ny = y + offset.y
      const key = makeKey(nx, ny)
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      if (grid[ny][nx] === 2) continue
      if (visited.has(key)) continue
      visited.add(key)
      queue.push({ x: nx, y: ny })
    }
  }

  return count
}
