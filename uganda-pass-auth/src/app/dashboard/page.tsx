'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/auth/tokens';
import { AuthenticationResult } from '@/lib/auth/types';
import TokenDisplay from '@/components/dashboard/TokenDisplay';
import UserInfo from '@/components/dashboard/UserInfo';
import LogoutButton from '@/components/dashboard/LogoutButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [tokens, setTokens] = useState<AuthenticationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedTokens = tokenManager.getTokens();
    if (!storedTokens) {
      router.push('/login');
      return;
    }
    setTokens(storedTokens);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!tokens) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8 text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🇺🇬</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to UG PASS
            </h1>
            <p className="text-gray-600">
              You have successfully authenticated with your digital identity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <UserInfo user={tokens.user} />
            <TokenDisplay tokens={tokens} />
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              What can you do with UG PASS?
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="text-yellow-600 mr-2">✓</span>
                Access government services securely
              </li>
              <li className="flex items-center">
                <span className="text-yellow-600 mr-2">✓</span>
                Authenticate to partner applications
              </li>
              <li className="flex items-center">
                <span className="text-yellow-600 mr-2">✓</span>
                Manage your digital identity
              </li>
              <li className="flex items-center">
                <span className="text-yellow-600 mr-2">✓</span>
                Secure document verification
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}