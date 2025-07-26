'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
          <p className="text-gray-600">
            An error occurred while loading this page. Please try again.
          </p>
        </div>
        
        {error.message && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <strong>Error:</strong> {error.message}
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={reset}
            className="w-full"
          >
            Try again
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
