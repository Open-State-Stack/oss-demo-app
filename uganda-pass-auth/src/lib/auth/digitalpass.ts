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

  setupSSEStream(sessionId: string, isSSO: boolean = false): EventSource {
    const endpoint = isSSO 
      ? `/auth/digital-pass/session/${sessionId}/sso-stream`
      : `/auth/digital-pass/session/${sessionId}/stream`;
      
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`);
    
    return eventSource;
  },

  async getSessionStatus(sessionId: string): Promise<{
    status: string;
    attemptsRemaining: number;
    expiresAt: string;
  }> {
    const response = await api.get(`/auth/digital-pass/session/${sessionId}/status`);
    return response.data;
  }
};