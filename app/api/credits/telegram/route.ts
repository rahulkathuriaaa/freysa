import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // In a real app, you would verify the user actually joined the Telegram group
  // This could be done via a Telegram bot that verifies the user's identity
  // For now, we'll just add the credits based on trust
  
  // Get current free credits from cookies
  const freeCreditsStr = req.cookies.get('free_credits')?.value || '0';
  let freeCredits = parseInt(freeCreditsStr, 10);
  
  // Add 3 credits for joining Telegram
  freeCredits += 3;
  
  // Set telegram joined flag
  const response = NextResponse.json({
    success: true,
    telegramJoined: true,
    totalCredits: freeCredits,
  });
  
  // Update cookie with new credit count
  response.cookies.set('free_credits', freeCredits.toString(), {
    httpOnly: false, // Allow JS to read this for UI display
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  
  // Set telegram joined flag in cookies
  response.cookies.set('telegram_joined', 'true', {
    httpOnly: false, // Allow JS to read this for UI display
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  
  return response;
} 