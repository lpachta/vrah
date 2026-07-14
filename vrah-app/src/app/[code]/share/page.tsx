'use client'

import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

export default function SharePage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const [copied, setCopied] = useState(false)

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${code}/select`

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Hra vytvořena!</h1>
        <p className="text-gray-500 mb-8">Sdílej kód s ostatními hráči</p>

        <div className="bg-gray-100 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-500 mb-2">Herní kód</p>
          <p className="text-5xl font-bold tracking-widest mb-4">{code}</p>
          <button
            onClick={copyCode}
            className="bg-blue-500 text-white px-6 py-2 rounded text-sm"
          >
            {copied ? 'Zkopírováno!' : 'Kopírovat kód'}
          </button>
        </div>

        <div className="mb-6">
          <QRCodeSVG value={shareUrl} size={180} />
        </div>

        <button
          onClick={copyLink}
          className="text-blue-500 text-sm hover:underline mb-8 block w-full"
        >
          Kopírovat odkaz
        </button>

        <button
          onClick={() => router.push(`/${code}/select`)}
          className="w-full bg-green-500 text-white text-xl py-3 rounded"
        >
          Hrát
        </button>
      </div>
    </div>
  )
}
