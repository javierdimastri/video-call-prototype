import { NextResponse } from 'next/server';
import twilio from 'twilio';

const { AccessToken } = twilio.jwt;
const { VideoGrant } = AccessToken;

const ACCOUNT_SID = 'AC53f4fc7f3c38625b5df08e7264f8190a';
const API_KEY_SID = 'SKd8847f4d5bd7949acbe3e0ea965bdce3';
const API_KEY_SEC = 'S1W7Yyvz6f0M7CrFRBGgOpw7TYXr3i1K';

export async function GET(request, { params }) {
  const { roomId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  // These should be environment variables in a real application
  const accountSid = process.env.TWILIO_ACCOUNT_SID || ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY || API_KEY_SID;
  const apiSecret = process.env.TWILIO_API_SECRET || API_KEY_SEC;

  // Create an access token which we will sign and return to the client
  const token = new AccessToken(accountSid, apiKey, apiSecret, { identity: userId });

  // Create a Video grant which enables a client to use Video
  const videoGrant = new VideoGrant({
    room: roomId,
  });

  // Add the grant to the token
  token.addGrant(videoGrant);

  // Serialize the token to a JWT string
  return NextResponse.json({
    token: token.toJwt(),
  });
}
