import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { shuffle } from '@/lib/game'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { players } = await request.json()

    if (!players || players.length < 2) {
      return NextResponse.json({ error: 'Potřeba alespoň 2 hráče' }, { status: 400 })
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({ code })
      .select()
      .single()

    if (gameError || !game) {
      console.error('Game insert error:', gameError)
      return NextResponse.json({ error: 'Chyba při vytváření hry' }, { status: 500 })
    }

    const playerRows = players.map((name: string) => ({
      game_id: game.id,
      name,
    }))

    const { data: insertedPlayers, error: playersError } = await supabase
      .from('players')
      .insert(playerRows)
      .select('id')

    if (playersError || !insertedPlayers) {
      console.error('Players insert error:', playersError)
      return NextResponse.json({ error: 'Chyba při vytváření hráčů' }, { status: 500 })
    }

    const shuffled = shuffle(insertedPlayers)
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

    return NextResponse.json({ code, gameId: game.id })
  } catch (err) {
    console.error('POST /api/games error:', err)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}
