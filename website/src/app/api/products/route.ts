import { NextRequest, NextResponse } from 'next/server';

// Fallback products served from local code (ensure images are in public/shop/)
const fallbackProducts: Array<{
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  collection: string;
  rating: number;
  reviews: number;
  stock: number;
  details: Record<string, string>;
}> = [
  {
    id: 'cafe-pizza-sandwich-neon-sign',
    name: 'Pizza Sandwich Neon Sign',
    description: 'Bright, colorful pizza and sandwich neon sign perfect for cafes, restaurants, and food spaces. Durable LED neon flex with acrylic backing and easy wall mounting.',
    price: 4999,
    images: ['/shop/Cafe_LED_4_1.webp'],
    category: 'cafe',
    collection: 'cafe',
    rating: 4.9,
    reviews: 128,
    stock: 25,
    details: {
      Material: 'LED Neon Flex + Acrylic',
      Power: 'DC 12V',
      Warranty: '2 Years',
      Mounting: 'Wall Mount + Hanging Kit'
    }
  },
  {
    id: 'cafe-open-sign',
    name: 'Open / Close Cafe Sign',
    description: 'Double-sided open/close neon sign with warm white glow. Perfect for cafes and bakeries that want clear storefront visibility.',
    price: 4299,
    images: ['/shop/Cafe_LED_4_1.webp'],
    category: 'cafe',
    collection: 'cafe',
    rating: 4.8,
    reviews: 87,
    stock: 18,
    details: {
      Material: 'LED Neon Flex + Acrylic',
      Power: 'DC 12V',
      Warranty: '2 Years',
      Mounting: 'Wall Mount + Hanging Kit'
    }
  },
  {
    id: 'cafe-coffee-steam',
    name: 'Coffee Cup Steam Neon',
    description: 'Minimal coffee cup with steam neon art sized for counters or window displays. Soft amber and white tones for cozy vibes.',
    price: 3799,
    images: ['/shop/Cafe_LED_4_1.webp'],
    category: 'cafe',
    collection: 'cafe',
    rating: 4.7,
    reviews: 64,
    stock: 22,
    details: {
      Material: 'LED Neon Flex + Acrylic',
      Power: 'DC 12V',
      Warranty: '2 Years',
      Mounting: 'Wall Mount + Hanging Kit'
    }
  }
];

// Categories for Mount Advertising
const validCategories = ['neon-signage', 'led-boards', 'cafe', 'gaming', 'banners', 'displays'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    const id = searchParams.get('id');
    
    // Pagination defaults
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20; // Default 20 products per page
    const offset = (pageNum - 1) * limitNum;
    const normalizedCategory = categoryParam ? categoryParam.trim().toLowerCase() : null;

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const filtered = normalizedCategory
        ? fallbackProducts.filter(product => {
            const categoryValue = product.category?.toLowerCase() || ''
            const collectionValue = product.collection?.toLowerCase() || ''
            return categoryValue === normalizedCategory || collectionValue === normalizedCategory
          })
        : fallbackProducts;
      const paginated = filtered.slice(offset, offset + limitNum);

      if (id) {
        const product = fallbackProducts.find(item => item.id === id);
        if (!product) {
          return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, products: [product], source: 'mock' });
      }

      return NextResponse.json({
        success: true,
        products: paginated,
        total: filtered.length,
        page: pageNum,
        totalPages: Math.ceil(filtered.length / limitNum),
        source: 'mock'
      });
    }

    // Use Supabase if configured
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      // First get total count for pagination
      let countQuery = supabase.from('products').select('*', { count: 'exact', head: true });
      if (normalizedCategory) {
        countQuery = countQuery.or(`category.ilike.${normalizedCategory},collection.ilike.${normalizedCategory}`);
      }
      const { count: totalCount } = await countQuery;

      let query = supabase.from('products').select('*');

      if (id) {
        const { data, error } = await query.eq('id', id).single();
        if (error) {
          if (error.code === 'PGRST116') {
            // Fallback to local products when Supabase has no matching record
            const fallback = fallbackProducts.find((item) => item.id === id);
            if (fallback) {
              return NextResponse.json({ success: true, products: [fallback], source: 'mock' });
            }
            return NextResponse.json({ success: false, error: 'Product not found', products: [] }, { status: 404 });
          }
          throw error;
        }
        // Return as array for consistency with product pages
        return NextResponse.json({ success: true, products: [data] });
      }

      if (normalizedCategory) {
        query = query.or(`category.ilike.${normalizedCategory},collection.ilike.${normalizedCategory}`);
      }

      // Apply pagination
      query = query.range(offset, offset + limitNum - 1);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // If Supabase is empty for the requested slice/category, serve local fallbacks so pages are not blank
      const fallbackWhenEmpty = data.length === 0
        ? (normalizedCategory
            ? fallbackProducts.filter((item) => {
                const categoryValue = item.category?.toLowerCase() || '';
                const collectionValue = item.collection?.toLowerCase() || '';
                return categoryValue === normalizedCategory || collectionValue === normalizedCategory;
              })
            : fallbackProducts)
        : [];

      const productsToReturn = data.length > 0 ? data : fallbackWhenEmpty;

      return NextResponse.json({ 
        success: true, 
        products: productsToReturn, 
        total: totalCount || productsToReturn.length,
        page: pageNum,
        totalPages: Math.ceil((totalCount || productsToReturn.length) / limitNum),
        source: data.length > 0 ? 'supabase' : 'mock'
      });

    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);
      const filteredFallback = normalizedCategory
        ? fallbackProducts.filter(product => {
            const categoryValue = product.category?.toLowerCase() || ''
            const collectionValue = product.collection?.toLowerCase() || ''
            return categoryValue === normalizedCategory || collectionValue === normalizedCategory
          })
        : fallbackProducts;
      const errorMessage = supabaseError instanceof Error ? supabaseError.message : 'An unknown database error occurred';
      return NextResponse.json(
        { success: true, products: filteredFallback, total: filteredFallback.length, source: 'mock', details: errorMessage },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Products API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: false,
      message: 'Products should be created through the admin API'
    }, { status: 403 });
    
  } catch (error) {
    console.error('Create product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to create product', details: errorMessage },
      { status: 500 }
    );
  }
}