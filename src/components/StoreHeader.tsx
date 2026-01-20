'use client';

import Image from 'next/image';
import StoreActions from './StoreActions';

interface StoreHeaderProps {
    store: any;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
    return (
        <div className="bg-white shadow-sm border-b border-gray-100">
            {/* Simple Cover Area */}
            <div className="h-32 w-full relative bg-gray-100">
                {store.cover_url ? (
                    <Image
                        src={store.cover_url}
                        alt="Portada"
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-orange-500" />
                )}
            </div>

            {/* Store Info */}
            <div className="px-4 pb-4">
                <div className="relative -mt-10 mb-3 flex justify-between items-end">
                    <div className="relative h-20 w-20 bg-white rounded-xl shadow p-1">
                        {store.logo_url ? (
                            <Image
                                src={store.logo_url}
                                alt={store.store_name}
                                fill
                                className="object-contain rounded-lg"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-2xl">🏪</div>
                        )}
                    </div>
                </div>

                <div>
                    <h1 className="text-xl font-bold text-gray-900">{store.store_name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{store.description || 'Pide tu comida favorita'}</p>
                </div>

                {/* Desktop Actions */}
                <div className="mt-3">
                    <StoreActions />
                </div>
            </div>
        </div>
    );
}
