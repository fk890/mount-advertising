import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
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
  image?: string;
  customization?: {
    text?: string;
    font?: string;
    color?: string;
    boardType?: string;
    dimensions?: string;
    hasCustomDesign?: boolean;
    notes?: string;
    addOns?: string[];
  };
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
  promoCode?: string;
  promoDiscount?: number;
  totalPrice: number;
  paymentMethod: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderNumber: string;
}

// Verify Razorpay payment signature
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  
  return expectedSignature === signature;
}

// Upload custom design image to Supabase Storage
async function uploadCustomDesign(base64Image: string, orderNumber: string, itemIndex: number): Promise<string | null> {
  try {
    if (!base64Image || !base64Image.startsWith('data:image')) {
      return null;
    }

    // Extract base64 data
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches || !matches[2]) return null;

    const extension = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `custom-designs/${orderNumber}-item-${itemIndex}.${extension}`;

    if (!supabaseAdmin) {
      return null;
    }

    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: `image/${extension}`,
        upsert: true,
      });

    if (error) {
      console.error('Failed to upload custom design:', error);
      return null;
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Custom design upload error:', error);
    return null;
  }
}

// Save order to Supabase
async function saveOrderToSupabase(orderData: OrderData) {
  try {
    // Insert main order
    if (!supabaseAdmin) {
      throw new Error('Supabase is not configured.');
    }

    const { data: orderResult, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderData.orderNumber,
        customer_email: orderData.customerInfo.email,
        customer_first_name: orderData.customerInfo.firstName,
        customer_last_name: orderData.customerInfo.lastName,
        customer_phone: orderData.customerInfo.phone,
        shipping_address: orderData.customerInfo.address,
        shipping_city: orderData.customerInfo.city,
        shipping_state: orderData.customerInfo.state,
        shipping_zip_code: orderData.customerInfo.zipCode,
        subtotal: orderData.totalPrice - orderData.shippingPrice - orderData.giftPackagingFee + (orderData.promoDiscount || 0),
        shipping_fee: orderData.shippingPrice,
        gift_packaging_fee: orderData.giftPackagingFee,
        promo_code: orderData.promoCode,
        promo_discount: orderData.promoDiscount,
        total_amount: orderData.totalPrice,
        payment_method: orderData.paymentMethod,
        payment_status: 'completed',
        razorpay_order_id: orderData.razorpayOrderId,
        razorpay_payment_id: orderData.razorpayPaymentId,
        razorpay_signature: orderData.razorpaySignature,
        order_status: 'confirmed',
        fulfillment_status: 'pending',
        gift_packaging: orderData.giftPackaging,
        gift_note: orderData.giftNote,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Order insert failed: ${orderError.message}`);
    }

    const orderId = orderResult.id;

    // Process and insert order items with custom designs
    const orderItems = await Promise.all(
      orderData.orderItems.map(async (item, index) => {
        let customDesignUrl = null;
        
        // Upload custom design if exists
        if (item.image && item.image.startsWith('data:image')) {
          customDesignUrl = await uploadCustomDesign(item.image, orderData.orderNumber, index);
        }

        return {
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
          product_category: item.category,
          customization: item.customization || null,
          custom_design_url: customDesignUrl,
        };
      })
    );

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Order items insert failed: ${itemsError.message}`);
    }

    return { orderId, orderItems };
  } catch (error) {
    console.error('Supabase save error:', error);
    throw error;
  }
}

