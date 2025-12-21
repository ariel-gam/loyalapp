require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testOrder() {
    console.log("Testing public order submission...");

    const phone = '99999_TEST_' + Date.now();

    // 1. Upsert Customer
    console.log("1. Upserting customer...");
    const { data: customer, error: custError } = await supabase
        .from('customers')
        .upsert({
            name: 'Test Script',
            phone: phone,
            last_order_at: new Date().toISOString()
        }, { onConflict: 'phone' })
        .select()
        .single();

    if (custError) {
        console.error("❌ Customer Error:", custError);
        return;
    }
    console.log("✅ Customer created/found:", customer.id);

    // 2. Create Order
    console.log("2. Creating order...");
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            customer_id: customer.id,
            total_amount: 100,
            delivery_method: 'pickup',
            details: [{ product: { name: 'Test' }, quantity: 1 }],
            status: 'pending' // explicit status
        })
        .select()
        .single();

    if (orderError) {
        console.error("❌ Order Error:", orderError);
    } else {
        console.log("✅ Order created:", order.id);
    }
}

testOrder();
