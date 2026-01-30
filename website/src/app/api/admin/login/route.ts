import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    console.log("Admin login attempt received");
    
    // Parse the request body
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    console.log(`Login attempt with email: ${email}`);
    // Validate credentials against environment variables
    console.log("Validating admin credentials against environment variables...");
    
    const adminEmail = (process.env.ADMIN_EMAIL || '').replace(/^["']|["']$/g, '').trim();
    const adminPassword = (process.env.ADMIN_PASSWORD || '').replace(/^["']|["']$/g, '').trim();
    const jwtSecret = process.env.JWT_SECRET;
    
    console.log(`Environment variables check: 
      ADMIN_EMAIL exists: ${Boolean(adminEmail)}
      ADMIN_PASSWORD exists: ${Boolean(adminPassword)}
      JWT_SECRET exists: ${Boolean(jwtSecret)}`
    );
    
    if (!adminEmail || !adminPassword || !jwtSecret) {
      console.error("Missing required environment variables for admin login");
      return NextResponse.json(
        { error: 'Server configuration error - Missing environment variables' },
        { status: 500 }
      );
    }
    
    // Validate credentials
    const emailMatch = email === adminEmail.toLowerCase();
    const passwordMatch = password === adminPassword;
    console.log(`Credential validation: Email match: ${emailMatch}, Password match: ${passwordMatch}`);
    console.log(`Received email: "${email}", Expected: "${adminEmail.toLowerCase()}"`);
    console.log(`Password length received: ${password.length}, Expected: ${adminPassword.length}`);
    
    if (!emailMatch || !passwordMatch) {
      console.log("Invalid login credentials provided");
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log("Admin credentials verified successfully");
    
    // Create a JWT token
    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({ email, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret);
    
    // Set the cookie - using response headers for better compatibility
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Use lax for both dev and prod for better compatibility
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });
    
    console.log("JWT token set in cookie successfully");
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
