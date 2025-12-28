'use server';

import { createClient } from '@/utils/supabase/server';

export async function getProductsBySlug(slug: string) {
    if (!slug) return [];

    // Mock for Demo
    if (slug === 'demo-pizza') {
        const mockProducts = [
            {
                id: '1',
                name: 'Pizza Muzzarella',
                description: 'Salsa de tomate, muzzarella, orégano y aceitunas.',
                price: 12000,
                originalPrice: 12000,
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80',
                categoryId: 'pizzas',
                available: true,
                isDiscountActive: false
            },
            {
                id: '2',
                name: 'Pizza Napolitana',
                description: 'Salsa de tomate, muzzarella, rodajas de tomate, ajo y perejil.',
                price: 13500,
                originalPrice: 13500,
                image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=500&q=80',
                categoryId: 'pizzas',
                available: true,
                isDiscountActive: false
            },
            {
                id: '3',
                name: 'Empanada de Carne',
                description: 'Carne cortada a cuchillo, suave y jugosa.',
                price: 1500,
                originalPrice: 1500,
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80',
                categoryId: 'empanadas',
                available: true,
                isDiscountActive: false
            },
            {
                id: '4',
                name: 'Cerveza IPA',
                description: 'Pinta de cerveza artesanal estilo IPA.',
                price: 4500,
                originalPrice: 4500,
                image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=500&q=80',
                categoryId: 'bebidas',
                available: true,
                isDiscountActive: false
            }
        ];
        return mockProducts;
    }

    const supabase = await createClient();

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

        if (error) {
            console.error("Error fetching products:", error);
            return [];
        }

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

        return processedProducts;

    } catch (error) {
        console.error("Action Error:", error);
        return [];
    }
}
