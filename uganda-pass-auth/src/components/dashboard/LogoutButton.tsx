'use client';

import { useState } from 'react';
import { tokenManager } from '@/lib/auth/tokens';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      // Clear local tokens
      tokenManager.clearTokens();
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear tokens and redirect even if backend call fails
      tokenManager.clearTokens();
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center space-x-2"
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <span>🚪</span>
          <span>Logout</span>
        </>
      )}
    </button>
  );
}