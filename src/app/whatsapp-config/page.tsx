'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WhatsAppConfig from '@/components/WhatsAppConfig';

export default function WhatsAppConfigPage() {
    const router = useRouter();
    const [storeId, setStoreId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            return;
        }

        // Obtener store del usuario (mismo método que admin panel)
        const { data: stores, error } = await supabase
            .from('stores')
            .select('id, name')
            .eq('owner_id', user.id);

        console.log('User ID:', user.id);
        console.log('Stores found:', stores);
        console.log('Error:', error);

        if (error || !stores || stores.length === 0) {
            alert('No se encontró tu tienda. Por favor completa el setup primero.');
            router.push('/setup');
            return;
        }

        setStoreId(stores[0].id);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
            <div className="max-w-2xl mx-auto py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/admin')}
                        className="text-orange-600 hover:text-orange-700 flex items-center gap-2 mb-4"
                    >
                        ← Volver al Panel
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Configuración de WhatsApp</h1>
                    <p className="text-gray-600 mt-2">
                        Conecta tu WhatsApp para recibir notificaciones automáticas de pedidos
                    </p>
                </div>

                {/* WhatsApp Config Component */}
                {storeId && <WhatsAppConfig storeId={storeId} />}

                {/* Info adicional */}
                <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                    <h3 className="font-bold text-lg mb-3">ℹ️ ¿Cómo funciona?</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex gap-2">
                            <span>✅</span>
                            <span>Cuando un cliente hace un pedido, recibirás un mensaje automático en WhatsApp</span>
                        </li>
                        <li className="flex gap-2">
                            <span>✅</span>
                            <span>El mensaje incluye todos los detalles del pedido</span>
                        </li>
                        <li className="flex gap-2">
                            <span>✅</span>
                            <span>Puedes responder directamente al cliente desde WhatsApp</span>
                        </li>
                        <li className="flex gap-2">
                            <span>✅</span>
                            <span>Tu número de WhatsApp es privado, solo tú lo ves</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
