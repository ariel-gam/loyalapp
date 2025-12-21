import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function testInsert() {
    console.log("Attempting to insert dummy customer and order...");

    // 1. Customer
    const { data: customer, error: custError } = await supabase
        .from('customers')
        .upsert({ phone: '999999', name: 'Script Test', last_order_at: new Date().toISOString() }, { onConflict: 'phone' })
        .select()
        .single();

    if (custError) {
        console.error("Customer Insert Error:", custError);
        return;
    }
    console.log("Customer Created:", customer.id);

    // 2. Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            customer_id: customer.id,
            total_amount: 100,
            delivery_method: 'pickup',
            details: []
        })
        .select();

    if (orderError) {
        console.error("Order Insert Error:", orderError);
    } else {
        console.log("Order Created Successfully:", order);
    }
}

testInsert();
