-- WhatsApp API Tables
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, connected, disconnected
    qr_code TEXT,
    qr_expires_at TIMESTAMPTZ,
    credentials JSONB, -- untuk menyimpan session Baileys
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient VARCHAR(50) NOT NULL, -- nomor WA penerima
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, document
    message_content TEXT NOT NULL,
    media_url TEXT,
    media_mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'queued', -- queued, sent, delivered, read, failed
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES billing_plans(id),
    messages_sent INTEGER DEFAULT 0,
    messages_limit INTEGER,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id)
);

CREATE TABLE IF NOT EXISTS whatsapp_autoresponders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    match_type VARCHAR(50) DEFAULT 'exact', -- exact, contains, starts_with
    reply_message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_broadcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    message_content TEXT NOT NULL,
    media_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, cancelled
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user ON whatsapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session ON whatsapp_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user ON whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_usage_user ON whatsapp_usage(user_id);

-- RLS Policies
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own sessions" ON whatsapp_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON whatsapp_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON whatsapp_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can see own messages" ON whatsapp_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON whatsapp_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see own usage" ON whatsapp_usage
    FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE whatsapp_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_autoresponders ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own webhooks" ON whatsapp_webhooks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own autoresponders" ON whatsapp_autoresponders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own broadcasts" ON whatsapp_broadcasts
    FOR ALL USING (auth.uid() = user_id);
