'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { submitOrder } from '@/actions/orderActions';

interface CartModalProps {
    store: any;
}

export default function CartModal({ store }: CartModalProps) {
    const { items, updateQuantity, totalPrice, isCartOpen, toggleCart, clearCart } = useCart();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [address, setAddress] = useState('');
    const [selectedZoneId, setSelectedZoneId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const deliveryZones: { id: string; name: string; price: number }[] = store.deliveryZones || store.settings?.deliveryZones || [];
    const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);

    // Delivery Check
    const isDeliveryEnabled = store.deliveryEnabled !== false && store.settings?.deliveryEnabled !== false;

    // Force Pickup if delivery disabled
    if (!isDeliveryEnabled && deliveryMethod === 'delivery') {
        setDeliveryMethod('pickup');
    }

    // Calculate final total including delivery
    const deliveryCost = (deliveryMethod === 'delivery' && selectedZone) ? selectedZone.price : 0;
    const finalTotal = totalPrice + deliveryCost;

    if (!isCartOpen) return null;

    const storeAddress = store.address || store.settings?.address || 'Dirección no disponible';
    const storePhone = store.phone || store.settings?.phone || '5491112345678';

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name || !phone) {
            alert('Por favor completa tu nombre y teléfono');
            return;
        }
        if (deliveryMethod === 'delivery') {
            if (!address) {
                alert('Por favor completa tu dirección de envío');
                return;
            }
            if (deliveryZones.length > 0 && !selectedZoneId) {
                alert('Por favor selecciona una zona de envío para calcular el costo');
                return;
            }
        }

        const phoneClean = phone.replace(/\D/g, '');

        setIsSubmitting(true);
        try {
            await submitOrder({
                storeId: store.id,
                name,
                phone: phoneClean,
                items,
                deliveryMethod,
                address,
                deliveryZone: selectedZone ? { name: selectedZone.name, price: selectedZone.price } : undefined,
                totalPrice: finalTotal // Save the total with delivery
            });
        } catch (err) {
            console.error("Error saving order:", err);
        }
        setIsSubmitting(false);

        // Construct the message
        let message = `*Hola! Quiero realizar un pedido en ${store.name || 'LoyalFood'}* 🍔%0A%0A`;
        message += `*Cliente:* ${name}%0A`;
        message += `*Teléfono:* ${phone}%0A`;
        message += `*MODALIDAD:* ${deliveryMethod === 'delivery' ? 'ENVÍO A DOMICILIO 🛵' : 'RETIRO EN LOCAL 🏃'}%0A`;

        if (deliveryMethod === 'delivery') {
            message += `*Dirección:* ${address}%0A`;
            if (selectedZone) {
                message += `*Zona de Envío:* ${selectedZone.name} ($${selectedZone.price})%0A`;
            }
        }

        message += `%0A*Detalle del Pedido:*%0A`;

        items.forEach((item) => {
            message += `- ${item.quantity}x ${item.product.name} ($${(item.product.price * item.quantity).toLocaleString('es-AR')})%0A`;
        });

        message += `%0A*TOTAL: $${finalTotal.toLocaleString('es-AR')}*`;

        if (deliveryMethod === 'pickup') {
            message += `%0A%0A_Retiro por: ${storeAddress}_`;
        }

        const url = `https://wa.me/${storePhone}?text=${message}`;

        window.open(url, '_blank');
        clearCart();
        toggleCart();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={toggleCart}
            />

            {/* Modal Content */}
            <div className="bg-white w-full sm:w-[500px] h-[90vh] sm:h-auto sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col pointer-events-auto transform transition-transform animate-slide-up sm:animate-fade-in relative">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900">Tu Pedido</h2>
                    <button
                        onClick={toggleCart}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {items.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p className="mb-2 text-lg">Tu carrito está vacío 😔</p>
                            <button
                                onClick={toggleCart}
                                className="text-orange-600 font-medium hover:underline"
                            >
                                Volver al menú
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Delivery Method Selector */}
                            {isDeliveryEnabled ? (
                                <div className="bg-gray-100 p-1 rounded-xl flex">
                                    <button
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${deliveryMethod === 'delivery' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setDeliveryMethod('delivery')}
                                    >
                                        Envío a Domicilio 🛵
                                    </button>
                                    <button
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${deliveryMethod === 'pickup' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setDeliveryMethod('pickup')}
                                    >
                                        Retiro en Local 🏃
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-orange-100 text-orange-800 p-3 rounded-xl text-center font-bold text-sm mb-4">
                                    🏃 Solo disponible para Retiro en Local
                                </div>
                            )}



                            {/* Zone Selector (if configured) */}
                            {deliveryMethod === 'delivery' && deliveryZones.length > 0 && (
                                <div className="animate-fade-in bg-orange-50 p-3 rounded-xl border border-orange-100">
                                    <label className="block text-sm font-bold text-orange-800 mb-2">
                                        ¿En qué zona estás?
                                    </label>
                                    <select
                                        value={selectedZoneId}
                                        onChange={(e) => setSelectedZoneId(e.target.value)}
                                        className="w-full p-2 border border-orange-200 rounded-lg bg-white text-gray-800 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="">Seleccionar zona...</option>
                                        {deliveryZones.map(zone => (
                                            <option key={zone.id} value={zone.id}>
                                                {zone.name} (+${zone.price})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-orange-800 mt-2 opacity-90 leading-tight font-medium">
                                        ⚠️ Si la zona seleccionada no coincide con la dirección de entrega, el comercio podrá ajustar el precio o cancelar el pedido.
                                    </p>
                                </div>
                            )}

                            {/* Product List */}
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex gap-4">
                                        <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-medium text-gray-900 line-clamp-1">{item.product.name}</h3>
                                                <span className="font-bold text-gray-900">
                                                    ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-gray-200 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, -1)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-100" />

                            {/* User Form */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900">Datos de contacto</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ej: Juan Pérez"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp)</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Ej: 11 1234 5678"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                        />
                                    </div>

                                    {/* Conditional Address Field */}
                                    {deliveryMethod === 'delivery' ? (
                                        <div className="animate-fade-in">
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección de Envío</label>
                                            <input
                                                type="text"
                                                id="address"
                                                required
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Calle, Número, Piso, Depto..."
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
                                            <p className="text-sm text-gray-800 font-medium text-center">
                                                📍 Retiras por: <strong>{storeAddress}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer actions */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Total {deliveryCost > 0 && <span className="text-xs text-orange-600">(Envío: +${deliveryCost})</span>}</span>
                            <span className="text-2xl font-bold text-gray-900">${finalTotal.toLocaleString('es-AR')}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={items.length === 0 || isSubmitting}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            <span>{isSubmitting ? 'Procesando...' : 'Confirmar Pedido en WhatsApp'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
}
