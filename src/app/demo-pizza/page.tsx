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
    deliveryZones: [
        { id: 'z1', name: 'CABA (Centro)', price: 1500 },
        { id: 'z2', name: 'CABA (Resto)', price: 2500 },
        { id: 'z3', name: 'GBA Norte', price: 4000 }
    ],
    deliveryEnabled: true
};

const mockProducts = [
    // PIZZAS
    {
        id: '1',
        name: 'Pizza Muzzarella',
        description: 'Salsa de tomate italiana, muzzarella doble, orégano fresco y aceitunas negras.',
        price: 12000,
        originalPrice: 12000,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
        categoryId: 'pizzas',
        available: true,
        isDiscountActive: false,
    },
    {
        id: '2',
        name: 'Pizza Napolitana Premium',
        description: 'Muzzarella, rodajas de tomate natural, ajo picado, perejil y borde de queso.',
        price: 13500,
        originalPrice: 15000,
        image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=800&q=80',
        categoryId: 'pizzas',
        available: true,
        isDiscountActive: true,
        discountPercent: 10
    },
    {
        id: 'p3',
        name: 'Pizza Calabresa',
        description: 'Longaniza calabresa auténtica, muzzarella y un toque de pimentón.',
        price: 14000,
        originalPrice: 14000,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
        categoryId: 'pizzas',
        available: true,
        isDiscountActive: false
    },
    {
        id: 'p4',
        name: 'Fugazzeta Rellena',
        description: 'Rellena de jamón y queso, cubierta de cebolla caramelizada.',
        price: 16500,
        originalPrice: 16500,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        categoryId: 'pizzas',
        available: true,
        isDiscountActive: false
    },

    // EMPANADAS
    {
        id: '3',
        name: 'Empanada de Carne Cortada',
        description: 'Carne cortada a cuchillo, suave y jugosa, condimentada con comino y pimentón.',
        price: 1500,
        originalPrice: 1500,
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
        categoryId: 'empanadas',
        available: true,
        isDiscountActive: false
    },
    {
        id: 'e2',
        name: 'Empanada Jamón y Queso',
        description: 'Jamón cocido natural y muzzarella en masa hojaldrada.',
        price: 1500,
        originalPrice: 1500,
        image: 'https://images.unsplash.com/photo-1565355648839-81cb70445d4c?auto=format&fit=crop&w=800&q=80', // Replace placeholder
        categoryId: 'empanadas',
        available: true,
        isDiscountActive: false
    },

    // BEBIDAS
    {
        id: '4',
        name: 'Cerveza IPA Artesanal',
        description: 'Pinta de cerveza estilo IPA, amargor moderado y notas cítricas.',
        price: 4500,
        originalPrice: 4500,
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
        categoryId: 'bebidas',
        available: true,
        isDiscountActive: false
    },
    {
        id: 'b2',
        name: 'Coca-Cola 1.5L',
        description: 'Gaseosa sabor cola original, ideal para compartir.',
        price: 3200,
        originalPrice: 3200,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
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
