import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config';
import './CallbackPage.css';

interface DebugInfo {
  url?: string;
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
  storedState?: string;
  authMethod?: string;
  tokenExchangeError?: string;
}

const CallbackPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [successDetails, setSuccessDetails] = useState('');
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    processCallback();
  }, []);

  const processCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      const debug: DebugInfo = {
        url: window.location.href,
        code: code ? `${code.substring(0, 20)}...` : undefined,
        state: state || undefined,
        error: error || undefined,
        errorDescription: errorDescription || undefined,
        storedState: sessionStorage.getItem('oauth_state') || undefined,
        authMethod: sessionStorage.getItem('auth_method') || undefined
      };
      setDebugInfo(debug);

      if (error) {
        showError(`Authentication Error: ${error}`, errorDescription || 'No additional details provided.');
        return;
      }

      if (!code) {
        showError('Missing Authorization Code', 'No authorization code received from the authentication server.');
        return;
      }

      const storedState = sessionStorage.getItem('oauth_state');
      if (!state || state !== storedState) {
        showError('Invalid State Parameter', 'Possible CSRF attack detected. State parameter mismatch.');
        return;
      }

      await exchangeCodeForTokens(code);

    } catch (error: any) {
      console.error('Callback processing error:', error);
      showError('Processing Error', error.message);
    }
  };

  const exchangeCodeForTokens = async (code: string) => {
    try {
      const tokenRequest = {
        grant_type: 'authorization_code',
        code: code,
        client_id: CONFIG.CLIENT_ID,
        client_secret: 'secret_19bf559030b6a8823083f96ed740c950d96f207a2c7cca5c35ce72fecadd737f',
        redirect_uri: window.location.origin + window.location.pathname
      };

      const response = await fetch(`${CONFIG.AUTH_SERVER_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenRequest)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Token exchange failed (${response.status}): ${responseData.error || responseData.message || 'Unknown error'}`);
      }

      sessionStorage.setItem('access_token', responseData.access_token);
      if (responseData.refresh_token) {
        sessionStorage.setItem('refresh_token', responseData.refresh_token);
      }

      showSuccess(responseData);

    } catch (error: any) {
      console.error('Token exchange error:', error);
      showError('Token Exchange Failed', error.message);
      setDebugInfo(prev => ({ ...prev, tokenExchangeError: error.message }));
    }
  };

  const showError = (title: string, details: string) => {
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(true);
    setErrorMessage(title);
    setErrorDetails(details);
  };

  const showSuccess = (tokenData: any) => {
    setIsLoading(false);
    setIsError(false);
    setIsSuccess(true);

    const details = `
      Token Type: ${tokenData.token_type || 'Bearer'}
      Expires In: ${tokenData.expires_in || 'N/A'} seconds
      Auth Method: ${tokenData.auth_method || sessionStorage.getItem('auth_method') || 'N/A'}
      Access Token: ${tokenData.access_token ? tokenData.access_token.substring(0, 30) + '...' : 'N/A'}
    `;
    setSuccessDetails(details);

    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const showDebugInfo = () => {
    const debugText = JSON.stringify(debugInfo, null, 2);
    alert(`Debug Information:\n\n${debugText}`);
    console.log('Debug Info:', debugInfo);
  };

  if (isLoading) {
    return (
      <div className="callback-page">
        <div className="container">
          <div className="spinner"></div>
          <h1>Processing Authentication</h1>
          <p className="message">Please wait while we complete your authentication...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="callback-page">
        <div className="container">
          <div className="success-icon">✓</div>
          <h1>Authentication Successful!</h1>
          <p className="message">You have been successfully authenticated. Redirecting to dashboard...</p>
          <div className="details">
            <pre>{successDetails}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="callback-page">
        <div className="container">
          <div className="error-icon">✗</div>
          <h1>Authentication Failed</h1>
          <p className="message">{errorMessage}</p>
          <div className="details">
            <div className="detail-item">
              <span className="detail-label">Details:</span> {errorDetails}
            </div>
            <div className="detail-item">
              <span className="detail-label">Timestamp:</span> {new Date().toISOString()}
            </div>
          </div>
          <button onClick={() => navigate('/')} className="btn">Try Again</button>
          <button onClick={showDebugInfo} className="btn secondary">Debug Info</button>
        </div>
      </div>
    );
  }

  return null;
};

export default CallbackPage;