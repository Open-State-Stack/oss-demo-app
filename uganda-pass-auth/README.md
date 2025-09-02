# Uganda Pass Authentication Frontend

A standalone Next.js application that provides authentication for the Uganda Pass digital identity system. This app handles both direct login and OAuth2/SSO flows.

## Features

- **WebAuthn/Passkey Authentication**: Biometric authentication using platform authenticators
- **Digital Pass Authentication**: Mobile-based challenge-response authentication
- **OAuth2 Integration**: Seamless integration with third-party applications
- **Real-time Updates**: Server-Sent Events for instant status updates
- **Responsive Design**: Mobile-first design with Uganda government branding

## Development Setup

### Prerequisites

- Node.js 18+ 
- Backend API running at `http://localhost:3000`

### Installation

```bash
npm install
```

### Environment Configuration

Configure `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME="Uganda Pass Authentication"
NEXT_PUBLIC_WEBAUTHN_RP_ID=localhost
NEXT_PUBLIC_WEBAUTHN_RP_NAME="Uganda Pass"
NEXT_PUBLIC_DIGITAL_PASS_ENABLED=true
```

### Development Server

```bash
npm run dev
```

Access the application at `http://localhost:3000`

## Usage Scenarios

### Direct Login
Visit `http://localhost:3000/login` to authenticate and access the dashboard.

### OAuth2 Flow
Third-party applications redirect to:
```
http://localhost:3000/login?client_id=partner123&redirect_uri=https://partner.com/callback&state=xyz
```

After authentication, users are redirected back to the partner with an authorization code.

## Architecture

```
src/
├── app/
│   ├── login/           # Authentication page
│   ├── dashboard/       # User dashboard (direct login)
│   └── api/            # API routes for token management
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   └── ui/             # Shared UI components
└── lib/
    └── auth/           # Authentication utilities
```

## Security

- **httpOnly Cookies**: Secure token storage
- **CSRF Protection**: Cross-site request forgery prevention
- **Content Security Policy**: XSS protection
- **CORS Configuration**: Proper cross-origin handling
- **Rate Limiting**: Protection against brute force attacks

## Integration with Backend

This frontend consumes the following backend APIs:

- `/auth/webauthn/authenticate/*` - WebAuthn authentication
- `/auth/digital-pass/*` - Digital Pass authentication
- `/auth/authorize` - OAuth2 authorization
- `/auth/verify` - Session verification
- `/auth/token` - Token exchange
