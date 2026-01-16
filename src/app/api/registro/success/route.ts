
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    // Inicializar Supabase Admin dentro
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const external_reference = searchParams.get('external_reference');

    if (!external_reference) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.loyalapp.com.ar'}/registro?error=no_data`);
    }

    try {
        const { nombreLocal, email } = JSON.parse(external_reference);
        const password = Math.random().toString(36).slice(-8);

        // 1. Crear Usuario
        const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.loyalapp.com.ar'}/login?msg=ya_registrado`);
            }
            throw authError;
        }

        // 2. Crear Tienda
        const slug = nombreLocal.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
        await supabaseAdmin.from('stores').insert({
            owner_id: userData.user.id,
            name: nombreLocal.trim(),
            slug: slug,
            settings: {
                primary_color: '#f97316',
                store_name: nombreLocal.trim()
            }
        });

        // 3. Enviar Email
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.loyalapp.com.ar'}/api/send-welcome`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        } catch (e) {
            console.error("Error email:", e);
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.loyalapp.com.ar'}/admin-creado?user=${email}&pass=${password}`);

    } catch (error: any) {
        console.error('Error Finalizing Registro:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.loyalapp.com.ar'}/registro?error=finalizing`);
    }
}
