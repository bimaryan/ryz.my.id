-- Table: whatsapp_api_keys
CREATE TABLE IF NOT EXISTS whatsapp_api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- Table: whatsapp_contact_groups
CREATE TABLE IF NOT EXISTS whatsapp_contact_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: whatsapp_contacts
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES whatsapp_contact_groups(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, phone)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_api_keys_key ON whatsapp_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_user ON whatsapp_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_group ON whatsapp_contacts(group_id);

-- RLS Policies
ALTER TABLE whatsapp_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own api_keys" ON whatsapp_api_keys
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contact_groups" ON whatsapp_contact_groups
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contacts" ON whatsapp_contacts
    FOR ALL USING (auth.uid() = user_id);
