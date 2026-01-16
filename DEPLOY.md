# Guía de Despliegue a Vercel

Sigue estos pasos para llevar tu aplicación **LoyalFood SaaS** a producción.

## 1. Preparar el Código (Ya realizado)
He confirmado los últimos cambios para la versión multi-tienda.

## 2. Subir a GitHub
Para conectar con Vercel, lo mejor es tener el código en GitHub.
1. Ve a [GitHub.com](https://github.com) y crea un **Nuevo Repositorio** (público o privado) llamado `loyalfood`.
2. Ejecuta los siguientes comandos en tu terminal (obteniendo la URL de tu nuevo repo):

```bash
git remote add origin https://github.com/TU_USUARIO/loyalfood.git
git branch -M main
git push -u origin main
```

## 3. Configurar en Vercel
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard) y haz clic en **"Add New..."** -> **"Project"**.
2. Selecciona tu repositorio `loyalfood` y haz clic en **Import**.

## 4. Variables de Entorno (¡MUY IMPORTANTE!)
Antes de darle a "Deploy", busca la sección **Environment Variables** y agrega las siguientes (copialas de tu archivo `.env.local`):

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | *Tu URL de Supabase* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Tu Key Anon de Supabase* |
| `SUPABASE_SERVICE_ROLE_KEY` | *Tu Service Role Key (Admin) de Supabase* |
| `MP_ACCESS_TOKEN` | *Tu Access Token de Mercado Pago* |
| `EMAIL_USER` | *Tu Email de Gmail (para enviar credenciales)* |
| `EMAIL_PASS` | *Tu Contraseña de Aplicación de Gmail* |

> ⚠️ Sin estas variables, el registro de usuarios y el pago con Mercado Pago fallarán.

## 5. Desplegar
Haz clic en **Deploy**. Vercel construirá la aplicación y en unos minutos te dará una URL (ej: `loyalfood.vercel.app`).

## 6. Post-Despliegue
¡Tu SaaS ya está vivo!
- Tu Landing Page estará en `https://loyalfood.vercel.app`
- Tus clientes podrán ir a `https://loyalfood.vercel.app/mi-pizzeria`
- Tú podrás ir a `https://loyalfood.vercel.app/admin`

*(Opcional: Si compraste un dominio en Vercel, configúralo en Settings -> Domains)*
