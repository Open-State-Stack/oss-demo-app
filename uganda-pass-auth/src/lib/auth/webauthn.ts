import { startAuthentication, AuthenticationResponseJSON } from '@simplewebauthn/browser';
import api from './api';
import { WebAuthnAuthenticationOptions, AuthenticationResult } from './types';

export const webauthnAuth = {
  async getAuthenticationOptions(entityId: string): Promise<WebAuthnAuthenticationOptions> {
    const response = await api.post('/auth/webauthn/authenticate/options', {
      entityId
    });
    return response.data;
  },

  async verifyAuthentication({ challengeId, authResponse }: {
    challengeId: string;
    authResponse: AuthenticationResponseJSON;
  }): Promise<AuthenticationResult> {
    const response = await api.post('/auth/webauthn/authenticate/verify', {
      challengeId,
      authResponse
    });
    return response.data;
  },

  async authenticate(entityId: string): Promise<AuthenticationResult> {
    try {
      // Get authentication options from backend
      const options = await this.getAuthenticationOptions(entityId);
      
      // Start WebAuthn authentication  
      const authResponse = await startAuthentication({ optionsJSON: options.options });
      
      // Verify authentication with backend
      const result = await this.verifyAuthentication({
        challengeId: options.challengeId,
        authResponse
      });
      
      return result;
    } catch (error) {
      throw new Error((error as Error)?.message || 'WebAuthn authentication failed');
    }
  }
};