
// Mercado Pago Webhook Payment Notification
// Cuando un usuario paga en Mercado Pago, MP enviará una solicitud POST a nuestra URL con los detalles del pago.
// Esta API recibe la notificación, verifica el pago y actualiza la fecha de vencimiento de la suscripción del cliente.

import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { supabase } from '@/lib/supabase';

// Inicializar el cliente de Mercado Pago
// IMPORTANTE: Recuerda agregar tu Access Token en las variables de entorno (.env.local) como MP_ACCESS_TOKEN
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
    try {
        // Mercado Pago envía los datos en la query string (o body dependiendo de la configuración)
        // Para notificaciones tipo Webhook "topic=payment", viene el ID en query params
        const url = new URL(request.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        if (topic === 'payment' && id) {
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id });

            if (paymentInfo.status === 'approved') {
                // El pago fue aprobado. Ahora necesitamos saber QUÉ cliente pagó.
                // Usualmente pasamos el 'store_id' o 'user_id' en el campo 'external_reference' al crear la preferencia.
                const storeId = paymentInfo.external_reference;

                if (storeId) {
                    // Calculamos la nueva fecha de vencimiento (30 días más)
                    // Primero obtenemos la fecha actual de vencimiento para sumar, o desde hoy si ya venció

                    // Nota: Aquí usamos supabase-js estándar, pero en producción deberíamos usar Service Role 
                    // si tenemos RLS estricto que impida leer/escribir stores ajenos.
                    // Asumiremos que tenemos una función RPC o permisos adecuados, o usamos service role client aqui mismo.

                    // Simplificación: Sumamos 30 días a HOY. (Lo ideal es sumar a la fecha actual de fin si es futura)
                    const newExpiryDate = new Date();
                    newExpiryDate.setDate(newExpiryDate.getDate() + 30);

                    const { error } = await supabase
                        .from('stores')
                        .update({ trial_ends_at: newExpiryDate.toISOString() }) // Reusamos este campo o creamos uno nuevo 'subscription_ends_at'
                        .eq('id', storeId);

                    if (error) {
                        console.error('Error actualizando suscripción:', error);
                        return NextResponse.json({ status: 'error' }, { status: 500 });
                    }

                    console.log(`Suscripción renovada para tienda ${storeId}`);
                }
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error webhook:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 }); // Devolver 200/201 igual a veces MP lo requiere para no reintentar
    }
}
