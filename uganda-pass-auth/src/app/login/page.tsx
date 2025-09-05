'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { detectLoginContext, LoginContext } from '@/lib/auth/oauth';
import WebAuthnLogin from '@/components/auth/WebAuthnLogin';
import DigitalPassLogin from '@/components/auth/DigitalPassLogin';
import MethodSelector from '@/components/auth/MethodSelector';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function LoginContent() {
  const searchParams = useSearchParams();
  const context = detectLoginContext(searchParams);
  const [selectedMethod, setSelectedMethod] = useState<'webauthn' | 'digitalpass' | null>(null);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-yellow-200">
      <div className="flex items-center justify-center min-h-screen p-4">
  
          <LoginCard 
            context={context} 
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
          />
  
      </div>
    </div>
  );
}

function LoginCard({ 
  context, 
  selectedMethod, 
  onSelectMethod 
}: {
  context: LoginContext;
  selectedMethod: 'webauthn' | 'digitalpass' | null;
  onSelectMethod: (method: 'webauthn' | 'digitalpass' | null) => void;
}) {
  if (!selectedMethod) {
    return (
      <MethodSelector 
        onSelect={onSelectMethod}
        context={context}
      />
    );
  }
  
  if (selectedMethod === 'webauthn') {
    return (
      <WebAuthnLogin 
        context={context} 
        onBack={() => onSelectMethod(null)}
      />
    );
  }
  
  if (selectedMethod === 'digitalpass') {
    return (
      <DigitalPassLogin 
        context={context}
        onBack={() => onSelectMethod(null)}
      />
    );
  }

  return null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-yellow-400 to-red-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}