import React from "react";
import Link from "next/link";
import styles from "./shop-button.module.scss";

export const ShopButton = () => (
  <Link href="/shop" className={styles.shopButton}>
    <span>Shop</span>
  </Link>
);
