import Catalog from '@/components/Catalog';
import CartButton from '@/components/CartButton';
import CartModal from '@/components/CartModal';
import Image from 'next/image';

// Datos estáticos para la demo (sin base de datos, 100% fiable)
const demoStore = {
    id: 'demo-uuid-123',
    store_name: 'La Pizzería de Prueba',
    slug: 'demo-pizza',
    logo_url: null,
    primary_color: '#f97316',
    address: 'Av. Corrientes 1234, CABA',
    phone: '5491112345678',
};

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <style>{`:root { --primary-color: ${demoStore.primary_color}; }`}</style>

            <header className="bg-white p-4 shadow-sm relative z-10 flex items-center justify-center">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {demoStore.store_name} (DEMO)
                </h1>
            </header>

            {/* Pasamos el slug "demo-pizza" explícitamente */}
            <Catalog slug="demo-pizza" />

            <CartButton />
            <CartModal store={demoStore} />
        </main>
    );
}
