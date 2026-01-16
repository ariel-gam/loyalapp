'use client';

import { useState, useEffect } from 'react';

interface WhatsAppConfigProps {
    storeId: string;
}

export default function WhatsAppConfig({ storeId }: WhatsAppConfigProps) {
    const [connected, setConnected] = useState(false);
    const [phone, setPhone] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // Verificar estado al cargar
    useEffect(() => {
        if (storeId) {
            checkStatus();
        }
    }, [storeId]);

    // Polling para verificar conexión cuando hay QR activo
    useEffect(() => {
        if (!qrCode) return;

        const interval = setInterval(async () => {
            const status = await checkStatus();
            if (status?.connected) {
                setQrCode(null);
                clearInterval(interval);
            }
        }, 3000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrCode]);

    const checkStatus = async () => {
        try {
            const res = await fetch(`/api/whatsapp/status?storeId=${storeId}`);
            const data = await res.json();
            setConnected(data.connected);
            setPhone(data.phone);
            setChecking(false);
            return data;
        } catch (error) {
            console.error('Error checking status:', error);
            setChecking(false);
            return null;
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/whatsapp/create-instance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId })
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Error al crear instancia');
                setLoading(false);
                return;
            }

            const data = await res.json();
            setQrCode(data.qrCode);
        } catch (error) {
            console.error('Error connecting:', error);
            alert('Error al conectar WhatsApp');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('¿Estás seguro de desconectar WhatsApp? Dejarás de recibir notificaciones automáticas.')) {
            return;
        }

        setLoading(true);
        try {
            await fetch('/api/whatsapp/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId })
            });
            setConnected(false);
            setPhone(null);
        } catch (error) {
            console.error('Error disconnecting:', error);
            alert('Error al desconectar WhatsApp');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📱</span>
                <h2 className="text-2xl font-bold text-gray-800">Configurar WhatsApp</h2>
            </div>

            <p className="text-gray-600 mb-6">
                Conecta tu WhatsApp para recibir notificaciones automáticas cuando lleguen nuevos pedidos.
            </p>

            {connected ? (
                <div className="space-y-4">
                    {/* Estado Conectado */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="font-semibold text-green-800">WhatsApp Conectado</p>
                                {phone && (
                                    <p className="text-sm text-green-600">Número: {phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>ℹ️ Importante:</strong> Recibirás un mensaje automático cada vez que un cliente haga un pedido.
                        </p>
                    </div>

                    {/* Botón Desconectar */}
                    <button
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        {loading ? 'Desconectando...' : 'Desconectar WhatsApp'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {!qrCode ? (
                        <>
                            {/* Instrucciones */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                                <p className="font-semibold text-gray-800">¿Cómo funciona?</p>
                                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                                    <li>Haz clic en "Conectar mi WhatsApp"</li>
                                    <li>Escanea el código QR con tu WhatsApp</li>
                                    <li>¡Listo! Recibirás notificaciones automáticas</li>
                                </ol>
                            </div>

                            {/* Botón Conectar */}
                            <button
                                onClick={handleConnect}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Generando código QR...
                                    </>
                                ) : (
                                    <>
                                        <span>📱</span>
                                        Conectar mi WhatsApp
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {/* QR Code */}
                            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                                <p className="text-center font-semibold text-gray-800 mb-4">
                                    Escanea este código QR con WhatsApp
                                </p>

                                <div className="flex justify-center">
                                    <img
                                        src={qrCode}
                                        alt="QR Code WhatsApp"
                                        className="w-64 h-64 border-4 border-white shadow-lg rounded-lg"
                                    />
                                </div>

                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800 text-center">
                                        <strong>📱 En tu teléfono:</strong><br />
                                        WhatsApp → Menú (⋮) → Dispositivos vinculados → Vincular dispositivo
                                    </p>
                                </div>
                            </div>

                            {/* Indicador de espera */}
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <span className="animate-pulse">⏳</span>
                                <span className="text-sm">Esperando que escanees el código...</span>
                            </div>

                            {/* Botón Cancelar */}
                            <button
                                onClick={() => setQrCode(null)}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
