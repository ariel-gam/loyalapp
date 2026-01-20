import Catalog from '@/components/Catalog';
import CartButton from '@/components/CartButton';
import CartModal from '@/components/CartModal';
import { getStoreBySlug } from '@/actions/settingsActions';
import { getProductsBySlug } from '@/actions/catalogActions';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import StoreActions from '@/components/StoreActions';
import StoreHeader from '@/components/StoreHeader';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    return {
        manifest: `/api/manifest?slug=${slug}`,
    };
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Parallel fetching for store details and products
    const [store, products] = await Promise.all([
        getStoreBySlug(slug),
        getProductsBySlug(slug)
    ]);

    if (!store) {
        notFound();
    }

    // Check for expiration (Pay-to-Publish)
    const isStoreActive = store.trial_ends_at && new Date(store.trial_ends_at) > new Date();

    if (!isStoreActive) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-gray-100">
                    <div className="text-6xl mb-6">🚧</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Tienda en Preparación</h1>
                    <p className="text-gray-600 mb-6">Estamos configurando nuestro menú digital para brindarte la mejor experiencia.</p>
                    <div className="bg-orange-50 p-4 rounded-xl">
                        <p className="text-xs text-orange-800 font-medium uppercase tracking-wide mb-1">¿Sos el dueño?</p>
                        <a href="/admin" className="text-orange-600 underline font-bold hover:text-orange-700 text-sm">
                            Ingresar al Panel para activar la tienda
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <style>{`:root { --primary-color: ${store.primary_color || '#f97316'}; }`}</style>

            <StoreHeader store={store} />

            <Catalog slug={slug} initialProducts={products} store={store} />

            <CartButton />
            <CartModal store={store} />
        </main>
    );
}
