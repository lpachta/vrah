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

  const { data: existingPlayer } = await supabase
    .from('players')
    .select('id')
    .eq('game_id', game.id)
    .eq('id', playerId)
    .single()

  if (!existingPlayer) {
    return NextResponse.json({ error: 'Hráč nenalezen v této hře' }, { status: 404 })
  }

  return NextResponse.json({ playerId: existingPlayer.id })
}
