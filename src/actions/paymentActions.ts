'use server';

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/utils/supabase/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function createSubscriptionPreference() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("No autenticado");

    // Get Store ID for reference
    const { data: store } = await supabase
        .from('stores')
        .select('id, name, owner_id, settings')
        .eq('owner_id', user.id)
        .single();

    if (!store) throw new Error("Tienda no encontrada");

    // Fixed Price for "Paquete Bienvenida" (1 Month + 15 Days Free)
    // The previous promo logic is replaced by this standard offer.
    const price = 60000;
    const title = 'Paquete Bienvenida (45 Días) - LoyalApp';

    const preference = new Preference(client);

    const result = await preference.create({
        body: {
            items: [
                {
                    id: 'suscripcion_mensual',
                    title: title,
                    quantity: 1,
                    unit_price: price, // Dynamic Price
                    currency_id: 'ARS'
                }
            ],
            back_urls: {
                success: `${process.env.NEXT_PUBLIC_BASE_URL}/admin?payment=success`,
                failure: `${process.env.NEXT_PUBLIC_BASE_URL}/admin?payment=failure`,
                pending: `${process.env.NEXT_PUBLIC_BASE_URL}/admin?payment=pending`
            },
            auto_return: 'approved',
            external_reference: store.id, // ID local para identificar quién paga
            notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago` // Webhook (Debe ser HTTPS pública)
        }
    });

    if (!result.init_point) throw new Error("Error generando pago");

    return result.init_point; // URL de cobro
}
