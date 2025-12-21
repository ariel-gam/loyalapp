
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySettings() {
    console.log("Verifying store_settings table...");

    // 1. Try to fetch settings
    const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

    if (error) {
        console.error("❌ Error fetching settings:", error.message);
        console.log("Did you run the SQL script in Supabase?");
        return;
    }

    console.log("✅ Current Settings found:", data);

    // 2. Try to update settings (test update)
    const newPhone = data.phone === '5491112345678' ? '5491199999999' : '5491112345678';
    console.log(`Attempting to update phone to: ${newPhone}...`);

    const { error: updateError } = await supabase
        .from('store_settings')
        .update({ phone: newPhone })
        .eq('id', 1);

    if (updateError) {
        console.error("❌ Error updating settings:", updateError.message);
    } else {
        console.log("✅ Settings updated successfully.");

        // Revert just in case or leave it to show it works
        console.log("Reverting/Checking...");
        const { data: updatedData } = await supabase.from('store_settings').select('*').single();
        console.log("New Value in DB:", updatedData.phone);
    }
}

verifySettings();
