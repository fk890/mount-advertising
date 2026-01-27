import { Product } from '@/shop-types/Product';

export interface BrowserHistoryItem {
  id: string;
  name: string;
  image: string;
  price: number;
  collection?: string;
  category?: string;
  timestamp: number;
}

const HISTORY_KEY = 'mount_advertising_browser_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Get the user's browsing history
 */
export function getBrowsingHistory(): BrowserHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Error reading browsing history:', error);
    return [];
  }
}

/**
 * Add a product to browsing history
 */
export function addToBrowsingHistory(product: Product | BrowserHistoryItem) {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getBrowsingHistory();
    
    // Create history item
    const historyItem: BrowserHistoryItem = {
      id: product.id,
      name: product.name,
      image: typeof product.image === 'string'
        ? product.image
        : ('images' in product && Array.isArray(product.images) && product.images.length > 0)
          ? (product.images[0] ?? '/images/world.svg')
          : '/images/world.svg',
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      collection: product.collection,
      category: product.category,
      timestamp: Date.now()
    };
    
    // Remove existing entry of the same product
    const filteredHistory = history.filter(item => item.id !== product.id);
    
    // Add new item to the front
    const newHistory = [historyItem, ...filteredHistory];
    
    // Limit size
    const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
    
    // Save to localStorage
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    
    // Dispatch event to notify components
    window.dispatchEvent(new Event('browsing_history_update'));
    
    return trimmedHistory;
  } catch (error) {
    console.error('Error adding to browsing history:', error);
    return getBrowsingHistory();
  }
}

/**
 * Clear all browsing history
 */
export function clearBrowsingHistory(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event('browsing_history_update'));
}

/**
 * Remove a single item from browsing history
 */
export function removeFromBrowsingHistory(productId: string): BrowserHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = getBrowsingHistory();
    const filteredHistory = history.filter(item => item.id !== productId);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
    window.dispatchEvent(new Event('browsing_history_update'));
    
    return filteredHistory;
  } catch (error) {
    console.error('Error removing from browsing history:', error);
    return getBrowsingHistory();
  }
}
