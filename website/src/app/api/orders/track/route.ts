import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shop-utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  try {
    const url = new URL(req.url);
    const { searchParams } = url;
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');
    
    if (!orderNumber || !email) {
      return NextResponse.json(
        { success: false, error: 'Order number and email are required' },
        { status: 400 }
      );
    }
    
    // Search for order by order number and email
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_email,
        customer_first_name,
        customer_last_name,
        status,
        subtotal,
        shipping_fee,
        gift_packaging_fee,
        total_amount,
        created_at,
        tracking_number,
        estimated_delivery,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_zip_code,
        order_items (
          id,
          product_id,
          product_name,
          product_price,
          quantity,
          product_image
        )
      `)
      .eq('order_number', orderNumber)
      .eq('customer_email', email.toLowerCase())
      .single();
      
    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found. Please check your order number and email address.' },
        { status: 404 }
      );
    }
    
    // Format the response
    const formattedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      date: order.created_at,
      status: order.status || 'processing',
      total: order.total_amount,
      trackingNumber: order.tracking_number,
      estimatedDelivery: order.estimated_delivery,
      shippingAddress: {
        name: `${order.customer_first_name} ${order.customer_last_name}`,
        address: order.shipping_address,
        city: order.shipping_city,
        state: order.shipping_state,
        zipCode: order.shipping_zip_code
      },
      items: order.order_items?.map((item: {
        id: string;
        product_name: string;
        product_image: string;
        product_price: number;
        quantity: number;
      }) => ({
        id: item.id,
        name: item.product_name,
        image: item.product_image,
        price: item.product_price,
        quantity: item.quantity
      })) || []
    };
    
    return NextResponse.json({
      success: true,
      order: formattedOrder
    });
    
  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order information' },
      { status: 500 }
    );
  }
}
