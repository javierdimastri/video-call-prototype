import { NextResponse } from 'next/server';
import { jwt } from 'twilio';


const ACCOUNT_SID = 'AC53f4fc7f3c38625b5df08e7264f8190a';
const API_KEY_SID = 'SKd8847f4d5bd7949acbe3e0ea965bdce3';
const API_KEY_SECRET = 'S1W7Yyvz6f0M7CrFRBGgOpw7TYXr3i1K';

// GET handler
export async function GET(request, { params }) {
  const roomName = params.name;
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  console.log({userId});
  
  try {
    const identity = userId;
    const token = new jwt.AccessToken(ACCOUNT_SID, API_KEY_SID, API_KEY_SECRET, {identity});

    const videoGrant = new jwt.AccessToken.VideoGrant({ room: roomName });
    token.addGrant(videoGrant);
    console.log({token});

    const data ={ token: token.toJwt(), identity };
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// POST handler (opsional)
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const response = {
//       message: 'Data received successfully!',
//       receivedData: body,
//     };

//     return NextResponse.json(response, { status: 200 });
//   } catch (error) {
//     console.error('Error processing POST request:', error);
//     return NextResponse.json(
//       { error: 'Failed to process POST request' },
//       { status: 500 }
//     );
//   }
// }
