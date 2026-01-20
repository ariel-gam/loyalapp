import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    // Init Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: store } = await supabase
        .from('stores')
        .select('name, description, slug, primary_color, logo')
        .eq('slug', slug)
        .single();

    if (!store) {
        return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const manifest = {
        name: store.name,
        short_name: store.name.slice(0, 12),
        description: store.description || `Pide tu comida en ${store.name}`,
        start_url: `/${store.slug}?source=pwa`, // Add query param to track PWA opens if needed
        scope: "/", // CRITICAL: Ensure scope covers the whole domain since manifest is in /api/
        display: "standalone",
        background_color: "#ffffff",
        theme_color: store.primary_color || "#f97316",
        icons: [
            {
                src: "/icon.svg", // Using default icon for now to ensure validity
                sizes: "192x192",
                type: "image/svg+xml"
            },
            {
                src: "/icon.svg",
                sizes: "512x512",
                type: "image/svg+xml"
            }
        ]
    };

    return NextResponse.json(manifest);
}
