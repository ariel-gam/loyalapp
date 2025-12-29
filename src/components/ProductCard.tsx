import Image from 'next/image';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
    product: Product;
    disabled?: boolean;
}

export default function ProductCard({ product, disabled }: ProductCardProps) {
    const { addToCart, updateQuantity, items } = useCart();

    // Check if item is in cart to show quantity or visual feedback (optional)
    const cartItem = items.find(item => item.product.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    // Discount Logic
    const today = new Date().getDay(); // 0-6
    const isDiscountActive = product.discountDay === today && product.discountPercent;

    // The API sends 'price' as the FINAL price (already discounted if applicable)
    // and 'originalPrice' as the base price.
    // If no discount is active, price == originalPrice.
    const finalPrice = product.price;
    const originalPrice = product.originalPrice || product.price;

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const discountDayName = product.discountDay !== undefined ? days[product.discountDay] : '';

    const handleAddToCart = () => {
        if (disabled) return;
        // Create a copy of the product with the *effective* price for the cart
        const productForCart = { ...product, price: finalPrice };
        addToCart(productForCart);
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow relative ${disabled ? 'opacity-70 grayscale' : ''}`}>
            {/* Discount Badge */}
            {isDiscountActive && !disabled && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                    ¡Oferta de {discountDayName}!
                </div>
            )}

            <div className="relative h-40 w-full">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {quantity > 0 && !disabled && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                        {quantity}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3 flex-grow">
                    {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        {isDiscountActive ? (
                            <>
                                <span className="text-xs text-gray-400 line-through">
                                    ${originalPrice.toLocaleString('es-AR')}
                                </span>
                                <span className="font-bold text-lg text-red-600">
                                    ${finalPrice.toLocaleString('es-AR')}
                                </span>
                            </>
                        ) : (
                            <span className="font-bold text-lg text-gray-900">
                                ${originalPrice.toLocaleString('es-AR')}
                            </span>
                        )}
                    </div>

                    {quantity > 0 && !disabled ? (
                        <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
                            <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="w-8 h-8 flex items-center justify-center bg-white text-gray-700 rounded-full shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-sm font-bold"
                                aria-label="Restar uno"
                            >
                                -
                            </button>
                            <span className="w-8 text-center font-bold text-gray-800 text-sm">
                                {quantity}
                            </span>
                            <button
                                onClick={handleAddToCart}
                                className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-full shadow-sm hover:bg-orange-600 active:scale-95 transition-all text-sm font-bold"
                                aria-label="Sumar uno"
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            disabled={disabled}
                            className={`p-2 rounded-full shadow-md transition-all flex items-center justify-center w-10 h-10 ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white'}`}
                            aria-label={`Agregar ${product.name} al carrito`}
                        >
                            {disabled ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
