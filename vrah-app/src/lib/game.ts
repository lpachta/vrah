import { supabase } from './supabase'
import type { Player } from './types'

export function shuffle<T>(array: T[]): T[] {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function assignTargets(gameId: string): Promise<boolean> {
  const { data: players } = await supabase
    .from('players')
    .select('id')
    .eq('game_id', gameId)

  if (!players || players.length < 2) return false

  const shuffled = shuffle(players)
  const updates = shuffled.map((player, i) => {
    const target = shuffled[(i + 1) % shuffled.length]
    return supabase
      .from('players')
      .update({
        target_id: target.id,
        original_target_id: target.id,
      })
      .eq('id', player.id)
  })

  await Promise.all(updates)
  return true
}

export async function handleKill(victimId: string): Promise<void> {
  const { data: victim } = await supabase
    .from('players')
    .select('killer_id, original_target_id')
    .eq('id', victimId)
    .single()

  if (!victim || !victim.killer_id) return

  await supabase
    .from('players')
    .update({ alive: false })
    .eq('id', victimId)

  await supabase
    .from('players')
    .update({ target_id: victim.original_target_id })
    .eq('id', victim.killer_id)

  const { data: game } = await supabase
    .from('players')
    .select('game_id')
    .eq('id', victimId)
    .single()

  if (game) {
    const { data: alivePlayers } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', game.game_id)
      .eq('alive', true)

    if (alivePlayers && alivePlayers.length === 1) {
      await supabase
        .from('games')
        .update({ winner_id: alivePlayers[0].id })
        .eq('id', game.game_id)
    }
  }
}

export async function handleSelfDeath(playerId: string): Promise<void> {
  const { data: player } = await supabase
    .from('players')
    .select('game_id, original_target_id')
    .eq('id', playerId)
    .single()

  if (!player) return

  await supabase
    .from('players')
    .update({ alive: false })
    .eq('id', playerId)

  const { data: killer } = await supabase
    .from('players')
    .select('id')
    .eq('game_id', player.game_id)
    .eq('target_id', playerId)
    .eq('alive', true)
    .single()

  if (killer) {
    await supabase
      .from('players')
      .update({ target_id: player.original_target_id })
      .eq('id', killer.id)
  }

  const { data: alivePlayers } = await supabase
    .from('players')
    .select('id')
    .eq('game_id', player.game_id)
    .eq('alive', true)

  if (alivePlayers && alivePlayers.length === 1) {
    await supabase
      .from('games')
      .update({ winner_id: alivePlayers[0].id })
      .eq('id', player.game_id)
  }
}
