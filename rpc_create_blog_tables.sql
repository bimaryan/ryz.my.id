-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  cover_image_url TEXT,
  payment_type TEXT DEFAULT 'One Time',
  price NUMERIC DEFAULT 0,
  sale_price NUMERIC,
  currency TEXT DEFAULT 'IDR',
  allow_pay_what_you_want BOOLEAN DEFAULT FALSE,
  is_free BOOLEAN DEFAULT FALSE,
  release_time TIMESTAMP WITH TIME ZONE,
  custom_message TEXT,
  enable_whatsapp_notification BOOLEAN DEFAULT FALSE,
  block_layout TEXT DEFAULT 'default',
  questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for blogs
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policies for blogs
CREATE POLICY "Users can manage their own blogs"
  ON blogs
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view blogs"
  ON blogs
  FOR SELECT
  USING (true);

-- Create blog_chapters table
CREATE TABLE IF NOT EXISTS blog_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  part_name TEXT,
  title TEXT,
  content TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for blog_chapters
ALTER TABLE blog_chapters ENABLE ROW LEVEL SECURITY;

-- Policies for blog_chapters
CREATE POLICY "Users can manage their own chapters"
  ON blog_chapters
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM blogs
    WHERE blogs.id = blog_chapters.blog_id
    AND blogs.user_id = auth.uid()
  ));

CREATE POLICY "Public can view chapters"
  ON blog_chapters
  FOR SELECT
  USING (true);
