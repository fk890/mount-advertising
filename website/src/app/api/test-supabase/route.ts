import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Supabase configuration missing',
        details: 'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local',
        products: []
      }, { status: 500 });
    }

    // Try to import and use Supabase
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .limit(5);

      if (error) {
        console.error('Supabase query error:', error);
        return NextResponse.json({ 
          error: 'Database query failed', 
          details: error.message,
          products: []
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        message: 'Supabase connection successful',
        products: products || [],
        count: products?.length || 0
      });

    } catch (importError) {
      console.error('Supabase import error:', importError);
      return NextResponse.json({ 
        error: 'Supabase client initialization failed',
        details: importError instanceof Error ? importError.message : 'Make sure @supabase/supabase-js is installed',
        products: []
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test Supabase error:', error);
    return NextResponse.json({ 
      error: 'Failed to test Supabase connection',
      details: error instanceof Error ? error.message : 'Unknown error',
      products: []
    }, { status: 500 });
  }
}