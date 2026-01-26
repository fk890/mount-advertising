import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// PayPal webhook event types
interface PayPalPaymentData {
  id?: string;
  status?: string;
  amount?: {
    value?: string;
    currency_code?: string;
  };
  payer?: {
    email_address?: string;
  };
  reason_code?: string;
}

interface PayPalWebhookEvent {
  event_type: string;
  resource: PayPalPaymentData;
}

// Email configuration
const createTransporter = () => {
  // Always use Gmail for real email sending
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generic send email function
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Mount Advertising" <${process.env.EMAIL_FROM || 'noreply@mountadvertising.com'}>`,
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    // We log the error but don't rethrow, as the webhook shouldn't fail if an email does.
  }
};

// PayPal webhook handler for Next.js API routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const webhookEvent: PayPalWebhookEvent = JSON.parse(body);
    
    // Get headers for signature verification (currently unused but needed for future verification)
    // const headers = {
    //   'paypal-transmission-id': request.headers.get('paypal-transmission-id'),
    //   'paypal-cert-id': request.headers.get('paypal-cert-id'),
    //   'paypal-auth-algo': request.headers.get('paypal-auth-algo'),
    //   'paypal-transmission-time': request.headers.get('paypal-transmission-time'),
    //   'paypal-transmission-sig': request.headers.get('paypal-transmission-sig'),
    // };

    console.log('PayPal webhook received:', webhookEvent.event_type);// In production, you should verify the webhook signature here
    // For now, we'll just log the event
    
    const eventType = webhookEvent.event_type;
    const paymentData = webhookEvent.resource;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mountadvertising.com';

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        console.log('Payment completed:', paymentData.id);
        
        // 1. Send admin notification
        const adminSubject = '💰 Payment Received - Mount Advertising';
        const adminHtmlContent = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>✅ Payment Received!</h2>
            <p>A new payment has been successfully processed.</p>
            <h3>Payment Details:</h3>
            <ul>
              <li><strong>Transaction ID:</strong> ${paymentData.id || 'N/A'}</li>
              <li><strong>Amount:</strong> $${paymentData.amount?.value || 'N/A'} ${paymentData.amount?.currency_code || 'USD'}</li>
              <li><strong>Status:</strong> ${paymentData.status || 'N/A'}</li>
              <li><strong>Payer Email:</strong> ${paymentData.payer?.email_address || 'N/A'}</li>
            </ul>
          </div>
        `;
        await sendEmail(adminEmail, adminSubject, adminHtmlContent);

        // 2. Send customer confirmation email
        const customerEmail = paymentData.payer?.email_address;
        if (customerEmail) {
          const customerSubject = '🎉 Your Mount Advertising Order is Confirmed!';
          const customerHtmlContent = `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4a4a4a; margin-bottom: 10px;">🎉 Thank You For Your Order!</h1>
                <p style="color: #666; font-size: 16px;">We've received your order and are getting it ready for shipment.</p>
              </div>
              <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #333; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Summary</h3>
                <p><strong>Transaction ID:</strong> ${paymentData.id || 'N/A'}</p>
                <p><strong>Amount Paid:</strong> $${paymentData.amount?.value || 'N/A'} ${paymentData.amount?.currency_code || 'USD'}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div style="margin-bottom: 30px;">
                  <h3 style="color: #333; margin-bottom: 20px;">What's Next?</h3>
                  <p style="color: #666;">You'll receive another email once your order has shipped. You can view your order history by logging into your account on our website.</p>
              </div>
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 14px;">Thank you for shopping with Mount Advertising</p>
              </div>
            </div>
          `;
          await sendEmail(customerEmail, customerSubject, customerHtmlContent);
        } else {
            console.error('Could not send customer confirmation: payer email not available.');
        }
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        console.log('Payment denied:', paymentData.id);
        const deniedSubject = '❌ Payment Denied - Mount Advertising';
        const deniedHtml = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>❌ Payment Denied</h2>
                <p>A payment attempt was denied. Details:</p>
                <p><strong>Transaction ID:</strong> ${paymentData.id || 'N/A'}</p>
                <p><strong>Reason:</strong> ${paymentData.reason_code || 'Unknown'}</p>
            </div>`;
        await sendEmail(adminEmail, deniedSubject, deniedHtml);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        console.log('Payment refunded:', paymentData.id);
        const refundedSubject = '🔄 Payment Refunded - Mount Advertising';
        const refundedHtml = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>🔄 Payment Refunded</h2>
                <p>A refund has been processed. Details:</p>
                <p><strong>Refund ID:</strong> ${paymentData.id || 'N/A'}</p>
                <p><strong>Amount:</strong> $${paymentData.amount?.value || 'N/A'} ${paymentData.amount?.currency_code || 'USD'}</p>
            </div>`;
        await sendEmail(adminEmail, refundedSubject, refundedHtml);
        break;
        
      default:
        console.log(`Unhandled PayPal webhook event: ${eventType}`);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
