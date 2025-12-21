
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Listenining for changes on 'orders' table...");

const channel = supabase
    .channel('debug_realtime')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
            console.log('🔔 RECEIVED REALTIME EVENT:', payload.eventType);
            // console.log(payload);
        }
    )
    .subscribe((status) => {
        console.log("Status:", status);
    });

// Keep process alive
setInterval(() => { }, 1000);
