'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecentOrders, getAdminProducts, createProduct, deleteProduct, toggleProductAvailability, getSalesRanking, updateProduct, getCustomers, updateOrderStatus, clearAllOrders, resetAllStats, clearAllCustomers } from '@/actions/adminActions';
import { getStoreSettings, updateStoreSettings } from '@/actions/settingsActions';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { uploadProductImage } from '@/utils/uploadImage';
import InstallAppButton from '@/components/InstallAppButton';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'stats' | 'customers' | 'settings'>('orders');

    // Store Info
    const [storeInfo, setStoreInfo] = useState<any>(null);
    const [storeNotFound, setStoreNotFound] = useState(false);

    // Data State
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [ranking, setRanking] = useState<any[]>([]);
    const [rankingPeriod, setRankingPeriod] = useState<'day' | 'week' | 'month'>('day');
    const [loading, setLoading] = useState(true);
    const [showInactiveOnly, setShowInactiveOnly] = useState(false);

    // Categories State
    const DEFAULT_CATEGORIES = [
        { id: 'pizzas', name: 'Pizzas' },
        { id: 'empanadas', name: 'Empanadas' },
        { id: 'hamburguesas', name: 'Hamburguesas' },
        { id: 'bebidas', name: 'Bebidas' },
        { id: 'sandwich-milanesa', name: 'Sandwich de Milanesas' },
        { id: 'sandwich-miga', name: 'Sandwich de Miga' },
        { id: 'papas-fritas', name: 'Papas Fritas' },
        { id: 'arrollados', name: 'Arrollados' },
        { id: 'postres', name: 'Postres' }
    ];
    const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    // Confirmation State
    const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void } | null>(null);

    // Image Upload State
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    // Password Reset State
    const [showPasswordReset, setShowPasswordReset] = useState(false);

    // Account Deletion State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('reset_password') === 'true') {
                setShowPasswordReset(true);
            }
        }
    }, []);

    useEffect(() => {
        // Initial Data Load
        async function init() {
            setLoading(true);
            try {
                const info = await getStoreSettings();
                if (!info) {
                    setStoreNotFound(true);
                    return;
                }
                setStoreInfo(info);
                if (info.categories && Array.isArray(info.categories)) {
                    setCategories(info.categories);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    // Load Tab Data
    useEffect(() => {
        if (!storeInfo) return;
        loadData();
    }, [activeTab, rankingPeriod, storeInfo]);

    // Real-time Orders
    useEffect(() => {
        if (!storeInfo || activeTab !== 'orders' || !supabase) return;

        console.log("🔌 Iniciando conexión Realtime para tienda:", storeInfo.id);
        const channel = supabase
            .channel('realtime_orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${storeInfo.id}` },
                (payload) => {
                    console.log('🔔 Cambio en pedidos detectado:', payload);
                    getRecentOrders().then(setOrders);
                }
            )
            .subscribe((status) => {
                console.log("📡 Estado:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [storeInfo, activeTab]);

    const loadData = async () => {
        setLoading(true);
        if (activeTab === 'orders') {
            const data = await getRecentOrders();
            setOrders(data);
        } else if (activeTab === 'products') {
            const data = await getAdminProducts();
            setProducts(data);
        } else if (activeTab === 'stats') {
            const data = await getSalesRanking(rankingPeriod);
            setRanking(data);
        } else if (activeTab === 'customers') {
            const data = await getCustomers();
            setCustomers(data);
        }
        setLoading(false);
    };

    const handleDeleteProduct = (id: string) => {
        setConfirmation({
            message: '⚠️ ¿Estás seguro de que quieres eliminar este producto?',
            onConfirm: async () => {
                const res = await deleteProduct(id);
                if (!res.success) alert("Error: " + res.message);
                else loadData();
            }
        });
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await toggleProductAvailability(id, currentStatus);
        loadData();
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setImageUrl(product.image_url || '');
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        setEditingProduct(null);
        setImageUrl('');
        setIsModalOpen(true);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const filteredCustomers = showInactiveOnly
        ? customers.filter((c) => c.daysSinceLastOrder > 20)
        : customers;

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando Panel...</div>;

    if (storeNotFound) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No se encontró tu tienda</h2>
            <p className="text-gray-600 mb-6">Parece que no tienes una tienda configurada o hubo un error cargándola.</p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                    Reintentar
                </button>
                <button
                    onClick={() => router.push('/setup')}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
                >
                    Crear Tienda
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-800">{storeInfo?.store_name}</h1>
                    {storeInfo?.slug && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1 sm:mt-0">
                            <a href={`/${storeInfo.slug}`} target="_blank" className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition">
                                Ver Tienda ↗
                            </a>
                            <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded px-2 py-1">
                                <span className="text-xs text-gray-500 font-mono hidden sm:inline">{typeof window !== 'undefined' ? window.location.origin : ''}/{storeInfo.slug}</span>
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/${storeInfo.slug}`;
                                        navigator.clipboard.writeText(url);
                                        alert('¡Link copiado! 📋\n\n' + url + '\n\nCompártelo en Instagram o WhatsApp.');
                                    }}
                                    className="text-xs font-bold text-gray-700 hover:text-orange-600 transition ml-1"
                                    title="Copiar Link Público"
                                >
                                    📋 Copiar
                                </button>
                            </div>
                            <div className="ml-2">
                                <InstallAppButton />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 sm:gap-4 overflow-x-auto">
                    {(['orders', 'products', 'customers', 'stats', 'settings'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${activeTab === tab ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab === 'stats' ? 'Estadísticas' : tab === 'settings' ? 'Configuración' : tab === 'orders' ? 'Pedidos' : tab === 'products' ? 'Productos' : 'Clientes'}
                        </button>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-600 hover:text-red-700 font-medium ml-2"
                    >
                        Salir
                    </button>
                </div>
            </nav>

            {/* Trial Banner */}
            {storeInfo?.trial_ends_at && (
                (() => {
                    const daysLeft = Math.ceil((new Date(storeInfo.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    if (daysLeft < 0) return (
                        <div className="bg-red-600 text-white p-3 text-center text-sm font-bold">
                            ⚠️ Tu periodo de prueba ha expirado. <a href="https://wa.me/5491112345678" target="_blank" className="underline hover:text-red-100">Contáctanos para activar tu plan</a>.
                        </div>
                    );
                    return (
                        <div className="bg-blue-600 text-white p-2 text-center text-xs font-semibold">
                            🎁 Estás disfrutando de tus {daysLeft} días de prueba gratis.
                        </div>
                    );
                })()
            )}

            {/* Content */}
            {storeInfo?.trial_ends_at && new Date(storeInfo.trial_ends_at) < new Date() ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100">
                        <div className="text-5xl mb-4">🔒</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Periodo de Prueba Finalizado</h2>
                        <p className="text-gray-600 mb-6">
                            Tu prueba gratuita ha terminado. Para seguir gestionando tu negocio, activa tu plan mensual.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-900">Plan Profesional</span>
                                <span className="font-bold text-lg text-orange-600">$60.000</span>
                            </div>
                            <ul className="text-sm text-gray-500 space-y-1">
                                <li>✅ Pedidos Ilimitados</li>
                                <li>✅ Catálogo Digital QR</li>
                                <li>✅ Panel de Control</li>
                                <li>✅ Soporte Prioritario</li>
                            </ul>
                        </div>

                        <button
                            onClick={async () => {
                                try {
                                    const { createSubscriptionPreference } = await import('@/actions/paymentActions');
                                    const url = await createSubscriptionPreference();
                                    window.location.href = url;
                                } catch (e: any) {
                                    alert("Error iniciando pago: " + e.message);
                                }
                            }}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 shadow-lg"
                        >
                            Pagar Suscripción
                        </button>

                        <p className="mt-6 text-xs text-gray-400">
                            ¿Necesitas extender la prueba? <a href="https://wa.me/5493454286955" target="_blank" className="underline hover:text-orange-600">Contáctanos</a>
                        </p>
                    </div>
                </div>
            ) : (
                <main className="max-w-7xl mx-auto p-6">
                    {loading && activeTab !== 'orders' ? ( // Don't show global loading for orders as we have realtime
                        <div className="py-20 text-center text-gray-500">Cargando datos...</div>
                    ) : (
                        <>
                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">Pedidos Recientes</h2>
                                        {orders.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setConfirmation({
                                                        message: '⚠️ ¿Limpiar pedidos recientes? (Se archivarán)',
                                                        onConfirm: async () => {
                                                            await clearAllOrders();
                                                            loadData();
                                                        }
                                                    });
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
                                            >
                                                🗑 Limpiar Todo
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid gap-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-bold text-lg text-gray-900">{order.customers?.name || 'Cliente'}</span>
                                                        <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                                                            {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mb-2">
                                                        {Array.isArray(order.details) && order.details.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex gap-1">
                                                                <span>{item.quantity}x</span>
                                                                <span>{item.product.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-gray-600 mb-1 flex items-center gap-1">
                                                        📞 {order.customers?.phone}
                                                        <a href={`https://wa.me/${order.customers?.phone}`} target="_blank" className="text-green-600 hover:underline text-xs ml-2">Chat</a>
                                                    </p>
                                                    <p className="text-gray-600 mb-2">{order.delivery_method === 'delivery' ? `🛵 Envío a: ${order.delivery_address}` : '🏃 Retiro en Local'}</p>
                                                </div>
                                                <div className="flex flex-col items-end justify-center gap-2">
                                                    <span className="text-2xl font-bold text-green-600">${order.total_amount?.toLocaleString('es-AR')}</span>
                                                    <div className="flex items-center gap-2">
                                                        {order.delivery_method === 'delivery' && (
                                                            <a
                                                                href={`https://wa.me/${order.customers?.phone}?text=${encodeURIComponent(`Hola ${order.customers?.name || ''}, ¡tu pedido salió en camino! 🛵🍕`)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition flex items-center gap-1 shadow-sm no-underline"
                                                            >
                                                                🛵 Avisar salida
                                                            </a>
                                                        )}
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {order.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                                        </span>
                                                        {order.status !== 'paid' && (
                                                            <button
                                                                onClick={async () => {
                                                                    await updateOrderStatus(order.id, 'paid');
                                                                    loadData();
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
                                        {orders.length === 0 && <p className="text-gray-500 text-center py-10">Esperando pedidos...</p>}
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
                                            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group">
                                                <div className="h-48 relative bg-gray-100">
                                                    {product.image_url && <Image src={product.image_url} alt={product.name} fill className="object-cover" />}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                                                    <p className="text-sm text-gray-500 mb-2 capitalize">{product.category_id.replace('-', ' ')}</p>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="font-bold text-lg">${product.base_price?.toLocaleString('es-AR')}</span>
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
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setConfirmation({
                                                        message: '⚠️ ¿Borrar TODOS los clientes? Esta acción es irreversible.',
                                                        onConfirm: async () => {
                                                            await clearAllCustomers();
                                                            loadData();
                                                        }
                                                    });
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 px-3 py-1 rounded hover:bg-red-50 mr-2 transition"
                                            >
                                                🗑 Limpiar Todo
                                            </button>
                                            <button
                                                onClick={() => setShowInactiveOnly(!showInactiveOnly)}
                                                className={`px-3 py-1 rounded-full text-sm font-medium transition ${showInactiveOnly ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                {showInactiveOnly ? 'Mostrando Inactivos' : 'Mostrar Inactivos'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        {/* Simple list or table */}
                                        {filteredCustomers.map(c => {
                                            const isInactive = c.daysSinceLastOrder > 20;
                                            const message = isInactive
                                                ? `Hola ${c.name}, ¡te extrañamos! 🏃‍♂️💨\n\nHace mucho que no pasas por aquí. Te dejamos un descuento especial para hoy 🎁.\n\nPide aquí: ${typeof window !== 'undefined' ? window.location.origin : ''}/${storeInfo.slug}`
                                                : `Hola ${c.name}, ¡gracias por elegirnos siempre! 🍕`;

                                            return (
                                                <div key={c.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center group">
                                                    <div>
                                                        <p className="font-bold text-gray-900 flex items-center gap-2">
                                                            {c.name}
                                                            <a
                                                                href={`https://wa.me/${c.phone}?text=${encodeURIComponent(message)}`}
                                                                target="_blank"
                                                                className="bg-green-100 text-green-700 p-1.5 rounded-full hover:bg-green-200 transition-colors"
                                                                title={isInactive ? "Enviar promo de recuperación" : "Enviar mensaje"}
                                                            >
                                                                💬
                                                            </a>
                                                        </p>
                                                        <p className="text-sm text-gray-500">{c.phone}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-sm">${c.totalSpent.toLocaleString('es-AR')}</p>
                                                        <p className="text-xs text-gray-500">{c.totalOrders} pedidos</p>
                                                        <p className={`text-xs ${isInactive ? 'text-red-500 font-bold' : 'text-green-600'}`}>
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
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">Estadísticas</h2>
                                        <button
                                            onClick={() => {
                                                setConfirmation({
                                                    message: '⚠️ ¿Borrar todas las estadísticas? Esto reiniciará el historial de ventas pero NO borrará los pedidos ni clientes.',
                                                    onConfirm: async () => {
                                                        await resetAllStats();
                                                        loadData();
                                                    }
                                                });
                                            }}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
                                        >
                                            📉 Limpiar Estadísticas
                                        </button>
                                    </div>
                                    {/* Simple Stats View */}
                                    <div className="flex gap-2 mb-4">
                                        {[
                                            { id: 'day', label: 'Día' },
                                            { id: 'week', label: 'Semana' },
                                            { id: 'month', label: 'Mes' }
                                        ].map((p) => (
                                            <button key={p.id} onClick={() => setRankingPeriod(p.id as any)} className={`px-3 py-1 rounded capitalize ${rankingPeriod === p.id ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>{p.label}</button>
                                        ))}
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <h3 className="text-lg font-bold mb-4">Ranking de Ventas</h3>
                                        <ul>
                                            {ranking.map((item, idx) => (
                                                <li key={idx} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                                    <span>{item.quantity}x {item.name}</span>
                                                    <span className="font-bold">${item.revenue.toLocaleString('es-AR')}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && storeInfo && (
                                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>
                                    <form action={async (formData) => {
                                        const newSettings = {
                                            store_name: formData.get('store_name'),
                                            address: formData.get('address'),
                                            phone: formData.get('phone'),
                                            logo_url: formData.get('logo_url'),
                                            primary_color: formData.get('primary_color'),
                                            categories: categories
                                        };
                                        const res = await updateStoreSettings(newSettings);
                                        if (res.success) alert('Guardado!');
                                        else alert(res.message);
                                    }} className="space-y-4">
                                        <div><label className="text-sm font-bold">Nombre</label><input name="store_name" defaultValue={storeInfo.store_name} className="w-full border p-2 rounded" /></div>
                                        <div><label className="text-sm font-bold">Dirección</label><input name="address" defaultValue={storeInfo.address} className="w-full border p-2 rounded" /></div>
                                        <div><label className="text-sm font-bold">Teléfono/WhatsApp</label><input name="phone" defaultValue={storeInfo.phone} className="w-full border p-2 rounded" /></div>

                                        <div>
                                            <label className="text-sm font-bold block mb-1">Logo URL</label>
                                            <div className="flex gap-2">
                                                <input
                                                    name="logo_url"
                                                    defaultValue={storeInfo.logo_url}
                                                    className="flex-1 border p-2 rounded"
                                                    id="logo-input" // Add ID to target with JS if needed, though we use defaultValue here. 
                                                // Actually, for consistency with the other form, let's use controlled component ONLY if we want immediate preview update.
                                                // But since the original form uses uncontrolled inputs (formData), we can just update the input's value using ref or direct manipulation? 
                                                // Easier: Modify the form to be controlled? No, keep it uncontrolled but use state for the image URL input to support the upload button filling it.
                                                // Let's use a small local component or just useState inside the map.
                                                // Since we are inside the main AdminPage component, we can add a new state for logoUrl.
                                                />
                                                <label className={`cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-2 rounded flex items-center gap-2 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <span className="text-xl">📷</span>
                                                    <span className="text-sm font-medium">{uploading ? '...' : 'Subir'}</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={uploading}
                                                        onChange={async (e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setUploading(true);
                                                                try {
                                                                    const url = await uploadProductImage(e.target.files[0]);
                                                                    // Update the input value directly since it is uncontrolled for now, or better, force a re-render.
                                                                    // Simplest way for this specific form:
                                                                    const input = document.querySelector('input[name="logo_url"]') as HTMLInputElement;
                                                                    if (input) input.value = url;
                                                                } catch (err) {
                                                                    alert('Error subiendo imagen: ' + (err as any).message);
                                                                } finally {
                                                                    setUploading(false);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div><label className="text-sm font-bold">Color</label><input name="primary_color" type="color" defaultValue={storeInfo.primary_color || '#f97316'} className="h-10 w-full" /></div>

                                        {/* Category Management */}
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-bold block mb-2">Categorías de Productos</label>
                                            <div className="space-y-2 mb-3">
                                                {categories.map((cat, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <input
                                                            value={cat.name}
                                                            onChange={(e) => {
                                                                const newCats = [...categories];
                                                                newCats[idx].name = e.target.value;
                                                                // Also update ID if it was auto-generated or allow editing ID? 
                                                                // Better keep ID stable if possible, but for simple MVP let's just edit name.
                                                                // Actually for proper keying we should probably not edit ID of existing items easily or it breaks relations if we used ID.
                                                                // But we use ID as value. Let's assume user just edits display name. 
                                                                // If they want to change ID (which is what is stored in product), it's harder.
                                                                // Let's simplified: Allow editing Name. ID remains. 
                                                                // For NEW items, we generate ID from name.
                                                                setCategories(newCats);
                                                            }}
                                                            className="flex-1 border p-1 px-2 rounded text-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm('¿Borrar categoría?')) {
                                                                    setCategories(categories.filter((_, i) => i !== idx));
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-700 px-2"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Nueva categoría..."
                                                    className="flex-1 border p-1 px-2 rounded text-sm"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = (e.target as HTMLInputElement).value;
                                                            if (val.trim()) {
                                                                const id = val.toLowerCase().replace(/[^a-z0-9]/g, '-');
                                                                setCategories([...categories, { id, name: val }]);
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                        const val = input.value;
                                                        if (val.trim()) {
                                                            const id = val.toLowerCase().replace(/[^a-z0-9]/g, '-');
                                                            setCategories([...categories, { id, name: val }]);
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
                                                >
                                                    Agregar
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Presiona Enter para agregar. Los IDs se generan automáticamente.</p>
                                        </div>

                                        <button
                                            type="submit"
                                            onClick={(e) => {
                                                if (!confirm('⚠️ ¿Estás seguro de que deseas guardar estos cambios en la configuración?')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition"
                                        >
                                            Guardar Cambios
                                        </button>
                                    </form>

                                    <hr className="my-8 border-gray-200" />

                                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">Plan de Suscripción</h3>
                                        <p className="text-gray-600 mb-4 text-sm">
                                            Tu plan actual expira el: <strong>{storeInfo.trial_ends_at ? new Date(storeInfo.trial_ends_at).toLocaleDateString() : 'N/A'}</strong>
                                        </p>
                                        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-bold text-gray-900">Plan Mensual</p>
                                                <p className="text-sm text-gray-500">$60.000 / mes</p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const { createSubscriptionPreference } = await import('@/actions/paymentActions');
                                                        const url = await createSubscriptionPreference();
                                                        window.location.href = url;
                                                    } catch (e: any) {
                                                        alert("Error iniciando pago: " + e.message);
                                                    }
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
                                            >
                                                Pagar Suscripción
                                            </button>
                                        </div>
                                    </div>


                                    <hr className="my-8 border-gray-200" />

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Seguridad</h3>
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            const form = e.target as HTMLFormElement;
                                            const password = (form.elements.namedItem('new_password') as HTMLInputElement).value;
                                            if (password.length < 6) {
                                                alert("La contraseña debe tener al menos 6 caracteres");
                                                return;
                                            }

                                            setLoading(true);
                                            const { error } = await supabase.auth.updateUser({ password: password });
                                            setLoading(false);

                                            if (error) alert("Error: " + error.message);
                                            else {
                                                alert("¡Contraseña actualizada correctamente!");
                                                form.reset();
                                            }
                                        }} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <div className="mb-4">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
                                                <input name="new_password" type="password" placeholder="Mínimo 6 caracteres" className="w-full border p-2 rounded" required minLength={6} />
                                            </div>
                                            <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900 transition">
                                                Actualizar Contraseña
                                            </button>
                                        </form>
                                    </div>

                                    <hr className="my-8 border-gray-200" />
                                    <div>
                                        <h3 className="text-lg font-bold text-red-600 mb-4">Zona de Peligro</h3>
                                        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                                            <p className="text-sm text-red-800 mb-4">
                                                Si eliminas tu cuenta, se borrarán permanentemente tu tienda, productos, pedidos y clientes. Esta acción no se puede deshacer.
                                            </p>
                                            <button
                                                onClick={() => setDeleteModalOpen(true)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition"
                                            >
                                                Eliminar Cuenta
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            )}

            {/* Modal for Product Edit */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Editar' : 'Nuevo'}</h3>
                            <form action={async (formData) => {
                                if (!confirm('⚠️ ¿Estás seguro de que deseas guardar este producto?')) return;
                                if (editingProduct) await updateProduct(editingProduct.id, formData);
                                else await createProduct(formData);
                                setIsModalOpen(false);
                                loadData();
                            }} className="space-y-4">
                                <input name="name" placeholder="Nombre" defaultValue={editingProduct?.name} required className="w-full border p-2 rounded" />
                                <textarea name="description" placeholder="Descripción" defaultValue={editingProduct?.description} className="w-full border p-2 rounded" />
                                <input name="price" type="number" placeholder="Precio" defaultValue={editingProduct?.base_price} required className="w-full border p-2 rounded" />
                                <select name="categoryId" defaultValue={editingProduct?.category_id || categories[0]?.id || 'pizzas'} className="w-full border p-2 rounded capitalize">
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Imagen</label>
                                    <div className="flex gap-2">
                                        <input
                                            name="image"
                                            placeholder="URL Imagen"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="flex-1 border p-2 rounded"
                                        />
                                        <label className={`cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-2 rounded flex items-center gap-2 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <span className="text-xl">📷</span>
                                            <span className="text-sm font-medium">{uploading ? '...' : 'Subir'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={uploading}
                                                onChange={async (e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setUploading(true);
                                                        try {
                                                            const url = await uploadProductImage(e.target.files[0]);
                                                            setImageUrl(url);
                                                        } catch (err) {
                                                            alert('Error subiendo imagen: ' + (err as any).message);
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    {imageUrl && (
                                        <div className="relative h-40 w-full bg-gray-100 rounded overflow-hidden border border-gray-200">
                                            <Image src={imageUrl} alt="Preview" fill className="object-contain" />
                                        </div>
                                    )}
                                </div>

                                {/* Discounts handling simplified for MVP */}
                                <div className="bg-gray-50 p-2 rounded">
                                    <p className="text-xs font-bold mb-2">Descuentos Diarios (%)</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[0, 1, 2, 3, 4, 5, 6].map(d => (
                                            <div key={d}>
                                                <span className="text-xs text-gray-500">{['D', 'L', 'M', 'X', 'J', 'V', 'S'][d]}</span>
                                                <input
                                                    name={`discount_${d}`}
                                                    className="w-full text-xs border p-1 rounded"
                                                    defaultValue={editingProduct?.discounts?.find((x: any) => x.day_of_week === d)?.percent || ''}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-full bg-orange-600 text-white font-bold py-2 rounded">Guardar</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Password Reset Modal */}
            {
                showPasswordReset && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-4 text-center">🔐 Restablecer Contraseña</h3>
                            <p className="text-gray-600 mb-6 text-center text-sm">
                                Has iniciado sesión vía recuperación. Por favor establece una nueva contraseña para tu cuenta.
                            </p>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const password = (form.elements.namedItem('reset_new_password') as HTMLInputElement).value;

                                if (password.length < 6) {
                                    alert("Mínimo 6 caracteres");
                                    return;
                                }

                                const { error } = await supabase.auth.updateUser({ password });

                                if (error) {
                                    alert("Error: " + error.message);
                                } else {
                                    alert("¡Contraseña establecida con éxito!");
                                    setShowPasswordReset(false);
                                    // Clean URL
                                    router.push('/admin');
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
                                    <input name="reset_new_password" type="password" placeholder="********" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required minLength={6} />
                                </div>
                                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition">
                                    Guardar Nueva Contraseña
                                </button>
                                <button type="button" onClick={() => setShowPasswordReset(false)} className="w-full text-gray-500 text-sm py-2">
                                    Cancelar / Hacerlo después
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Confirmation Modal */}
            {
                confirmation && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
                            <p className="mb-4 font-bold">{confirmation.message}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmation(null)} className="flex-1 py-2 bg-gray-100 rounded">No</button>
                                <button onClick={() => { confirmation.onConfirm(); setConfirmation(null); }} className="flex-1 py-2 bg-red-600 text-white rounded">Sí</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Account Deletion Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl border-2 border-red-100">
                        <h3 className="text-2xl font-bold mb-4 text-red-600">⚠️ Eliminar Cuenta</h3>
                        <p className="text-gray-600 mb-6 text-sm">
                            Esta acción es <strong>irreversible</strong>. Escribe <span className="font-mono font-bold select-all bg-gray-100 px-1 rounded">ELIMINAR</span> abajo para confirmar.
                        </p>

                        <input
                            className="w-full border p-3 rounded mb-4 text-center tracking-widest uppercase font-bold"
                            placeholder="Escribe ELIMINAR"
                            value={deleteInput}
                            onChange={e => setDeleteInput(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setDeleteInput('');
                                }}
                                className="flex-1 py-3 bg-gray-100 font-bold text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={deleteInput !== 'ELIMINAR'}
                                onClick={async () => {
                                    if (deleteInput !== 'ELIMINAR') return;

                                    if (!confirm('¿Última oportunidad? Se borrará todo.')) return;

                                    setLoading(true);
                                    try {
                                        const { deleteAccount } = await import('@/actions/settingsActions');
                                        const res = await deleteAccount();
                                        if (res.success) {
                                            alert('Cuenta eliminada. Gracias por usar LoyalApp.');
                                            window.location.href = '/login';
                                        } else {
                                            alert('Error: ' + res.message);
                                            setLoading(false);
                                        }
                                    } catch (err: any) {
                                        alert('Error crítico: ' + err.message);
                                        setLoading(false);
                                    }
                                }}
                                className={`flex-1 py-3 font-bold text-white rounded-lg transition ${deleteInput === 'ELIMINAR'
                                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200'
                                    : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? 'Eliminando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
