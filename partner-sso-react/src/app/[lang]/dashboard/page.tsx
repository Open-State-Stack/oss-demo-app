'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Key, RefreshCw, LogOut, Loader2, Copy, CheckCircle, Clock } from 'lucide-react'

interface TokenInfo {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  auth_method?: string
}

export default function DashboardPage() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [authMethod, setAuthMethod] = useState<string>('')
  const [copied, setCopied] = useState<{ access: boolean; refresh: boolean }>({ access: false, refresh: false })
  const router = useRouter()

  useEffect(() => {
    loadTokenData()
  }, [])

  const loadTokenData = () => {
    const accessToken = sessionStorage.getItem('access_token')
    
    if (!accessToken) {
      alert('No access token found. Redirecting to login...')
      router.push('/en')
      return
    }

    const refreshToken = sessionStorage.getItem('refresh_token')
    const storedAuthMethod = sessionStorage.getItem('auth_method') || 'digital_pass'
    
    setAuthMethod(storedAuthMethod)

    try {
      const payload = parseJWT(accessToken)
      setTokenInfo({
        access_token: accessToken,
        refresh_token: refreshToken || undefined,
        token_type: 'Bearer',
        expires_in: payload?.exp ? payload.exp - Math.floor(Date.now() / 1000) : undefined,
        auth_method: payload?.auth_method || storedAuthMethod
      })
    } catch (error) {
      setTokenInfo({
        access_token: accessToken,
        refresh_token: refreshToken || undefined,
        token_type: 'Bearer',
        auth_method: storedAuthMethod
      })
    }
  }

  const parseJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      throw new Error('Invalid JWT token')
    }
  }

  const copyToken = async (type: 'access' | 'refresh') => {
    const token = type === 'access' 
      ? tokenInfo?.access_token 
      : tokenInfo?.refresh_token
    
    if (token) {
      try {
        await navigator.clipboard.writeText(token)
        setCopied(prev => ({ ...prev, [type]: true }))
        setTimeout(() => {
          setCopied(prev => ({ ...prev, [type]: false }))
        }, 2000)
      } catch (err) {
        console.error('Failed to copy token:', err)
        alert('Failed to copy token. Please copy manually from the display.')
      }
    } else {
      alert('Token not found')
    }
  }

  const logout = () => {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('auth_method')
    
    router.push('/')
  }

  if (!tokenInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <CardTitle>Loading dashboard...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-800">Welcome to Your Dashboard!</CardTitle>
                <CardDescription className="text-green-700">
                  You have successfully authenticated using UG PASS SSO
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">
                Authenticated via{' '}
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {authMethod === 'digital_pass' ? 'Digital Pass' : 'WebAuthn'}
                </Badge>
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Access Token</CardTitle>
                  <CardDescription>Your OAuth2 access token for API calls</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 border">
                <code className="text-xs text-gray-700 break-all">
                  {tokenInfo.access_token.length > 100 
                    ? `${tokenInfo.access_token.substring(0, 100)}...` 
                    : tokenInfo.access_token}
                </code>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium">{tokenInfo.token_type || 'Bearer'}</p>
                </div>
                {tokenInfo.expires_in && (
                  <div>
                    <span className="text-gray-500">Expires In:</span>
                    <p className="font-medium flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {tokenInfo.expires_in}s
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => copyToken('access')} 
                variant="outline" 
                size="sm"
                className="w-full"
                disabled={copied.access}
              >
                {copied.access ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Access Token
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {tokenInfo.refresh_token && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Refresh Token</CardTitle>
                    <CardDescription>Your OAuth2 refresh token</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <code className="text-xs text-gray-700 break-all">
                    {tokenInfo.refresh_token.length > 100 
                      ? `${tokenInfo.refresh_token.substring(0, 100)}...` 
                      : tokenInfo.refresh_token}
                  </code>
                </div>
                <Button 
                  onClick={() => copyToken('refresh')} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  disabled={copied.refresh}
                >
                  {copied.refresh ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Refresh Token
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Details</CardTitle>
            <CardDescription>Information about your current session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Auth Method:</span>
                <Badge variant="outline">
                  {tokenInfo.auth_method || authMethod}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Session Started:</span>
                <Badge variant="outline">
                  {new Date().toLocaleTimeString()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
             <Card>
          <CardHeader>
            <CardTitle>Authentication Details</CardTitle>
            <CardDescription>Information about your current session</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">P</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Partner Dashboard</h1>
          </div>
          <Button onClick={logout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
          </CardContent>
        </Card>     
      </main>
    </div>
  )
}