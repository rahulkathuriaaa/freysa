import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Get twitter user info from cookies
  const twitterUserId = req.cookies.get('twitter_user_id')?.value;
  const twitterUsername = req.cookies.get('twitter_username')?.value;
  const freeCredits = req.cookies.get('free_credits')?.value || '0';
  
  return NextResponse.json({
    isAuthenticated: !!twitterUserId,
    username: twitterUsername || null,
    freeCredits: parseInt(freeCredits, 10),
  });
} 