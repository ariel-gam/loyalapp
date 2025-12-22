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

const mockProducts = [
    {
        id: '1',
        name: 'Pizza Muzzarella',
        description: 'Salsa de tomate, muzzarella, orégano y aceitunas.',
        price: 12000,
        originalPrice: 12000,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80',
        categoryId: 'pizzas',
        available: true,
        isDiscountActive: false,
        discountDay: undefined,
        discountPercent: undefined
    },
    {
        id: '2',
        name: 'Pizza Napolitana',
        description: 'Salsa de tomate, muzzarella, rodajas de tomate, ajo y perejil.',
        price: 13500,
        originalPrice: 13500,
        image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=500&q=80',
        categoryId: 'pizzas',
        available: true,
        isDiscountActive: false
    },
    {
        id: '3',
        name: 'Empanada de Carne',
        description: 'Carne cortada a cuchillo, suave y jugosa.',
        price: 1500,
        originalPrice: 1500,
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80',
        categoryId: 'empanadas',
        available: true,
        isDiscountActive: false
    },
    {
        id: '4',
        name: 'Cerveza IPA',
        description: 'Pinta de cerveza artesanal estilo IPA.',
        price: 4500,
        originalPrice: 4500,
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=500&q=80',
        categoryId: 'bebidas',
        available: true,
        isDiscountActive: false
    }
];

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <style>{`:root { --primary-color: ${demoStore.primary_color}; }`}</style>

            <header className="bg-white p-4 shadow-sm relative z-10 flex items-center justify-center">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {demoStore.store_name} (DEMO)
                </h1>
            </header>

            {/* Pasamos el slug "demo-pizza" y los productos mockeados */}
            <Catalog slug="demo-pizza" initialProducts={mockProducts} />

            <CartButton />
            <CartModal store={demoStore} />
        </main>
    );
}
