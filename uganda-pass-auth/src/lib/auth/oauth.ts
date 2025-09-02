import { ReadonlyURLSearchParams } from 'next/navigation';
import { LoginContext, OAuth2Context, DirectContext, AuthenticationResult } from './types';

export type { LoginContext, OAuth2Context, DirectContext };

export function detectLoginContext(searchParams: ReadonlyURLSearchParams): LoginContext {
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const responseType = searchParams.get('response_type');
  const partnerSessionId = searchParams.get('partner_session_id');
  
  if (clientId && redirectUri) {
    return {
      type: 'oauth2',
      clientId,
      redirectUri,
      state: state || undefined,
      responseType: responseType || 'code',
      partnerSessionId
    } as OAuth2Context;
  }
  
  return { type: 'direct' } as DirectContext;
}

export function handleAuthSuccess(context: LoginContext, result: AuthenticationResult | { code?: string; authorizationCode?: string; accessToken?: string; refreshToken?: string; user?: unknown }) {
  if (context.type === 'oauth2') {
    // OAuth2 flow - redirect to partner with authorization code
    const redirectUrl = new URL(context.redirectUri);
    const code = 'authorizationCode' in result ? result.authorizationCode : ('code' in result ? result.code : undefined);
    if (code) {
      redirectUrl.searchParams.set('code', code);
    }
    if (context.state) {
      redirectUrl.searchParams.set('state', context.state);
    }
    window.location.href = redirectUrl.toString();
  } else {
    // Direct login - store tokens and navigate to dashboard
    if ('accessToken' in result && result.accessToken) {
      localStorage.setItem('access_token', result.accessToken);
      if ('refreshToken' in result && result.refreshToken) {
        localStorage.setItem('refresh_token', result.refreshToken);
      }
      if ('user' in result && result.user) {
        localStorage.setItem('user_info', JSON.stringify(result.user));
      }
    }
    window.location.href = '/dashboard';
  }
}