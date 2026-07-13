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
  const { killerId, victimId } = await request.json()

  const { data: game } = await supabase
    .from('games')
    .select('id')
    .eq('code', code)
    .single()

  if (!game) {
    return NextResponse.json({ error: 'Hra nenalezena' }, { status: 404 })
  }

  const { data: victim } = await supabase
    .from('players')
    .select('*')
    .eq('id', victimId)
    .eq('game_id', game.id)
    .single()

  if (!victim || !victim.alive) {
    return NextResponse.json({ error: 'Hráč nenalezen nebo je mrtvý' }, { status: 400 })
  }

  await supabase
    .from('players')
    .update({ killer_id: killerId })
    .eq('id', victimId)

  return NextResponse.json({ success: true })
}
