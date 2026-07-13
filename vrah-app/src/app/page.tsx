'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'vrah-templates'

interface Template {
  name: string
  players: string[]
}

export default function Home() {
  const router = useRouter()
  const [players, setPlayers] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setTemplates(JSON.parse(saved))
  }, [])

  const addPlayer = () => {
    if (input.trim() && !players.includes(input.trim())) {
      setPlayers([...players, input.trim()])
      setInput('')
    }
  }

  const removePlayer = (name: string) => {
    setPlayers(players.filter(p => p !== name))
  }

  const saveTemplate = () => {
    const name = prompt('Název template:')
    if (!name) return
    const updated = [...templates.filter(t => t.name !== name), { name, players }]
    setTemplates(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const loadTemplate = (template: Template) => {
    setPlayers(template.players)
  }

  const deleteTemplate = (name: string) => {
    const updated = templates.filter(t => t.name !== name)
    setTemplates(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const importFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (Array.isArray(data)) setPlayers(data)
      } catch {}
    }
    reader.readAsText(file)
  }

  const exportToFile = () => {
    const blob = new Blob([JSON.stringify(players, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vrah-players.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const createGame = async () => {
    if (players.length < 2) return

    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players }),
    })

    const data = await res.json()
    if (data.code) {
      localStorage.setItem('vrah-session', JSON.stringify({ code: data.code, role: 'admin' }))
      router.push(`/join?code=${data.code}`)
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Vytvoř hru</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addPlayer()}
          className="flex-1 border p-2 rounded"
          placeholder="Jméno hráče"
        />
        <button onClick={addPlayer} className="bg-blue-500 text-white px-4 py-2 rounded">
          Přidej
        </button>
      </div>

      <ul className="mb-4 divide-y">
        {players.map((p) => (
          <li key={p} className="flex justify-between items-center py-2">
            <span>{p}</span>
            <button onClick={() => removePlayer(p)} className="text-red-500 text-sm">odebrat</button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={createGame} disabled={players.length < 2} className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50">
          Vytvoř hru
        </button>
        <button onClick={saveTemplate} disabled={players.length === 0} className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50">
          Ulož template
        </button>
        <button onClick={exportToFile} disabled={players.length === 0} className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50">
          Exportovat
        </button>
        <label className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer">
          Importovat
          <input type="file" accept=".json" onChange={importFromFile} className="hidden" />
        </label>
      </div>

      {templates.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Templatey</h2>
          {templates.map(t => (
            <div key={t.name} className="flex justify-between items-center py-1">
              <span className="text-sm">{t.name} ({t.players.length} hráčů)</span>
              <div className="flex gap-2">
                <button onClick={() => loadTemplate(t)} className="text-blue-500 text-sm">načíst</button>
                <button onClick={() => deleteTemplate(t.name)} className="text-red-500 text-sm">smazat</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
