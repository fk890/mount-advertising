import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// OAuth callback handler
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/shop/login?error=configuration', request.url));
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/shop/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/shop/login?error=no_code', request.url));
  }

  try {
    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL(`/shop/login?error=${encodeURIComponent(exchangeError?.message || 'exchange_failed')}`, request.url)
      );
    }

    const user = data.user;
    const session = data.session;

    // Create a response that redirects to account page with user data in URL
    // The client-side will extract this and store in localStorage
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.full_name?.split(' ')[0] || userMetadata.name?.split(' ')[0] || '';
    const lastName = userMetadata.full_name?.split(' ').slice(1).join(' ') || userMetadata.name?.split(' ').slice(1).join(' ') || '';
    
    // Create a base64-encoded user object to pass to client
    const userData = {
      id: user.id,
      email: user.email,
      firstName,
      lastName,
      token: session.access_token,
    };
    
    const encodedUser = Buffer.from(JSON.stringify(userData)).toString('base64');
    
    // Redirect to a client page that will handle storing the user data
    return NextResponse.redirect(
      new URL(`/shop/auth/callback?user=${encodedUser}`, request.url)
    );
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/shop/login?error=callback_failed', request.url));
  }
}
