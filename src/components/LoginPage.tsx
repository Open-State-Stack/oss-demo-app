import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setStatus({ message: `Authentication failed: ${error}`, type: 'error' });
      return;
    }

    if (code && state) {
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        setStatus({ message: 'Invalid state parameter - possible CSRF attack', type: 'error' });
        return;
      }

      setStatus({ message: 'Authentication successful! Exchanging code for tokens...', type: 'success' });
      exchangeCodeForTokens(code);
    }
  }, [searchParams, navigate]);

  const generateState = (): string => {
    return btoa(Math.random().toString(36).substr(2, 9));
  };

  const loginWithDigitalPass = () => {
    const state = generateState();
    
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('auth_method', 'digital_pass');
    
    setStatus({ message: 'Redirecting to Digital Pass authentication...', type: 'info' });
    
    const authUrl = new URL(`${CONFIG.AUTH_SERVER_URL}/auth/authorize`);
    authUrl.searchParams.append('client_id', CONFIG.CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', CONFIG.CALLBACK_URL);
    authUrl.searchParams.append('scope', CONFIG.SCOPES);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('channel', 'web');
    authUrl.searchParams.append('auth_method', 'digital_pass');
    
    setTimeout(() => {
      window.location.href = authUrl.toString();
    }, 1000);
  };


  const exchangeCodeForTokens = async (code: string) => {
    try {
      const response = await fetch(`${CONFIG.AUTH_SERVER_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          client_id: CONFIG.CLIENT_ID,
          client_secret: 'secret_19bf559030b6a8823083f96ed740c950d96f207a2c7cca5c35ce72fecadd737f',
          redirect_uri: CONFIG.CALLBACK_URL
        })
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokens = await response.json();
      
      sessionStorage.setItem('access_token', tokens.access_token);
      if (tokens.refresh_token) {
        sessionStorage.setItem('refresh_token', tokens.refresh_token);
      }

      setStatus({ message: 'Tokens received successfully! Redirecting to dashboard...', type: 'success' });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Token exchange error:', error);
      setStatus({ message: `Token exchange failed: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="header">
          <div className="logo">P</div>
          <h1>Partner Demo Portal</h1>
          <p className="subtitle">Experience Digital Pass SSO Integration</p>
        </div>

        <div className="auth-options">
          <button className="auth-button primary" onClick={loginWithDigitalPass}>
            <div className="auth-icon digital-pass-icon">📱</div>
            <div className="auth-text">
              <div className="auth-title">Login with Digital Pass</div>
              <div className="auth-description">Secure mobile authentication via push notification</div>
            </div>
          </button>
        </div>

        {status && (
          <div className={`status ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="config-info">
          <div className="config-item">
            <strong>Client ID:</strong> <span>{CONFIG.CLIENT_ID}</span>
          </div>
          <div className="config-item">
            <strong>Auth Server:</strong> <span>{CONFIG.AUTH_SERVER_URL}</span>
          </div>
          <div className="config-item">
            <strong>Callback URL:</strong> <span>{CONFIG.CALLBACK_URL}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;