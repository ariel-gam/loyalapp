'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SetupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [coupon, setCoupon] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                router.push('/login');
            } else {
                // Check if user already has a store
                supabase.from('stores').select('slug').eq('owner_id', user.id).single()
                    .then(({ data }) => {
                        if (data) router.push('/admin');
                    });
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (!supabase) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No autenticado");

            const finalSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

            const trialDays = coupon.trim().toUpperCase() === 'GRATIS30' ? 30 : 15;
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

            const { error } = await supabase.from('stores').insert({
                owner_id: user.id,
                name: name.trim(),
                slug: finalSlug,
                trial_ends_at: trialEndsAt.toISOString(),
                settings: {
                    primary_color: '#f97316',
                    store_name: name.trim()
                }
            });

            if (error) {
                if (error.code === '23505') throw new Error("Este link (slug) ya está en uso. Por favor elige otro.");
                throw error;
            }

            alert("¡Tienda creada con éxito!");
            router.push('/admin');
        } catch (err: any) {
            alert(err.message || "Error al crear la tienda");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Configura tu Tienda
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Estás a un paso de tener tu propio sistema de pedidos.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Local</label>
                            <input
                                required
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    // Auto-generate slug
                                    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, -1)) {
                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                                    }
                                }}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Ej: Pizzería Mario"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Link Personalizado</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                    loyalapp.com.ar/
                                </span>
                                <input
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-r-md outline-none focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="pizzeria-mario"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Este será el link que compartirás con tus clientes.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código Promocional (Opcional)</label>
                            <input
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Si tienes un código, ingrésalo aquí"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                {loading ? 'Creando...' : 'Crear Tienda'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
