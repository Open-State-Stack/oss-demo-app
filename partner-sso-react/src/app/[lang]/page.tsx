'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Smartphone, CheckCircle, XCircle, Info } from 'lucide-react'
import { CONFIG } from '@/lib/config'
import { UGAuthLogo } from '@/assets/icons'

interface StatusMessage {
  message: string
  type: 'info' | 'success' | 'error'
}

export default function LoginPage() {
  const [status, setStatus] = useState<StatusMessage | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams?.get('code')
    const state = searchParams?.get('state')
    const error = searchParams?.get('error')

    if (error) {
      setStatus({ message: `Authentication failed: ${error}`, type: 'error' })
      return
    }

    if (code && state) {
      const storedState = sessionStorage.getItem('oauth_state')
      if (state !== storedState) {
        setStatus({ message: 'Invalid state parameter - possible CSRF attack', type: 'error' })
        return
      }

      setStatus({ message: 'Authentication successful! Exchanging code for tokens...', type: 'success' })
      exchangeCodeForTokens(code)
    }
  }, [searchParams])

  const generateState = (): string => {
    return btoa(Math.random().toString(36).substring(2, 11))
  }

  const loginWithDigitalPass = () => {
    const state = generateState()
    
    sessionStorage.setItem('oauth_state', state)
    sessionStorage.setItem('auth_method', 'digital_pass')
    
    setStatus({ message: 'Redirecting to Digital Pass authentication...', type: 'info' })
    
    const authUrl = new URL(`${CONFIG.AUTH_SERVER_URL}/auth/authorize`)
    if (!CONFIG.CLIENT_ID || !CONFIG.CALLBACK_URL || !CONFIG.SCOPES) {
      setStatus({ message: 'Missing OAuth configuration. Please check environment variables.', type: 'error' })
      return
    }
    authUrl.searchParams.append('client_id', CONFIG.CLIENT_ID ?? '')
    authUrl.searchParams.append('redirect_uri', CONFIG.CALLBACK_URL ?? '')
    authUrl.searchParams.append('scope', CONFIG.SCOPES ?? '')
    authUrl.searchParams.append('state', state)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('channel', 'web')
    
    setTimeout(() => {
      window.location.href = authUrl.toString()
    }, 1000)
  }

  const exchangeCodeForTokens = async (code: string) => {
    try {
      const response = await fetch(`${CONFIG.AUTH_SERVER_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          client_id: CONFIG.CLIENT_ID,
          client_secret: CONFIG.CLIENT_SECRET,
          redirect_uri: CONFIG.CALLBACK_URL
        })
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`)
      }

      const tokens = await response.json()
      
      sessionStorage.setItem('access_token', tokens.access_token)
      if (tokens.refresh_token) {
        sessionStorage.setItem('refresh_token', tokens.refresh_token)
      }

      setStatus({ message: 'Tokens received successfully! Redirecting to dashboard...', type: 'success' })
      
      setTimeout(() => {
        router.push('/en/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Token exchange error:', error)
      setStatus({ message: `Token exchange failed: ${error.message}`, type: 'error' })
    }
  }

  const StatusIcon = ({ type }: { type: 'info' | 'success' | 'error' }) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'error':
        return <XCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-400 to-red-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary-foreground">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Partner Demo Portal</h1>
          <p className="text-gray-200">Experience Uganda Pass SSO Integration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Choose your authentication method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

          <Button
            type="button"
            onClick={loginWithDigitalPass}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-md flex items-center justify-center space-x-2"
          >
             <UGAuthLogo className='h-6 w-6' />
             <span>Login with Uganda Pass</span>
          </Button>

            {status && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                status.type === 'success' ? 'bg-green-50 text-green-800' :
                status.type === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                <StatusIcon type={status.type} />
                <span className="text-sm">{status.message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Client ID:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {CONFIG.CLIENT_ID}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Auth Server:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {(CONFIG.AUTH_SERVER_URL ?? '').replace('https://', '')}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Callback URL:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {(CONFIG.CALLBACK_URL ?? '').replace('http://localhost:8080', 'localhost:8080')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}