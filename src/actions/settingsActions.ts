'use server';

import { createClient } from '@/utils/supabase/server';

export interface StoreSettings {
    store_name: string;
    address: string;
    phone: string;
    logo_url?: string;
    primary_color?: string;
}

export async function getStoreBySlug(slug: string) {
    // Mock for Demo
    if (slug === 'demo-pizza') {
        return {
            id: 'demo-uuid-123',
            name: 'La Pizzería de Prueba',
            slug: 'demo-pizza',
            logo_url: null,
            primary_color: '#f97316',
            address: 'Calle Falsa 123',
            phone: '5491112345678',
        };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.from('stores').select('*').eq('slug', slug).single();
    if (error) return null;
    return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        trial_ends_at: data.trial_ends_at,
        ...data.settings // Spread JSON settings
    };
}

export async function getStoreSettings() {
    // This is for Admin usage mainly, to get "My Store"
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        store_name: data.name,
        slug: data.slug,
        trial_ends_at: data.trial_ends_at,
        ...data.settings
    };
}

export async function updateStoreSettings(newSettings: any) {
    const supabase = await createClient();

    // We need to verify which store belongs to this user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "No autorizado" };

    // We act on the 'stores' table now. 
    // We update 'settings' jsonb column BUT also 'name' if store_name changed.

    const { store_name, ...otherSettings } = newSettings;

    const { error } = await supabase
        .from('stores')
        .update({
            name: store_name,
            settings: {
                store_name,
                ...otherSettings
            }
        })
        .eq('owner_id', user.id);

    if (error) {
        console.error("Error updating settings:", error);
        return { success: false, message: error.message };
    }
    return { success: true };
}

export async function deleteAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "No autorizado" };

    // Initialize Admin Client
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { success: false, message: "Error de configuración: Falta Service Role Key" };
    }

    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // 1. Delete Store (Cascades to products, orders, etc.)
    const { error: deleteStoreError } = await adminClient
        .from('stores')
        .delete()
        .eq('owner_id', user.id);

    if (deleteStoreError) {
        console.error("Error deleting store:", deleteStoreError);
        return { success: false, message: "Error eliminando datos de la tienda: " + deleteStoreError.message };
    }

    // 2. Delete Auth User
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
        console.error("Error deleting user:", deleteUserError);
        return { success: false, message: "Datos eliminados, pero hubo un error eliminando la cuenta de usuario: " + deleteUserError.message };
    }

    return { success: true };
}

export async function redeemCoupon(code: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "No autorizado" };

    // 1. Get Store
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    if (storeError || !store) return { success: false, message: "Tienda no encontrada" };

    // 2. Validate Coupon
    // Use Admin Client to bypass RLS on coupons if needed
    // Assuming we need admin privilege to interact with coupons freely.
    const adminClient = await getAdminClient();

    const { data: coupon, error: couponError } = await adminClient
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('active', true)
        .single();

    if (couponError || !coupon) {
        return { success: false, message: "Cupón inválido o no encontrado" };
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { success: false, message: "Este cupón ha expirado" };
    }

    // Check usage limits
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        return { success: false, message: "Este cupón agotó sus usos" };
    }

    // Check if store already used PROMO
    // If we want to strictly block multiple coupons:
    // if (store.settings?.promo_used) return { success: false, message: "Ya has utilizado un cupón de bienvenida" };

    // 3. Apply Coupon
    const daysToAdd = coupon.days_extension || 30;

    // Calculate new date: If trial is active, add to end. If expired, add to NOW.
    let currentEnd = store.trial_ends_at ? new Date(store.trial_ends_at) : new Date();
    if (currentEnd < new Date()) currentEnd = new Date(); // If expired, start from now

    currentEnd.setDate(currentEnd.getDate() + daysToAdd);

    // 4. Update Store
    const { error: updateError } = await adminClient
        .from('stores')
        .update({
            trial_ends_at: currentEnd.toISOString(),
            settings: {
                ...store.settings,
                promo_used: true, // Mark as used
                coupon_code: coupon.code
            }
        })
        .eq('id', store.id);

    if (updateError) return { success: false, message: "Error al aplicar el cupón" };

    // 5. Log Usage & Increment Counter
    await adminClient.from('coupon_usage').insert({
        coupon_id: coupon.id,
        store_id: store.id,
        user_email: user.email
    });

    await adminClient
        .from('coupons')
        .update({ current_uses: (coupon.current_uses || 0) + 1 })
        .eq('id', coupon.id);

    return { success: true, message: `¡Cupón canjeado! Se agregaron ${daysToAdd} días.` };
}

async function getAdminClient() {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}
