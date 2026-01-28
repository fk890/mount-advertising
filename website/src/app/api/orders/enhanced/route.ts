import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin, isSupabaseConfigured } from '@/shop-utils/supabase/admin';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  sku?: string;
  collection?: string;
  category?: string;
}

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface OrderData {
  customerInfo: CustomerInfo;
  orderItems: OrderItem[];
  giftPackaging: boolean;
  giftNote?: string;
  shippingPrice: number;
  giftPackagingFee: number;
  totalPrice: number;
  paymentMethod: string;
  paymentDetails?: {
    paypalOrderId?: string;
    paypalPayerId?: string;
    paypalPaymentId?: string;
  };
}

// Generate unique order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MA-${timestamp.slice(-6)}${random}`;
};

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Save order to Supabase
const saveOrderToSupabase = async (orderData: OrderData, orderNumber: string) => {
  try {
    // Insert main order
    if (!supabaseAdmin) {
      throw new Error('Supabase is not configured.');
    }

    const { data: orderResult, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_email: orderData.customerInfo.email,
        customer_first_name: orderData.customerInfo.firstName,
        customer_last_name: orderData.customerInfo.lastName,
        customer_phone: orderData.customerInfo.phone,
        shipping_address: orderData.customerInfo.address,
        shipping_city: orderData.customerInfo.city,
        shipping_state: orderData.customerInfo.state,
        shipping_zip_code: orderData.customerInfo.zipCode,
        subtotal: orderData.totalPrice - orderData.shippingPrice - orderData.giftPackagingFee,
        shipping_fee: orderData.shippingPrice,
        gift_packaging_fee: orderData.giftPackagingFee,
        total_amount: orderData.totalPrice,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentDetails?.paypalOrderId ? 'completed' : 'pending',
        paypal_order_id: orderData.paymentDetails?.paypalOrderId,
        paypal_payer_id: orderData.paymentDetails?.paypalPayerId,
        paypal_payment_id: orderData.paymentDetails?.paypalPaymentId,
        order_status: 'confirmed',
        fulfillment_status: 'pending',
        gift_packaging: orderData.giftPackaging,
        gift_note: orderData.giftNote
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Order insert failed: ${orderError.message}`);
    }

    const orderId = orderResult.id;

    // Insert order items
    const orderItems = orderData.orderItems.map(item => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      product_sku: item.sku || `SKU-${item.id}`,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      size: item.size,
      color: item.color,
      product_collection: item.collection,
      product_category: item.category
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Order items insert failed: ${itemsError.message}`);
    }

    return orderId;
    
  } catch (error) {
    console.error('Supabase save error:', error);
    throw error;
  }
};

