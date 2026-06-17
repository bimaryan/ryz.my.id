-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE CHECK (email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::text),
  username character varying NOT NULL UNIQUE CHECK (char_length(username::text) >= 3),
  avatar_url text,
  full_name character varying,
  plan_type character varying DEFAULT 'free'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_verified boolean DEFAULT false,
  max_links integer DEFAULT 50,
  storage_limit integer DEFAULT 1000,
  api_quota integer DEFAULT 1000,
  last_login_at timestamp with time zone,
  two_fa_enabled boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  original_url text NOT NULL CHECK (original_url ~* '^https?://'::text),
  short_code character varying NOT NULL UNIQUE CHECK (char_length(short_code::text) >= 4),
  custom_slug character varying UNIQUE,
  title character varying,
  description text,
  tags ARRAY DEFAULT ARRAY[]::character varying[],
  category character varying,
  is_active boolean DEFAULT true,
  password_hash character varying,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  qr_code_url text,
  preview_image text,
  og_title character varying,
  og_description text,
  og_image text,
  clicks_count integer DEFAULT 0,
  is_public boolean DEFAULT false,
  utm_source character varying,
  utm_medium character varying,
  utm_campaign character varying,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT links_pkey PRIMARY KEY (id),
  CONSTRAINT links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL,
  referrer character varying,
  user_agent text,
  ip_address inet,
  country character varying,
  city character varying,
  latitude numeric,
  longitude numeric,
  device_type character varying CHECK (device_type::text = ANY (ARRAY['mobile'::character varying::text, 'tablet'::character varying::text, 'desktop'::character varying::text])),
  browser character varying,
  os character varying,
  utm_source character varying,
  utm_medium character varying,
  utm_campaign character varying,
  utm_content character varying,
  utm_term character varying,
  timestamp timestamp with time zone DEFAULT now(),
  session_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analytics_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.links(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name character varying NOT NULL CHECK (char_length(name::text) >= 1),
  avatar_url text,
  description text,
  slug character varying UNIQUE CHECK (char_length(slug::text) >= 3),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  plan_type character varying DEFAULT 'free'::character varying,
  members_count integer DEFAULT 1,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying DEFAULT 'member'::character varying CHECK (role::text = ANY (ARRAY['owner'::character varying::text, 'admin'::character varying::text, 'member'::character varying::text])),
  joined_at timestamp with time zone DEFAULT now(),
  permissions jsonb DEFAULT '{"edit": false, "view": true, "delete": false, "manage_team": false}'::jsonb,
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.team_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  link_id uuid NOT NULL,
  assigned_to uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_links_pkey PRIMARY KEY (id),
  CONSTRAINT team_links_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_links_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.links(id),
  CONSTRAINT team_links_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id)
);
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  team_id uuid,
  key_hash character varying NOT NULL UNIQUE,
  name character varying NOT NULL CHECK (char_length(name::text) >= 1),
  last_used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{"read": true, "write": true}'::jsonb,
  CONSTRAINT api_keys_pkey PRIMARY KEY (id),
  CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT api_keys_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.link_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL,
  shared_by uuid NOT NULL,
  shared_with_email character varying NOT NULL CHECK (shared_with_email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::text),
  access_level character varying DEFAULT 'view'::character varying CHECK (access_level::text = ANY (ARRAY['view'::character varying::text, 'edit'::character varying::text, 'admin'::character varying::text])),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT link_shares_pkey PRIMARY KEY (id),
  CONSTRAINT link_shares_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.links(id),
  CONSTRAINT link_shares_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES public.users(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action character varying NOT NULL CHECK (char_length(action::text) > 0),
  resource_type character varying NOT NULL,
  resource_id uuid,
  changes jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.plan_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_type character varying NOT NULL UNIQUE CHECK (plan_type::text = ANY (ARRAY['free'::character varying::text, 'pro'::character varying::text, 'enterprise'::character varying::text])),
  max_links integer NOT NULL,
  max_team_members integer NOT NULL,
  api_requests_per_month integer NOT NULL,
  custom_domains boolean DEFAULT false,
  storage_gb integer NOT NULL,
  analytics_retention_days integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT plan_limits_pkey PRIMARY KEY (id)
);
CREATE TABLE public.custom_domains (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team_id uuid,
  domain character varying NOT NULL UNIQUE CHECK (domain::text ~* '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$'::text),
  is_verified boolean DEFAULT false,
  verification_token character varying,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  is_primary boolean NOT NULL DEFAULT false,
  CONSTRAINT custom_domains_pkey PRIMARY KEY (id),
  CONSTRAINT custom_domains_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT custom_domains_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team_id uuid,
  event_type character varying NOT NULL CHECK (char_length(event_type::text) > 0),
  url text NOT NULL CHECK (url ~* '^https?://'::text),
  headers jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_triggered_at timestamp with time zone,
  failed_attempts integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT webhooks_pkey PRIMARY KEY (id),
  CONSTRAINT webhooks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT webhooks_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL,
  event_data jsonb NOT NULL,
  response_status integer,
  response_body text,
  error_message text,
  attempt_number integer DEFAULT 1,
  next_retry_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT webhook_logs_pkey PRIMARY KEY (id),
  CONSTRAINT webhook_logs_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES public.webhooks(id)
);
