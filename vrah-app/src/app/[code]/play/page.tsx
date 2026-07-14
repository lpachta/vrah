'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import type { Player, Game } from '@/lib/types'

export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [me, setMe] = useState<Player | null>(null)
  const [victim, setVictim] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const loadGame = useCallback(async () => {
    try {
      const raw = localStorage.getItem('vrah-session')
      if (!raw) return
      const session = JSON.parse(raw)
      if (!session.playerId) return

      const adminPlayers = localStorage.getItem('vrah-admin-players')
      setIsAdmin(!!adminPlayers)

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
    } catch {}
    setLoading(false)
  }, [code])

  useEffect(() => {
    const init = async () => {
      await loadGame()
    }
    init()
    const interval = setInterval(() => { loadGame() }, 3000)
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

  const leaveGame = () => {
    localStorage.removeItem('vrah-session')
    router.push('/')
  }

  const newGame = async () => {
    const adminPlayers = localStorage.getItem('vrah-admin-players')
    if (!adminPlayers) return
    const players = JSON.parse(adminPlayers)

    const res = await fetch(`/api/games/${code}/new-game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players }),
    })

    const data = await res.json()
    if (data.code) {
      localStorage.setItem('vrah-session', JSON.stringify({ code: data.code }))
      router.push(`/${data.code}/share`)
    }
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
            <button onClick={leaveGame} className="mt-8 bg-green-700 px-6 py-3 rounded text-lg">
              Zpět
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-900 text-white p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">PROHRÁL JSI</h1>
          <p className="text-xl">Hra skončila</p>
          <button onClick={leaveGame} className="mt-8 bg-red-700 px-6 py-3 rounded text-lg">
            Zpět
          </button>
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
          <button onClick={leaveGame} className="mt-8 bg-gray-700 px-6 py-3 rounded text-lg">
            Zpět
          </button>
        </div>
      </div>
    )
  }

  const iHaveTarget = victim && victim.alive
  const targetPendingConfirmation = victim && victim.killer_id
  const iAmKilled = me.killer_id

  const myKiller = iAmKilled
    ? players.find((p: Player) => p.id === me.killer_id)
    : null

  const someoneTargetsMe = players.some(
    (p: Player) => p.alive && p.target_id === me.id && p.id !== me.id
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {iHaveTarget && !targetPendingConfirmation && (
        <>
          <div className="w-full max-w-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center mb-8">
            <p className="text-gray-500 dark:text-gray-400 mb-2">Tvoje oběť</p>
            <h2 className="text-4xl font-bold">{victim!.name}</h2>
          </div>
          <div className="flex gap-4 w-full max-w-sm">
            <button onClick={reportKill} className="flex-1 bg-green-500 text-white py-4 rounded text-xl font-bold">
              Potvrdit vraždu
            </button>
          </div>
        </>
      )}

      {iHaveTarget && targetPendingConfirmation && (
        <div className="w-full max-w-sm text-center mb-8">
          <div className="bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400 rounded-xl p-6 mb-4">
            <p className="text-yellow-700 dark:text-yellow-200 text-lg">
              Čekáš na potvrzení smrti hráče <strong>{victim!.name}</strong>
            </p>
          </div>
        </div>
      )}

      {iAmKilled && (
        <div className="w-full max-w-sm text-center mb-8">
          <div className="bg-red-100 dark:bg-red-900 border-2 border-red-400 rounded-xl p-8 mb-4">
            <p className="text-red-700 dark:text-red-200 text-xl mb-2">Byl jsi zavražděn!</p>
            {myKiller && <p className="text-red-500 dark:text-red-300 text-sm">Vrah: {myKiller.name}</p>}
          </div>
          <button onClick={confirmDeath} className="w-full bg-red-500 text-white py-4 rounded text-xl font-bold">
            Potvrdit smrt
          </button>
        </div>
      )}

      {!iHaveTarget && !iAmKilled && !someoneTargetsMe && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Čekám na přiřazení oběti...</h2>
          <p className="text-gray-500">Obnov stránku za chvíli</p>
        </div>
      )}

      {!iAmKilled && someoneTargetsMe && (
        <div className="w-full max-w-sm text-center mt-4">
          <button onClick={confirmDeath} className="w-full bg-red-500 text-white py-4 rounded text-xl font-bold">
            Potvrdit smrt
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400 mb-2">Kód hry: {code}</p>
        <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${code}/select`} size={128} />
      </div>

      {isAdmin && (
        <div className="mt-6">
          <button onClick={newGame} className="bg-orange-500 text-white px-6 py-3 rounded text-lg font-bold">
            Nová hra
          </button>
        </div>
      )}
    </div>
  )
}