// Send comprehensive order confirmation email
const sendOrderConfirmationEmail = async (orderData: OrderData, orderNumber: string, orderId: number) => {
  try {
    const transporter = createTransporter();
    
    const orderTotal = orderData.totalPrice.toFixed(2);
    const itemsHtml = orderData.orderItems.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">
          <strong>${item.name}</strong><br>
          <small style="color: #666;">SKU: ${item.id} ${item.size ? `| Size: ${item.size}` : ''} ${item.color ? `| Color: ${item.color}` : ''}</small>
        </td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: center;">$${item.price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px;">
          <h1 style="color: #333; margin-bottom: 10px; font-size: 28px;">Mount Advertising</h1>
          <h2 style="color: #28a745; margin-bottom: 10px;">✅ Order Confirmed!</h2>
          <p style="color: #666; font-size: 16px;">Thank you for your purchase, ${orderData.customerInfo.firstName}!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Order Details</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Internal Order ID:</strong> #${orderId}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
          ${orderData.paymentDetails?.paypalOrderId ? `<p><strong>PayPal Transaction ID:</strong> ${orderData.paymentDetails.paypalOrderId}</p>` : ''}
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Shipping Address</h3>
          <p>${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}</p>
          <p>${orderData.customerInfo.address}</p>
          <p>${orderData.customerInfo.city}, ${orderData.customerInfo.state} ${orderData.customerInfo.zipCode}</p>
          <p>Phone: ${orderData.customerInfo.phone}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #e9ecef;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Order Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Subtotal:</span>
            <span>$${(orderData.totalPrice - orderData.shippingPrice - orderData.giftPackagingFee).toFixed(2)}</span>
          </div>
          ${orderData.shippingPrice > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Shipping:</span>
            <span>$${orderData.shippingPrice.toFixed(2)}</span>
          </div>` : ''}
          ${orderData.giftPackagingFee > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Gift Packaging:</span>
            <span>$${orderData.giftPackagingFee.toFixed(2)}</span>
          </div>` : ''}
          <hr style="margin: 10px 0; border: 1px solid #dee2e6;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
            <span>Total:</span>
            <span>$${orderTotal}</span>
          </div>
        </div>

        ${orderData.giftNote ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h4 style="color: #856404; margin-bottom: 10px;">🎁 Gift Note:</h4>
          <p style="color: #856404; margin: 0;">${orderData.giftNote}</p>
        </div>` : ''}

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Thank you for choosing Mount Advertising!</p>
          <p style="color: #666; font-size: 12px;">You will receive shipping information once your order is processed.</p>
          <p style="color: #666; font-size: 12px;">Questions? Contact us at ${process.env.ADMIN_EMAIL}</p>
        </div>
      </div>
    `;

    // Send to customer
    await transporter.sendMail({
      from: `"Mount Advertising" <${process.env.EMAIL_USER}>`,
      to: orderData.customerInfo.email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: htmlContent
    });

    // Send admin notification with enhanced details
    const adminHtml = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #28a745;">🛒 New Order Received!</h2>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Internal ID:</strong> #${orderId}</p>
        <p><strong>Customer:</strong> ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}</p>
        <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
        <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
        <p><strong>Total Amount:</strong> $${orderTotal}</p>
        <p><strong>Payment Status:</strong> ${orderData.paymentDetails?.paypalOrderId ? 'PAID via PayPal' : 'PENDING'}</p>
        
        <h3>Shipping Address:</h3>
        <p>${orderData.customerInfo.address}<br>
        ${orderData.customerInfo.city}, ${orderData.customerInfo.state} ${orderData.customerInfo.zipCode}</p>
        
        <h3>Order Items:</h3>
        ${orderData.orderItems.map(item => `
          <p>• ${item.name} (ID: ${item.id}) - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>
        `).join('')}
        
        ${orderData.giftNote ? `<p><strong>Gift Note:</strong> ${orderData.giftNote}</p>` : ''}
        
        <hr>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Check admin dashboard for order details</li>
          <li>Prepare items for shipping</li>
          <li>Update order status when shipped</li>
        </ol>
      </div>
    `;

    await transporter.sendMail({
      from: `"Mount Advertising Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🆕 New Order #${orderId} - ${orderNumber}`,
      html: adminHtml
    });

    console.log('Order confirmation emails sent successfully');
    
  } catch (error) {
    console.error('Failed to send order confirmation emails:', error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const orderData: OrderData = await request.json();

    // Validate required fields
    const { customerInfo, orderItems, totalPrice, paymentMethod } = orderData;
    
    if (!customerInfo?.email || !customerInfo?.firstName || !customerInfo?.lastName ||
        !customerInfo?.address || !customerInfo?.city || !customerInfo?.state || !customerInfo?.zipCode ||
        !orderItems?.length || !totalPrice || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Missing required order information' },
        { status: 400 }
      );
    }    // Generate unique order number
    const orderNumber = generateOrderNumber();
    
    // Save order to Supabase
    const orderId = await saveOrderToSupabase(orderData, orderNumber);
    
    // Send confirmation emails
    await sendOrderConfirmationEmail(orderData, orderNumber, orderId);
    
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderNumber,
        orderId,
        total: totalPrice
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}
