import api from './api';
import { DigitalPassInitiateResponse } from './types';

export const digitalPassAuth = {
  async initiateChallenge({ identifier, identifier_type }: {
    identifier: string;
    identifier_type: 'phoneNumber' | 'nationalId';
  }): Promise<DigitalPassInitiateResponse> {
    const response = await api.post('/auth/digital-pass/initiate', {
      identifier,
      identifier_type,
    });
    return response.data;
  },

  async initiateSSOChallenge({ partner_session_id, identifier, identifier_type }: {
    partner_session_id: string;
    identifier: string;
    identifier_type: 'phoneNumber' | 'nationalId';
  }): Promise<DigitalPassInitiateResponse> {
    const response = await api.post('/auth/digital-pass/sso-initiate', {
      partner_session_id,
      identifier,
      identifier_type
    });
    return response.data;
  },

  setupSSEStream(accessToken: string, isSSO: boolean = false): EventSource {
    const endpoint = isSSO 
      ? `/auth/digital-pass/session/sso-stream`
      : `/auth/digital-pass/session/stream`;
      
    // Include access token as query parameter for SSE authentication
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}?access_token=${accessToken}`;
    const eventSource = new EventSource(url);
    
    return eventSource;
  },

  async getSessionStatus(accessToken: string): Promise<{
    status: string;
    attemptsRemaining: number;
    expiresAt: string;
  }> {
    const response = await api.get('/auth/digital-pass/session/status', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  }
};