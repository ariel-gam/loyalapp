
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Creating a new test order for Realtime check...');

    // Get a valid customer or use a placeholder if testing
    const { data: customers } = await supabase.from('customers').select('id').limit(1);
    const customerId = customers && customers.length > 0 ? customers[0].id : '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase.from('orders').insert({
        customer_id: customerId,
        total_amount: 8888,
        status: 'pending',
        delivery_method: 'pickup',
        payment_method: 'cash',
        details: [{ quantity: 1, product: { name: '🔔 REALTIME TEST 2 🔔', price: 8888 } }]
    }).select();

    if (error) {
        console.error('Error creating order:', error);
    } else {
        console.log('✅ Order created successfully:', data);
    }
}

main();
