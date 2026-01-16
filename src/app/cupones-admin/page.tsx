'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function CuponesAdminPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCode, setNewCode] = useState('');
    const [daysExtension, setDaysExtension] = useState(30);
    const [maxUses, setMaxUses] = useState(1);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setCoupons(data);
        }
        setLoading(false);
    };

    const generateCode = () => {
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        setNewCode(`VIP${daysExtension}-${randomPart}`);
    };

    const createCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCode.trim()) {
            alert('Por favor genera un código');
            return;
        }

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { error } = await supabase.from('coupons').insert({
            code: newCode.trim().toUpperCase(),
            type: `vip${daysExtension}`,
            days_extension: daysExtension,
            max_uses: maxUses,
            active: true,
            notes: notes.trim() || null,
            created_by: 'admin'
        });

        if (error) {
            alert('Error al crear cupón: ' + error.message);
        } else {
            alert('✅ Cupón creado exitosamente!');
            setNewCode('');
            setNotes('');
            loadCoupons();
        }
    };

    const toggleCoupon = async (id: string, currentActive: boolean) => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { error } = await supabase
            .from('coupons')
            .update({ active: !currentActive })
            .eq('id', id);

        if (!error) {
            loadCoupons();
        }
    };

    const copyCoupon = (code: string) => {
        navigator.clipboard.writeText(code);
        alert(`✅ Código copiado: ${code}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando cupones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">🎟️ Gestión de Cupones VIP</h1>
                    <p className="text-gray-600">Crea y administra códigos de acceso VIP para regalar acceso extendido</p>
                </div>

                {/* Crear Nuevo Cupón */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Cupón</h2>
                    <form onSubmit={createCoupon} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Código del Cupón</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="VIP30-XXXXX"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                                    >
                                        🎲 Generar
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Días de Extensión</label>
                                <select
                                    value={daysExtension}
                                    onChange={(e) => setDaysExtension(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value={15}>15 días</option>
                                    <option value={30}>30 días</option>
                                    <option value={60}>60 días</option>
                                    <option value={90}>90 días</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Máximo de Usos</label>
                                <input
                                    type="number"
                                    value={maxUses}
                                    onChange={(e) => setMaxUses(Number(e.target.value))}
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notas (Opcional)</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Ej: Para cliente especial"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition shadow-lg"
                        >
                            ✨ Crear Cupón VIP
                        </button>
                    </form>
                </div>

                {/* Lista de Cupones */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Cupones Existentes ({coupons.length})</h2>

                    {coupons.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay cupones creados aún</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Código</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Días</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Usos</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Notas</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map((coupon) => (
                                        <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <span className="font-mono font-bold text-orange-600">{coupon.code}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                                                    {coupon.days_extension} días
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-gray-700">
                                                    {coupon.current_uses || 0} / {coupon.max_uses || '∞'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {coupon.active ? (
                                                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                                                        ✓ Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                                                        ✗ Inactivo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {coupon.notes || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => copyCoupon(coupon.code)}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm font-medium"
                                                    >
                                                        📋 Copiar
                                                    </button>
                                                    <button
                                                        onClick={() => toggleCoupon(coupon.id, coupon.active)}
                                                        className={`px-3 py-1 rounded transition text-sm font-medium ${coupon.active
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            }`}
                                                    >
                                                        {coupon.active ? '🚫 Desactivar' : '✓ Activar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
