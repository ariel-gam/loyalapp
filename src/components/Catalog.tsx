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
                // 2. Check Time
                const ranges = store.schedule.ranges || [];
                // Backward compatibility
                if (ranges.length === 0 && store.schedule.openTime && store.schedule.closeTime) {
                    ranges.push({ open: store.schedule.openTime, close: store.schedule.closeTime });
                }

                if (ranges.length === 0) return true; // No schedule = Always Open

                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                let isOpenNow = false;
                let nextOpenTime = null;

                // Sort ranges by open time to find next open easily
                const sortedRanges = [...ranges].sort((a, b) => {
                    const [aH, aM] = a.open.split(':').map(Number);
                    const [bH, bM] = b.open.split(':').map(Number);
                    return (aH * 60 + aM) - (bH * 60 + bM);
                });

                for (const range of sortedRanges) {
                    if (!range.open || !range.close) continue;

                    const [openH, openM] = range.open.split(':').map(Number);
                    const openMinutes = openH * 60 + openM;

                    const [closeH, closeM] = range.close.split(':').map(Number);
                    const closeMinutes = closeH * 60 + closeM;

                    let isMatch = false;
                    if (closeMinutes < openMinutes) {
                        // Overnight
                        isMatch = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
                    } else {
                        // Same day
                        isMatch = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
                    }

                    if (isMatch) {
                        isOpenNow = true;
                        break;
                    }

                    // If not open, checks if this range is in the future
                    if (!isOpenNow && currentMinutes < openMinutes) {
                        if (!nextOpenTime) nextOpenTime = range.open;
                    }
                }

                // If closed and no next time today found, maybe show "Mañana"?
                // For now, we store nextOpenTime logic inside component state or return it?
                // The current architecture checks distinct return value. 
                // Let's rely on component state for "nextOpenTime" too?
                // Or jus render based on store.schedule later.
                // Re-calculating nextOpenTime in render is cheap.
                return isOpenNow;
            };

            setIsStoreOpen(checkOpen());
            const interval = setInterval(() => setIsStoreOpen(checkOpen()), 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [store]);

    // Helper to get display text for banner
    const getNextOpenMessage = () => {
        const ranges = store?.schedule?.ranges || [];
        if (ranges.length === 0 && store?.schedule?.openTime) {
            ranges.push({ open: store.schedule.openTime, close: store.schedule.closeTime });
        }
        if (ranges.length === 0) return 'En este momento no estamos tomando pedidos.';

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Find first range opening after now
        const sortedRanges = [...ranges].sort((a: any, b: any) => {
            const [aH, aM] = a.open.split(':').map(Number);
            const [bH, bM] = b.open.split(':').map(Number);
            return (aH * 60 + aM) - (bH * 60 + bM);
        });

        for (const range of sortedRanges) {
            const [openH, openM] = range.open.split(':').map(Number);
            const openMinutes = openH * 60 + openM;
            if (currentMinutes < openMinutes) {
                return `Abrimos a las ${range.open} hs`;
            }
        }
        return 'Abrimos mañana';
    };

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
            {!isStoreOpen ? (
                <div className="bg-red-600 text-white p-4 text-center sticky top-0 z-50 shadow-md">
                    <h3 className="font-bold text-lg">🔴 Local Cerrado</h3>
                    <p className="text-sm opacity-90">
                        {getNextOpenMessage()}
                    </p>
                </div>
            ) : ((store?.delayTime > 20 || store?.settings?.delayTime > 20) && (
                <div className="bg-orange-500 text-white p-2 text-center sticky top-0 z-50 shadow-md flex items-center justify-center gap-2 animate-fade-in">
                    <span className="text-lg">⏳</span>
                    <div>
                        <p className="text-sm font-bold">Alta Demanda</p>
                        <p className="text-xs opacity-90">Demora aprox: {(store?.delayTime || store?.settings?.delayTime || 0) + 20} - {(store?.delayTime || store?.settings?.delayTime || 0) + 40} min</p>
                    </div>
                </div>
            ))}

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
