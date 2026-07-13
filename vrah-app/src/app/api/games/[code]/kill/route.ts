import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { code } = await params
    const { killerId, victimId } = await request.json()

    if (!killerId || !victimId) {
      return NextResponse.json({ error: 'Chybějící parametry' }, { status: 400 })
    }

    const { data: game } = await supabase
      .from('games')
      .select('id')
      .eq('code', code)
      .single()

    if (!game) {
      return NextResponse.json({ error: 'Hra nenalezena' }, { status: 404 })
    }

    const { data: killer } = await supabase
      .from('players')
      .select('*')
      .eq('id', killerId)
      .eq('game_id', game.id)
      .single()

    if (!killer || !killer.alive) {
      return NextResponse.json({ error: 'Vrah nenalezen nebo je mrtvý' }, { status: 400 })
    }

    const { data: victim } = await supabase
      .from('players')
      .select('*')
      .eq('id', victimId)
      .eq('game_id', game.id)
      .single()

    if (!victim || !victim.alive) {
      return NextResponse.json({ error: 'Oběť nenalezena nebo je mrtvá' }, { status: 400 })
    }

    if (killer.target_id !== victimId) {
      return NextResponse.json({ error: 'Tato oběť není tvůj cíl' }, { status: 403 })
    }

    await supabase
      .from('players')
      .update({ alive: false })
      .eq('id', victimId)

    await supabase
      .from('players')
      .update({ target_id: victim.original_target_id })
      .eq('id', killerId)

    const { data: alivePlayers } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', game.id)
      .eq('alive', true)

    if (alivePlayers && alivePlayers.length <= 1) {
      if (alivePlayers.length === 1) {
        await supabase
          .from('games')
          .update({ winner_id: alivePlayers[0].id })
          .eq('id', game.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/games/[code]/kill error:', err)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}
