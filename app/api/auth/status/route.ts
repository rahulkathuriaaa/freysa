import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Get twitter user info from cookies
  const twitterUserId = req.cookies.get('twitter_user_id')?.value;
  const twitterUsername = req.cookies.get('twitter_username')?.value;
  const twitterName = req.cookies.get('twitter_name')?.value;
  const twitterProfileImage = req.cookies.get('twitter_profile_image')?.value;
  const freeCredits = req.cookies.get('free_credits')?.value || '0';
  const telegramJoined = req.cookies.get('telegram_joined')?.value === 'true';
  
  return NextResponse.json({
    isAuthenticated: !!twitterUserId,
    username: twitterUsername || null,
    name: twitterName || null,
    profileImageUrl: twitterProfileImage || null,
    freeCredits: parseInt(freeCredits, 10),
    telegramJoined: telegramJoined
  });
} 