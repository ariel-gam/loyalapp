'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        setLoading(true);

        try {
            if (isRegister) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
                });
                if (error) throw error;
                alert('¡Registro exitoso! Por favor inicia sesión.');
                setIsRegister(false);
            } else {
                console.log("Iniciando sesión con:", email);
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });

                if (error) {
                    console.error("Error SignIn:", error);
                    throw error;
                }

                console.log("Sesión inciada:", data.user?.id);

                // Check if user has a store
                console.log("Buscando tienda...");
                const { data: stores, error: storeError } = await supabase.from('stores').select('slug').maybeSingle();

                if (storeError) console.error("Error buscando tienda:", storeError);

                if (stores) {
                    console.log("Tienda encontrada -> /admin");
                    router.push('/admin');
                    router.refresh();
                } else {
                    console.log("Sin tienda -> /setup");
                    router.push('/setup');
                    router.refresh();
                }
            }
        } catch (err: any) {
            console.error("Catch Error:", err);
            alert(err.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isRegister ? 'Crea tu cuenta' : 'Inicia Sesión'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="font-medium text-orange-600 hover:text-orange-500"
                    >
                        {isRegister ? 'Ingresa aquí' : 'Regístrate aquí'}
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleAuth}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                            >
                                {loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Entrar')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
