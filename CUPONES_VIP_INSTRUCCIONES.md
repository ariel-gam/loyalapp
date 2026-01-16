# Sistema de Cupones VIP - Instrucciones de Instalación

## 📋 Resumen
Este sistema te permite crear códigos de cupón VIP para regalar acceso extendido (30 días) a tus clientes.

## 🔧 Paso 1: Crear las Tablas en Supabase

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto "LoyalApp"
3. Ve a la sección **SQL Editor** en el menú lateral
4. Haz clic en **"New Query"**
5. Copia y pega el siguiente código SQL:

```sql
-- Crear tabla de cupones VIP
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'vip30',
    days_extension INTEGER NOT NULL DEFAULT 30,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);

-- Tabla para trackear uso de cupones
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_usage_unique 
ON coupon_usage(coupon_id, store_id);

-- Insertar cupones VIP de ejemplo
INSERT INTO coupons (code, type, days_extension, max_uses, active, notes, created_by)
VALUES 
    ('VIP30-LAUNCH', 'vip30', 30, 100, true, 'Cupón de lanzamiento - 100 usos', 'admin'),
    ('VIP30-FRIEND', 'vip30', 30, 50, true, 'Para amigos y familia - 50 usos', 'admin'),
    ('VIP30-PREMIUM', 'vip30', 30, 1, true, 'Cupón único premium', 'admin')
ON CONFLICT (code) DO NOTHING;
```

6. Haz clic en **"Run"** para ejecutar el script
7. Deberías ver un mensaje de éxito

## 🚀 Paso 2: Desplegar el Código

Los archivos ya están actualizados localmente. Ahora necesitas desplegarlos al VPS:

### Archivos modificados:
- `src/app/api/registro/checkout/route.ts` - Validación de cupones
- `src/app/cupones-admin/page.tsx` - Panel de administración (NUEVO)

## 📱 Paso 3: Usar el Sistema

### Para Generar Cupones:
1. Ve a: `https://loyalapp.com.ar/cupones-admin`
2. Completa el formulario:
   - **Código**: Haz clic en "🎲 Generar" o escribe uno personalizado
   - **Días de Extensión**: Selecciona 30 días (o más)
   - **Máximo de Usos**: Cuántas personas pueden usar este código
   - **Notas**: Descripción interna (opcional)
3. Haz clic en "✨ Crear Cupón VIP"
4. El cupón aparecerá en la lista
5. Haz clic en "📋 Copiar" para copiar el código

### Para Regalar un Cupón:
1. Genera un cupón en `/cupones-admin`
2. Copia el código (ej: `VIP30-ABC123`)
3. Envíaselo a tu cliente por WhatsApp/Email
4. El cliente lo ingresa en el campo "¿Tienes un Cupón?" al registrarse
5. Automáticamente recibirá **30 días** en lugar de 15

### Para Ver Cupones Usados:
- En la tabla verás la columna "Usos" que muestra: `2 / 50` (2 usos de 50 máximos)
- Puedes desactivar cupones haciendo clic en "🚫 Desactivar"

## 🎁 Cupones Pre-creados

El sistema crea automáticamente 3 cupones de ejemplo:
- `VIP30-LAUNCH` - 100 usos
- `VIP30-FRIEND` - 50 usos  
- `VIP30-PREMIUM` - 1 uso único

Puedes usarlos inmediatamente o crear los tuyos propios.

## ✅ Verificación

Para probar que funciona:
1. Ve a `https://loyalapp.com.ar/registro`
2. Completa el formulario
3. En "¿Tienes un Cupón?" escribe: `VIP30-LAUNCH`
4. Haz clic en "CREAR TIENDA GRATIS"
5. Si todo funciona, deberías ver que el período de prueba es de 30 días en lugar de 15

## 🔒 Seguridad

- Los cupones se validan en el servidor (no se pueden falsificar)
- Se registra cada uso del cupón
- Se previene el uso duplicado del mismo cupón por la misma tienda
- Los cupones pueden desactivarse en cualquier momento

## 📊 Estadísticas

En el panel de cupones puedes ver:
- Cuántas veces se usó cada cupón
- Qué cupones están activos/inactivos
- Notas sobre cada cupón

¿Necesitas ayuda? Avísame si tienes algún problema con la instalación.
