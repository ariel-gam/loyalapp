'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DemoAdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'stats' | 'customers' | 'settings'>('orders');

    // Store Info Mock
    const [storeInfo, setStoreInfo] = useState({
        id: 'demo-store',
        store_name: 'La Pizzería de Prueba',
        slug: 'demo-pizza',
        address: 'Av. Corrientes 1234, CABA',
        phone: '5491112345678',
        logo_url: null,
        primary_color: '#f97316',
        trial_ends_at: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // 14 days from now
    });

    // Mock Data State
    const [orders, setOrders] = useState<any[]>([
        {
            id: '1',
            customers: { name: 'Juan Perez', phone: '5491199999999' },
            created_at: new Date().toISOString(),
            total_amount: 15750,
            status: 'pending',
            delivery_method: 'delivery',
            delivery_address: 'Av. Santa Fe 3200, 4B',
            details: [
                { quantity: 1, product: { name: 'Pizza Napolitana' } },
                { quantity: 1, product: { name: 'Empanada de Carne' } },
                { quantity: 1, product: { name: 'Empanada de Carne' } },
            ]
        },
        {
            id: '2',
            customers: { name: 'Maria Garcia', phone: '5491188888888' },
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            total_amount: 12000,
            status: 'paid',
            delivery_method: 'pickup',
            delivery_address: '',
            details: [
                { quantity: 1, product: { name: 'Pizza Muzzarella' } }
            ]
        }
    ]);

    const [products, setProducts] = useState<any[]>([
        { id: '1', name: 'Pizza Muzzarella', description: 'Salsa de tomate, muzzarella, orégano y aceitunas.', base_price: 12000, category_id: 'pizzas', is_available: true, image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80', discounts: [] },
        { id: '2', name: 'Pizza Napolitana', description: 'Salsa de tomate, muzzarella, rodajas de tomate, ajo y perejil.', base_price: 13500, category_id: 'pizzas', is_available: true, image_url: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=500&q=80', discounts: [] },
        { id: '3', name: 'Empanada de Carne', description: 'Carne cortada a cuchillo, suave y jugosa.', base_price: 1500, category_id: 'empanadas', is_available: true, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80', discounts: [] },
        { id: '4', name: 'Cerveza IPA', description: 'Pinta de cerveza artesanal estilo IPA.', base_price: 4500, category_id: 'bebidas', is_available: true, image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=500&q=80', discounts: [] },
    ]);

    const [customers, setCustomers] = useState<any[]>([
        { id: '1', name: 'Juan Perez', phone: '5491199999999', totalSpent: 45000, totalOrders: 3, daysSinceLastOrder: 0 },
        { id: '2', name: 'Maria Garcia', phone: '5491188888888', totalSpent: 24000, totalOrders: 2, daysSinceLastOrder: 1 },
        { id: '3', name: 'Carlos Lopez', phone: '5491177777777', totalSpent: 12000, totalOrders: 1, daysSinceLastOrder: 45 },
    ]);

    const [rankingPeriod, setRankingPeriod] = useState<'day' | 'week' | 'month'>('day');
    const [ranking, setRanking] = useState<any[]>([
        { name: 'Pizza Muzzarella', quantity: 15, revenue: 180000 },
        { name: 'Empanada de Carne', quantity: 40, revenue: 60000 },
        { name: 'Pizza Napolitana', quantity: 8, revenue: 108000 },
    ]);

    const [loading, setLoading] = useState(false);
    const [showInactiveOnly, setShowInactiveOnly] = useState(false);

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    // Confirmation State
    const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void } | null>(null);

    // Actions Mocks
    const handleDeleteProduct = (id: string) => {
        setConfirmation({
            message: '⚠️ ¿Estás seguro de que quieres eliminar este producto? (Simulación)',
            onConfirm: () => {
                setProducts(products.filter(p => p.id !== id));
            }
        });
    };

    const handleToggle = (id: string, currentStatus: boolean) => {
        setProducts(products.map(p => p.id === id ? { ...p, is_available: !currentStatus } : p));
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleSaveProduct = (formData: FormData) => {
        const newProduct = {
            id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
            name: formData.get('name'),
            description: formData.get('description'),
            base_price: Number(formData.get('price')),
            category_id: formData.get('categoryId'),
            image_url: formData.get('image'),
            is_available: true,
            discounts: []
        };

        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...newProduct } : p));
        } else {
            setProducts([...products, newProduct]);
        }
        setIsModalOpen(false);
    };

    const filteredCustomers = showInactiveOnly
        ? customers.filter((c) => c.daysSinceLastOrder > 20)
        : customers;

    return (
        <div className="min-h-screen bg-gray-50 border-t-8 border-orange-500">
            {/* Demo Banner */}
            <div className="bg-orange-600 text-white text-center py-2 text-sm font-bold shadow-md relative z-20">
                🚀 ESTÁS EN MODO DEMO - Los cambios no se guardan permanentemente.
            </div>

            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-800">{storeInfo?.store_name}</h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1 sm:mt-0">
                        <Link href="/demo-pizza" target="_blank" className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition">
                            Ver Tienda Demo ↗
                        </Link>
                    </div>
                </div>
                <div className="flex gap-2 sm:gap-4 overflow-x-auto items-center">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {(['orders', 'products', 'customers', 'stats', 'settings'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition capitalize ${activeTab === tab ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab === 'stats' ? 'Estadísticas' : tab === 'settings' ? 'Config' : tab === 'orders' ? 'Pedidos' : tab === 'products' ? 'Productos' : 'Clientes'}
                            </button>
                        ))}
                    </div>
                    <Link
                        href="/"
                        className="text-sm bg-gray-800 hover:bg-gray-900 text-white font-medium ml-2 px-4 py-2 rounded-lg transition"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto p-6">

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Pedidos Recientes</h2>
                            <button
                                onClick={() => setConfirmation({ message: '⚠️ Esta función limpiaría los pedidos en la versión real.', onConfirm: () => { } })}
                                className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition opacity-50 cursor-not-allowed"
                            >
                                🗑 Limpiar Todo
                            </button>
                        </div>
                        <div className="grid gap-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-lg text-gray-900">{order.customers?.name || 'Cliente'}</span>
                                            <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                                                {new Date(order.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-2">
                                            {order.details.map((item: any, idx: number) => (
                                                <div key={idx} className="flex gap-1">
                                                    <span>{item.quantity}x</span>
                                                    <span>{item.product.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-gray-600 mb-2">{order.delivery_method === 'delivery' ? `🛵 Envío a: ${order.delivery_address}` : '🏃 Retiro en Local'}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-center gap-2">
                                        <span className="text-2xl font-bold text-green-600">${order.total_amount?.toLocaleString('es-AR')}</span>
                                        <div className="flex items-center gap-2">
                                            {order.delivery_method === 'delivery' && (
                                                <button
                                                    onClick={() => alert("En la versión real, esto abriría WhatsApp con un mensaje pre-armado para el cliente.")}
                                                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition flex items-center gap-1 shadow-sm"
                                                >
                                                    🛵 Avisar salida
                                                </button>
                                            )}
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                            </span>
                                            {order.status !== 'paid' && (
                                                <button
                                                    onClick={() => {
                                                        setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'paid' } : o));
                                                    }}
                                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition"
                                                >
                                                    ✔ Cobrar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Mis Productos</h2>
                            <button onClick={handleCreateNew} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition">+ Nuevo Producto</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition">
                                    <div className="h-48 relative bg-gray-100">
                                        {product.image_url && <Image src={product.image_url} alt={product.name} fill className="object-cover" />}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900">{product.name}</h3>
                                        <div className="flex justify-between items-center mb-3 mt-2">
                                            <span className="font-bold text-lg text-orange-600">${product.base_price?.toLocaleString('es-AR')}</span>
                                            <button onClick={() => handleToggle(product.id, product.is_available)} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${product.is_available !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                                {product.is_available !== false ? 'Disponible' : 'Agotado'}
                                            </button>
                                        </div>
                                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                                            <button onClick={() => handleEditProduct(product)} className="flex-1 bg-blue-50 text-blue-600 text-sm font-medium py-1.5 rounded hover:bg-blue-100 transition flex items-center justify-center gap-1">
                                                ✏️ Editar
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 bg-red-50 text-red-600 text-sm font-medium py-1.5 rounded hover:bg-red-100 transition flex items-center justify-center gap-1">
                                                🗑 Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Clientes ({customers.length})</h2>
                            <button
                                onClick={() => setShowInactiveOnly(!showInactiveOnly)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition ${showInactiveOnly ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                {showInactiveOnly ? 'Mostrando Inactivos' : 'Filtrar Inactivos'}
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {filteredCustomers.map(c => {
                                const isInactive = c.daysSinceLastOrder > 20;
                                return (
                                    <div key={c.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center group">
                                        <div>
                                            <p className="font-bold text-gray-900 flex items-center gap-2">
                                                {c.name}
                                                <button
                                                    onClick={() => alert("Esto abriría WhatsApp con un mensaje personalizado de recuperación.")}
                                                    className="bg-green-100 text-green-700 p-1.5 rounded-full hover:bg-green-200 transition-colors"
                                                >
                                                    💬
                                                </button>
                                            </p>
                                            <p className="text-sm text-gray-500">{c.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-green-600">${c.totalSpent.toLocaleString('es-AR')}</p>
                                            <p className="text-xs text-gray-500">{c.totalOrders} pedidos</p>
                                            <p className={`text-xs ${isInactive ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                Hace {c.daysSinceLastOrder} días
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas de Venta</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-bold uppercase mb-1">Ventas Hoy</h3>
                                <p className="text-3xl font-extrabold text-gray-900">$45.000</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-bold uppercase mb-1">Pedidos</h3>
                                <p className="text-3xl font-extrabold text-gray-900">4</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-bold uppercase mb-1">Ticket Promedio</h3>
                                <p className="text-3xl font-extrabold text-gray-900">$11.250</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            {['day', 'week', 'month'].map((p) => (
                                <button key={p} onClick={() => setRankingPeriod(p as any)} className={`px-3 py-1 rounded capitalize ${rankingPeriod === p ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>Por {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : 'Mes'}</button>
                            ))}
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">Ranking de Productos más Vendidos</h3>
                            <ul>
                                {ranking.map((item, idx) => (
                                    <li key={idx} className="flex justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded transition">
                                        <div className="flex gap-3">
                                            <span className="font-bold text-gray-400 w-6">#{idx + 1}</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-gray-500 text-sm">{item.quantity} un.</span>
                                            <span className="font-bold text-gray-900 w-24 text-right">${item.revenue.toLocaleString('es-AR')}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración (Simulación)</h2>
                        <div className="space-y-4">
                            <div><label className="text-sm font-bold">Nombre</label><input disabled defaultValue={storeInfo.store_name} className="w-full border p-2 rounded bg-gray-50" /></div>
                            <div><label className="text-sm font-bold">Dirección</label><input disabled defaultValue={storeInfo.address} className="w-full border p-2 rounded bg-gray-50" /></div>

                            {/* Delivery Zones Demo */}
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-6 relative">
                                <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-sm font-bold animate-pulse">
                                    ¡NUEVO!
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-md font-bold text-orange-800 flex items-center gap-2">
                                        🛵 Zonas de Envío
                                    </h4>
                                    <label className="flex items-center cursor-pointer relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            defaultChecked={true}
                                            onChange={(e) => {
                                                const zones = document.getElementById('demo-zones-container');
                                                if (zones) zones.style.opacity = e.target.checked ? '1' : '0.5';
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                        <span className="ml-3 text-sm font-medium text-orange-900">Activado</span>
                                    </label>
                                </div>

                                <div id="demo-zones-container" className="space-y-3 mb-4 transition-opacity">
                                    <div className="flex gap-2 items-center bg-white p-2 rounded shadow-sm">
                                        <input disabled value="Casco Céntrico" className="flex-1 border p-1 rounded text-sm bg-gray-50" />
                                        <span className="text-gray-500 font-bold">$</span>
                                        <input disabled value="1500" className="w-24 border p-1 rounded text-sm bg-gray-50" />
                                        <button className="text-red-300 px-2 font-bold cursor-not-allowed">✕</button>
                                    </div>
                                    <div className="flex gap-2 items-center bg-white p-2 rounded shadow-sm">
                                        <input disabled value="Barrios Aledaños" className="flex-1 border p-1 rounded text-sm bg-gray-50" />
                                        <span className="text-gray-500 font-bold">$</span>
                                        <input disabled value="2500" className="w-24 border p-1 rounded text-sm bg-gray-50" />
                                        <button className="text-red-300 px-2 font-bold cursor-not-allowed">✕</button>
                                    </div>
                                </div>
                                <p className="text-xs text-orange-600">
                                    En la versión real, aquí podrás configurar tus propias zonas y precios.
                                </p>
                            </div>

                            <div>
                                <p className="text-center font-bold text-gray-500 bg-gray-100 py-4 rounded-lg mt-8 text-sm">
                                    🔒 Para editar estos datos realmente, necesitas tu propia tienda.
                                    <br />
                                    <Link href="/login" className="underline hover:text-orange-800 text-orange-600">Crea tu cuenta gratis</Link> y pruébalo.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Modal for Product Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Editar Producto (Simulado)' : 'Nuevo Producto (Simulado)'}</h3>
                        <form action={handleSaveProduct} className="space-y-4">
                            <input name="name" placeholder="Nombre" defaultValue={editingProduct?.name} required className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" />
                            <textarea name="description" placeholder="Descripción" defaultValue={editingProduct?.description} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" />
                            <input name="price" type="number" placeholder="Precio" defaultValue={editingProduct?.base_price} required className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" />
                            <select name="categoryId" defaultValue={editingProduct?.category_id || 'pizzas'} className="w-full border p-2 rounded capitalize focus:ring-2 focus:ring-orange-500 outline-none">
                                <option value="pizzas">Pizzas</option>
                                <option value="empanadas">Empanadas</option>
                                <option value="bebidas">Bebidas</option>
                            </select>
                            <input name="image" placeholder="URL Imagen" defaultValue={editingProduct?.image_url} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" />

                            <div className="pt-2 text-xs text-center text-gray-500">
                                * Los cambios se verán reflejados solo en tu sesión actual.
                            </div>

                            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition shadow-lg">Guardar Cambios</button>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 py-2 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmation && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
                        <p className="mb-4 font-bold text-gray-800">{confirmation.message}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmation(null)} className="flex-1 py-2 bg-gray-100 rounded hover:bg-gray-200 transition">Cancelar</button>
                            <button onClick={() => { confirmation.onConfirm(); setConfirmation(null); }} className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition shadow-md">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
