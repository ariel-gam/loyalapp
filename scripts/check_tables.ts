import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkTables() {
    console.log("Checking Orders...");
    const { data: o, error: oe } = await supabase.from('orders').select('id').limit(1);
    if (oe) console.log("Orders Error:", oe.message);
    else console.log("Orders OK, found:", o.length);

    console.log("Checking Products...");
    const { data: p, error: pe } = await supabase.from('products').select('id').limit(1);
    if (pe) console.log("Products Error:", pe.message);
    else console.log("Products OK, found:", p.length);
}

checkTables();
