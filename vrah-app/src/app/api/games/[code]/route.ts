import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { code } = await params

  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('code', code)
    .single()

  if (!game) {
    return NextResponse.json({ error: 'Hra nenalezena' }, { status: 404 })
  }

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', game.id)

  return NextResponse.json({ game, players })
}
