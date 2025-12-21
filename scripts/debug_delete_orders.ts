
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    console.log("Attempting to delete ALL orders...");

    // Try to delete one specific order first if any exist
    const { data: orders } = await supabase.from('orders').select('id').limit(1);

    if (orders && orders.length > 0) {
        console.log(`Found ${orders.length} order(s). Trying to delete id: ${orders[0].id}`);

        const { error: deleteOneError } = await supabase
            .from('orders')
            .delete()
            .eq('id', orders[0].id);

        if (deleteOneError) {
            console.error("Error deleting single order:", deleteOneError);
        } else {
            console.log("Successfully deleted single order.");
        }
    }

    // Now try the bulk delete pattern used in the app
    console.log("Attempting bulk delete pattern...");
    const { error: bulkError } = await supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (bulkError) {
        console.error("BULK DELETE ERROR:", bulkError);
    } else {
        console.log("Bulk delete report success (check if rows are gone).");
    }
}

testDelete();
