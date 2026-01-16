-- Agregar columnas de WhatsApp a la tabla stores
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS whatsapp_instance TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_stores_whatsapp_instance ON stores(whatsapp_instance);

-- Comentarios para documentación
COMMENT ON COLUMN stores.whatsapp_instance IS 'Nombre único de la instancia de WhatsApp en Evolution API';
COMMENT ON COLUMN stores.whatsapp_connected IS 'Indica si el WhatsApp está actualmente conectado';
COMMENT ON COLUMN stores.whatsapp_phone IS 'Número de teléfono de WhatsApp conectado';
