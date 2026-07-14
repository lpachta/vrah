'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function SelectPage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    fetch(`/api/games/${code}`)
      .then(r => r.json())
      .then(data => setPlayers(data.players || []))
  }, [code])

  const confirmSelection = async () => {
    if (!selected) return

    const res = await fetch(`/api/games/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: selected }),
    })

    const data = await res.json()
    if (data.playerId) {
      localStorage.setItem('vrah-session', JSON.stringify({ code, playerId: data.playerId }))
      router.push(`/${code}/play`)
    }
  }

  if (!confirmed && selected) {
    const player = players.find(p => p.id === selected)
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Jsi si jistý?</h2>
          <p className="text-xl mb-2">Vybral jsi: <strong>{player?.name}</strong></p>
          <p className="text-red-500 mb-6">Pokud se spleteš, dozvíš se oběť někoho jiného!</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setSelected(null)} className="bg-gray-300 px-6 py-3 rounded text-lg">
              Zpět
            </button>
            <button onClick={() => { setConfirmed(true); confirmSelection() }} className="bg-green-500 text-white px-6 py-3 rounded text-lg">
              Ano, jsem to já
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vyber sebe</h1>
      <ul className="space-y-2">
        {players.map(p => (
          <li key={p.id}>
            <button
              onClick={() => setSelected(p.id)}
              className={`w-full text-left p-4 rounded border-2 text-lg ${
                selected === p.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
