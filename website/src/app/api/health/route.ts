import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'online',
        database: 'checking...',
        email: 'checking...',
        paypal: 'checking...'
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      configuration: {
        supabase: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        },
        admin: {
          email: !!process.env.ADMIN_EMAIL,
          password: !!process.env.ADMIN_PASSWORD
        },
        email: {
          user: !!process.env.EMAIL_USER,
          password: !!process.env.EMAIL_PASSWORD
        },
        paypal: {
          clientId: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
          clientSecret: !!process.env.PAYPAL_CLIENT_SECRET
        }
      }
    };

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'ADMIN_EMAIL',
      'ADMIN_PASSWORD'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      healthStatus.services.api = 'warning';
      healthStatus.status = 'degraded';
    }

    // Database connection check
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        healthStatus.services.database = 'configured';
      } else {
        healthStatus.services.database = 'not_configured';
        healthStatus.status = 'degraded';
      }
    } catch {
      healthStatus.services.database = 'offline';
      healthStatus.status = 'unhealthy';
    }

    // Email service check
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      healthStatus.services.email = 'configured';
    } else {
      healthStatus.services.email = 'not_configured';
    }

    // PayPal service check
    if (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
      healthStatus.services.paypal = 'configured';
    } else {
      healthStatus.services.paypal = 'not_configured';
    }

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 
              healthStatus.status === 'degraded' ? 200 : 503
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}