import Catalog from '@/components/Catalog';
import CartButton from '@/components/CartButton';
import CartModal from '@/components/CartModal';
import { getStoreBySlug } from '@/actions/settingsActions';
import { getProductsBySlug } from '@/actions/catalogActions';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    return (
        <main className="min-h-screen bg-gray-50">
            <style>{`:root { --primary-color: ${store.primary_color || '#f97316'}; }`}</style>

            {/* Store ID hidden field for Cart context if needed, or CartModal fetches it? 
                Actually CartModal calculates totals. Submitting order needs store_id.
                We should pass store={store} to CartModal or provide a Context.
                For now let's pass it to CartModal if we can refactor it, 
                or better: The Cart Context should holding the current storeId.
                
                Simplest MVP fix: Add <StoreInitializer store={store} /> to set context.
            */}

            <header className="bg-white p-4 shadow-sm relative z-10 flex items-center justify-center">
                {store.logo_url ? (
                    <div className="relative h-12 w-48">
                        <Image src={store.logo_url} alt={store.store_name} fill className="object-contain" priority />
                    </div>
                ) : (
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {store.store_name}
                    </h1>
                )}
            </header>

            <Catalog slug={slug} initialProducts={products} store={store} />

            <CartButton />
            <CartModal store={store} />
        </main>
    );
}
