
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return NextResponse.json({ error: 'Faltan credenciales de email' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Configurar HTML del correo
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #f97316; text-align: center;">¡Bienvenido a LoyalApp! 🍕</h2>
            <p>Hola,</p>
            <p>Gracias por registrarte. Tu cuenta de negocio ha sido creada.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Usuario (Email):</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${password}</p>
            </div>

            <p style="text-align: center;">
                <a href="https://loyalapp.com.ar/setup" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Configurar mi Tienda</a>
            </p>
            
            <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
                Guarda este correo en un lugar seguro.
            </p>
        </div>
        `;

        await transporter.sendMail({
            from: `"LoyalApp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🎉 Bienvenido a LoyalFood - Tus Credenciales',
            html: htmlContent
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
