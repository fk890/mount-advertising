import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {

    // Fetch orders with their items using Supabase
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_sku,
          unit_price,
          quantity,
          total_price,
          size,
          color,
          product_collection,
          product_category,
          customization,
          custom_design_url
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    // Transform orders to map order_items to items for frontend
    const transformedOrders = orders?.map(order => ({
      ...order,
      items: order.order_items
    })) || [];

    // Calculate statistics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: statsData, error: statsError } = await supabase
      .from('orders')
      .select('id, total_amount, order_status, fulfillment_status')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (statsError) {
      throw new Error(`Failed to fetch statistics: ${statsError.message}`);
    }

    // Calculate statistics
    const totalOrders = statsData?.length || 0;
    const totalRevenue = statsData?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;
    const pendingOrders = statsData?.filter(order => order.order_status === 'pending').length || 0;
    const confirmedOrders = statsData?.filter(order => order.order_status === 'confirmed').length || 0;
    const shippedOrders = statsData?.filter(order => order.fulfillment_status === 'shipped').length || 0;
    const deliveredOrders = statsData?.filter(order => order.fulfillment_status === 'delivered').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        orders: transformedOrders,
        statistics: {
          totalOrders,
          totalRevenue,
          pendingOrders,
          confirmedOrders,
          shippedOrders,
          deliveredOrders
        }
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status, fulfillmentStatus } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: "Database not configured. Please set up Supabase environment variables."
      }, { status: 500 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updateData.order_status = status;
    }

    if (fulfillmentStatus) {
      updateData.fulfillment_status = fulfillmentStatus;

      // Set shipped_at timestamp when status changes to shipped
      if (fulfillmentStatus === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      }
      
      // Set delivered_at timestamp when status changes to delivered
      if (fulfillmentStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data
    });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
