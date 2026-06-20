
-- Menambahkan kolom payment_provider dan pakasir_order_id ke tabel orders
-- Jalankan di SQL Editor Supabase!

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_provider varchar,
ADD COLUMN IF NOT EXISTS pakasir_order_id varchar;

-- Index untuk pakasir_order_id
CREATE INDEX IF NOT EXISTS orders_pakasir_order_id_idx ON public.orders (pakasir_order_id);
