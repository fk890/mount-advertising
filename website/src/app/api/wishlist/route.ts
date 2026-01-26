import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const { data: wishlistItems, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          images,
          stock
        )
      `)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Wishlist fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch wishlist' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      wishlistItems: wishlistItems || []
    });
    
  } catch (error) {
    console.error('Wishlist API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json();
    
    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }
    
    // Check if item already exists in wishlist
    const { data: existingItem } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
      
    if (existingItem) {
      return NextResponse.json(
        { success: false, error: 'Item already in wishlist' },
        { status: 400 }
      );
    }
    
    // Add new item to wishlist
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: userId,
        product_id: productId
      })
      .select()
      .single();
      
    if (error) {
      console.error('Wishlist insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add to wishlist' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      wishlistItem: data,
      message: 'Item added to wishlist successfully'
    });
    
  } catch (error) {
    console.error('Wishlist API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    
    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
      
    if (error) {
      console.error('Wishlist delete error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove item from wishlist' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
    
  } catch (error) {
    console.error('Wishlist API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
