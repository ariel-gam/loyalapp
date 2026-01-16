'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecentOrders, getAdminProducts, createProduct, deleteProduct, toggleProductAvailability, getAdminStats, updateProduct, getCustomers, updateOrderStatus, archiveOrder, clearAllOrders, resetAllStats, clearAllCustomers, bulkUpdateProductPrices } from '@/actions/adminActions';
import { getStoreSettings, updateStoreSettings } from '@/actions/settingsActions';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { uploadProductImage } from '@/utils/uploadImage';
import InstallAppButton from '@/components/InstallAppButton';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'stats' | 'customers' | 'settings' | 'help'>('orders');

    // Store Info
    const [storeInfo, setStoreInfo] = useState<any>(null);
    const [storeNotFound, setStoreNotFound] = useState(false);

    // Data State
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        totalRevenue: 0,
        totalOrders: 0,
        averageTicket: 0,
        deliveryStats: { delivery: 0, pickup: 0 },
        ranking: []
    });
    const [rankingPeriod, setRankingPeriod] = useState<'day' | 'week' | 'month'>('day');
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showInactiveOnly, setShowInactiveOnly] = useState(false);
    const [newOrderAlert, setNewOrderAlert] = useState(false);

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

    // Schedule State
    const [schedule, setSchedule] = useState<{
        openTime: string;
        closeTime: string;
        ranges: { id: string; open: string; close: string }[];
        closedDates: string[];
    }>({
        openTime: '',
        closeTime: '',
        ranges: [],
        closedDates: []
    });

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    // Confirmation State
    const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void } | null>(null);

    // Delivery Zones State
    const [deliveryZones, setDeliveryZones] = useState<{ id: string, name: string; price: number }[]>([]);
    const [deliveryEnabled, setDeliveryEnabled] = useState(true);

    // Logistics / Delay State
    const [delayTime, setDelayTime] = useState(0); // Minutes
    const [autoDelay, setAutoDelay] = useState(false);
    const [lastAutoUpdate, setLastAutoUpdate] = useState(0); // Timestamp to prevent spamming updates

    // Bulk Edit State
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [bulkPercentage, setBulkPercentage] = useState<string>('');
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    // Category Management State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Automatic Delay Monitor
    useEffect(() => {
        if (!autoDelay) return;
        const interval = setInterval(async () => {
            const now = Date.now();
            let redCount = 0;
            const pendingOrders = orders.filter(o => o.status !== 'paid');

            pendingOrders.forEach(o => {
                const created = new Date(o.created_at).getTime();
                const elapsed = (now - created) / 60000;
                if (elapsed > 30) redCount++;
            });

            if (redCount >= 3 && (now - lastAutoUpdate > 900000)) {
                const newDelay = delayTime < 30 ? 30 : delayTime + 15;
                setDelayTime(newDelay);
                setLastAutoUpdate(now);

                const { updateStoreSettings } = await import('@/actions/settingsActions');
                await updateStoreSettings({
                    ...storeInfo.settings,
                    store_name: storeInfo.store_name,
                    delayTime: newDelay,
                    autoDelayEnabled: true
                });

                alert(`⚠️ ALERTA DE COCINA: Se detectaron ${redCount} pedidos con demora. Se ha aumentado el tiempo de espera a ${newDelay} min.`);
            }

        }, 30000);

        return () => clearInterval(interval);
    }, [orders, autoDelay, delayTime, lastAutoUpdate, storeInfo]);

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
                if (info.schedule) {
                    let initialRanges = Array.isArray(info.schedule.ranges) ? info.schedule.ranges : [];
                    if (initialRanges.length === 0 && info.schedule.openTime && info.schedule.closeTime) {
                        initialRanges = [{
                            id: Date.now().toString(),
                            open: info.schedule.openTime,
                            close: info.schedule.closeTime
                        }];
                    }

                    setSchedule({
                        openTime: info.schedule.openTime || '',
                        closeTime: info.schedule.closeTime || '',
                        ranges: initialRanges,
                        closedDates: Array.isArray(info.schedule.closedDates) ? info.schedule.closedDates : []
                    });
                }
                if (info.deliveryZones && Array.isArray(info.deliveryZones)) {
                    setDeliveryZones(info.deliveryZones);
                }
                if (info.deliveryEnabled !== undefined) {
                    setDeliveryEnabled(info.deliveryEnabled);
                }
                if (info.delayTime !== undefined) setDelayTime(info.delayTime);
                if (info.autoDelayEnabled !== undefined) setAutoDelay(info.autoDelayEnabled);

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
        if (!storeInfo || !supabase) return;

        // Function to play beep sound
        const playBeep = () => {
            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);

                console.log('🔊 Sonido reproducido exitosamente');
                setSoundEnabled(true);
            } catch (e) {
                console.warn("⚠️ No se pudo reproducir el sonido:", e);
            }
        };

        console.log("🔌 Iniciando conexión Realtime para tienda:", storeInfo.id);
        const channel = supabase
            .channel('realtime_orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${storeInfo.id}` },
                async (payload) => {
                    console.log('🔔 Cambio en pedidos detectado:', payload);

                    if (payload.eventType === 'INSERT') {
                        // Play beep sound for new orders
                        if (soundEnabled) {
                            playBeep();
                        }

                        // Show visual alert banner
                        setNewOrderAlert(true);
                        setTimeout(() => setNewOrderAlert(false), 5000);

                        // Visual notification
                        if (typeof window !== 'undefined' && document.hidden) {
                            document.title = '🔔 NUEVO PEDIDO - LoyalApp';
                            setTimeout(() => {
                                document.title = 'LoyalApp - Admin';
                            }, 5000);
                        }
                    }

                    if (activeTab === 'orders') {
                        getRecentOrders().then(setOrders);
                    }
                }
            )
            .subscribe((status) => {
                console.log("📡 Estado:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [storeInfo, activeTab, soundEnabled]);

    const loadData = async () => {
        setLoading(true);
        if (activeTab === 'orders') {
            const data = await getRecentOrders();
            setOrders(data);
        } else if (activeTab === 'products') {
            const data = await getAdminProducts();
            setProducts(data);
        } else if (activeTab === 'stats') {
            const data = await getAdminStats(rankingPeriod);
            setStats(data);
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

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        if (categories.some(c => c.id === slug)) return alert("La categoría ya existe");

        const newCategories = [...categories, { id: slug, name: newCategoryName.trim() }];
        setCategories(newCategories);
        setNewCategoryName('');

        // Persist
        if (storeInfo) {
            const { updateStoreSettings } = await import('@/actions/settingsActions');
            await updateStoreSettings({
                ...storeInfo.settings,
                store_name: storeInfo.store_name,
                categories: newCategories
            });
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("¿Seguro que quieres borrar esta categoría?")) return;
        if (products.some(p => p.category_id === id)) return alert("No puedes borrar una categoría que tiene productos. Elimina o mueve los productos primero.");

        const newCategories = categories.filter(c => c.id !== id);
        setCategories(newCategories);

        // Persist
        if (storeInfo) {
            const { updateStoreSettings } = await import('@/actions/settingsActions');
            await updateStoreSettings({
                ...storeInfo.settings,
                store_name: storeInfo.store_name,
                categories: newCategories
            });
        }
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
                <button onClick={() => window.location.reload()} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition">Reintentar</button>
                <button onClick={() => router.push('/setup')} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition">Crear Tienda</button>
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
                    {(['orders', 'products', 'customers', 'stats', 'settings', 'help'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${activeTab === tab ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab === 'stats' ? 'Estadísticas' : tab === 'settings' ? 'Configuración' : tab === 'orders' ? 'Pedidos' : tab === 'products' ? 'Productos' : tab === 'customers' ? 'Clientes' : 'Ayuda 💡'}
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

            {/* New Order Alert Banner */}
            {newOrderAlert && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 text-center font-bold text-lg animate-pulse shadow-lg">
                    🔔 ¡NUEVO PEDIDO RECIBIDO! 🍕
                </div>
            )}

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
                                <span className="font-bold text-gray-900">
                                    {storeInfo?.settings?.promo_used ? 'Plan Profesional' : 'Plan Profesional (Promo)'}
                                </span>
                                <span className="font-bold text-lg text-orange-600">
                                    {storeInfo?.settings?.promo_used ? '$60.000' : '$35.000'}
                                </span>
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
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            {/* Logistics Control Panel */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 mb-6">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            ⏱️ Gestión de Demora
                                            {delayTime > 0 && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">Activa</span>}
                                        </h3>
                                        <p className="text-sm text-gray-500">Tiempo extra que se suma al estimado de envío.</p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                                        <div className="text-center min-w-[80px]">
                                            <span className="block text-2xl font-bold text-orange-600">{delayTime} min</span>
                                            <span className="text-xs text-gray-400">Demora Actual</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    const newDelay = Math.max(0, delayTime - 15);
                                                    setDelayTime(newDelay);
                                                    const { updateStoreSettings } = await import('@/actions/settingsActions');
                                                    await updateStoreSettings({ ...storeInfo.settings, store_name: storeInfo.store_name, delayTime: newDelay });
                                                }}
                                                className="w-10 h-10 rounded-full bg-white border hover:bg-gray-100 font-bold text-gray-600 transition"
                                            >-15</button>
                                            <button
                                                onClick={async () => {
                                                    const newDelay = delayTime + 15;
                                                    setDelayTime(newDelay);
                                                    const { updateStoreSettings } = await import('@/actions/settingsActions');
                                                    await updateStoreSettings({ ...storeInfo.settings, store_name: storeInfo.store_name, delayTime: newDelay });
                                                }}
                                                className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold transition shadow-lg shadow-orange-200"
                                            >+15</button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 border-l pl-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autoDelay}
                                                onChange={async (e) => {
                                                    const checked = e.target.checked;
                                                    setAutoDelay(checked);
                                                    const { updateStoreSettings } = await import('@/actions/settingsActions');
                                                    await updateStoreSettings({ ...storeInfo.settings, store_name: storeInfo.store_name, autoDelayEnabled: checked });
                                                }}
                                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Auto-Ajuste</span>
                                        </label>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    // Create and load audio
                                                    const bell = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3');
                                                    bell.volume = 0.8;

                                                    // Try to play
                                                    await bell.play();

                                                    // Success
                                                    setSoundEnabled(true);
                                                    alert("✅ ¡Sonido activado! Ahora recibirás notificaciones sonoras cuando lleguen nuevos pedidos.");
                                                } catch (error) {
                                                    console.error("Error al activar sonido:", error);

                                                    // Try alternative approach with AudioContext
                                                    try {
                                                        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                                                        await audioContext.resume();

                                                        const bell = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3');
                                                        bell.volume = 0.8;
                                                        await bell.play();

                                                        setSoundEnabled(true);
                                                        alert("✅ ¡Sonido activado! Ahora recibirás notificaciones sonoras cuando lleguen nuevos pedidos.");
                                                    } catch (retryError) {
                                                        console.error("Error en segundo intento:", retryError);
                                                        // Force enable anyway - the sound will work on next order
                                                        setSoundEnabled(true);
                                                        alert("⚠️ Configuración de sonido guardada.\n\n" +
                                                            "Si no escuchaste el sonido de prueba:\n" +
                                                            "1. Verifica que el volumen de tu dispositivo esté activado\n" +
                                                            "2. Haz clic en el ícono 🔒 en la barra de direcciones\n" +
                                                            "3. Permite el sonido para este sitio\n\n" +
                                                            "El sonido funcionará cuando llegue el próximo pedido.");
                                                    }
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border font-medium ${soundEnabled
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 animate-pulse'
                                                }`}
                                        >
                                            {soundEnabled ? (
                                                <>
                                                    <span className="text-xl">🔊</span>
                                                    <span>Sonido Activo</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xl">🔔</span>
                                                    <span>¡Haz clic para activar notificaciones!</span>
                                                </>
                                            )}
                                        </button>
                                        {soundEnabled && (
                                            <button
                                                onClick={() => {
                                                    try {
                                                        // Create beep sound using Web Audio API
                                                        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                                                        const oscillator = audioContext.createOscillator();
                                                        const gainNode = audioContext.createGain();

                                                        oscillator.connect(gainNode);
                                                        gainNode.connect(audioContext.destination);

                                                        // Configure beep sound
                                                        oscillator.frequency.value = 800; // Frequency in Hz
                                                        oscillator.type = 'sine';

                                                        // Volume envelope
                                                        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                                                        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                                                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                                                        // Play beep
                                                        oscillator.start(audioContext.currentTime);
                                                        oscillator.stop(audioContext.currentTime + 0.5);

                                                        alert("🔊 ¡Sonido reproducido!\n\nSi escuchaste un 'BEEP', todo funciona correctamente.\n\nCuando llegue un pedido, escucharás este mismo sonido.");
                                                    } catch (err) {
                                                        console.error("Error reproduciendo sonido:", err);
                                                        alert("⚠️ Error al reproducir sonido.\n\nIntenta:\n1. Recargar la página\n2. Usar Chrome o Firefox\n3. Verificar que el volumen esté alto");
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition font-medium text-sm"
                                            >
                                                <span>🔊</span>
                                                <span>Probar Sonido</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

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
                                <OrdersList orders={orders} updateOrderStatus={updateOrderStatus} archiveOrder={archiveOrder} loadData={loadData} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div>
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-gray-800">Mis Productos</h2>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            if (selectedProducts.size === products.length) {
                                                setSelectedProducts(new Set());
                                            } else {
                                                setSelectedProducts(new Set(products.map(p => p.id)));
                                            }
                                        }}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                                    >
                                        {selectedProducts.size > 0 && selectedProducts.size === products.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                    </button>
                                    <button onClick={() => setIsCategoryModalOpen(true)} className="bg-white border text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">📂 Gestionar Categorías</button>
                                    <button onClick={handleCreateNew} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition">+ Nuevo Producto</button>
                                </div>
                            </div>
                            {selectedProducts.size > 0 && (
                                <div className="sticky top-4 z-40 bg-white border-2 border-orange-500 shadow-xl rounded-xl p-4 mb-6 flex items-center justify-between animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-4">
                                        <span className="bg-orange-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                                            {selectedProducts.size} seleccionados
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-700 font-medium">Aumentar Precios:</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={bulkPercentage}
                                                    onChange={(e) => setBulkPercentage(e.target.value)}
                                                    placeholder="10"
                                                    className="w-20 border border-gray-300 rounded-lg py-1 px-2 text-right font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                                />
                                                <span className="absolute right-7 top-1.5 text-gray-400 font-bold">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedProducts(new Set())}
                                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!bulkPercentage || isNaN(Number(bulkPercentage))) return alert("Ingresa un porcentaje válido");
                                                if (!confirm(`¿Estás seguro de aumentar un ${bulkPercentage}% el precio de ${selectedProducts.size} productos?`)) return;

                                                setIsBulkUpdating(true);
                                                const res = await bulkUpdateProductPrices(Array.from(selectedProducts), Number(bulkPercentage));
                                                setIsBulkUpdating(false);

                                                if (res.success) {
                                                    alert(res.message);
                                                    setSelectedProducts(new Set());
                                                    setBulkPercentage('');
                                                    loadData();
                                                } else {
                                                    alert("Error: " + res.message);
                                                }
                                            }}
                                            disabled={isBulkUpdating || !bulkPercentage}
                                            className="bg-orange-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:scale-105 transition transform"
                                        >
                                            {isBulkUpdating ? 'Actualizando...' : 'Aplicar Aumento'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-10">
                                {categories.map(category => {
                                    const categoryProducts = products.filter(p => p.category_id === category.id);
                                    if (categoryProducts.length === 0) return null;

                                    return (
                                        <div key={category.id}>
                                            <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                                                <span className="bg-orange-100 text-orange-600 w-8 h-8 flex items-center justify-center rounded-lg text-sm">
                                                    {categoryProducts.length}
                                                </span>
                                                {category.name}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {categoryProducts.map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className={`rounded-xl shadow-sm border overflow-hidden relative group transition-all cursor-pointer ${selectedProducts.has(product.id) ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-50' : 'bg-white border-gray-100 hover:shadow-md'}`}
                                                        onClick={(e) => {
                                                            // Allow clicking anywhere on card to select, unless clicking a button
                                                            if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) return;
                                                            const newSet = new Set(selectedProducts);
                                                            if (newSet.has(product.id)) newSet.delete(product.id);
                                                            else newSet.add(product.id);
                                                            setSelectedProducts(newSet);
                                                        }}
                                                    >
                                                        <div className="absolute top-2 left-2 z-10">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedProducts.has(product.id)}
                                                                onChange={() => { }} // Handled by parent click
                                                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer shadow-sm border-gray-300"
                                                            />
                                                        </div>
                                                        <div className="h-48 relative bg-gray-100">
                                                            {product.image_url && <Image src={product.image_url} alt={product.name} fill className="object-cover" />}
                                                        </div>
                                                        <div className="p-4">
                                                            <h3 className="font-bold text-gray-900">{product.name}</h3>
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
                                    );
                                })}
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
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Panel de Rendimiento</h2>
                                    <p className="text-gray-500 text-sm">Monitorea el crecimiento de tu negocio en tiempo real.</p>
                                </div>
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                    {[
                                        { id: 'day', label: 'Hoy' },
                                        { id: 'week', label: 'Semana' },
                                        { id: 'month', label: 'Mes' }
                                    ].map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setRankingPeriod(p.id as any)}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${rankingPeriod === p.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <span className="text-gray-500 text-sm font-medium mb-1">Ventas Totales</span>
                                    <span className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString('es-AR')}</span>
                                    <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full self-start">Ingresos Brutos</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <span className="text-gray-500 text-sm font-medium mb-1">Total Pedidos</span>
                                    <span className="text-2xl font-bold text-blue-600">{stats.totalOrders}</span>
                                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full self-start">Gestionados</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <span className="text-gray-500 text-sm font-medium mb-1">Ticket Promedio</span>
                                    <span className="text-2xl font-bold text-orange-600">${stats.averageTicket.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                                    <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full self-start">Por Cliente</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <span className="text-gray-500 text-sm font-medium mb-1">Logística</span>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="text-center">
                                            <span className="block text-lg font-bold text-gray-800">{stats.deliveryStats.delivery}</span>
                                            <span className="text-[10px] text-gray-400 uppercase">🛵 Envío</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-100"></div>
                                        <div className="text-center">
                                            <span className="block text-lg font-bold text-gray-800">{stats.deliveryStats.pickup}</span>
                                            <span className="text-[10px] text-gray-400 uppercase">🏃 Retiro</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Ranking Visual */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        🏆 Productos más Vendidos
                                    </h3>
                                    <div className="space-y-6">
                                        {stats.ranking.length > 0 ? (
                                            stats.ranking.map((item: any, idx: number) => {
                                                const maxQty = stats.ranking[0].quantity;
                                                const percentage = (item.quantity / maxQty) * 100;
                                                return (
                                                    <div key={idx} className="space-y-2">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="font-medium text-gray-700">{item.name}</span>
                                                            <span className="text-gray-500">{item.quantity} unidades • <span className="font-bold text-gray-900">${item.revenue.toLocaleString('es-AR')}</span></span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-center py-10 text-gray-400 italic">No hay datos suficientes para el período seleccionado.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Distribution / Pie placeholder */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6">Método de Entrega</h3>
                                    <div className="flex flex-col items-center justify-center h-[200px] relative">
                                        {stats.totalOrders > 0 ? (
                                            <>
                                                {/* Simple CSS-based donut/chart representation */}
                                                <div className="w-32 h-32 rounded-full border-[16px] border-orange-500 flex items-center justify-center relative">
                                                    <div className="text-center">
                                                        <span className="block text-2xl font-bold text-gray-800">{Math.round((stats.deliveryStats.delivery / stats.totalOrders) * 100)}%</span>
                                                        <span className="text-[10px] text-gray-400 uppercase">Delivery</span>
                                                    </div>
                                                </div>
                                                <div className="mt-8 grid grid-cols-2 gap-4 w-full text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                        <span className="text-gray-600">Envío ({stats.deliveryStats.delivery})</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                                                        <span className="text-gray-600">Retiro ({stats.deliveryStats.pickup})</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-400 text-sm">Sin pedidos registrados</p>
                                        )}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100">
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
                                            className="w-full text-red-500 hover:text-red-700 text-xs font-semibold py-2 transition rounded hover:bg-red-50"
                                        >
                                            📉 Reiniciar Historial
                                        </button>
                                    </div>
                                </div>
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
                                    categories: categories,
                                    schedule: schedule,
                                    deliveryZones: deliveryZones,
                                    deliveryEnabled: deliveryEnabled,
                                    cbu: formData.get('cbu'),
                                    alias: formData.get('alias'),
                                    bank_name: formData.get('bank_name')
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

                                {/* Bank Details Config */}
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <h4 className="text-md font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                        🏦 Datos Bancarios (Para Transferencias)
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase mb-1 block">Nombre del Banco</label>
                                            <input name="bank_name" defaultValue={storeInfo.bank_name} placeholder="Ej: Banco Galicia" className="w-full border p-2 rounded text-sm" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-700 uppercase mb-1 block">CBU / CVU</label>
                                                <input name="cbu" defaultValue={storeInfo.cbu} placeholder="0000..." className="w-full border p-2 rounded text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-700 uppercase mb-1 block">Alias</label>
                                                <input name="alias" defaultValue={storeInfo.alias} placeholder="ejemplo.alias.mp" className="w-full border p-2 rounded text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-emerald-700 mt-2">
                                        Estos datos se mostrarán a tus clientes cuando elijan pagar con transferencia.
                                    </p>
                                </div>

                                {/* Schedule Config */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="text-md font-bold text-blue-800 mb-4 flex items-center gap-2">
                                        ⏰ Horarios y Disponibilidad
                                    </h4>

                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-bold text-gray-700 uppercase">Turnos de Apertura</label>
                                            <button
                                                type="button"
                                                onClick={() => setSchedule({
                                                    ...schedule,
                                                    ranges: [...(schedule.ranges || []), { id: Date.now().toString(), open: '', close: '' }]
                                                })}
                                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                            >
                                                + Agregar Turno
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {schedule.ranges?.map((range, idx) => (
                                                <div key={range.id} className="flex gap-2 items-center">
                                                    <input
                                                        type="time"
                                                        value={range.open}
                                                        onChange={(e) => {
                                                            const newRanges = [...schedule.ranges];
                                                            newRanges[idx].open = e.target.value;
                                                            setSchedule({ ...schedule, ranges: newRanges });
                                                        }}
                                                        className="w-full border p-2 rounded bg-white text-sm"
                                                    />
                                                    <span className="text-gray-400 text-xs">a</span>
                                                    <input
                                                        type="time"
                                                        value={range.close}
                                                        onChange={(e) => {
                                                            const newRanges = [...schedule.ranges];
                                                            newRanges[idx].close = e.target.value;
                                                            setSchedule({ ...schedule, ranges: newRanges });
                                                        }}
                                                        className="w-full border p-2 rounded bg-white text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSchedule({
                                                                ...schedule,
                                                                ranges: schedule.ranges.filter((_, i) => i !== idx)
                                                            });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 font-bold px-2"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            {(!schedule.ranges || schedule.ranges.length === 0) && (
                                                <div className="text-sm text-gray-500 italic p-2 bg-white rounded border border-gray-100 text-center">
                                                    Sin horarios definidos (Abierto 24hs)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-600 mb-4">
                                        Puedes agregar múltiples turnos (ej. Mediodía y Noche).
                                    </p>

                                    <div className="border-t border-blue-200 pt-4">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Fechas Cerradas (Feriados/Vacaciones)</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="date"
                                                id="closed-date-picker"
                                                className="flex-1 border p-2 rounded text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const input = document.getElementById('closed-date-picker') as HTMLInputElement;
                                                    if (input.value && !schedule.closedDates.includes(input.value)) {
                                                        setSchedule({
                                                            ...schedule,
                                                            closedDates: [...schedule.closedDates, input.value].sort()
                                                        });
                                                        input.value = '';
                                                    }
                                                }}
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {schedule.closedDates.map((date) => (
                                                <span key={date} className="bg-white border border-blue-200 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-2">
                                                    {new Date(date + 'T12:00:00').toLocaleDateString()}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSchedule({
                                                            ...schedule,
                                                            closedDates: schedule.closedDates.filter(d => d !== date)
                                                        })}
                                                        className="text-red-500 hover:text-red-700 font-bold"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                            {schedule.closedDates.length === 0 && <span className="text-gray-400 text-xs italic">No hay fechas bloqueadas</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Zones Config */}
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-md font-bold text-orange-800 flex items-center gap-2">
                                            🛵 Zonas de Envío
                                        </h4>
                                        <label className="flex items-center cursor-pointer relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={deliveryEnabled}
                                                onChange={(e) => setDeliveryEnabled(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                            <span className="ml-3 text-sm font-medium text-orange-900">{deliveryEnabled ? 'Activado' : 'Desactivado'}</span>
                                        </label>
                                    </div>

                                    {deliveryEnabled && (
                                        <>
                                            <div className="space-y-3 mb-4">
                                                {deliveryZones.map((zone, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded shadow-sm">
                                                        <input
                                                            placeholder="Nombre Zona (Ej: Centro)"
                                                            value={zone.name}
                                                            onChange={(e) => {
                                                                const newZones = [...deliveryZones];
                                                                newZones[idx].name = e.target.value;
                                                                setDeliveryZones(newZones);
                                                            }}
                                                            className="flex-1 border p-1 rounded text-sm"
                                                        />
                                                        <span className="text-gray-500 font-bold">$</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Precio"
                                                            value={zone.price}
                                                            onChange={(e) => {
                                                                const newZones = [...deliveryZones];
                                                                newZones[idx].price = Number(e.target.value);
                                                                setDeliveryZones(newZones);
                                                            }}
                                                            className="w-24 border p-1 rounded text-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeliveryZones(deliveryZones.filter((_, i) => i !== idx))}
                                                            className="text-red-500 hover:text-red-700 px-2 font-bold"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setDeliveryZones([...deliveryZones, { id: Date.now().toString(), name: '', price: 0 }])}
                                                    className="bg-orange-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-orange-700 transition w-full"
                                                >
                                                    + Agregar Zona
                                                </button>
                                            </div>
                                            <p className="text-xs text-orange-600 mt-2">
                                                Si agregas zonas, el cliente deberá elegir una al pedir envío a domicilio y el costo se sumará automáticamente.
                                            </p>
                                        </>
                                    )}
                                </div>

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


                    {activeTab === 'help' && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                                <div className="bg-orange-50 p-6 border-b border-orange-100">
                                    <h2 className="text-2xl font-bold text-orange-800">Centro de Ayuda 🆘</h2>
                                    <p className="text-orange-700 mt-2">Guía rápida para administrar tu negocio sin complicaciones.</p>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {/* FAQ Items */}
                                    <div className="p-4">
                                        <details className="group">
                                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800 hover:text-orange-600 transition-colors">
                                                ¿Cómo cargo un nuevo producto?
                                                <span className="group-open:rotate-180 transition-transform">▼</span>
                                            </summary>
                                            <p className="mt-4 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                Ve a la pestaña <strong>"Productos"</strong> y pulsa el botón naranja <strong>"+ Nuevo Producto"</strong>. Completa el nombre, precio y sube una foto linda. ¡Listo!
                                            </p>
                                        </details>
                                    </div>

                                    <div className="p-4">
                                        <details className="group">
                                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800 hover:text-orange-600 transition-colors">
                                                ¿Cómo pauso un producto que no tengo?
                                                <span className="group-open:rotate-180 transition-transform">▼</span>
                                            </summary>
                                            <p className="mt-4 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                En la lista de productos, verás un botón verde que dice <strong>"Disponible"</strong>. Haz clic ahí y cambiará a rojo <strong>"Agotado"</strong>. Los clientes verán el producto pero no podrán pedirlo.
                                            </p>
                                        </details>
                                    </div>

                                    <div className="p-4">
                                        <details className="group">
                                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800 hover:text-orange-600 transition-colors">
                                                ¿Cómo funciona el sonido de pedidos?
                                                <span className="group-open:rotate-180 transition-transform">▼</span>
                                            </summary>
                                            <p className="mt-4 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                En la pestaña <strong>"Pedidos"</strong>, activa el botón de la campana 🔔.
                                                IMPORTANTE: Debes tener la página abierta (aunque sea en segundo plano) para escuchar el sonido.
                                                Si estás en el celular, asegúrate de que no esté en modo "No Molestar".
                                            </p>
                                        </details>
                                    </div>

                                    <div className="p-4">
                                        <details className="group">
                                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800 hover:text-orange-600 transition-colors">
                                                ¿Cómo instalo el panel en mi celular?
                                                <span className="group-open:rotate-180 transition-transform">▼</span>
                                            </summary>
                                            <p className="mt-4 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                Haz clic en el botón <strong>"Instalar App"</strong> que ves arriba a la derecha en la barra de navegación. Esto creará un icono directo en tu pantalla de inicio para que entres como una aplicación común.
                                            </p>
                                        </details>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl relative my-auto">
                                <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                                <form action={async (formData) => {
                                    setLoading(true);
                                    // Add store_id manual if needed, but actions usually handle it via RLS + getAuthStore
                                    // Just ensure we pass necessary data
                                    const name = formData.get('name') as string;
                                    const price = parseFloat(formData.get('price') as string);
                                    const categoryId = formData.get('category') as string;
                                    const description = formData.get('description') as string;
                                    const imageFile = formData.get('image') as File;

                                    let imageUrl = editingProduct?.image_url;

                                    if (imageFile && imageFile.size > 0) {
                                        const uploadRes = await uploadProductImage(imageFile);
                                        if (!uploadRes) return alert("Error subiendo imagen");
                                        imageUrl = uploadRes;
                                    }

                                    const result = editingProduct
                                        ? await updateProduct(editingProduct.id, formData)
                                        : await createProduct(formData);

                                    setLoading(false);

                                    if (result.success) {
                                        setIsModalOpen(false);
                                        setEditingProduct(null);
                                        loadData();
                                    } else {
                                        alert("Error: " + result.message);
                                    }
                                }} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                        <input name="name" required defaultValue={editingProduct?.name} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej: Pizza Muzzarella" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Precio</label>
                                        <input name="price" type="number" required defaultValue={editingProduct?.base_price} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                        <select name="category" required defaultValue={editingProduct?.category_id || categories[0]?.id} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                                        <textarea name="description" defaultValue={editingProduct?.description} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ingredientes, detalles..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Imagen</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition relative">
                                            <input
                                                type="file"
                                                name="image"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        // Preview logic could go here
                                                    }
                                                }}
                                            />
                                            <span className="text-gray-500 text-sm">Tocá para subir foto 📸</span>
                                        </div>
                                        {editingProduct?.image_url && (
                                            <div className="mt-2 relative h-20 w-full rounded overflow-hidden">
                                                <Image src={editingProduct.image_url} alt="Preview" fill className="object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <button disabled={loading} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition disabled:bg-gray-400">
                                        {loading ? 'Guardando...' : 'Guardar Producto'}
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 py-3 font-medium">Cancelar</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {confirmation && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
                            <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
                                <p className="mb-4 font-bold text-gray-800 text-lg">{confirmation.message}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setConfirmation(null)} className="flex-1 py-2 bg-gray-100 rounded-lg font-medium text-gray-700 hover:bg-gray-200">No</button>
                                    <button onClick={() => { confirmation.onConfirm(); setConfirmation(null); }} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Sí</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {deleteModalOpen && (
                        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl border-2 border-red-100 text-center">
                                <h3 className="text-2xl font-bold mb-4 text-red-600">⚠️ Eliminar Cuenta</h3>
                                <p className="text-gray-600 mb-6 text-sm">Esta acción es irreversible. Escribe <strong>ELIMINAR</strong> para confirmar.</p>
                                <input className="w-full border p-3 rounded mb-4 text-center" placeholder="Escribe ELIMINAR" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} />
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 font-bold rounded-lg transition hover:bg-gray-200">Cancelar</button>
                                    <button disabled={deleteInput !== 'ELIMINAR'} onClick={async () => {
                                        const { deleteAccount } = await import('@/actions/settingsActions');
                                        const res = await deleteAccount();
                                        if (res.success) window.location.href = '/login'; else alert(res.message);
                                    }} className={`flex-1 py-3 font-bold text-white rounded-lg transition ${deleteInput === 'ELIMINAR' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300'}`}>Confirmar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCategoryModalOpen && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Gestionar Categorías</h3>
                                <div className="flex gap-2 mb-6">
                                    <input
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Nueva Categoría..."
                                        className="flex-1 border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                    <button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="bg-orange-600 text-white px-4 py-2 rounded font-bold hover:bg-orange-700 disabled:bg-gray-300">
                                        +
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                            <span className="font-medium text-gray-700">{cat.name}</span>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 p-1">
                                                🗑
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setIsCategoryModalOpen(false)} className="w-full mt-6 py-3 bg-gray-100 font-bold rounded-lg text-gray-600 hover:bg-gray-200">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                </main>
            )}
        </div>
    );
}

function OrdersList({ orders, updateOrderStatus, archiveOrder, loadData }: { orders: any[], updateOrderStatus: any, archiveOrder: any, loadData: any }) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 5000);
        return () => clearInterval(interval);
    }, []);

    if (orders.length === 0) return <p className="text-gray-500 text-center py-10">Esperando pedidos...</p>;

    return (
        <div className="space-y-4">
            {orders.map((order) => {
                const elapsed = (now - new Date(order.created_at).getTime()) / 60000;
                let statusColor = 'border-gray-100';
                let timerColor = 'text-gray-500';

                if (order.status !== 'paid') {
                    if (elapsed > 30) { statusColor = 'border-red-500 bg-red-50 ring-2 ring-red-100'; timerColor = 'text-red-600 font-bold animate-pulse'; }
                    else if (elapsed > 15) { statusColor = 'border-yellow-400 bg-yellow-50'; timerColor = 'text-yellow-600 font-bold'; }
                    else { statusColor = 'border-green-400 bg-green-50'; timerColor = 'text-green-600 font-bold'; }
                }

                return (
                    <div key={order.id} className={`p-6 rounded-xl shadow-sm border transition-all ${statusColor} flex flex-col md:flex-row justify-between gap-4`}>
                        <div className="text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-lg text-gray-900">{order.customers?.name || 'Cliente'}</span>
                                <span className={`text-sm px-2 py-1 rounded-full bg-white/50 ${timerColor}`}>Hace {Math.floor(elapsed)} min</span>
                                <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2 font-medium">
                                {Array.isArray(order.details) && order.details.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-1"><span>{item.quantity}x</span><span>{item.product?.name}</span></div>
                                ))}
                            </div>
                            <p className="text-gray-600 mb-1 text-sm">📞 {order.customers?.phone} <a href={`https://wa.me/${order.customers?.phone}`} target="_blank" className="text-green-600 text-xs ml-1 hover:underline">Chat</a></p>
                            <p className="text-gray-600 text-sm">{order.delivery_method === 'delivery' ? `🛵 Envío a: ${order.delivery_address}` : '🏃 Retiro en Local'}</p>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-2">
                            <span className="text-2xl font-bold text-green-600">${order.total_amount?.toLocaleString('es-AR')}</span>
                            <div className="flex items-center gap-2">
                                {order.delivery_method === 'delivery' && (
                                    <a href={`https://wa.me/${order.customers?.phone}?text=${encodeURIComponent('Hola, tu pedido salió en camino! 🛵')}`} target="_blank" className="text-xs bg-blue-500 text-white px-2 py-1 rounded shadow-sm no-underline transition hover:bg-blue-600">🛵 Avisar salida</a>
                                )}
                                {order.delivery_method === 'pickup' && (
                                    <a href={`https://wa.me/${order.customers?.phone}?text=${encodeURIComponent('¡Hola! Tu pedido ya está listo para retirar. ¡Te esperamos! 🍕')}`} target="_blank" className="text-xs bg-orange-500 text-white px-2 py-1 rounded shadow-sm no-underline transition hover:bg-orange-600">🔔 Avisar retiro</a>
                                )}
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-600'}`}>{order.status === 'paid' ? 'Completado' : 'Pendiente'}</span>
                                {order.status !== 'paid' && (
                                    <>
                                        <button
                                            onClick={async () => {
                                                if (confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
                                                    await archiveOrder(order.id);
                                                    loadData();
                                                }
                                            }}
                                            className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1"
                                        >
                                            Cancelar
                                        </button>
                                        <button onClick={async () => { await updateOrderStatus(order.id, 'paid'); loadData(); }} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold transition shadow-lg shadow-green-200 hover:bg-green-700">✔ Completar</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
