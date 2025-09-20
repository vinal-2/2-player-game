export type GameMode = "friend" | "bot"

export type GameRuntimeEvent =
  | { type: "score"; payload?: Record<string, any> }
  | { type: "game_over"; payload?: Record<string, any> }
  | { type: "custom"; payload: Record<string, any> }

export interface GameRuntimeProps {
  gameId: string
  mode: GameMode
  onExit: () => void
  onEvent?: (event: GameRuntimeEvent) => void
}
