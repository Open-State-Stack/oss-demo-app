import { AuthenticationResult } from '@/lib/auth/types';

interface Props {
  tokens: AuthenticationResult;
}

export default function TokenDisplay({ tokens }: Props) {
  const maskToken = (token: string) => {
    if (token.length < 20) return '****';
    return token.slice(0, 10) + '...' + token.slice(-10);
  };

  const getExpiryTime = () => {
    const expiresIn = parseInt(tokens.expiresIn);
    const expiryDate = new Date(Date.now() + expiresIn * 1000);
    return expiryDate.toLocaleString();
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
        <span className="mr-2">🔑</span>
        Access Token Information
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-red-700">Authentication Method</label>
          <p className="text-red-900 capitalize">{tokens.authMethod.replace('_', ' ')}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-red-700">Access Token</label>
          <p className="text-red-900 font-mono text-sm break-all">
            {maskToken(tokens.accessToken)}
          </p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-red-700">Token Type</label>
          <p className="text-red-900">{tokens.tokenType}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-red-700">Expires At</label>
          <p className="text-red-900">{getExpiryTime()}</p>
        </div>
        
        {tokens.zkpProofId && (
          <div>
            <label className="text-sm font-medium text-red-700">ZKP Proof ID</label>
            <p className="text-red-900 font-mono text-sm break-all">
              {tokens.zkpProofId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}