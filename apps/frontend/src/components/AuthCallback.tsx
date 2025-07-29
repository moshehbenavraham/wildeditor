import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react'

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { searchParams } = new URL(window.location.href)
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(errorDescription || 'Authentication failed')
          return
        }

        // If we get here, the email verification was successful
        setStatus('success')
        setMessage('Email verified successfully! Redirecting to the editor...')
        
        // Redirect to main app after a short delay
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred during verification')
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Luminari Wilderness Editor
        </h1>

        {status === 'loading' && (
          <div>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-green-400 mb-2">Verification Successful!</h2>
            <p className="text-gray-300">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-400 mb-2">Verification Failed</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}