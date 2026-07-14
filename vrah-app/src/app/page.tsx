'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

function JoinContent() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('vrah-session')
    if (saved) {
      const session = JSON.parse(saved)
      if (session.code && session.playerId) {
        router.push(`/${session.code}/play`)
      }
    }
  }, [router])

  const joinGame = async () => {
    if (!code.trim()) return
    const upperCode = code.toUpperCase().trim()

    const res = await fetch(`/api/games/${upperCode}`)
    const data = await res.json()

    if (data.error) {
      setError('Hra nenalezena')
      return
    }

    router.push(`/${upperCode}/select`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-bold mb-8">Vrah</h1>
        <input
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && joinGame()}
          className="w-full text-center text-2xl tracking-widest border-2 p-4 rounded mb-4 uppercase"
          placeholder="Kód hry"
          maxLength={6}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button onClick={joinGame} className="w-full bg-blue-500 text-white text-xl py-3 rounded mb-4">
          Vstoupit
        </button>
        <a href="/create" className="text-gray-400 text-sm hover:underline">
          Vytvoř novou hru
        </a>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Načítání...</div>}>
      <JoinContent />
    </Suspense>
  )
}
