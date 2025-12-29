'use server';

import { supabase } from '@/lib/supabase';
import { CartItem } from '@/context/CartContext';

interface SubmitOrderParams {
    storeId: string;
    name: string;
    phone: string;
    items: CartItem[];
    totalPrice: number;
    deliveryMethod: 'delivery' | 'pickup';
    address?: string;
    deliveryZone?: { name: string; price: number };
}

export async function submitOrder(data: SubmitOrderParams) {
    console.log("--> submitOrder CALLED with:", data.name, data.phone);
    if (!supabase) {
        return { success: true, message: "Skipped persistence (dev mode)" };
    }

    try {
        // 1. Upsert Customer (Per Store)
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .upsert(
                {
                    store_id: data.storeId,
                    phone: data.phone,
                    name: data.name,
                    last_order_at: new Date().toISOString()
                },
                { onConflict: 'phone,store_id' } // Use the composite key
            )
            .select()
            .single();

        if (customerError) throw new Error(`Customer Error: ${customerError.message}`);

        // 2. Create Order
        const { error: orderError } = await supabase
            .from('orders')
            .insert({
                store_id: data.storeId,
                customer_id: customer.id,
                total_amount: data.totalPrice,
                delivery_method: data.deliveryMethod,
                delivery_address: data.deliveryMethod === 'delivery'
                    ? `${data.address}${data.deliveryZone ? ` (${data.deliveryZone.name})` : ''}`
                    : null,
                details: data.items,
            });

        if (orderError) throw new Error(`Order Error: ${orderError.message}`);

        return { success: true };

    } catch (error) {
        console.error("Failed to save order:", error);
        return { success: false, error: String(error) };
    }
}
