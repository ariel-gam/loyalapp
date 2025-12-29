'use client';

import { useState, useEffect } from 'react';

export default function InstallAppButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode
        if (typeof window !== 'undefined') {
            if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
                setIsStandalone(true);
            }
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent) && !isStandalone) {
            setIsIOS(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [isStandalone]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (isStandalone) return null; // Already installed

    // Android / Desktop (Chrome)
    if (deferredPrompt) {
        return (
            <button
                onClick={handleInstallClick}
                className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg animate-pulse hover:bg-orange-700 transition flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Instalar App
            </button>
        );
    }

    // iOS Instructions
    if (isIOS) {
        return (
            <button
                onClick={() => alert("Para instalar en iPhone/iPad:\n1. Toca el botón 'Compartir' (el cuadrado con la flecha hacia arriba)\n2. Busca y selecciona 'Agregar a Inicio'")}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold border border-gray-300 hover:bg-gray-200 transition flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Instalar
            </button>
        );
    }

    return null;
}
