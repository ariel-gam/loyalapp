'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function CredencialesContent() {
    const searchParams = useSearchParams();
    const user = searchParams.get('user');
    const pass = searchParams.get('pass');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">¡Todo listo!</h1>
                <p className="text-gray-600 mb-8">Tu tienda ha sido creada. Te enviamos estos mismos datos a tu correo.</p>

                <div className="bg-green-50 p-6 rounded-xl border border-green-200 mb-8">
                    <p className="text-sm text-green-700 font-bold uppercase tracking-wider mb-2">Tus Credenciales</p>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Usuario (Email)</p>
                            <p className="text-lg font-mono font-bold text-gray-800">{user}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Contraseña Temporal</p>
                            <p className="text-lg font-mono font-bold text-gray-800 tracking-widest">{pass}</p>
                        </div>
                    </div>
                </div>

                <Link
                    href="/login"
                    className="block w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-200"
                >
                    IR AL PANEL ADMIN ➝
                </Link>

                <p className="mt-6 text-sm text-gray-400">
                    Recuerda cambiar tu contraseña una vez que ingreses.
                </p>
            </div>
        </div>
    );
}

export default function AdminCreadoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
            <CredencialesContent />
        </Suspense>
    );
}
