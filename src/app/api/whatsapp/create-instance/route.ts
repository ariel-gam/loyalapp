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

        // Verificar que el store existe
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id, name, whatsapp_instance, whatsapp_connected')
            .eq('id', storeId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Store no encontrado' }, { status: 404 });
        }

        // Si ya tiene una instancia conectada, retornar error
        if (store.whatsapp_connected) {
            return NextResponse.json({ error: 'WhatsApp ya está conectado' }, { status: 400 });
        }

        // Crear nombre de instancia único
        const instanceName = store.whatsapp_instance || `store-${storeId}`;

        // FORZAR limpieza completa de la instancia para evitar estados corruptos
        console.log('Limpiando instancia anterior...');

        // Paso 1: Intentar logout (desconectar sesión activa)
        try {
            await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
                method: 'DELETE',
                headers: {
                    'apikey': EVOLUTION_API_KEY
                }
            });
            console.log('Logout ejecutado');
        } catch (e) {
            console.log('No había sesión activa para logout');
        }

        // Paso 2: Eliminar la instancia completamente
        try {
            const deleteResponse = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
                method: 'DELETE',
                headers: {
                    'apikey': EVOLUTION_API_KEY
                }
            });

            if (deleteResponse.ok) {
                console.log('Instancia eliminada exitosamente');
            }
        } catch (e) {
            console.log('No había instancia para eliminar');
        }

        // Esperar un momento para asegurar que la eliminación se completó
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Crear instancia en Evolution API v1.5.2
        const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
            method: 'POST',
            headers: {
                'apikey': EVOLUTION_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instanceName: instanceName
            })
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('Error creando instancia:', errorText);

            // Si el error es que ya existe, continuamos
            if (!errorText.includes('already exists') && !errorText.includes('already in use')) {
                return NextResponse.json({ error: 'Error al crear instancia de WhatsApp' }, { status: 500 });
            }
        }

        console.log('Instancia creada/verificada (v1.5.2)');

        // Obtener QR code
        const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
            method: 'GET',
            headers: {
                'apikey': EVOLUTION_API_KEY
            }
        });

        if (!qrResponse.ok) {
            const errorText = await qrResponse.text();
            console.error('Error al obtener QR:', errorText);
            return NextResponse.json({ error: 'Error al obtener QR code' }, { status: 500 });
        }

        const qrData = await qrResponse.json();
        console.log('QR obtenido exitosamente');

        // En v1.5.2 el QR viene en base64
        const qrCode = qrData.base64 || qrData.qrcode?.base64 || qrData.qr;

        // Actualizar store con el nombre de instancia
        await supabase
            .from('stores')
            .update({ whatsapp_instance: instanceName })
            .eq('id', storeId);

        if (!qrCode) {
            console.error('No se pudo obtener QR code ni en creación ni en conexión');
            return NextResponse.json({ error: 'No se pudo generar el código QR. Intenta recargar la página.' }, { status: 500 });
        }

        return NextResponse.json({
            instanceName,
            qrCode: qrCode
        });

    } catch (error) {
        console.error('Error en create-instance:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
