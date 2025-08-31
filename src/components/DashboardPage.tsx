import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

interface TokenInfo {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  auth_method?: string;
}

const DashboardPage: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [authMethod, setAuthMethod] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTokenData();
  }, [navigate]);

  const loadTokenData = () => {
    const accessToken = sessionStorage.getItem('access_token');
    
    if (!accessToken) {
      alert('No access token found. Redirecting to login...');
      navigate('/');
      return;
    }

    const refreshToken = sessionStorage.getItem('refresh_token');
    const storedAuthMethod = sessionStorage.getItem('auth_method') || 'digital_pass';
    
    setAuthMethod(storedAuthMethod);

    try {
      const payload = parseJWT(accessToken);
      setTokenInfo({
        access_token: accessToken,
        refresh_token: refreshToken || undefined,
        token_type: 'Bearer',
        expires_in: payload?.exp ? payload.exp - Math.floor(Date.now() / 1000) : undefined,
        auth_method: payload?.auth_method || storedAuthMethod
      });
    } catch (error) {
      setTokenInfo({
        access_token: accessToken,
        refresh_token: refreshToken || undefined,
        token_type: 'Bearer',
        auth_method: storedAuthMethod
      });
    }
  };

  const parseJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  };

  const copyToken = (type: 'access' | 'refresh') => {
    const token = type === 'access' 
      ? tokenInfo?.access_token 
      : tokenInfo?.refresh_token;
    
    if (token) {
      navigator.clipboard.writeText(token).then(() => {
        alert('Token copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy token:', err);
        alert('Failed to copy token. Please copy manually from the display.');
      });
    } else {
      alert('Token not found');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('auth_method');
    
    navigate('/');
  };

  if (!tokenInfo) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">P</div>
            <div className="header-title">Partner Dashboard</div>
          </div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="welcome-card">
          <h1 className="welcome-title">Welcome to Your Dashboard!</h1>
          <p className="welcome-subtitle">You have successfully authenticated using Digital Pass SSO</p>
          <div className="user-info">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>
                Authenticated via{' '}
                <span className={`badge ${authMethod.replace('_', '-')}`}>
                  {authMethod === 'digital_pass' ? 'Digital Pass' : 'WebAuthn'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="cards-grid">
          <div className="card">
            <div className="card-header">
              <div className="card-icon tokens">🔑</div>
              <h2 className="card-title">Access Token</h2>
            </div>
            <div className="card-content">
              <p>Your OAuth2 access token for API calls:</p>
              <div className="token-display">
                {tokenInfo.access_token.length > 50 
                  ? `${tokenInfo.access_token.substring(0, 50)}...` 
                  : tokenInfo.access_token}
              </div>
              <div className="token-info">
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{tokenInfo.token_type || 'Bearer'}</span>
                </div>
                {tokenInfo.expires_in && (
                  <div className="info-item">
                    <span className="info-label">Expires In:</span>
                    <span className="info-value">{tokenInfo.expires_in} seconds</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Auth Method:</span>
                  <span className="info-value">{tokenInfo.auth_method || authMethod}</span>
                </div>
              </div>
              <button className="copy-btn" onClick={() => copyToken('access')}>
                Copy Access Token
              </button>
            </div>
          </div>

          {tokenInfo.refresh_token && (
            <div className="card">
              <div className="card-header">
                <div className="card-icon tokens">🔄</div>
                <h2 className="card-title">Refresh Token</h2>
              </div>
              <div className="card-content">
                <p>Your OAuth2 refresh token:</p>
                <div className="token-display">
                  {tokenInfo.refresh_token.length > 50 
                    ? `${tokenInfo.refresh_token.substring(0, 50)}...` 
                    : tokenInfo.refresh_token}
                </div>
                <button className="copy-btn" onClick={() => copyToken('refresh')}>
                  Copy Refresh Token
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;