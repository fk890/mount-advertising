import Link from 'next/link';
import Image from 'next/image';
import styles from './product-card.module.scss';

interface ProductCardProps {
  href: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  badgeLabel?: string;
  showWishlist?: boolean;
  priority?: boolean;
}

const formatPrice = (value: number) => `₹ ${Math.round(value).toLocaleString('en-IN')}`;

export default function ProductCard({
  href,
  name,
  image,
  price,
  originalPrice,
  badgeLabel = '30% OFF',
  showWishlist = true,
  priority = false,
}: ProductCardProps) {
  const derivedOriginal = originalPrice ?? Math.round(price / 0.7);
  const dealPrice = Math.round(price * 0.7);

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.cardShell}>
        <div className={styles.imageWrap}>
          <Image
            src={image}
            alt={name}
            fill
            priority={priority}
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className={styles.badge}>{badgeLabel}</div>
          {showWishlist && <div className={styles.wishlist}>♡</div>}
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(price)}</span>
          <span className={styles.originalPrice}>{formatPrice(derivedOriginal)}</span>
        </div>
        <div className={styles.deal}>💚 Get it for {formatPrice(dealPrice)}</div>
      </div>
    </Link>
  );
}
