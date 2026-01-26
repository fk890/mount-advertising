export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  priceFormatted?: string;
  originalPrice?: number | string;
  images: string[];
  image?: string; // For backward compatibility
  collection?: string;
  category?: string;
  subcategory?: string;
  isNew?: boolean;
  rating?: number;
  reviews?: number;
  tags?: string[];
  colors?: string[] | number;
  stock: number;
  inStock?: boolean;
  articleNo?: string;
  specifications?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  details: {
    material: string;
    gemstone?: string;
    weight: string;
    dimensions: string;
    [key: string]: string | undefined;
  };
  // Allow additional properties
  [key: string]: unknown;
}
