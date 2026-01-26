import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
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

// Send order confirmation email to customer
const sendOrderConfirmationEmail = async (orderData: OrderData, orderNumber: string) => {
  try {
    const transporter = createTransporter();
    
    const orderTotal = orderData.totalPrice.toFixed(2);
    const itemsHtml = orderData.orderItems.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">${item.name}</td>
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
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
          ${orderData.paymentDetails?.paypalOrderId ? `<p><strong>PayPal Transaction ID:</strong> ${orderData.paymentDetails.paypalOrderId}</p>` : ''}
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Shipping Address</h3>
          <p>${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}</p>
          <p>${orderData.customerInfo.address}</p>
          <p>${orderData.customerInfo.city}, ${orderData.customerInfo.state} ${orderData.customerInfo.zipCode}</p>
          <p>${orderData.customerInfo.phone}</p>
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
          
          <div style="margin-top: 20px; text-align: right;">
            <p style="margin: 5px 0;"><strong>Subtotal: $${(orderData.totalPrice - orderData.giftPackagingFee).toFixed(2)}</strong></p>
            ${orderData.giftPackaging ? `<p style="margin: 5px 0;">Gift Packaging: $${orderData.giftPackagingFee.toFixed(2)}</p>` : ''}
            <p style="margin: 5px 0;">Shipping: FREE</p>
            <p style="margin: 15px 0 0 0; font-size: 18px; color: #28a745;"><strong>Total: $${orderTotal}</strong></p>
          </div>
        </div>

        ${orderData.giftNote ? `
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin-bottom: 10px;">🎁 Gift Note</h3>
          <p style="color: #856404; font-style: italic;">"${orderData.giftNote}"</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
            We'll send you a shipping confirmation with tracking information once your order ships.
          </p>
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #007bff;">${process.env.ADMIN_EMAIL}</a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Thank you for choosing Mount Advertising!
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Mount Advertising" <${process.env.EMAIL_FROM}>`,
      to: orderData.customerInfo.email,
      subject: `✅ Order Confirmation #${orderNumber} - Mount Advertising`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${orderData.customerInfo.email}`);
    
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
  }
};

// Send order notification to admin
const sendAdminOrderNotification = async (orderData: OrderData, orderNumber: string) => {
  try {
    const transporter = createTransporter();
    
    const itemsList = orderData.orderItems.map(item => 
      `• ${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #28a745; margin-bottom: 10px;">🛍️ New Order Received!</h1>
          <p style="color: #666; font-size: 16px;">A new order has been placed on Mount Advertising</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Order Information</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Amount:</strong> $${orderData.totalPrice.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
          ${orderData.paymentDetails?.paypalOrderId ? `<p><strong>PayPal Transaction:</strong> ${orderData.paymentDetails.paypalOrderId}</p>` : ''}
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Customer Information</h3>
          <p><strong>Name:</strong> ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}</p>
          <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
          <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
          <p><strong>Address:</strong> ${orderData.customerInfo.address}, ${orderData.customerInfo.city}, ${orderData.customerInfo.state} ${orderData.customerInfo.zipCode}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
          <pre style="background: white; padding: 15px; border-radius: 5px; overflow-x: auto;">${itemsList}</pre>
          ${orderData.giftPackaging ? '<p><strong>🎁 Gift Packaging:</strong> Requested</p>' : ''}
          ${orderData.giftNote ? `<p><strong>🎁 Gift Note:</strong> "${orderData.giftNote}"</p>` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">Mount Advertising Admin Notification</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Mount Advertising" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛍️ New Order #${orderNumber} - $${orderData.totalPrice.toFixed(2)}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Admin order notification sent');
    
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();
    
    // Validate required fields
    if (!orderData.customerInfo || !orderData.orderItems || orderData.orderItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `MA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // In a real application, you would save this to a database
    // For now, we'll just log it and send emails
    console.log('📦 New order received:', {
      orderNumber,
      customer: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
      email: orderData.customerInfo.email,
      total: orderData.totalPrice,
      items: orderData.orderItems.length,
      paymentMethod: orderData.paymentMethod
    });

    // Send confirmation emails
    await Promise.all([
      sendOrderConfirmationEmail(orderData, orderNumber),
      sendAdminOrderNotification(orderData, orderNumber)
    ]);

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderNumber: orderNumber,
      data: {
        orderNumber,
        customerEmail: orderData.customerInfo.email,
        totalAmount: orderData.totalPrice,
        orderDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Order processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process order' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
