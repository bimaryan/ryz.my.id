-- Aktifkan ekstensi HTTP jika belum aktif
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Buat fungsi RPC untuk request token Midtrans
CREATE OR REPLACE FUNCTION get_midtrans_token(
  p_order_id text,
  p_gross_amount int,
  p_first_name text,
  p_phone text,
  p_address text,
  p_server_key text,
  p_is_production boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Berjalan dengan hak akses pembuat (admin) untuk bypass RLS
AS $$
DECLARE
  v_request_body jsonb;
  v_response extensions.http_response;
  v_auth_string text;
  v_midtrans_url text;
BEGIN
  -- Buat payload JSON
  v_request_body := jsonb_build_object(
    'transaction_details', jsonb_build_object(
      'order_id', p_order_id,
      'gross_amount', p_gross_amount
    ),
    'customer_details', jsonb_build_object(
      'first_name', p_first_name,
      'phone', COALESCE(p_phone, '08123456789'),
      'billing_address', jsonb_build_object('address', COALESCE(p_address, ''))
    )
  );

  -- Tentukan URL Endpoint (Sandbox atau Production)
  IF p_is_production THEN
    v_midtrans_url := 'https://app.midtrans.com/snap/v1/transactions';
  ELSE
    v_midtrans_url := 'https://app.sandbox.midtrans.com/snap/v1/transactions';
  END IF;

  -- Encode Server Key menjadi Base64 (Server Key + ":")
  v_auth_string := encode(CAST(p_server_key || ':' AS bytea), 'base64');

  -- Lakukan pemanggilan HTTP POST ke Midtrans
  SELECT * INTO v_response FROM extensions.http((
    'POST',
    v_midtrans_url,
    ARRAY[
      extensions.http_header('Authorization', 'Basic ' || v_auth_string),
      extensions.http_header('Accept', 'application/json')
    ],
    'application/json',
    v_request_body::text
  )::extensions.http_request);

  -- Jika status gagal, kembalikan body errornya
  IF v_response.status >= 400 THEN
    RETURN jsonb_build_object(
      'error', true, 
      'status_code', v_response.status,
      'message', v_response.content::jsonb
    );
  END IF;

  -- Kembalikan token sukses
  RETURN v_response.content::jsonb;
EXCEPTION WHEN OTHERS THEN
  -- Tangkap error query / ekstensi HTTP jika ada
  RETURN jsonb_build_object(
    'error', true,
    'message', SQLERRM
  );
END;
$$;
