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

    return (
        <div className={`
            group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transform transition-all duration-300
            ${disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'}
        `}>
            {/* Image Container - Aspect Ratio 4:3 for food looks best */}
            <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {!product.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Agotado
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 relative">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1 line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* Footer: Price + Add Button */}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                    <span className="font-black text-xl text-gray-900">
                        ${product.price.toLocaleString('es-AR')}
                    </span>

                    <button
                        onClick={handleAdd}
                        disabled={disabled || !product.available}
                        className={`
                            relative overflow-hidden rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 shadow-md
                            ${disabled || !product.available
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
                            }
                            ${isAdded ? 'scale-110 bg-green-500' : ''}
                        `}
                        aria-label="Agregar al carrito"
                    >
                        {/* Icon: Plus */}
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isAdded ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </span>

                        {/* Icon: Checkmark (Success) */}
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isAdded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
