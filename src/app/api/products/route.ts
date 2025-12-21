import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!supabase || !slug) {
        return NextResponse.json({ products: [] });
    }

    try {
        const today = new Date().getDay(); // 0-6

        // Query products filtered by Store Slug via inner join
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                stores!inner(slug),
                discounts (
                  percent,
                  day_of_week,
                  is_active
                )
            `)
            .eq('stores.slug', slug) // FILTER BY SLUG
            .order('name');

        if (error) throw error;

        // Map DB shape (snake_case) to Frontend shape (camelCase)
        const processedProducts = products.map((product: any) => {
            // Find valid discount for today
            const activeDiscount = product.discounts?.find((d: any) =>
                d.day_of_week === today && d.is_active
            );

            let finalPrice = product.base_price;

            if (activeDiscount) {
                finalPrice = product.base_price * (1 - activeDiscount.percent / 100);
            }

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: finalPrice,
                originalPrice: product.base_price,
                image: product.image_url,
                categoryId: product.category_id,
                available: product.is_available,
                discountDay: activeDiscount?.day_of_week,
                discountPercent: activeDiscount?.percent,
                isDiscountActive: !!activeDiscount
            };
        });

        return NextResponse.json({ products: processedProducts });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ products: [] }, { status: 500 });
    }
}
