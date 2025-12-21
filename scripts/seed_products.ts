import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { products, categories } from '../src/data/products';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function seedDatabase() {
    console.log("Seeding database with initial products...");

    // 1. Clear existing products (optional, but good for reset)
    // await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 

    for (const p of products) {
        // Insert product
        const { data: prodData, error } = await supabase
            .from('products')
            .upsert({
                name: p.name,
                description: p.description,
                base_price: p.price,
                category_id: p.categoryId,
                image_url: p.image,
                is_available: p.available
            }, { onConflict: 'name' }) // Use name as conflict target to avoid duplicates if ID mismatch
            .select()
            .single();

        if (error) {
            console.error(`Error inserting ${p.name}:`, error.message);
            continue;
        }

        console.log(`Inserted/Updated: ${p.name}`);

        // Insert discount if exists
        if (p.discountDay !== undefined && p.discountPercent !== undefined) {
            const { error: discError } = await supabase
                .from('discounts')
                .upsert({
                    product_id: prodData.id,
                    day_of_week: p.discountDay,
                    percent: p.discountPercent,
                    is_active: true
                }, { onConflict: 'product_id, day_of_week' });

            if (discError) console.error(`Error adding discount for ${p.name}:`, discError.message);
            else console.log(`  > Added discount: ${p.discountPercent}% on day ${p.discountDay}`);
        }
    }
    console.log("Database seed completed.");
}

seedDatabase();
