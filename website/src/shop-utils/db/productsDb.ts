import { supabaseAdmin, isSupabaseConfigured } from '@/shop-utils/supabase/admin';

// Update Product interface for Mount Advertising products
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  originalPrice?: number | string;
  category: string;
  subcategory?: string;
  images: string[];
  stock: number;
  isNew?: boolean;
  specifications?: Record<string, string>;
  collection?: string;
  articleNo?: string;
  colors?: string[] | number;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  createdAt: string;
  priceFormatted?: string;
  image?: string;
  details: {
    material: string;
    size?: string;
    weight?: string;
    dimensions: string;
    [key: string]: string | undefined;
  };
  [key: string]: unknown;
}

// Valid categories for Mount Advertising
export const validCategories = ['neon-signage', 'led-boards', 'cafe', 'gaming', 'banners', 'displays'];

// Fallback products used when Supabase is not configured
const fallbackProducts: Product[] = [
  {
    id: 'cafe-pizza-sandwich-neon-sign',
    name: 'Pizza Sandwich Neon Sign',
    description: 'Bright, colorful pizza and sandwich neon sign perfect for cafes, restaurants, and food spaces. Durable LED neon flex with acrylic backing and easy wall mounting.',
    price: 4999,
    category: 'cafe',
    collection: 'cafe',
    images: ['/shop/Cafe_LED_4_1.webp'],
    stock: 25,
    rating: 4.9,
    reviews: 128,
    createdAt: new Date().toISOString(),
    details: {
      material: 'LED Neon Flex + Acrylic',
      dimensions: '18" x 12"',
      weight: 'N/A',
    },
    specifications: {
      Material: 'LED Neon Flex + Acrylic',
      Power: 'DC 12V',
      Warranty: '2 Years',
      Mounting: 'Wall Mount + Hanging Kit'
    }
  }
];

// Create new product
export async function createProduct(productData: Partial<Product>): Promise<Product> {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    throw new Error('Supabase is not configured.');
  }
  // Omit fields that are not in the database schema
  const { details, inStock, isNew, isFeatured, ...createData } = productData;

  const newProductData = {
    ...createData,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([newProductData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product in Supabase:', error);
    throw new Error('Failed to create product.');
  }

  return data as Product;
}

// Update product by ID
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    throw new Error('Supabase is not configured.');
  }
  // Omit fields that are not in the database schema to prevent errors
  const { details, inStock, isNew, isFeatured, ...updateData } = updates;

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product in Supabase:', error);
    throw new Error('Failed to update product.');
  }
  return data;
}

// Delete product by ID
export async function deleteProduct(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return false;
  }
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

  if (error) {
    console.error('Error deleting product in Supabase:', error);
    return false;
  }
  return true;
}

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return fallbackProducts;
  }
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching all products from Supabase:', error);
    throw new Error('Failed to fetch products.');
  }

  // Process the data to ensure it matches the Product interface
  const processedProducts = data.map(product => {
    // Ensure details property exists with required fields
    const details = product.specifications || {};

    return {
      ...product,
      details: {
        material: details.material || product.material || 'Gold',
        gemstone: details.gemstone || product.gemstone || 'Diamond',
        weight: details.weight || product.weight || '0.10 ct',
        dimensions: details.dimensions || product.dimensions || '15mm',
        ...details,
      },
    };
  });

  return processedProducts as Product[];
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return fallbackProducts.find(product => product.id === id) || null;
  }
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PostgREST error code for "Not a single row was returned"
      console.log(`Product with id ${id} not found.`);
      return null;
    }
    console.error(`Error fetching product ${id} from Supabase:`, error);
    throw new Error('Failed to fetch product.');
  }

  if (!data) return null;

  // Ensure details property exists with required fields
  const details = data.specifications || {};

  const processedProduct = {
    ...data,
    details: {
      material: details.material || data.material || 'Gold',
      gemstone: details.gemstone || data.gemstone || 'Diamond',
      weight: details.weight || data.weight || '0.10 ct',
      dimensions: details.dimensions || data.dimensions || '15mm',
      ...details,
    },
  };

  return processedProduct as Product;
}