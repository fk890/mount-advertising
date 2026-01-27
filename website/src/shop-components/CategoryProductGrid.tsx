"use client";

import ShowcaseProductCard from '@/shop-components/ShowcaseProductCard';
import { Product } from '@/shop-types/Product';

interface CategoryProductGridProps {
  products: Product[];
}

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
  const parsePrice = (price: string | number): number => {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    return parseFloat(String(price).replace(/[^\d.-]/g, ''));
  };

  return (
    <>
      {/* Products Count */}
      <div className="mb-8">
        <p className="text-sm text-gray-600" style={{ fontFamily: "var(--font-montserrat)" }}>
          {products.length} Results
        </p>
      </div>

      {/* Product Grid - Matching Bracelets Design */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[4px]">
        {products.map((product) => (
          <ShowcaseProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={parsePrice(product.price)}
            image={product.images?.[0] || product.image || '/images/world.svg'}
            images={product.images}
            isNew={product.isNew}
            colors={product.colors}
          />
        ))}
      </div>
    </>
  );
}
