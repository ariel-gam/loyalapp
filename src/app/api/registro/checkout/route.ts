
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        // Validar variables de entorno críticas de forma temprana
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Faltan variables de Supabase');
            return NextResponse.json({ error: 'Configuración del servidor incompleta (Supabase)' }, { status: 500 });
        }

        const { nombreLocal, email, cupon } = await request.json();

        if (!nombreLocal || !email) {
            return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // --- VALIDAR CUPÓN VIP (si existe) ---
        let daysToAdd = 15; // Por defecto 15 días
        let couponData = null;

        if (cupon && cupon.trim()) {
            const { data: couponRecord, error: couponError } = await supabaseAdmin
                .from('coupons')
                .select('*')
                .eq('code', cupon.trim().toUpperCase())
                .eq('active', true)
                .single();

            if (couponError || !couponRecord) {
                return NextResponse.json({ error: '❌ Cupón inválido o expirado' }, { status: 400 });
            }

            // Verificar si el cupón ha expirado
            if (couponRecord.expires_at && new Date(couponRecord.expires_at) < new Date()) {
                return NextResponse.json({ error: '❌ Este cupón ha expirado' }, { status: 400 });
            }

            // Verificar límite de usos
            if (couponRecord.max_uses && couponRecord.current_uses >= couponRecord.max_uses) {
                return NextResponse.json({ error: '❌ Este cupón ya alcanzó su límite de usos' }, { status: 400 });
            }

            // Cupón válido!
            couponData = couponRecord;
            daysToAdd = couponRecord.days_extension || 30;
        }

        // --- CREACIÓN DIRECTA (FREE TRIAL) ---
        // Generamos password aleatorio
        const password = Math.random().toString(36).slice(-8);

        // 1. Crear Usuario en Auth (sin confirmación de email)
        const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) {
            // Si el usuario ya existe, intentamos recuperar su ID? 
            // Mejor retornar error legible
            if (authError.status === 422) return NextResponse.json({ error: 'Este email ya está registrado.' }, { status: 400 });
            throw authError;
        }

        // 2. Calcular Trial (15 o 30 días según cupón)
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + daysToAdd);

        // 3. Crear Tienda
        const slug = nombreLocal.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
        const { data: storeData, error: storeError } = await supabaseAdmin.from('stores').insert({
            owner_id: userData.user.id,
            name: nombreLocal.trim(),
            slug: slug,
            trial_ends_at: trialEndsAt.toISOString(),
            settings: {
                primary_color: '#f97316',
                store_name: nombreLocal.trim(),
                promo_used: couponData ? true : false, // Marcar si usó cupón
                coupon_code: couponData ? couponData.code : null
            }
        }).select().single();

        if (storeError) {
            // Si falla la tienda (ej slug duplicado), deberíamos borrar el user? 
            // Por simplicidad, retornamos el error.
            if (storeError.code === '23505') return NextResponse.json({ error: 'El nombre del local genera un link duplicado. Intenta otro nombre.' }, { status: 400 });
            throw storeError;
        }

        // 4. Si usó cupón, registrar el uso
        if (couponData && storeData) {
            try {
                // Registrar uso del cupón
                await supabaseAdmin.from('coupon_usage').insert({
                    coupon_id: couponData.id,
                    store_id: storeData.id,
                    user_email: email
                });

                // Incrementar contador de usos
                await supabaseAdmin
                    .from('coupons')
                    .update({ current_uses: (couponData.current_uses || 0) + 1 })
                    .eq('id', couponData.id);
            } catch (e) {
                console.error("Error registrando uso de cupón:", e);
                // No fallar el registro por esto
            }
        }

        // 4. Enviar Email de Bienvenida
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.loyalapp.com.ar'}/api/send-welcome`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        } catch (e) {
            console.error("Error enviando email welcome:", e);
        }

        return NextResponse.json({
            success: true,
            redirect: `/admin-creado?user=${email}&pass=${password}`
        });

        /*
        // --- CÓDIGO MERCADO PAGO ELIMINADO PARA FLUJO FREE TRIAL ---
        // (Se conserva la lógica de pago en /admin para cuando venza el trial)
        */



    } catch (error: any) {
        console.error('Error Checkout:', error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}

