import { NextRequest, NextResponse } from 'next/server';

const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pleasant-troll-inviting.ngro'}/api/auth/twitter/callback`;
const NODE_ENV = process.env.NODE_ENV || 'development';

export async function GET(req: NextRequest) {
  // Get the authorization code and state from URL parameters
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Handle Twitter-returned errors
  if (error) {
    console.error('Twitter OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/gui?error=${error}&details=${encodeURIComponent(errorDescription || '')}`
    );
  }
  
  // Verify state matches the one we set in the cookie (CSRF protection)
  const storedState = req.cookies.get('twitter_oauth_state')?.value;
  const codeVerifier = req.cookies.get('twitter_oauth_verifier')?.value;
  
  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    console.error('Auth validation failed:', {
      hasCode: !!code,
      hasState: !!state,
      hasStoredState: !!storedState,
      stateMatches: state === storedState,
      hasCodeVerifier: !!codeVerifier
    });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/gui?error=invalid_state`
    );
  }
  
  try {
    console.log('Exchanging code for token...');
    
    // Check if we should use a mock/fallback authentication for development/testing
    // This is useful when Twitter API is giving issues or for local development
    const useMockAuth = searchParams.get('mock') === 'true' || process.env.USE_MOCK_AUTH === 'true';
    
    if (useMockAuth) {
      console.log('Using mock authentication as requested');
      return createMockAuthResponse();
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorData);
      
      // If Twitter token exchange fails, fall back to mock auth in development
      if (NODE_ENV === 'development') {
        console.log('Falling back to mock authentication in development mode');
        return createMockAuthResponse();
      }
      
      throw new Error(`Token exchange failed: ${tokenResponse.statusText} (${errorData})`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Token received, fetching user data...');
    
    // Get the user's info with extended user details
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('User info request failed:', userResponse.status, errorData);
      
      // If user info fails, fall back to mock auth in development
      if (NODE_ENV === 'development') {
        console.log('Falling back to mock authentication in development mode');
        return createMockAuthResponse();
      }
      
      throw new Error(`User info request failed: ${userResponse.statusText} (${errorData})`);
    }
    
    const userData = await userResponse.json();
    console.log('User data received, setting cookies and redirecting...');
    
    // Set cookies with user data and tokens
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/gui?auth=success`
    );
    
    // Clean up the oauth cookies since we don't need them anymore
    response.cookies.delete('twitter_oauth_state');
    response.cookies.delete('twitter_oauth_verifier');
    
    // Store user data in cookies
    response.cookies.set('twitter_user_id', userData.data.id, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    response.cookies.set('twitter_username', userData.data.username, {
      httpOnly: false, // Allow JS to read this for UI display
      secure: NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    if (userData.data.name) {
      response.cookies.set('twitter_name', userData.data.name, {
        httpOnly: false,
        secure: NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
    }
    
    if (userData.data.profile_image_url) {
      response.cookies.set('twitter_profile_image', userData.data.profile_image_url, {
        httpOnly: false,
        secure: NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
    }
    
    response.cookies.set('free_credits', '5', {
      httpOnly: false, // Allow JS to read this for UI display
      secure: NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/gui?error=auth_failed&details=${encodeURIComponent(String(error))}`
    );
  }
}

// Function to create a mock authentication response for development/testing
function createMockAuthResponse() {
  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/gui?auth=success&mock=true`
  );
  
  response.cookies.delete('twitter_oauth_state');
  response.cookies.delete('twitter_oauth_verifier');
  
  // Set mock user data in cookies
  response.cookies.set('twitter_user_id', '12345678', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
  
  response.cookies.set('twitter_username', 'example_user', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
  
  response.cookies.set('twitter_name', 'Example User', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
  
  response.cookies.set('twitter_profile_image', 'https://pbs.twimg.com/profile_images/default_profile_400x400.png', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
  
  response.cookies.set('free_credits', '5', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  
  return response;
} 