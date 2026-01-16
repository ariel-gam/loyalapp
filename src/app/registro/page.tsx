'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
    const router = useRouter();
    const [nombreLocal, setNombreLocal] = useState('');
    const [email, setEmail] = useState('');
    const [cupon, setCupon] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/registro/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreLocal, email, cupon })
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Respuesta no JSON:", text);
                throw new Error(`Error del servidor (${res.status}): La respuesta no es un JSON válido.`);
            }

            if (!res.ok) throw new Error(data.error || 'Error al procesar');

            if (data.url) {
                // Caso Mercado Pago
                window.location.href = data.url;
            } else if (data.success && data.redirect) {
                // Caso Cupón Gratis
                router.push(data.redirect);
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="text-4xl font-extrabold text-orange-600 mb-2">¡Empezamos! 🍕</h2>
                <p className="text-gray-600">Configura tu negocio en segundos y empieza a vender.</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-orange-100">
                    <form className="space-y-6" onSubmit={handleRegistro}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de tu Pizzería / Local</label>
                            <input
                                required
                                value={nombreLocal}
                                onChange={(e) => setNombreLocal(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                                placeholder="Ej: Pizzería La Favorita"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tu Email (donde recibirás tus datos)</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                                placeholder="nombre@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">¿Tienes un Cupón? (Opcional)</label>
                            <input
                                value={cupon}
                                onChange={(e) => setCupon(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                                placeholder="Escribe aquí tu código"
                            />
                        </div>

                        <div className="pt-4 text-center">
                            <p className="text-xs text-gray-500 mb-4 italic">
                                * Comienza tu prueba gratis hoy. Sin tarjeta de crédito.
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-orange-700 transform hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creando Tienda...
                                    </span>
                                ) : (
                                    'CREAR TIENDA GRATIS (15 DÍAS)'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
