'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion';

interface SpringSummerBannerProps {
  imagePath: string;
}

export default function SpringSummerBanner({ imagePath }: SpringSummerBannerProps) {
  return (
    <motion.div
      className="block group text-left h-full"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="bg-white flex flex-col relative overflow-hidden h-full">
        <div className="relative w-full h-full">
          <Image
            src={imagePath}
            alt="Spring-Summer Collection"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6">
            <div className="text-white">
              <h3 className="text-2xl md:text-3xl font-light tracking-wider drop-shadow-lg">Spring-Summer 2025</h3>
              <p className="mt-1 text-sm md:text-base font-light drop-shadow-md max-w-xs">
                Where the transformative power of crystal shines.
              </p>
            </div>
            <div className="mt-4">
              <Link href="/shop/neon-signage" className="inline-block">
                <div className="bg-white text-black px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors duration-300">
                  Shop now
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
