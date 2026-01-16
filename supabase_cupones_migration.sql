-- Crear tabla de cupones VIP
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'vip30', -- vip30 = 30 días gratis
    days_extension INTEGER NOT NULL DEFAULT 30,
    max_uses INTEGER DEFAULT 1, -- Cuántas veces se puede usar
    current_uses INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL = no expira
    created_by TEXT, -- Email del creador
    notes TEXT -- Notas internas
);

-- Índices para búsqueda rápida
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

-- Índice para evitar uso duplicado
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_usage_unique 
ON coupon_usage(coupon_id, store_id);

-- Insertar algunos cupones VIP de ejemplo
INSERT INTO coupons (code, type, days_extension, max_uses, active, notes, created_by)
VALUES 
    ('VIP30-LAUNCH', 'vip30', 30, 100, true, 'Cupón de lanzamiento - 100 usos', 'admin'),
    ('VIP30-FRIEND', 'vip30', 30, 50, true, 'Para amigos y familia - 50 usos', 'admin'),
    ('VIP30-PREMIUM', 'vip30', 30, 1, true, 'Cupón único premium', 'admin')
ON CONFLICT (code) DO NOTHING;

-- Comentarios
COMMENT ON TABLE coupons IS 'Cupones VIP para extender período de prueba';
COMMENT ON COLUMN coupons.code IS 'Código del cupón (ej: VIP30-LAUNCH)';
COMMENT ON COLUMN coupons.days_extension IS 'Días adicionales que otorga el cupón';
COMMENT ON COLUMN coupons.max_uses IS 'Máximo de usos permitidos (NULL = ilimitado)';
COMMENT ON COLUMN coupons.current_uses IS 'Usos actuales del cupón';
