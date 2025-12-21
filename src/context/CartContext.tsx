'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Product } from '@/data/products';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    totalPrice: number;
    totalItems: number;
    isCartOpen: boolean;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (product: Product) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        // Optional: Open cart on first add? No, maybe just a toast or badge update.
    };

    const removeFromCart = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setItems((prev) => {
            return prev.map((item) => {
                if (item.product.id === productId) {
                    const newQuantity = Math.max(0, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter((item) => item.quantity > 0);
        });
    };

    const clearCart = () => setItems([]);

    const toggleCart = () => setIsCartOpen((prev) => !prev);

    const totalPrice = useMemo(() => {
        return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }, [items]);

    const totalItems = useMemo(() => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    }, [items]);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalPrice,
                totalItems,
                isCartOpen,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
