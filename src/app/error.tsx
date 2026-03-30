'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          Algo deu errado
        </h2>
        <p className="text-[#666666] text-sm mb-6">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
        </p>
        {error?.message && (
          <pre className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left overflow-auto">
            {error.message}
          </pre>
        )}
        <button
          onClick={reset}
          className="bg-[#3B3BFF] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#2525DD] transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
