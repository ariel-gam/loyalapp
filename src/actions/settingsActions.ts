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
    const supabase = await createClient();
    const { data, error } = await supabase.from('stores').select('*').eq('slug', slug).single();
    if (error) return null;
    return {
        id: data.id,
        name: data.name,
        slug: data.slug,
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
