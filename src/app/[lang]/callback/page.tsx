'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Bug } from 'lucide-react'
import { CONFIG } from '@/lib/config'

interface DebugInfo {
  url?: string
  code?: string
  state?: string
  error?: string
  errorDescription?: string
  storedState?: string
  authMethod?: string
  tokenExchangeError?: string
}

export default function CallbackPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorDetails, setErrorDetails] = useState('')
  const [successDetails, setSuccessDetails] = useState('')
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    processCallback()
  }, [])

  const processCallback = async () => {
    try {
      const code = searchParams?.get('code')
      const state = searchParams?.get('state')
      const error = searchParams?.get('error')
      const errorDescription = searchParams?.get('error_description')

      const debug: DebugInfo = {
        url: window.location.href,
        code: code ? `${code.substring(0, 20)}...` : undefined,
        state: state || undefined,
        error: error || undefined,
        errorDescription: errorDescription || undefined,
        storedState: sessionStorage.getItem('oauth_state') || undefined,
        authMethod: sessionStorage.getItem('auth_method') || undefined
      }
      setDebugInfo(debug)

      if (error) {
        showError(`Authentication Error: ${error}`, errorDescription || 'No additional details provided.')
        return
      }

      if (!code) {
        showError('Missing Authorization Code', 'No authorization code received from the authentication server.')
        return
      }

      const storedState = sessionStorage.getItem('oauth_state')
      if (!state || state !== storedState) {
        showError('Invalid State Parameter', 'Possible CSRF attack detected. State parameter mismatch.')
        return
      }

      await exchangeCodeForTokens(code)

    } catch (error: any) {
      console.error('Callback processing error:', error)
      showError('Processing Error', error.message)
    }
  }

  const exchangeCodeForTokens = async (code: string) => {
    try {
      const tokenRequest = {
        grant_type: 'authorization_code',
        code: code,
        client_id: CONFIG.CLIENT_ID,
        client_secret: CONFIG.CLIENT_SECRET,
        redirect_uri: window.location.origin + '/callback'
      }

      const response = await fetch(`${CONFIG.AUTH_SERVER_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenRequest)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(`Token exchange failed (${response.status}): ${responseData.error || responseData.message || 'Unknown error'}`)
      }

      sessionStorage.setItem('access_token', responseData.access_token)
      if (responseData.refresh_token) {
        sessionStorage.setItem('refresh_token', responseData.refresh_token)
      }

      showSuccess(responseData)

    } catch (error: any) {
      console.error('Token exchange error:', error)
      showError('Token Exchange Failed', error.message)
      setDebugInfo(prev => ({ ...prev, tokenExchangeError: error.message }))
    }
  }

  const showError = (title: string, details: string) => {
    setIsLoading(false)
    setIsSuccess(false)
    setIsError(true)
    setErrorMessage(title)
    setErrorDetails(details)
  }

  const showSuccess = (tokenData: any) => {
    setIsLoading(false)
    setIsError(false)
    setIsSuccess(true)

    const details = `Token Type: ${tokenData.token_type || 'Bearer'}
Expires In: ${tokenData.expires_in || 'N/A'} seconds
Auth Method: ${tokenData.auth_method || sessionStorage.getItem('auth_method') || 'N/A'}
Access Token: ${tokenData.access_token ? tokenData.access_token.substring(0, 30) + '...' : 'N/A'}`
    
    setSuccessDetails(details)

    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  }

  const showDebugInfo = () => {
    const debugText = JSON.stringify(debugInfo, null, 2)
    alert(`Debug Information:\n\n${debugText}`)
    console.log('Debug Info:', debugInfo)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Processing Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">Please wait while we complete your authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Authentication Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              You have been successfully authenticated. Redirecting to dashboard...
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">{successDetails}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Authentication Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center font-medium text-gray-900">{errorMessage}</p>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm text-gray-700">Details:</span>
                  <span className="text-sm text-gray-600 text-right max-w-xs">{errorDetails}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-700">Timestamp:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {new Date().toISOString()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => router.push('/')} className="flex-1">
                Try Again
              </Button>
              <Button onClick={showDebugInfo} variant="outline" size="icon">
                <Bug className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}