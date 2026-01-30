"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import styles from "./search.module.scss";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams ? searchParams.get("q") || "" : "";
  const [searchInput, setSearchInput] = useState(query);
  type SearchResult = {
    id: string;
    name: string;
    collection: string;
    category?: string;
    price: number | string;
    images?: string[];
  };

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError("");
    
    // Try API search first, fallback to products endpoint
    fetch(`/api/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success || data.products) {
          const products: SearchResult[] = (data.products || []) as SearchResult[];
          const filtered = products.filter((p) => 
            p.name?.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase()) ||
            p.category?.toLowerCase().includes(query.toLowerCase())
          );
          // Deduplicate products by ID
          const uniqueResults: SearchResult[] = Array.from(
            new Map(filtered.map((p) => [p.id, p])).values()
          );
          setResults(uniqueResults);
        } else {
          setError("No results found.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch search results.");
        setLoading(false);
      });
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/shop/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    router.push("/shop/search");
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(String(price).replace(/[₹$,]/g, '')) || 0;
    return '₹ ' + numPrice.toLocaleString('en-IN');
  };

  const getProductLink = (product: any) => {
    if (product.id.startsWith('cafe-')) return `/shop/cafe/${product.id}`;
    if (product.id.startsWith('gaming-')) return `/shop/gaming/${product.id}`;
    return `/shop/product/${product.id}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Search Header */}
        <div className={styles.header}>
          <h1 className={styles.title} style={{ fontFamily: 'var(--font-basement-grotesque)' }}>
            Search Products
          </h1>
          
          {/* Search Input */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for neon signs, LED boards, banners..."
                className={styles.searchInput}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={styles.clearButton}
                >
                  <X style={{ width: 20, height: 20 }} />
                </button>
              )}
            </div>
          </form>

          {query && (
            <p className={styles.queryLabel}>
              Showing results for: <span className={styles.queryHighlight}>&quot;{query}&quot;</span>
            </p>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className={styles.statusRow}>
            <div className={styles.spinner}></div>
          </div>
        ) : error ? (
          <div className={styles.message}>
            <p className={styles.errorText}>{error}</p>
          </div>
        ) : !query ? (
          <div className={styles.message}>
            <Search style={{ width: 64, height: 64, color: '#4b5563', margin: '0 auto 16px' }} />
            <p className={styles.messageText}>Enter a search term to find products</p>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.message}>
            <p className={styles.messageText} style={{ marginBottom: 12 }}>No products found for &quot;{query}&quot;</p>
            <p className={styles.messageText} style={{ color: '#6b7280', fontSize: 14 }}>Try searching for &quot;neon&quot;, &quot;LED&quot;, &quot;cafe&quot;, or &quot;banner&quot;</p>
          </div>
        ) : (
          <>
            <p className={styles.resultsCount}>{results.length} product{results.length !== 1 ? 's' : ''} found</p>
            <div className={styles.grid}>
              {results.map(product => (
                <Link 
                  key={product.id} 
                  href={getProductLink(product)} 
                  className={styles.card}
                >
                  <div>
                    <div className={styles.cardImage}>
                      <Image 
                        src={product.images?.[0] || "/shop/placeholder.webp"} 
                        alt={product.name} 
                        fill 
                        style={{ objectFit: 'contain', padding: '16px' }} 
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className={styles.badge}>
                        30% OFF
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.productName}>
                        {product.name}
                      </h3>
                      <p className={styles.productMeta}>{product.category || product.collection}</p>
                      <p className={styles.productPrice}>{formatPrice(product.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.statusRow}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
