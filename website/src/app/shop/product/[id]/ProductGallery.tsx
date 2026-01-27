'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/shop-types/Product'

interface ProductGalleryProps {
  product: Product
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const images = product.images && product.images.length > 0 ? product.images : ['/images/world.svg']
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsZoomed(true)
  }

  const handleZoomClose = useCallback(() => {
    setIsZoomed(false)
  }, [])

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const currentImage = images[selectedImageIndex] ?? images[0] ?? '/images/world.svg';

  return (
    <>
      <div className="lg:col-span-1">        {/* Main Product Image */}
        <div 
          className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 mb-4 group cursor-zoom-in"
          onClick={() => handleImageClick(selectedImageIndex)}
        >          <Image
          src={currentImage}
          alt={`${product.name} - High-quality advertising product from Mount Advertising, view ${selectedImageIndex + 1} of ${images.length}`}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
        </div>
        
        {/* Thumbnail Images */}
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square relative overflow-hidden rounded-lg bg-gray-100 border-2 transition-all duration-300 hover:scale-105 ${
                selectedImageIndex === index ? 'border-gray-900 shadow-lg' : 'border-transparent hover:border-gray-300'
              }`}
            >              <Image
                src={image}
                alt={`${product.name} detailed view ${index + 1} - Mount Advertising product from different angle`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Modal / Lightbox */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={handleZoomClose}
        >
          {/* Close Button */}
          <button
            onClick={handleZoomClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[60]"
            aria-label="Close image viewer"
          >
            <X className="h-10 w-10" />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[60] bg-black/30 rounded-full p-2"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[60] bg-black/30 rounded-full p-2"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          {/* Image Container */}
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center">
            <Image
              src={currentImage}
              alt={`${product.name} - High-quality advertising product from Mount Advertising, view ${selectedImageIndex + 1} of ${images.length}`}
              fill
              className="object-contain object-center"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  )
}
