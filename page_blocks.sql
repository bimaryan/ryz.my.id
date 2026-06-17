-- Table: page_blocks
-- Description: A table to store different types of blocks (Link, Header, Video, Product, etc) for a page.
-- Note: Currently RYZLink uses the 'links' JSONB column in the 'pages' table for simplicity. 
-- You can run this SQL if you plan to migrate to a fully normalized relational structure.

CREATE TABLE page_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'link', -- 'link', 'header', 'image', 'video', 'social_connect', 'digital_product', etc.
    title TEXT,
    subtitle TEXT,
    url TEXT,
    icon VARCHAR(100),
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store specific data per block type (e.g. video_id, price, layout)
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by page_id and ordering
CREATE INDEX idx_page_blocks_page_id_sort ON page_blocks(page_id, sort_order);

-- Add Row Level Security (RLS)
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

-- Allow public to read active blocks
CREATE POLICY "Public can view active blocks" 
ON page_blocks FOR SELECT 
USING (is_active = true);

-- Allow owners to manage their own page blocks
CREATE POLICY "Users can manage their own page blocks" 
ON page_blocks FOR ALL 
USING (
    page_id IN (
        SELECT id FROM pages WHERE user_id = auth.uid()
        UNION
        SELECT p.id FROM pages p 
        JOIN team_members tm ON p.team_id = tm.team_id 
        WHERE tm.user_id = auth.uid()
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_page_blocks_modtime
    BEFORE UPDATE ON page_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
