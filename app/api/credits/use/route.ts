import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Get current free credits from cookies
  const freeCreditsStr = req.cookies.get('free_credits')?.value || '0';
  let freeCredits = parseInt(freeCreditsStr, 10);
  
  // Check if the user has free credits
  if (freeCredits <= 0) {
    return NextResponse.json(
      { success: false, message: 'No free credits available' },
      { status: 402 } // 402 Payment Required
    );
  }
  
  // Decrement credits
  freeCredits -= 1;
  
  // Update cookie with new credit count
  const response = NextResponse.json({
    success: true,
    remainingCredits: freeCredits,
  });
  
  response.cookies.set('free_credits', freeCredits.toString(), {
    httpOnly: false, // Allow JS to read this for UI display
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  
  return response;
} 