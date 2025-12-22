'use client';

import { useState, useEffect } from 'react';
import { categories as staticCategories } from '@/data/products';
import ProductCard from './ProductCard';
import { Product } from '@/data/products';

interface CatalogProps {
    slug: string;
    initialProducts?: Product[];
}

export default function Catalog({ slug, initialProducts = [] }: CatalogProps) {
    const [activeCategory, setActiveCategory] = useState(staticCategories[0].id);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(!initialProducts.length);

    useEffect(() => {
        if (initialProducts.length > 0) {
            setLoading(false);
            return;
        }

        async function fetchProducts() {
            setLoading(true);
            try {
                const res = await fetch(`/api/products?slug=${slug}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setProducts(data.products || []);
            } catch (error) {
                console.error("Catalog load error", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [slug, initialProducts]);

    // Also filter out unavailable products
    const filteredProducts = products.filter(
        (product) => product.categoryId === activeCategory && product.available !== false
    );

    return (
        <div className="pb-24">
            {/* Sticky Category Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
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
                        <ProductCard key={product.id} product={product} />
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
