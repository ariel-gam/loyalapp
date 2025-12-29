'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { categories as staticCategories } from '@/data/products';
import ProductCard from './ProductCard';
import { Product } from '@/data/products';

interface CatalogProps {
    slug: string;
    initialProducts?: Product[];
    store?: any;
}

export default function Catalog({ slug, initialProducts = [], store }: CatalogProps) {
    const [activeCategory, setActiveCategory] = useState(staticCategories[0].id);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(!initialProducts.length);
    const [isStoreOpen, setIsStoreOpen] = useState(true);

    useEffect(() => {
        if (store?.schedule) {
            const checkOpen = () => {
                const now = new Date();

                // 1. Check Date
                // Use local date to match the user experience (assuming customers are in same timezone as store)
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;

                if (store.schedule.closedDates?.includes(dateString)) {
                    return false;
                }

                // 2. Check Time
                const { openTime, closeTime } = store.schedule;
                if (!openTime || !closeTime) return true;

                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                const [openH, openM] = openTime.split(':').map(Number);
                const openMinutes = openH * 60 + openM;

                const [closeH, closeM] = closeTime.split(':').map(Number);
                const closeMinutes = closeH * 60 + closeM;

                if (closeMinutes < openMinutes) {
                    // Overnight (e.g. 18:00 to 02:00)
                    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
                } else {
                    // Same day (e.g. 09:00 to 17:00)
                    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
                }
            };

            setIsStoreOpen(checkOpen());
            const interval = setInterval(() => setIsStoreOpen(checkOpen()), 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [store]);

    useEffect(() => {
        let isMounted = true;

        async function fetchProducts() {
            // Only set loading if we don't have products yet, to avoid visual flash on updates
            if (products.length === 0) setLoading(true);

            try {
                const res = await fetch(`/api/products?slug=${slug}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                if (isMounted) {
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Catalog load error", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        // Fetch initially if needed or if just mounted
        if (products.length === 0) {
            fetchProducts();
        } else if (initialProducts.length > 0 && products.length === initialProducts.length) {
            // If we have initial products passed in props and state matches, we might not need to fetch, 
            // BUT we still need to set loading=false if it was true.
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [slug]);

    // Also filter out unavailable products
    const filteredProducts = products.filter(
        (product) => product.categoryId === activeCategory && product.available !== false
    );

    return (
        <div className="pb-24">
            {/* Store Closed Banner */}
            {!isStoreOpen && (
                <div className="bg-red-600 text-white p-4 text-center sticky top-0 z-50 shadow-md">
                    <h3 className="font-bold text-lg">🔴 Local Cerrado</h3>
                    <p className="text-sm opacity-90">
                        {store?.schedule?.openTime
                            ? `Abrimos a las ${store.schedule.openTime} hs`
                            : 'En este momento no estamos tomando pedidos.'}
                    </p>
                </div>
            )}

            {/* Sticky Category Header */}
            <div className={`sticky ${!isStoreOpen ? 'top-[76px]' : 'top-0'} z-10 bg-white/95 backdrop-blur-sm shadow-sm transition-all`}>
                <div className="flex overflow-x-auto py-4 px-4 gap-3 no-scrollbar">
                    {staticCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category.id
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        Cargando menú...
                    </div>
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            disabled={!isStoreOpen}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-10 text-center text-gray-400">
                        No hay productos disponibles en esta sección por ahora.
                    </div>
                )}
            </div>
        </div>
    );
}
