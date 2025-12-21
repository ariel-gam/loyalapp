require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUpdate() {
    console.log("Testing UPDATE permission on orders...");

    // 1. Create a dummy order
    const { data: order, error: insertError } = await supabase
        .from('orders')
        .insert({
            total_amount: 50,
            delivery_method: 'pickup',
            details: [],
            status: 'pending'
        })
        .select()
        .single();

    if (insertError) {
        console.error("❌ Insert Failed:", insertError);
        return; // Stop if insert fails
    }
    console.log("✅ Inserted Order ID:", order.id);

    // 2. Try to UPDATE it (This mimics the "Cobrar" button)
    console.log("Attempting UPDATE status to 'paid'...");
    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id);

    if (updateError) {
        console.error("❌ UPDATE Failed (RLS likely issue):", updateError);
    } else {
        console.log("✅ UPDATE Successful!");
    }
}

testUpdate();
