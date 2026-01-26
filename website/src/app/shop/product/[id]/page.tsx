import { Star } from 'lucide-react'
import { generateProductMetadata, generateProductJsonLd } from '@/shop-utils/productSeo';
import { Metadata } from 'next';
import { Product } from '@/shop-types/Product';
import ProductActions from './ProductActions';
import ProductGallery from './ProductGallery';
import ProductTabs from './ProductTabs';
import MobileProductPage from '@/shop-components/MobileProductPage';
import { getProductById } from '@/shop-utils/db/productsDb';

// Force dynamic rendering - disable static generation and caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This interface is needed for the page props
interface ProductPageProps {
  params: {
    id: string;
  };
}

// Adapter function to convert product data to the Product type
function adaptProduct(productData: Record<string, any>): Product {
  const images = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images
    : [productData.image || '/images/world.svg'];
  let price = productData.price;
  if (typeof price === 'string') {
    price = parseFloat(price.replace(/[$,]/g, ''));
  }

  let originalPrice = productData.originalPrice;
  if (typeof originalPrice === 'string') {
    originalPrice = parseFloat(originalPrice.replace(/[$,]/g, ''));
  }

  const details = {
    material: productData.specifications?.material || 'Pure Silver',
    gemstone: productData.specifications?.color || 'Mixed',
    weight: productData.specifications?.weight || '10g',
    dimensions: productData.specifications?.stoneDiameter || 'Standard'
  };

  let priceFormatted = '';
  if (typeof productData.price === 'number') {
    priceFormatted = `$${productData.price.toLocaleString()}`;
  } else if (typeof productData.price === 'string') {
    priceFormatted = productData.price;
  } else if (typeof price === 'number' && !isNaN(price)) {
    priceFormatted = `$${price.toLocaleString()}`;
  }

  return {
    ...(productData as object),
    id: productData.id,
    name: productData.name,
    description: productData.description,
    images: images,
    price: price,
    priceFormatted: priceFormatted,
    originalPrice: originalPrice,
    rating: productData.rating || 5,
    reviews: productData.reviews || 10,
    inStock: productData.stock > 0,
    tags: [productData.collection || 'advertising', 'premium', 'business', 'signage'],
    stock: productData.stock || (productData.inStock ? 10 : 0),
    details: details,
    category: productData.category || productData.collection?.toLowerCase() || 'jewelry',
    collection: productData.collection,
    articleNo: productData.articleNo,
    specifications: productData.specifications,
    createdAt: productData.createdAt || new Date().toISOString(),
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = params;
  const productData = await getProductById(id);

  if (!productData) {
    return {
      title: 'Product Not Found | Mount Advertising',
      description: 'The requested product could not be found.',
    }
  }

  const product = adaptProduct(productData);
  return generateProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Note: For server components, you don't need React.use() for params
  const { id } = params;
  const productData = await getProductById(id);

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-gray-500" style={{ background: '#f5f3ea' }}>
        Product not found
      </div>
    );
  }

  const product = adaptProduct(productData);

  return (
    <>
      <div className="lg:hidden">
        <MobileProductPage product={product} />
      </div>

      <div className="hidden lg:block min-h-screen bg-white">
        {product && (
          <>
            {generateProductJsonLd(product)}
          </>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            <ProductGallery product={product} />

            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>

              <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-3xl text-gray-900 font-semibold">
                    {product.priceFormatted}
                  </p>
                  {product.originalPrice && (
                    <p className="text-xl text-gray-500 line-through">
                      {typeof product.originalPrice === 'string' ? product.originalPrice : `$${product.originalPrice}`}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="sr-only">Reviews</h3>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <Star
                        key={rating}
                        className={`h-5 w-5 ${
                          (product.rating || 5) > rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="sr-only">{product.rating || 5} out of 5 stars</p>
                  <a href="#reviews" className="ml-3 text-sm font-medium text-gray-600 hover:text-gray-500">
                    {product.reviews || 10} reviews
                  </a>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <p className="text-base text-gray-900">{product.description}</p>
              </div>

              <div className="mt-10">
                <ProductActions product={product} />
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="space-y-4">
                  {product.collection && (
                    <div>
                      <span className="text-sm font-medium text-gray-900">Collection: </span>
                      <span className="text-sm text-gray-600">{product.collection}</span>
                    </div>
                  )}
                  {product.articleNo && (
                    <div>
                      <span className="text-sm font-medium text-gray-900">Article No: </span>
                      <span className="text-sm text-gray-600">{product.articleNo}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900">Availability: </span>
                    <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ProductTabs product={product} />
        </div>
      </div>
    </>
  );
}
