import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { code } = await params
  const { playerId } = await request.json()

  const { data: game } = await supabase
    .from('games')
    .select('id')
    .eq('code', code)
    .single()

  if (!game) {
    return NextResponse.json({ error: 'Hra nenalezena' }, { status: 404 })
  }

  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .eq('game_id', game.id)
    .single()

  if (!player || !player.alive) {
    return NextResponse.json({ error: 'Hráč nenalezen nebo je mrtvý' }, { status: 400 })
  }

  await supabase
    .from('players')
    .update({ alive: false })
    .eq('id', playerId)

  if (player.killer_id) {
    await supabase
      .from('players')
      .update({ target_id: player.original_target_id })
      .eq('id', player.killer_id)
  } else {
    const { data: killer } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', game.id)
      .eq('target_id', playerId)
      .eq('alive', true)
      .single()

    if (killer) {
      await supabase
        .from('players')
        .update({ target_id: player.original_target_id })
        .eq('id', killer.id)
    }
  }

  const { data: alivePlayers } = await supabase
    .from('players')
    .select('id')
    .eq('game_id', game.id)
    .eq('alive', true)

  if (alivePlayers && alivePlayers.length === 1) {
    await supabase
      .from('games')
      .update({ winner_id: alivePlayers[0].id })
      .eq('id', game.id)
  }

  return NextResponse.json({ success: true })
}
