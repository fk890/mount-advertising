import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { isAuthenticated, isAdmin } from '@/shop-utils/authUtils';
import { getAllProducts, createProduct } from '@/shop-utils/db/productsDb';
import type { Product } from '@/shop-utils/db/productsDb';
import { jwtVerify } from 'jose';

async function verifyAdmin(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get('admin-token')?.value;
    if (!token) return false;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        await jwtVerify(token, secret);
        return true;
    } catch (error) {
        return false;
    }
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch all products from our database
    const products = await getAllProducts();
    
    // Format products for admin panel (fixing image compatibility)
    const formattedProducts = products.map((product: Product) => ({
      ...product,
      // Ensure image property exists for admin panel compatibility
      image: product.images && product.images.length > 0 ? product.images[0] : '/images/world.svg'
    }));
    
    return NextResponse.json({ products: formattedProducts });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'category'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
      // Ensure the data has the correct format for our database
    const productData = {
      ...data,
      // Add other fields that might be needed for consistency
      
      // Handle images - keep them as uploaded
      images: Array.isArray(data.images) ? data.images : [],
      
      // Convert price to number if it's a string
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price
    };
    
    // Save the product to our database
    const newProduct = await createProduct(productData);
    
    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
