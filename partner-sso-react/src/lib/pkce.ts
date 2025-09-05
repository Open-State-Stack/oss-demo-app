/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth2 public clients
 * RFC 7636 implementation
 */

/**
 * Generate a cryptographically random code verifier
 * @param length - Length of the verifier (43-128 characters)
 */
export function generateCodeVerifier(length: number = 128): string {
  // Ensure length is within RFC 7636 bounds
  const validLength = Math.max(43, Math.min(128, length));
  
  // Generate random bytes
  const array = new Uint8Array(validLength);
  crypto.getRandomValues(array);
  
  // Convert to base64url encoding
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, validLength);
}

/**
 * Generate code challenge from verifier using SHA256
 * @param codeVerifier - The code verifier string
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  // Encode the verifier as UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  
  // Hash with SHA-256
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE parameters for OAuth2 flow
 */
export async function generatePKCEChallenge(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256' as const
  };
}

/**
 * Store PKCE verifier securely in session storage
 */
export function storePKCEVerifier(verifier: string): void {
  sessionStorage.setItem('pkce_code_verifier', verifier);
}

/**
 * Retrieve PKCE verifier from session storage
 */
export function retrievePKCEVerifier(): string | null {
  return sessionStorage.getItem('pkce_code_verifier');
}

/**
 * Clear PKCE verifier from session storage
 */
export function clearPKCEVerifier(): void {
  sessionStorage.removeItem('pkce_code_verifier');
}

/**
 * Validate PKCE parameters according to RFC 7636
 */
export function validatePKCEParams(codeVerifier: string, codeChallenge: string): boolean {
  // Validate lengths
  if (codeVerifier.length < 43 || codeVerifier.length > 128) {
    return false;
  }
  
  if (codeChallenge.length < 43 || codeChallenge.length > 128) {
    return false;
  }
  
  // Validate base64url encoding
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  return base64urlPattern.test(codeVerifier) && base64urlPattern.test(codeChallenge);
}