interface Props {
  user: {
    entityId: string;
    email?: string;
    displayName?: string;
  };
}

export default function UserInfo({ user }: Props) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
        <span className="mr-2">👤</span>
        User Information
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-yellow-700">Entity ID</label>
          <p className="text-yellow-900 font-mono text-sm">{user.entityId}</p>
        </div>
        
        {user.displayName && (
          <div>
            <label className="text-sm font-medium text-yellow-700">Display Name</label>
            <p className="text-yellow-900">{user.displayName}</p>
          </div>
        )}
        
        {user.email && (
          <div>
            <label className="text-sm font-medium text-yellow-700">Email</label>
            <p className="text-yellow-900">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}