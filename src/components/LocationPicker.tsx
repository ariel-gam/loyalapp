'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';

// Importar Leaflet dinámicamente para evitar errores de SSR
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);

interface LocationPickerProps {
    onLocationSelect: (location: {
        lat: number;
        lng: number;
        address: string;
        distance?: number;
    }) => void;
    storeLocation?: { lat: number; lng: number };
    initialLocation?: { lat: number; lng: number };
}

// Componente para manejar clicks en el mapa
function LocationMarker({
    position,
    setPosition
}: {
    position: [number, number] | null;
    setPosition: (pos: [number, number]) => void;
}) {
    const { useMapEvents } = require('react-leaflet');

    useMapEvents({
        click(e: any) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : <Marker position={position as LatLngExpression} />;
}

export default function LocationPicker({
    onLocationSelect,
    storeLocation,
    initialLocation
}: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [address, setAddress] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    // Default: Paraná, Entre Ríos, Argentina
    const defaultCenter: [number, number] = initialLocation
        ? [initialLocation.lat, initialLocation.lng]
        : [-31.7333, -60.5297];

    useEffect(() => {
        setMounted(true);
    }, []);

    // Geocodificación inversa (coordenadas -> dirección)
    useEffect(() => {
        if (!position) return;

        const reverseGeocode = async () => {
            setLoading(true);
            try {
                // Usar API proxy del servidor para evitar CORS
                const response = await fetch(
                    `/api/geocode?lat=${position[0]}&lon=${position[1]}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Geocoding response:', data);

                const formattedAddress = data.display_name || 'Dirección no encontrada';
                setAddress(formattedAddress);

                // Calcular distancia si hay ubicación de la tienda
                let distance: number | undefined;
                if (storeLocation) {
                    distance = calculateDistance(
                        storeLocation.lat,
                        storeLocation.lng,
                        position[0],
                        position[1]
                    );
                }

                onLocationSelect({
                    lat: position[0],
                    lng: position[1],
                    address: formattedAddress,
                    distance
                });
            } catch (error) {
                console.error('Error en geocodificación:', error);
                setAddress('Error al obtener dirección. Intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        reverseGeocode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position]);

    // Búsqueda de direcciones
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ar&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                const newPosition: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
                setPosition(newPosition);
            } else {
                alert('No se encontró la dirección. Intenta con otra búsqueda.');
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            alert('Error al buscar la dirección');
        } finally {
            setLoading(false);
        }
    };

    // Calcular distancia entre dos puntos (fórmula de Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return Math.round(distance * 10) / 10; // Redondear a 1 decimal
    };

    const toRad = (value: number): number => {
        return (value * Math.PI) / 180;
    };

    if (!mounted) {
        return (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Cargando mapa...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Buscador de direcciones */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar dirección (ej: San Martín 1234, Paraná)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                >
                    {loading ? '🔍' : 'Buscar'}
                </button>
            </form>

            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                    📍 <strong>Haz clic en el mapa</strong> para marcar tu ubicación exacta, o busca tu dirección arriba.
                </p>
            </div>

            {/* Mapa */}
            <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                    center={position || defaultCenter}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>

            {/* Dirección seleccionada */}
            {position && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">📍 Ubicación Seleccionada:</h3>
                    <p className="text-sm text-green-700">
                        {loading ? 'Obteniendo dirección...' : address}
                    </p>
                    {storeLocation && (
                        <p className="text-sm text-green-600 mt-2">
                            📏 Distancia desde el local: <strong>{calculateDistance(
                                storeLocation.lat,
                                storeLocation.lng,
                                position[0],
                                position[1]
                            )} km</strong>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
