import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Twitter OAuth endpoints
const TWITTER_OAUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/twitter/callback`;

// Twitter OAuth 2.0 scopes - Use minimal scopes to increase approval chances
const scopes = ['tweet.read', 'users.read'];

// Create a code verifier (random string between 43-128 chars)
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

// Create code challenge with S256 method
function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function GET(req: NextRequest) {
  try {
    // Generate a random state value for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    
    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // Store state and verifier in cookies for verification on callback
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10, // 10 minutes
      sameSite: 'lax' as const,
    };

    // Build OAuth URL
    const url = new URL(TWITTER_OAUTH_URL);
    
    // Essential parameters
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', TWITTER_CLIENT_ID);
    url.searchParams.append('redirect_uri', REDIRECT_URI);
    url.searchParams.append('scope', scopes.join(' '));
    url.searchParams.append('state', state);
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');
    
    // Let's simplify and avoid problematic parameters
    // url.searchParams.append('skip_authorization', 'true');
    // url.searchParams.append('force_login', 'false');

    // Set cookies and redirect
    const response = NextResponse.redirect(url.toString());
    response.cookies.set('twitter_oauth_state', state, cookieOptions);
    response.cookies.set('twitter_oauth_verifier', codeVerifier, cookieOptions);
    
    console.log("Redirecting to Twitter OAuth URL:", url.toString());
    
    return response;
  } catch (error) {
    console.error("Error in Twitter auth route:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/gui?error=auth_setup_failed`
    );
  }
} 