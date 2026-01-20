'use client';

import { useEffect, useState } from 'react';

export default function InstallAppButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
            setIsInstalled(true);
        }
    };

    if (isInstalled) return <div className="text-center text-green-600 font-bold text-sm bg-green-50 p-2 rounded-lg">✅ App Instalada</div>;

    if (!isInstallable) return null;

    return (
        <div className="w-full">
            <button
                onClick={handleInstall}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-1 group animate-pulse-slow"
            >
                <span className="text-lg">📲 Instalar App</span>
                <span className="text-xs font-normal opacity-90 group-hover:opacity-100">Para pedir más rápido la próxima vez</span>
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">Agrega nuestra tienda a tu inicio</p>
        </div>
    );
}
