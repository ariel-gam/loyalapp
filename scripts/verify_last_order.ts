import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars manually since we are running a standalone script
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
    console.log("Checking orders in Supabase...");

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id, 
            total_amount, 
            delivery_method, 
            customers ( name, phone )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching orders:", error);
        return;
    }

    if (!orders || orders.length === 0) {
        console.log("No orders found.");
    } else {
        console.log("Found recent orders:");
        orders.forEach(o => {
            const customerName = Array.isArray(o.customers) ? o.customers[0]?.name : o.customers?.name;
            const customerPhone = Array.isArray(o.customers) ? o.customers[0]?.phone : o.customers?.phone;
            console.log(`- Order ${o.id}: $${o.total_amount} (${o.delivery_method}) - Customer: ${customerName} (${customerPhone})`);
        });
    }
}

checkOrders();
