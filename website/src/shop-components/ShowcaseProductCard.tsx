'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface ShowcaseProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  isNew?: boolean;
  colors?: string[] | number;
  index?: number;
  href?: string;
}

export default function ShowcaseProductCard({
  id,
  name,
  price,
  image,
  images = [],
  isNew = false,
  index = 0,
  href,
}: ShowcaseProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryImage = images[0] || image || '/shop/customise-your-own.webp';
  const secondaryImage = images[1] || null;

  const formatPrice = (amount: number) => '₹ ' + amount.toLocaleString('en-IN');
  const discountedPrice = Math.round(price * 0.7);
  const formattedPrice = formatPrice(discountedPrice);
  const formattedOriginalPrice = formatPrice(price);
  const savingsPrice = formatPrice(Math.round(discountedPrice * 0.7));

  const resolvedHref = href
    || (id.startsWith('cafe-')
      ? `/shop/cafe/${id}`
      : id.startsWith('gaming-')
        ? `/shop/gaming/${id}`
        : `/shop/product/${id}`);

  return (
    <>
      <Link href={resolvedHref} className="group block">
        {/* White Card with Square Image */}
        <div 
          className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Square Image Container */}
          <div className="relative w-full" style={{ paddingBottom: '100%' }}>
            <Image
              src={isHovered && secondaryImage ? secondaryImage : primaryImage}
              alt={name}
              fill
              className="object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 4}
              quality={90}
            />

            {/* 30% OFF Badge */}
            <div className="absolute top-3 left-3 bg-[#c8ff00] text-black text-[11px] font-bold px-2.5 py-1 rounded z-10">
              30% OFF
            </div>
          </div>
        </div>

        {/* Product Info Below Card */}
        <div className="mt-3">
          <h3 className="text-sm font-medium text-white line-clamp-1">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-white">{formattedPrice}</span>
            <span className="text-xs text-gray-500 line-through">{formattedOriginalPrice}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[11px] text-green-500">💚 Get it for {savingsPrice}</span>
          </div>
        </div>
      </Link>
    </>
  );
}
