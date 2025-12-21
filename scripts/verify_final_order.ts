import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkFinalOrder() {
    console.log("Checking for Test User FINAL...");

    // Check Customer
    const { data: customer, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', '777777777')
        .single();

    if (custError) {
        console.log("Customer not found or error:", custError.message);
        return;
    }
    console.log("Found Customer:", customer.name);

    // Check Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (orderError) {
        console.log("Order not found or error:", orderError.message);
    } else {
        console.log("Found Order:", order.id, "Total:", order.total_amount);
    }
}

checkFinalOrder();
