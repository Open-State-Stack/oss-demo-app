import { AuthenticationResult } from './types';

export const tokenManager = {
  setTokens(tokens: AuthenticationResult) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      localStorage.setItem('user_info', JSON.stringify(tokens.user));
      localStorage.setItem('token_expires_in', tokens.expiresIn);
      localStorage.setItem('auth_method', tokens.authMethod);
    }
  },

  getTokens(): AuthenticationResult | null {
    if (typeof window === 'undefined') return null;
    
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userInfo = localStorage.getItem('user_info');
    const expiresIn = localStorage.getItem('token_expires_in');
    const authMethod = localStorage.getItem('auth_method');

    if (!accessToken || !refreshToken || !userInfo) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: expiresIn || '3600',
      authMethod: authMethod || 'unknown',
      zkpProofId: '',
      user: JSON.parse(userInfo)
    };
  },

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('token_expires_in');
      localStorage.removeItem('auth_method');
    }
  },

  isAuthenticated(): boolean {
    return this.getTokens() !== null;
  }
};