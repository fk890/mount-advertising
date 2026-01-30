import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const orderId = searchParams.get('orderId');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Return empty orders if Supabase is not configured
      return NextResponse.json({
        success: true,
        orders: [],
        message: 'Database not configured'
      });
    }

    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const authUser = authData.user;
    const normalizedEmail = email?.toLowerCase();
    const authEmail = authUser.email?.toLowerCase();

    if (userId && authUser.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    if (normalizedEmail && authEmail && normalizedEmail !== authEmail) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    if (orderId && !userId && !email) {
      return NextResponse.json(
        { success: false, error: 'userId or email is required when requesting a specific order' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    // If specific order ID is requested
    if (orderId) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        return NextResponse.json({
          success: false,
          error: 'Order not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        order: data
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Build query for user orders
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('customer_email', email);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({
        success: true,
        orders: []
      });
    }

    // Transform the data to match expected format
    const orders = (data || []).map(order => ({
      id: order.id,
      orderNumber: order.order_number || order.id.slice(0, 8).toUpperCase(),
      date: new Date(order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      status: order.status || 'pending',
      total: order.total_amount || order.total_price || 0,
      items: order.items || []
    }));

    return NextResponse.json({
      success: true,
      orders
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({
      success: true,
      orders: [],
      error: 'Failed to fetch orders'
    });
  }
}
