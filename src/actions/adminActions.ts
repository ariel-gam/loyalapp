'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to get authenticated store
async function getAuthStore(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    // Check if user has a store
    const { data: store, error } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (error || !store) throw new Error("Tienda no encontrada. Por favor completa la configuración.");

    return { storeId: store.id, user };
}

// --- ORDERS ---

export async function getRecentOrders() {
    const supabase = await createClient();
    try {
        const { storeId } = await getAuthStore(supabase);

        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                total_amount,
                delivery_method,
                delivery_address,
                created_at,
                status, 
                details,
                customers ( name, phone )
            `)
            .eq('store_id', storeId)
            .eq('is_archived', false)
            .order('created_at', { ascending: false })
            .limit(50); // Increased limit

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return data;
    } catch (e) {
        return [];
    }
}

export async function updateOrderStatus(id: string, status: 'pending' | 'paid') {
    const supabase = await createClient();
    try {
        await getAuthStore(supabase); // Verify auth

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id); // RLS ensures we only update our own orders

        if (error) return { success: false, message: error.message };

        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

// --- PRODUCTS ---

export async function getAdminProducts() {
    const supabase = await createClient();
    try {
        const { storeId } = await getAuthStore(supabase);

        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                discounts ( day_of_week, percent )
            `)
            .eq('store_id', storeId)
            .order('name');

        if (error) return [];
        return data;
    } catch (e) {
        return [];
    }
}

async function manageDiscounts(supabase: any, storeId: string, productId: string, formData: FormData) {
    // Days: 0 (Sun) - 6 (Sat)
    for (let i = 0; i <= 6; i++) {
        const percentStr = formData.get(`discount_${i}`);
        const percent = percentStr ? Number(percentStr) : 0;

        if (percent > 0) {
            // Upsert discount
            await supabase
                .from('discounts')
                .upsert({
                    store_id: storeId,
                    product_id: productId,
                    day_of_week: i,
                    percent: percent,
                    is_active: true
                }, { onConflict: 'product_id, day_of_week' });
        } else {
            // Remove discount
            await supabase
                .from('discounts')
                .delete()
                .eq('product_id', productId)
                .eq('day_of_week', i);
        }
    }
}

export async function createProduct(formData: FormData) {
    const supabase = await createClient();
    try {
        const { storeId } = await getAuthStore(supabase);

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = Number(formData.get('price'));
        const categoryId = formData.get('categoryId') as string;
        const image = formData.get('image') as string;

        const { data, error } = await supabase
            .from('products')
            .insert({
                store_id: storeId,
                name,
                description,
                base_price: price,
                category_id: categoryId,
                image_url: image,
                is_available: true
            })
            .select()
            .single();

        if (error) return { success: false, message: error.message };

        // Manage Discounts
        if (data) {
            await manageDiscounts(supabase, storeId, data.id, formData);
        }

        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function updateProduct(id: string, formData: FormData) {
    const supabase = await createClient();
    try {
        const { storeId } = await getAuthStore(supabase);

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = Number(formData.get('price'));
        const categoryId = formData.get('categoryId') as string;
        const image = formData.get('image') as string;

        const { error } = await supabase
            .from('products')
            .update({
                name,
                description,
                base_price: price,
                category_id: categoryId,
                image_url: image
            })
            .eq('id', id)
            .eq('store_id', storeId); // Safety check

        if (error) return { success: false, message: error.message };

        await manageDiscounts(supabase, storeId, id, formData);

        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function deleteProduct(id: string) {
    const supabase = await createClient();
    try {
        await getAuthStore(supabase);

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id); // RLS handles store check, but could add .eq('store_id', storeId) explicitly

        if (error) return { success: false, message: error.message };

        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function toggleProductAvailability(id: string, currentStatus: boolean) {
    const supabase = await createClient();
    try {
        await getAuthStore(supabase);

        const { error } = await supabase
            .from('products')
            .update({ is_available: !currentStatus })
            .eq('id', id);

        if (error) return { success: false, message: error.message };

        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

// --- STATISTICS ---

export async function getSalesRanking(period: 'day' | 'week' | 'month') {
    const supabase = await createClient();
    try {
        const { storeId } = await getAuthStore(supabase);

        const now = new Date();
        let startDate = new Date();

        if (period === 'day') {
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'week') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(now.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const { data: orders, error } = await supabase
            .from('orders')
            .select('details')
            .eq('store_id', storeId)
            .eq('status', 'paid')
            .gte('created_at', startDate.toISOString());

        if (error) return [];

        const productStats: Record<string, { name: string, quantity: number, revenue: number }> = {};

        orders.forEach((order: any) => {
            if (Array.isArray(order.details)) {
                order.details.forEach((item: any) => {
                    const id = item.product.id;
                    if (!productStats[id]) {
                        productStats[id] = {
                            name: item.product.name,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productStats[id].quantity += item.quantity;
                    productStats[id].revenue += item.quantity * item.product.price;
                });
            }
        });

        return Object.values(productStats).sort((a, b) => b.quantity - a.quantity);
    } catch (e) {
        return [];
    }
}

// --- CUSTOMERS (CRM) ---

export async function getCustomers() {
    const supabase = await createClient();
    try {
        const { storeId } = await getAuthStore(supabase);

        const { data, error } = await supabase
            .from('customers')
            .select(`
                id,
                name,
                phone,
                last_order_at,
                orders (
                    id,
                    total_amount,
                    created_at
                )
            `)
            .eq('store_id', storeId)
            .order('last_order_at', { ascending: false });

        if (error) return [];

        return data.map((customer: any) => {
            const totalOrders = customer.orders ? customer.orders.length : 0;
            const totalSpent = customer.orders
                ? customer.orders.reduce((sum: number, order: any) => sum + Number(order.total_amount), 0)
                : 0;
            const lastOrderDate = new Date(customer.last_order_at);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - lastOrderDate.getTime());
            const daysSinceLastOrder = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                ...customer,
                totalOrders,
                totalSpent,
                daysSinceLastOrder
            };
        });
    } catch (e) {
        return [];
    }
}

// --- CLEANUP ACTIONS ---

export async function clearAllOrders() {
    const supabase = await createClient();
    try {
        const { storeId } = await getAuthStore(supabase);

        const { error } = await supabase
            .from('orders')
            .update({ is_archived: true })
            .eq('store_id', storeId)
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) return { success: false, message: error.message };

        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function resetAllStats() {
    const supabase = await createClient();
    try {
        const { storeId } = await getAuthStore(supabase);

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('store_id', storeId)
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) return { success: false, message: error.message };

        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function clearAllCustomers() {
    const supabase = await createClient();
    try {
        const { storeId } = await getAuthStore(supabase);

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('store_id', storeId)
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) return { success: false, message: error.message };

        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
