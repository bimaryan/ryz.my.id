-- Tabel untuk menyimpan riwayat pembelian Billing & Plans
CREATE TABLE public.billing_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name varchar NOT NULL,
  amount integer NOT NULL,
  status varchar DEFAULT 'paid'::varchar CHECK (status IN ('pending', 'paid', 'failed')),
  midtrans_order_id varchar,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT billing_history_pkey PRIMARY KEY (id)
);

-- Indexing
CREATE INDEX billing_history_user_id_idx ON public.billing_history (user_id);
CREATE INDEX billing_history_midtrans_order_id_idx ON public.billing_history (midtrans_order_id);

-- RLS Policies
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own billing history" 
ON public.billing_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own billing history" 
ON public.billing_history FOR SELECT 
USING (auth.uid() = user_id);
