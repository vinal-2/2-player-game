export type GameAvailability = "playable" | "coming-soon"
export type SupportedMode = "bot" | "local"

export type GameCatalogEntry = {
  id: string
  name: string
  icon: string
  backgroundColor: string
  description: string
  instructions: string
  status: GameAvailability
  componentId?: string
  difficulty?: number
  minPlayers?: number
  maxPlayers?: number
  category?: string
  isNew?: boolean
  isPremium?: boolean
  supportedModes: SupportedMode[]
}