// Email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send confirmation emails
async function sendConfirmationEmails(orderData: OrderData, orderId: string, orderItems: any[]) {
  const transporter = createTransporter();
  const orderTotal = orderData.totalPrice.toFixed(2);

  // Build items HTML with custom order details
  const itemsHtml = orderData.orderItems.map((item, index) => {
    const savedItem = orderItems[index];
    let customDetails = '';
    
    if (item.customization) {
      customDetails = `
        <div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border-radius: 4px; font-size: 12px;">
          <strong>Custom Order Details:</strong><br>
          ${item.customization.text ? `Text: "${item.customization.text}"<br>` : ''}
          ${item.customization.font ? `Font: ${item.customization.font}<br>` : ''}
          ${item.customization.color ? `Color: ${item.customization.color}<br>` : ''}
          ${item.customization.boardType ? `Board Type: ${item.customization.boardType}<br>` : ''}
          ${item.customization.dimensions ? `Size: ${item.customization.dimensions}<br>` : ''}
          ${item.customization.notes ? `Notes: ${item.customization.notes}<br>` : ''}
          ${item.customization.addOns?.length ? `Add-ons: ${item.customization.addOns.join(', ')}<br>` : ''}
          ${savedItem.custom_design_url ? `<a href="${savedItem.custom_design_url}" style="color: #2563eb;">View Custom Design</a>` : ''}
        </div>
      `;
    }

    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">
          <strong>${item.name}</strong><br>
          <small style="color: #666;">
            SKU: ${item.id} 
            ${item.size ? `| Size: ${item.size}` : ''} 
            ${item.color ? `| Color: ${item.color}` : ''}
          </small>
          ${customDetails}
        </td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: center;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  // Customer email
  const customerHtml = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px;">
        <h1 style="color: #333; margin-bottom: 10px; font-size: 28px;">Mount Advertising</h1>
        <h2 style="color: #28a745; margin-bottom: 10px;">✅ Order Confirmed!</h2>
        <p style="color: #666; font-size: 16px;">Thank you for your purchase, ${orderData.customerInfo.firstName}!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-bottom: 15px;">Order Details</h3>
        <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> Razorpay</p>
        <p><strong>Payment ID:</strong> ${orderData.razorpayPaymentId}</p>
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
          <span>₹${(orderData.totalPrice - orderData.shippingPrice - orderData.giftPackagingFee + (orderData.promoDiscount || 0)).toFixed(2)}</span>
        </div>
        ${orderData.shippingPrice > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Shipping:</span>
          <span>₹${orderData.shippingPrice.toFixed(2)}</span>
        </div>` : ''}
        ${orderData.giftPackagingFee > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Gift Packaging:</span>
          <span>₹${orderData.giftPackagingFee.toFixed(2)}</span>
        </div>` : ''}
        ${orderData.promoDiscount ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #22c55e;">
          <span>Promo Discount (${orderData.promoCode}):</span>
          <span>-₹${orderData.promoDiscount.toFixed(2)}</span>
        </div>` : ''}
        <hr style="margin: 10px 0; border: 1px solid #dee2e6;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
          <span>Total:</span>
          <span>₹${orderTotal}</span>
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

  // Admin notification with custom design links
  const customOrdersSection = orderData.orderItems.some(item => item.customization) ? `
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h3 style="color: #92400e; margin: 0 0 10px 0;">⚠️ CUSTOM ORDER - Requires Attention</h3>
      ${orderData.orderItems.map((item, index) => {
        if (!item.customization) return '';
        const savedItem = orderItems[index];
        return `
          <div style="background: white; padding: 10px; border-radius: 4px; margin-top: 10px;">
            <strong>${item.name}</strong><br>
            ${item.customization.text ? `<em>Text:</em> "${item.customization.text}"<br>` : ''}
            ${item.customization.font ? `<em>Font:</em> ${item.customization.font}<br>` : ''}
            ${item.customization.color ? `<em>Color:</em> ${item.customization.color}<br>` : ''}
            ${item.customization.boardType ? `<em>Board Type:</em> ${item.customization.boardType}<br>` : ''}
            ${item.customization.dimensions ? `<em>Dimensions:</em> ${item.customization.dimensions}<br>` : ''}
            ${item.customization.notes ? `<em>Notes:</em> ${item.customization.notes}<br>` : ''}
            ${item.customization.addOns?.length ? `<em>Add-ons:</em> ${item.customization.addOns.join(', ')}<br>` : ''}
            ${savedItem.custom_design_url ? `<a href="${savedItem.custom_design_url}" style="color: #2563eb; font-weight: bold;">📎 VIEW UPLOADED DESIGN</a>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  ` : '';

  const adminHtml = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #28a745;">🛒 New Order Received!</h2>
      <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
      <p><strong>Customer:</strong> ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}</p>
      <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
      <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
      <p><strong>Total Amount:</strong> ₹${orderTotal}</p>
      <p><strong>Payment Status:</strong> ✅ PAID via Razorpay</p>
      <p><strong>Razorpay Payment ID:</strong> ${orderData.razorpayPaymentId}</p>
      
      ${customOrdersSection}
      
      <h3>Shipping Address:</h3>
      <p>${orderData.customerInfo.address}<br>
      ${orderData.customerInfo.city}, ${orderData.customerInfo.state} ${orderData.customerInfo.zipCode}</p>
      
      <h3>Order Items:</h3>
      ${orderData.orderItems.map((item, index) => {
        const savedItem = orderItems[index];
        return `
          <p>• ${item.name} (ID: ${item.id}) - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}
          ${item.customization?.hasCustomDesign && savedItem.custom_design_url ? `<br>&nbsp;&nbsp;📎 <a href="${savedItem.custom_design_url}">View Design</a>` : ''}</p>
        `;
      }).join('')}
      
      ${orderData.giftNote ? `<p><strong>Gift Note:</strong> ${orderData.giftNote}</p>` : ''}
      
      <hr>
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Check admin dashboard for order details</li>
        ${orderData.orderItems.some(item => item.customization) ? '<li><strong>Review custom order designs</strong></li>' : ''}
        <li>Prepare items for shipping</li>
        <li>Update order status when shipped</li>
      </ol>
    </div>
  `;

  try {
    // Send customer email
    await transporter.sendMail({
      from: `"Mount Advertising" <${process.env.EMAIL_USER}>`,
      to: orderData.customerInfo.email,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      html: customerHtml,
    });

    // Send admin email
    await transporter.sendMail({
      from: `"Mount Advertising Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🆕 New Order ${orderData.orderNumber} - ₹${orderTotal}${orderData.orderItems.some(item => item.customization) ? ' ⚠️ CUSTOM ORDER' : ''}`,
      html: adminHtml,
    });

    console.log('Order confirmation emails sent successfully');
  } catch (error) {
    console.error('Failed to send emails:', error);
    // Don't throw - order is already saved
  }
}

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
    const {
      customerInfo,
      orderItems,
      totalPrice,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderNumber,
    } = orderData;

    if (!customerInfo?.email || !customerInfo?.firstName || !customerInfo?.lastName ||
        !customerInfo?.address || !customerInfo?.city || !customerInfo?.state || !customerInfo?.zipCode ||
        !orderItems?.length || !totalPrice || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, message: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Save order to Supabase
    const { orderId, orderItems: savedItems } = await saveOrderToSupabase(orderData);

    // Send confirmation emails
    await sendConfirmationEmails(orderData, orderId, savedItems);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderNumber,
        orderId,
        total: totalPrice,
      },
    });

  } catch (error) {
    console.error('Order verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process order' },
      { status: 500 }
    );
  }
}
