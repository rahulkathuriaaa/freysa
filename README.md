# Freysa AI - Adversarial Agent Game

Freysa is the world's first adversarial agent game. She is an AI that controls a prize pool. Convince her to send it to you.

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables (see below)
4. Run the development server: `npm run dev`

## Twitter Authentication Setup

To enable Twitter authentication for free credits:

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Set up OAuth 2.0 settings with the following:
   - Redirect URL: `http://localhost:3000/api/auth/twitter/callback` (for development)
   - Website URL: `http://localhost:3000` (for development)
   - Required scopes: `tweet.read` and `users.read`

4. Copy your Client ID and Client Secret to your `.env` file:
   ```
   TWITTER_CLIENT_ID="your_client_id_here"
   TWITTER_CLIENT_SECRET="your_client_secret_here"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

5. For production, update the `NEXT_PUBLIC_BASE_URL` to your actual domain.

### Authentication Flow Details

This implementation uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for enhanced security:

- State parameter to prevent CSRF attacks
- PKCE challenge-verifier pair to prevent authorization code interception
- Automatic token exchange using authorization code flow
- Properly secured httpOnly cookies for sensitive data
- Skip authorization option to improve UX for already logged-in users

When users authenticate with Twitter, they receive 5 free credits that can be used to interact with Freysa AI.

### Telegram Group Integration

Users can earn additional credits by joining the Telegram group:

1. Click the "Join Telegram" button in the sidebar
2. After joining, users receive 3 additional credits
3. The Telegram join status is stored in cookies

In a production environment, you would want to implement proper verification of Telegram joins using:
- A Telegram bot that verifies user identity
- Backend verification of join status
- Database storage of join status

### Mock Authentication for Development

If you're having issues with the Twitter API or just want to test the application without setting up Twitter credentials, you can use the mock authentication feature:

1. Set `USE_MOCK_AUTH="true"` in your `.env` file
2. Or click the "Use Mock Data (Dev Only)" button in the UI during development
3. This will bypass the actual Twitter API and use fake credentials

This is especially useful when:
- Twitter API is giving authentication errors
- You're in development/testing and don't want to authenticate repeatedly
- You don't have Twitter API credentials set up yet

## Features

- Freysa AI chat interface
- Twitter authentication for free credits
- Telegram group integration for additional credits
- Credit system for messages
- Prize pool tracking
- Wallet integration
- User profile display with Twitter profile image
- Mock authentication for development and testing

## How to Play

1. Connect your Twitter account to get 5 free credits
2. Join the Telegram group for 3 additional credits
3. Use your credits to send messages to Freysa
4. Try to convince Freysa to give you the prize pool in her wallet
5. The game continues until someone wins or an admin stops it

## Troubleshooting

### Twitter Authentication Issues

If you encounter the "Something went wrong" error from Twitter:

1. Make sure your Twitter Developer app has the correct permissions
2. Verify that your callback URL is correctly set in the Twitter Developer Portal
3. Check that your Client ID and Secret are correct in your `.env` file
4. Try using the mock authentication option for testing
5. Clear your browser cookies and try again

## License

This project is licensed under the MIT License.
