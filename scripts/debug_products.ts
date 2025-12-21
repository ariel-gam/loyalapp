import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkProducts() {
    console.log("1. Cleaning old debug products...");
    await supabase.from('products').delete().eq('name', 'DEBUG_TEST');

    console.log("2. Inserting DEBUG_TEST product...");
    const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert({
            name: 'DEBUG_TEST',
            base_price: 123,
            category_id: 'pizzas',
            is_available: true
        })
        .select()
        .single();

    if (insertError) {
        console.error("INSERT FAILED:", insertError);
        return;
    }
    console.log("Insert Success ID:", inserted.id);

    console.log("3. Reading back ALL products...");
    const { data: all, error: readError } = await supabase.from('products').select('*');

    if (readError) {
        console.error("READ FAILED:", readError);
    } else {
        console.log(`Found ${all.length} products.`);
        const found = all.find(p => p.id === inserted.id);
        console.log("Can read inserted product?", !!found);
    }
}

checkProducts();
