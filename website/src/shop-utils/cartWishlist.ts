// src/utils/cartWishlist.ts

// Types for cart items
export interface CartItem {
  id: string;
  name: string;
  price: string | number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  variant?: string;
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(cartItem => 
    cartItem.id === item.id && 
    cartItem.color === item.color && 
    cartItem.size === item.size
  );
  
  if (existingItemIndex !== -1) {
    // Update quantity if item already exists with same options
    const existingItem = cart[existingItemIndex];
    if (existingItem) {
      existingItem.quantity += item.quantity;
    }
  } else {
    // Add new item
    cart.push(item);
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Immediately dispatch event to update navbar and floating cart
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartWishlistUpdate'));
    window.dispatchEvent(new Event('cartUpdated'));
  }
  
  return cart;
}

export function updateCartItem(itemId: string, updates: Partial<CartItem>) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1) {
    const existingItem = cart[itemIndex];
    if (existingItem) {
      cart[itemIndex] = { ...existingItem, ...updates } as CartItem;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartWishlistUpdate'));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }
  
  return cart;
}

export function removeFromCart(itemId: string, options: { color?: string, size?: string } = {}) {
  let cart = getCart();
  
  if (options.color || options.size) {
    // Remove specific variant
    cart = cart.filter(item => 
      !(item.id === itemId && 
        (options.color ? item.color === options.color : true) && 
        (options.size ? item.size === options.size : true)
      )
    );
  } else {
    // Remove all items with this id
    cart = cart.filter(item => item.id !== itemId);
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Immediately dispatch event to update navbar and floating cart
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartWishlistUpdate'));
    window.dispatchEvent(new Event('cartUpdated'));
  }
  
  return cart;
}

export function getWishlist() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

export function addToWishlist(productId: string) {
  const wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    // Immediately dispatch event to update navbar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartWishlistUpdate'));
    }
  }
}

export function removeFromWishlist(productId: string) {
  const wishlist = getWishlist().filter((id: string) => id !== productId);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  // Immediately dispatch event to update navbar
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartWishlistUpdate'));
  }
}
