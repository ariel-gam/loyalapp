'use client';

import { useCart } from '@/context/CartContext';

export default function CartButton() {
    const { totalItems, totalPrice, toggleCart, items } = useCart();

    if (items.length === 0) return null;

    return (
        <button
            onClick={toggleCart}
            className="fixed bottom-6 right-6 z-40 bg-primary text-white rounded-full shadow-lg shadow-black/20 p-4 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 animate-bounce-in"
            aria-label="Ver carrito"
        >
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                    {totalItems}
                </span>
            </div>
            <span className="font-bold text-lg hidden sm:block">
                ${totalPrice.toLocaleString('es-AR')}
            </span>
        </button>
    );
}
