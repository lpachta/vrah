export interface Game {
  id: string
  code: string
  created_at: string
}

export interface Player {
  id: string
  game_id: string
  name: string
  alive: boolean
  target_id: string | null
  original_target_id: string | null
  killer_id: string | null
}
