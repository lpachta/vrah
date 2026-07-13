'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

interface Player {
  id: string
  name: string
  alive: boolean
  target_id: string | null
  original_target_id: string | null
  killer_id: string | null
}

interface Game {
  id: string
  code: string
  winner_id: string | null
}

export default function PlayPage() {
  const params = useParams()
  const code = params.code as string
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [me, setMe] = useState<Player | null>(null)
  const [victim, setVictim] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  const loadGame = useCallback(async () => {
    const session = JSON.parse(localStorage.getItem('vrah-session') || '{}')
    if (!session.playerId) return

    const res = await fetch(`/api/games/${code}`)
    const data = await res.json()

    if (data.game) setGame(data.game)
    if (data.players) {
      setPlayers(data.players)
      const mePlayer = data.players.find((p: Player) => p.id === session.playerId)
      setMe(mePlayer || null)

      if (mePlayer && mePlayer.alive && mePlayer.target_id) {
        const target = data.players.find((p: Player) => p.id === mePlayer.target_id)
        setVictim(target || null)
      } else {
        setVictim(null)
      }
    }
    setLoading(false)
  }, [code])

  useEffect(() => {
    loadGame()
    const interval = setInterval(loadGame, 3000)
    return () => clearInterval(interval)
  }, [loadGame])

  const reportKill = async () => {
    if (!me || !victim) return
    await fetch(`/api/games/${code}/kill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ killerId: me.id, victimId: victim.id }),
    })
    loadGame()
  }

  const confirmDeath = async () => {
    if (!me) return
    await fetch(`/api/games/${code}/die`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: me.id }),
    })
    loadGame()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Načítání...</div>
  if (!me) return <div className="min-h-screen flex items-center justify-center">Hráč nenalezen</div>

  if (game?.winner_id) {
    if (game.winner_id === me.id) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-green-900 text-white p-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">VYHRÁL JSI!</h1>
            <p className="text-xl">Poslední přeživší</p>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-900 text-white p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">PROHRÁL JSI</h1>
          <p className="text-xl">Hra skončila</p>
        </div>
      </div>
    )
  }

  if (!me.alive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">JSI MRTVÝ</h1>
          <p className="text-xl text-gray-400">Čekáš na konec hry...</p>
        </div>
      </div>
    )
  }

  const showDeathNotification = me.killer_id !== null && me.alive

  if (showDeathNotification) {
    const killer = players.find(p => p.id === me!.killer_id)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-800 text-white p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">BYL JSI ZAVRAŽDĚN</h1>
          <p className="text-xl mb-2">Zabil tě: <strong>{killer?.name || 'Neznámý'}</strong></p>
          <button onClick={confirmDeath} className="mt-8 bg-white text-red-800 px-8 py-4 rounded text-xl font-bold">
            Potvrdit smrt
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {victim ? (
        <>
          <div className="w-full max-w-sm border-2 border-gray-300 rounded-xl p-8 text-center mb-8">
            <p className="text-gray-500 mb-2">Tvoje oběť</p>
            <h2 className="text-4xl font-bold">{victim.name}</h2>
          </div>
          <div className="flex gap-4 w-full max-w-sm">
            <button onClick={reportKill} className="flex-1 bg-green-500 text-white py-4 rounded text-xl font-bold">
              Potvrdit vraždu
            </button>
            <button onClick={confirmDeath} className="flex-1 bg-red-500 text-white py-4 rounded text-xl font-bold">
              Potvrdit smrt
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Čekám na přiřazení oběti...</h2>
          <p className="text-gray-500">Obnov stránku za chvíli</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400 mb-2">Kód hry: {code}</p>
        <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join?code=${code}`} size={128} />
      </div>
    </div>
  )
}
