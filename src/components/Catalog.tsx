'use client';

import { useState, useEffect } from 'react';
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
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter by category, search query, and availability
    const filteredProducts = products.filter((product) => {
        const matchesCategory = product.categoryId === activeCategory;
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
        return matchesCategory && matchesSearch && product.available !== false;
    });

    return (
        <div className="pb-24">
            {/* Store Closed Banner */}
            {!isStoreOpen && (
                <div className="bg-red-600 text-white p-4 text-center sticky top-0 z-50 shadow-md">
                    <h3 className="font-bold text-lg">🔴 Local Cerrado</h3>
                    <p className="text-sm opacity-90">
                        {getNextOpenMessage()}
                    </p>
                </div>
            )}

            {/* High Demand Banner */}
            {isStoreOpen && (store?.delayTime > 20 || store?.settings?.delayTime > 20) && (
                <div className="bg-orange-500 text-white p-2 text-center sticky top-0 z-50 shadow-md flex items-center justify-center gap-2 animate-fade-in">
                    <span className="text-lg">⏳</span>
                    <div>
                        <p className="text-sm font-bold">Alta Demanda</p>
                        <p className="text-xs opacity-90">
                            Demora aprox: {(store?.delayTime || store?.settings?.delayTime || 0) + 20} - {(store?.delayTime || store?.settings?.delayTime || 0) + 40} min
                        </p>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="p-4 bg-gradient-to-r from-purple-100/50 to-pink-100/50">
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        🔍
                    </div>
                    <input
                        type="text"
                        placeholder="¿Qué buscas?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
                    />
                </div>
            </div>

            {/* Simple Category Filter */}
            <div className="overflow-x-auto py-4 px-4 whitespace-nowrap bg-gray-50 border-b border-gray-100">
                {staticCategories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`
                            inline-block px-4 py-2 mr-2 rounded-full text-sm font-medium transition-colors border
                            ${activeCategory === category.id
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }
                        `}
                    >
                        {category.name}
                    </button>
                ))}
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
        </div >
    );
}

