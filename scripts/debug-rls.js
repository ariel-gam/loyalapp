require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugRLS() {
    console.log("--- DEBUGGING RLS & PERMISSIONS ---");

    // 1. Try to fetch products (READ)
    const { data: products, error: readError } = await supabase.from('products').select('*').limit(1);
    if (readError) console.error("❌ READ Products Failed:", readError.message);
    else console.log("✅ READ Products OK. Found:", products.length);

    if (products && products.length > 0) {
        const pid = products[0].id;
        // 2. Try to DELETE this product (DELETE)
        // We will try to delete and rollback or just check policy? We can't rollback easily.
        // Let's Insert a dummy product first.
        console.log("Creating dummy product to test DELETE...");
        const { data: dummy, error: insError } = await supabase.from('products').insert({
            name: 'DELETE_TEST',
            base_price: 100,
            category_id: 'pizzas',
            is_available: false
        }).select().single();

        if (insError) {
            console.error("❌ INSERT Dummy Product Failed:", insError.message);
        } else {
            console.log("✅ INSERT Dummy Product OK:", dummy.id);

            // 3. Now try DELETE
            const { error: delError } = await supabase.from('products').delete().eq('id', dummy.id);
            if (delError) console.error("❌ DELETE Product Failed:", delError.message);
            else console.log("✅ DELETE Product OK");
        }
    }

    // 4. Test ORDER UPDATE again
    // Find pending order
    const { data: pendOrders } = await supabase.from('orders').select('id').eq('status', 'pending').limit(1);
    if (pendOrders && pendOrders.length > 0) {
        console.log("Found pending order:", pendOrders[0].id);
        const { error: upError } = await supabase.from('orders').update({ status: 'paid' }).eq('id', pendOrders[0].id);
        if (upError) console.error("❌ UPDATE Order Failed:", upError.message);
        else console.log("✅ UPDATE Order OK");
    } else {
        console.log("No pending orders to test update");
    }
}

debugRLS();
