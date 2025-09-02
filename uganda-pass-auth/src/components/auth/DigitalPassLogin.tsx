'use client';

import { useState, useEffect, useRef } from 'react';
import { digitalPassAuth } from '@/lib/auth/digitalpass';
import { handleAuthSuccess, LoginContext } from '@/lib/auth/oauth';
import { SSEEvent } from '@/lib/auth/types';
import ErrorAlert from '@/components/ui/ErrorAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Props {
  context: LoginContext;
  onBack?: () => void;
}

export default function DigitalPassLogin({ context, onBack }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'phoneNumber' | 'nationalId'>('phoneNumber');
  const [challengeNumber, setChallengeNumber] = useState<number | null>(null);
  const [, setSessionId] = useState('');
  const [status, setStatus] = useState<'form' | 'challenge' | 'success' | 'error'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (context.type === 'oauth2') {
        // OAuth2 flow - use the partner session ID provided in the URL
        if (!context.partnerSessionId) {
          throw new Error('Missing partner session ID for OAuth2 flow');
        }
        
        result = await digitalPassAuth.initiateSSOChallenge({
          partner_session_id: context.partnerSessionId,
          identifier,
          identifier_type: identifierType
        });
      } else {
        // Direct login flow
        result = await digitalPassAuth.initiateChallenge({
          identifier,
          identifier_type: identifierType
        });
      }

      setChallengeNumber(result.challenge_number);
      setSessionId(result.session_id);
      setStatus('challenge');
      
      // Start real-time status monitoring
      startSSEMonitoring(result.session_id, context.type === 'oauth2');

    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      let errorMessage = error.response?.data?.message || error.message || 'Failed to initiate challenge';
      
      // User-friendly error messages
      if (errorMessage.includes('No identity found')) {
        errorMessage = 'Phone number not registered with Uganda Pass. Please register your identity first or use a different number.';
      } else if (errorMessage.includes('No device token')) {
        errorMessage = 'Device not registered for Uganda Pass. Please register your device first.';
      } else if (errorMessage.includes('Rate limit')) {
        errorMessage = 'Too many attempts. Please wait and try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startSSEMonitoring = (sessionId: string, isSSO: boolean) => {
    try {
      const eventSource = digitalPassAuth.setupSSEStream(sessionId, isSSO);
      eventSourceRef.current = eventSource;
      
      eventSource.onmessage = (event) => {
        const data: SSEEvent = JSON.parse(event.data);
        
        switch(data.type) {
          case 'status':
            setAttemptsRemaining(data.attemptsRemaining || null);
            if (data.status === 'verified') {
              setStatus('success');
            } else if (data.status === 'failed' || data.status === 'expired') {
              setStatus('error');
              setError('Authentication failed or expired');
            }
            break;
            
          case 'redirect':
            // OAuth2 flow - redirect to partner
            eventSource.close();
            window.location.href = data.redirect_uri!;
            break;
            
          case 'tokens':
            // Direct login - handle tokens
            eventSource.close();
            handleAuthSuccess(context, {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user
            });
            break;
            
          case 'error':
            eventSource.close();
            setStatus('error');
            setError(data.message || 'Authentication failed');
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        // Fallback to polling
        startPolling(sessionId, isSSO);
      };

    } catch (error) {
      console.error('Failed to setup SSE:', error);
      startPolling(sessionId, isSSO);
    }
  };

  const startPolling = (sessionId: string, isSSO: boolean) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await digitalPassAuth.getSessionStatus(sessionId);
        setAttemptsRemaining(status.attemptsRemaining);
        
        if (status.status === 'verified') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          
          if (isSSO) {
            // For SSO, we need to get redirect info differently
            setStatus('success');
          } else {
            // For direct login, redirect to dashboard
            window.location.href = '/dashboard';
          }
        } else if (['failed', 'expired'].includes(status.status)) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setStatus('error');
          setError('Authentication failed or expired');
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setStatus('error');
        setError('Connection lost');
      }
    }, 3000);
  };

  if (status === 'challenge') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">UG Pass</h2>
          <p className="text-gray-600">Mobile Verification</p>
        </div>

        <div className="mb-6">
          <p className="text-lg mb-4">
            A notification has been sent to your device.
            <br />
            Select this number in your Uganda Pass app:
          </p>
          <div className="text-6xl font-bold text-red-600 mb-4">
            {challengeNumber}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner className="h-4 w-4" />
              <span className="text-yellow-700">
                Waiting for mobile verification...
                {attemptsRemaining !== null && ` (${attemptsRemaining} attempts remaining)`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-black mb-2">Authentication Successful!</h2>
        <p className="text-gray-600">Redirecting...</p>
        <LoadingSpinner className="h-6 w-6 mx-auto mt-4" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📱</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">UG Pass</h2>
        <p className="text-gray-600">Digital Identity Authentication</p>
        {context.type === 'oauth2' && (
          <p className="text-sm text-blue-600 mt-2">
            Logging in to: <strong>Ministry of Internal Affairs</strong>
          </p>
        )}
      </div>

      {error && (
        <ErrorAlert 
          message={error} 
          onDismiss={() => setError('')}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🇺🇬 Phone Number or National ID
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="e.g., +256700000000 or NIN123456789"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identity Type
          </label>
          <select
            value={identifierType}
            onChange={(e) => setIdentifierType(e.target.value as 'phoneNumber' | 'nationalId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            required
            disabled={loading}
          >
            <option value="phoneNumber">Phone Number</option>
            <option value="nationalId">National ID (NIN)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !identifier}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-full transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>📱</span>
              <span>Continue with UG Pass</span>
            </>
          )}
        </button>
      </form>

      {onBack && (
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-sm"
            disabled={loading}
          >
            ← Choose Different Method
          </button>
        </div>
      )}
    </div>
  );
}