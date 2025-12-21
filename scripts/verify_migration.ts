import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkMigration() {
    console.log("🔍 Verificando migración SaaS...");

    // 1. Check Stores table
    const { error: storeError } = await supabase.from('stores').select('count').limit(1);

    if (storeError && storeError.code === '42P01') {
        console.error("❌ La tabla 'stores' NO existe. Has ejecutado el script en Supabase?");
        return;
    } else if (storeError) {
        console.error("❌ Error al acceder a 'stores':", storeError.message);
    } else {
        console.log("✅ Tabla 'stores' detectada.");
    }

    // 2. Check store_id column in products
    const { error: prodError } = await supabase.from('products').select('store_id').limit(1);
    if (prodError) {
        console.error("❌ La columna 'store_id' en 'products' parece faltar o dar error:", prodError.message);
    } else {
        console.log("✅ Columna 'store_id' confirmada en 'products'.");
    }

    console.log("\n🚀 Todo parece listo. Prueba registrar una cuenta en la aplicación.");
}

checkMigration();
