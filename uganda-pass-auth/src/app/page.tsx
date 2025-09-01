'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/auth/tokens';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if authenticated, otherwise to login
    if (tokenManager.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-400 to-red-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🇺🇬</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Uganda Pass</h1>
        <p className="text-gray-600 mb-4">Loading...</p>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent mx-auto" />
      </div>
    </div>
  );
}
