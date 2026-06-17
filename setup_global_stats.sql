-- Run this in your Supabase SQL Editor to allow fetching global stats on the public homepage

CREATE OR REPLACE FUNCTION public.get_global_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_links_count bigint;
  v_clicks_count bigint;
BEGIN
  -- Get total links
  SELECT count(*) INTO v_links_count FROM public.links;
  
  -- Get total clicks (sum of clicks_count from links)
  SELECT coalesce(sum(clicks_count), 0) INTO v_clicks_count FROM public.links;
  
  RETURN json_build_object(
    'total_links', v_links_count,
    'total_clicks', v_clicks_count
  );
END;
$$;
