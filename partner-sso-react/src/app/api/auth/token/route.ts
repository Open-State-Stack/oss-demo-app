import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grant_type, code, client_id, client_secret, redirect_uri, code_verifier } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      )
    }

    // Build token request based on client type (public vs confidential)
    const tokenRequest: any = {
      grant_type: grant_type || 'authorization_code',
      code: code,
      client_id: client_id || process.env.NEXT_PUBLIC_CLIENT_ID,
      redirect_uri: redirect_uri || process.env.NEXT_PUBLIC_CALLBACK_URL
    }
    
    // For PKCE flow (public clients), include code verifier
    if (code_verifier) {
      tokenRequest.code_verifier = code_verifier
      console.log('Using PKCE flow for public client')
    } else {
      // For confidential clients, include client secret
      tokenRequest.client_secret = client_secret || process.env.CLIENT_SECRET
      console.log('Using client secret for confidential client')
    }
    
    // Validate required parameters
    if (!tokenRequest.client_id) {
      return NextResponse.json(
        { error: 'Missing client_id' },
        { status: 400 }
      )
    }
    
    if (!code_verifier && !tokenRequest.client_secret) {
      return NextResponse.json(
        { error: 'Either code_verifier (PKCE) or client_secret is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenRequest)
    })

    const responseData = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Token exchange failed',
          details: responseData.error || responseData.message || 'Unknown error',
          status: response.status
        },
        { status: response.status }
      )
    }

    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}