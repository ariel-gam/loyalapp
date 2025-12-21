'use client';

import { useState } from 'react';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') { // Hardcoded for MVP
            onLogin();
        } else {
            setError(true);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Admin LoyalFood</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">Contraseña incorrecta</p>}
                    <button
                        type="submit"
                        className="w-full rounded-md bg-orange-600 px-4 py-2 font-bold text-white shadow hover:bg-orange-700 transition"
                    >
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
}
