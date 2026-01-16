import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://whatsapp.loyalapp.com.ar';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'LoyalApp2024SecureKey';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID requerido' }, { status: 400 });
        }

        // Obtener store
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('whatsapp_instance, whatsapp_connected, whatsapp_phone')
            .eq('id', storeId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Store no encontrado' }, { status: 404 });
        }

        // Si no tiene instancia, retornar no conectado
        if (!store.whatsapp_instance) {
            return NextResponse.json({
                connected: false,
                phone: null
            });
        }

        // Verificar estado en Evolution API
        const statusResponse = await fetch(
            `${EVOLUTION_API_URL}/instance/connectionState/${store.whatsapp_instance}`,
            {
                headers: {
                    'apikey': EVOLUTION_API_KEY
                }
            }
        );

        if (!statusResponse.ok) {
            // Si falla, asumir desconectado
            await supabase
                .from('stores')
                .update({ whatsapp_connected: false })
                .eq('id', storeId);

            return NextResponse.json({
                connected: false,
                phone: store.whatsapp_phone
            });
        }

        const statusData = await statusResponse.json();
        const isConnected = statusData.state === 'open';

        // Actualizar estado en DB
        await supabase
            .from('stores')
            .update({ whatsapp_connected: isConnected })
            .eq('id', storeId);

        return NextResponse.json({
            connected: isConnected,
            phone: store.whatsapp_phone
        });

    } catch (error) {
        console.error('Error en status:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
