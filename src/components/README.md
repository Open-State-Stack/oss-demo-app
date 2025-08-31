# Partner SSO React Demo

A React TypeScript version of the Partner SSO Demo application that showcases OAuth2 SSO integration with the Digital Pass authentication system.

## Key Changes from HTML Version

- **Dashboard Modification**: Removed profile API call - dashboard now only shows token information and logout button
- **React Router**: Navigation between login, callback, and dashboard pages
- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Modular React components for better maintainability

## Components

- **LoginPage**: Main authentication page with Digital Pass and WebAuthn options
- **CallbackPage**: OAuth2 callback handler for authorization code exchange
- **DashboardPage**: Protected dashboard showing only token information (no profile API calls)

## Usage

1. Start the development server: `npm start`
2. Navigate to `http://localhost:3000`
3. Choose authentication method and complete OAuth flow
4. Dashboard will display token information without making profile API calls

## Configuration

Update values in `src/config.ts` to match your environment.