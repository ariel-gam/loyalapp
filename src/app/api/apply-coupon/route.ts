import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 });
        }

        const { storeId, couponCode } = await request.json();

        if (!storeId || !couponCode) {
            return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Validar cupón
        const { data: coupon, error: couponError } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('active', true)
            .single();

        if (couponError || !coupon) {
            return NextResponse.json({ error: 'Cupón inválido o expirado' }, { status: 400 });
        }

        // 2. Verificar si el cupón ha expirado
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Este cupón ha expirado' }, { status: 400 });
        }

        // 3. Verificar límite de usos
        if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            return NextResponse.json({ error: 'Este cupón ya alcanzó su límite de usos' }, { status: 400 });
        }

        // 4. Verificar si ya fue usado por esta tienda
        const { data: existingUsage } = await supabaseAdmin
            .from('coupon_usage')
            .select('*')
            .eq('coupon_id', coupon.id)
            .eq('store_id', storeId)
            .maybeSingle();

        if (existingUsage) {
            return NextResponse.json({ error: 'Este cupón ya fue usado en esta cuenta' }, { status: 400 });
        }

        // 5. Obtener la tienda actual
        const { data: store, error: storeError } = await supabaseAdmin
            .from('stores')
            .select('trial_ends_at, owner_id, settings')
            .eq('id', storeId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
        }

        // 6. Calcular nueva fecha de expiración
        const currentTrialEnd = new Date(store.trial_ends_at);
        const newTrialEnd = new Date(currentTrialEnd);
        newTrialEnd.setDate(newTrialEnd.getDate() + (coupon.days_extension || 30));

        // 7. Actualizar la tienda
        const { error: updateError } = await supabaseAdmin
            .from('stores')
            .update({
                trial_ends_at: newTrialEnd.toISOString(),
                settings: {
                    ...store.settings,
                    coupon_applied: true,
                    coupon_code: coupon.code
                }
            })
            .eq('id', storeId);

        if (updateError) {
            throw updateError;
        }

        // 8. Registrar el uso del cupón
        const { data: usageData, error: usageError } = await supabaseAdmin
            .from('coupon_usage')
            .insert({
                coupon_id: coupon.id,
                store_id: storeId,
                user_email: store.owner_id
            })
            .select()
            .single();

        if (usageError) {
            console.error("Error registrando uso:", usageError);
        }

        // 9. Incrementar contador de usos
        await supabaseAdmin
            .from('coupons')
            .update({ current_uses: (coupon.current_uses || 0) + 1 })
            .eq('id', coupon.id);

        return NextResponse.json({
            success: true,
            daysAdded: coupon.days_extension || 30,
            newTrialEnd: newTrialEnd.toISOString(),
            message: `Cupón aplicado exitosamente. Tu período de prueba ahora termina el ${newTrialEnd.toLocaleDateString('es-AR')}`
        });

    } catch (error: any) {
        console.error('Error aplicando cupón:', error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}
