import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the admin token from cookies
    const tokenCookie = request.cookies.get('admin-token');
    
    if (!tokenCookie) {
      return NextResponse.json(
        { success: false, data: { user: null }, error: 'No authentication token found' },
        { status: 401 }
      );
    }
    
    // Verify the token
    try {
      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        console.error('JWT_SECRET environment variable not set');
        return NextResponse.json(
          { success: false, data: { user: null }, error: 'Server configuration error' },
          { status: 500 }
        );
      }
      
      // Convert the JWT secret to a Uint8Array as required by jose
      const secretKey = new TextEncoder().encode(jwtSecret);
      
      // Verify the token
      const { payload } = await jwtVerify(tokenCookie.value, secretKey);
      
      // Return the user data
      return NextResponse.json({
        success: true,
        data: { 
          user: {
            email: payload.email as string,
            role: payload.role as string
          }
        }
      });
      
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { success: false, data: { user: null }, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, data: { user: null }, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
