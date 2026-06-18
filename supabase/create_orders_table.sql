-- Tabel untuk menyimpan riwayat pesanan (Orders)
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  page_slug varchar NOT NULL,
  product_id varchar NOT NULL,
  product_name varchar NOT NULL,
  variant_name varchar,
  amount integer NOT NULL,
  customer_name varchar NOT NULL,
  customer_phone varchar,
  customer_address text,
  status varchar DEFAULT 'pending'::varchar CHECK (status IN ('pending', 'paid', 'failed')),
  midtrans_order_id varchar UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

-- Indexing
CREATE INDEX orders_page_slug_idx ON public.orders (page_slug);
CREATE INDEX orders_midtrans_order_id_idx ON public.orders (midtrans_order_id);

-- RLS Policies (Open for public insert so buyers can create orders, and public select for demo purposes)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can view orders" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Public can update orders" 
ON public.orders FOR UPDATE 
USING (true);
