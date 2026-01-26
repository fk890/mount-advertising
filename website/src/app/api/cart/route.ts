import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Get user's cart
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
    
    const { data: cartItems, error } = await supabase
      .from('cart_items')
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
      console.error('Cart fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch cart' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      cartItems: cartItems || []
    });
    
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity = 1, size, color } = await request.json();
    
    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }
    
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('size', size || '')
      .eq('color', color || '')
      .single();
      
    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();
        
      if (error) {
        console.error('Cart update error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update cart' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        cartItem: data,
        message: 'Cart updated successfully'
      });
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          size: size || null,
          color: color || null
        })
        .select()
        .single();
        
      if (error) {
        console.error('Cart insert error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to add to cart' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        cartItem: data,
        message: 'Item added to cart successfully'
      });
    }
    
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update cart item
export async function PUT(request: NextRequest) {
  try {
    const { cartItemId, quantity } = await request.json();
    
    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Cart item ID and quantity are required' },
        { status: 400 }
      );
    }
    
    if (quantity <= 0) {
      // Delete item if quantity is 0 or less
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);
        
      if (error) {
        console.error('Cart delete error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to remove item from cart' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      });
    } else {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId)
        .select()
        .single();
        
      if (error) {
        console.error('Cart update error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update cart' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        cartItem: data,
        message: 'Cart updated successfully'
      });
    }
    
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');
    
    if (!cartItemId) {
      return NextResponse.json(
        { success: false, error: 'Cart item ID is required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
      
    if (error) {
      console.error('Cart delete error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove item from cart' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
    
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
