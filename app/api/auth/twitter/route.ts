import { NextRequest, NextResponse } from 'next/server';

// Twitter OAuth endpoints
const TWITTER_OAUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/twitter/callback`;

// Twitter OAuth 2.0 scopes
const scopes = ['tweet.read', 'users.read'];

export async function GET(req: NextRequest) {
  // Generate a random state value for CSRF protection
  const state = Math.random().toString(36).substring(2);
  
  // Store state in a cookie for verification on callback
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax' as const,
  };

  // Build OAuth URL
  const url = new URL(TWITTER_OAUTH_URL);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('client_id', TWITTER_CLIENT_ID);
  url.searchParams.append('redirect_uri', REDIRECT_URI);
  url.searchParams.append('scope', scopes.join(' '));
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', 'challenge'); // Simplified; should use PKCE
  url.searchParams.append('code_challenge_method', 'plain'); // Should use S256 in production

  // Set cookie and redirect
  const response = NextResponse.redirect(url.toString());
  response.cookies.set('twitter_oauth_state', state, cookieOptions);
  
  return response;
} 