'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Smartphone, CheckCircle, XCircle, Info } from 'lucide-react'
import { CONFIG } from '@/lib/config'
import { UGAuthLogo } from '@/assets/icons'
import { generatePKCEChallenge, storePKCEVerifier, retrievePKCEVerifier, clearPKCEVerifier } from '@/lib/pkce'

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

  const loginWithDigitalPass = async () => {
    const state = generateState()
    
    sessionStorage.setItem('oauth_state', state)
    sessionStorage.setItem('auth_method', 'digital_pass')
    
    setStatus({ message: 'Preparing secure authentication...', type: 'info' })
    
    const authUrl = new URL(`${CONFIG.AUTH_SERVER_URL}/auth/authorize`)
    if (!CONFIG.CLIENT_ID || !CONFIG.CALLBACK_URL || !CONFIG.SCOPES) {
      setStatus({ message: 'Missing OAuth configuration. Please check environment variables.', type: 'error' })
      return
    }
    
    // Add standard OAuth2 parameters
    authUrl.searchParams.append('client_id', CONFIG.CLIENT_ID ?? '')
    authUrl.searchParams.append('redirect_uri', CONFIG.CALLBACK_URL ?? '')
    authUrl.searchParams.append('scope', CONFIG.SCOPES ?? '')
    authUrl.searchParams.append('state', state)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('channel', 'web')
    
    // Add PKCE parameters if enabled
    if (CONFIG.USE_PKCE) {
      try {
        const pkceParams = await generatePKCEChallenge()
        
        // Store code verifier securely for token exchange
        storePKCEVerifier(pkceParams.codeVerifier)
        
        // Add PKCE parameters to authorization request
        authUrl.searchParams.append('code_challenge', pkceParams.codeChallenge)
        authUrl.searchParams.append('code_challenge_method', pkceParams.codeChallengeMethod)
        
        setStatus({ message: 'Redirecting to Digital Pass authentication (PKCE-secured)...', type: 'info' })
      } catch (error) {
        console.error('PKCE generation failed:', error)
        setStatus({ message: 'Failed to generate PKCE parameters. Please try again.', type: 'error' })
        return
      }
    } else {
      setStatus({ message: 'Redirecting to Digital Pass authentication...', type: 'info' })
    }
    
    setTimeout(() => {
      window.location.href = authUrl.toString()
    }, 1000)
  }

  const exchangeCodeForTokens = async (code: string) => {
    try {
      // Prepare token request body
      const tokenRequest: any = {
        grant_type: 'authorization_code',
        code: code,
        client_id: CONFIG.CLIENT_ID,
        redirect_uri: CONFIG.CALLBACK_URL
      }
      
      // Add PKCE verifier if PKCE is enabled
      if (CONFIG.USE_PKCE) {
        const codeVerifier = retrievePKCEVerifier()
        if (!codeVerifier) {
          throw new Error('PKCE code verifier not found. Authentication flow may be compromised.')
        }
        tokenRequest.code_verifier = codeVerifier
        
        // Clear the verifier after use (single-use security)
        clearPKCEVerifier()
      } else {
        // For confidential clients, include client secret
        tokenRequest.client_secret = CONFIG.CLIENT_SECRET
      }
      
      const response = await fetch(`${CONFIG.AUTH_SERVER_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenRequest)
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
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary-foreground">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Partner Demo Portal</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Choose your authentication method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">


        <Button
            type="button"
            variant="secondary"
            onClick={loginWithDigitalPass}
            className="w-full h-10 bg-gray-100 dark:bg-gray-700 !cursor-pointer text-gray-950 dark:text-gray-200 rounded-full font-normal"
          >
             <UGAuthLogo className='!h-6 !w-6' />
            Login with Digital Pass
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
      </div>
    </div>
  )
}