'use client';

import Image from 'next/image';
import StoreActions from './StoreActions';

interface StoreHeaderProps {
    store: any;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
    return (
        <div className="relative bg-white shadow-sm overflow-hidden mb-2">
            {/* 1. Cover Background (Gradient or Image if available) */}
            <div className="h-32 sm:h-40 w-full relative">
                {store.cover_url ? (
                    <div className="absolute inset-0">
                        <Image
                            src={store.cover_url}
                            alt="Portada"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/20" /> {/* Dimmer */}
                    </div>
                ) : (
                    // Default Sexy Gradient
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
                )}
            </div>

            {/* 2. Floating Info Card */}
            <div className="relative px-4 pb-4 -mt-12 flex justify-between items-end">
                <div className="flex items-end gap-3 flex-1">
                    {/* Logo (Rounded & Bordered) */}
                    <div className="relative h-24 w-24 bg-white rounded-2xl shadow-lg border-4 border-white overflow-hidden flex-shrink-0">
                        {store.logo_url ? (
                            <Image
                                src={store.logo_url}
                                alt={store.store_name}
                                fill
                                className="object-contain p-1"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-50 text-3xl">
                                🏪
                            </div>
                        )}
                    </div>

                    {/* Store Title & Badge */}
                    <div className="mb-1 flex-1 min-w-0"> {/* Min-w-0 for text truncation */}
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight line-clamp-2 drop-shadow-sm">
                            {store.store_name}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium line-clamp-1 mt-0.5">
                            {store.description || 'Pide tu comida favorita ❤️'}
                        </p>
                    </div>
                </div>

                {/* Actions (Share/Install) - positioned top right relative to container logic or sticky?
                    Let's keep them inline for now, but maybe adjust spacing. */}
                <div className="mb-2 hidden sm:block">
                    <StoreActions />
                </div>
            </div>

            {/* Mobile Actions Bar (Visible mainly on mobile below title) */}
            <div className="px-4 pb-4 sm:hidden">
                <StoreActions />
            </div>
        </div>
    );
}
