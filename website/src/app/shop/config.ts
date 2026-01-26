/**
 * Mount Advertising Store Configuration
 * Premium signage and display solutions for businesses
 */

export const STORE_CONFIG = {
  name: "Mount Advertising",
  type: "advertising",
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_SHOP_API_URL || "http://localhost:3000",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Store branding
  branding: {
    title: "Mount Advertising",
    description: "Premium signage and display solutions for your business",
    logo: "/shop-logo.png",
  },
  
  // Product categories for advertising
  categories: [
    { id: "neon-signage", name: "Neon Signage" },
    { id: "led-boards", name: "LED Boards" },
    { id: "banners", name: "Banners" },
    { id: "displays", name: "Displays" },
  ],
  
  // Checkout configuration
  checkout: {
    enabled: true,
    currencies: ["USD"],
    paymentMethods: ["card", "bank_transfer"],
  },
};

/**
 * Get store configuration
 */
export function getStoreConfig() {
  return STORE_CONFIG;
}
