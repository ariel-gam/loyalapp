import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://whatsapp.loyalapp.com.ar';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'LoyalApp2024SecureKey';

export async function POST(request: NextRequest) {
    try {
        const { storeId } = await request.json();

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID requerido' }, { status: 400 });
        }

        // Obtener store
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('whatsapp_instance')
            .eq('id', storeId)
            .single();

        if (storeError || !store || !store.whatsapp_instance) {
            return NextResponse.json({ error: 'Store no encontrado o sin WhatsApp configurado' }, { status: 404 });
        }

        // Desconectar instancia en Evolution API
        const logoutResponse = await fetch(
            `${EVOLUTION_API_URL}/instance/logout/${store.whatsapp_instance}`,
            {
                method: 'DELETE',
                headers: {
                    'apikey': EVOLUTION_API_KEY
                }
            }
        );

        // Actualizar DB (incluso si falla el logout)
        await supabase
            .from('stores')
            .update({
                whatsapp_connected: false,
                whatsapp_phone: null
            })
            .eq('id', storeId);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error en disconnect:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
