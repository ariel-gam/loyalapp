'use client';

import { useCart } from '@/context/CartContext';
import { Product } from '@/data/products';
import Image from 'next/image';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
    disabled?: boolean;
}

export default function ProductCard({ product, disabled }: ProductCardProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = () => {
        if (disabled || !product.available) return;
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 500); // Visual feedback time

        // Haptic Feedback for Mobile
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    const hasDiscount = product.isDiscountActive && product.discountPercent && product.originalPrice;

    return (
        <div className={`
            bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-full relative
            ${hasDiscount ? 'border-orange-300 ring-2 ring-orange-200' : 'border-gray-100'}
            ${disabled ? 'opacity-60 grayscale' : ''}
        `}>
            {/* Discount Badge */}
            {hasDiscount && (
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                    🔥 {product.discountPercent}% OFF
                </div>
            )}

            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full bg-gray-100">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                                ${product.originalPrice?.toLocaleString('es-AR')}
                            </span>
                        )}
                        <span className={`font-bold text-lg ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                            ${product.price.toLocaleString('es-AR')}
                        </span>
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={disabled || !product.available}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-bold transition-all
                            ${disabled || !product.available
                                ? 'bg-gray-100 text-gray-400'
                                : hasDiscount
                                    ? 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                                    : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
                            }
                        `}
                    >
                        {isAdded ? 'Agregado ✓' : 'Agregar +'}
                    </button>
                </div>
            </div>
        </div>
    );
}

