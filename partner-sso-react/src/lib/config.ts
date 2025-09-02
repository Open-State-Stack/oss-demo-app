export const CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID,
  AUTH_SERVER_URL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL,
  CALLBACK_URL: process.env.NEXT_PUBLIC_CALLBACK_URL,
  SCOPES: process.env.NEXT_PUBLIC_SCOPES,
  CLIENT_SECRET: process.env.NEXT_PUBLIC_CLIENT_SECRET,
  // PKCE Configuration
  USE_PKCE: process.env.NEXT_PUBLIC_USE_PKCE === 'true' || !process.env.NEXT_PUBLIC_CLIENT_SECRET, // Use PKCE for public clients or when explicitly enabled
  PKCE_METHOD: 'S256' as const
};