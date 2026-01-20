'use client';

import { useEffect, useState } from 'react';

export default function StoreActions() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        // Listen for PWA install prompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    text: '¡Mirá esta tienda! 🍕',
                    url: window.location.href,
                });
                setIsShared(true);
                setTimeout(() => setIsShared(false), 2000);
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            setIsShared(true);
            setTimeout(() => setIsShared(false), 2000);
        }
    };

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleShare}
                className="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 transition"
            >
                {isShared ? '✨ Copiado' : '📤 Compartir'}
            </button>

            {isInstallable && (
                <button
                    onClick={handleInstall}
                    className="flex items-center gap-1 bg-orange-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-orange-700 transition animate-pulse"
                >
                    📲 Instalar App
                </button>
            )}
        </div>
    );
}
