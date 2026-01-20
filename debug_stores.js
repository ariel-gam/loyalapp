const fs = require('fs');
const path = require('path');

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, ...val] = line.split('=');
            if (key) process.env[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '');
        }
    });
}
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing ENV variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStores() {
    const { data: stores, error } = await supabase
        .from('stores')
        .select('name, slug, trial_ends_at, settings')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching stores:", error);
        return;
    }

    console.log("Latest 5 stores:");
    stores.forEach(s => {
        const trialEnd = new Date(s.trial_ends_at);
        const now = new Date();
        const isActive = trialEnd > now;
        const daysLeft = (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        console.log(`- Store: ${s.name} (${s.slug})`);
        console.log(`  Trial End: ${s.trial_ends_at}`);
        console.log(`  Is Active: ${isActive}`);
        console.log(`  Days Left: ${daysLeft.toFixed(2)}`);
        console.log(`  Settings:`, s.settings);
        console.log("-----------------------------------");
    });
}

checkStores();
