/*
  # Initial Schema for NIRVANA Spa Institute

  1. Tables
    - therapists: Stores information about spa professionals
    - therapies: Available therapy services
    - blog_posts: Blog content
    - company_info: Company details and contact information
    - faqs: Frequently asked questions
    - click_metrics: Track user interactions
    - admin_users: Administrative users

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated admin access
*/

-- Create therapists table
CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create therapies table
CREATE TABLE IF NOT EXISTS therapies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create company_info table
CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram TEXT,
  whatsapp TEXT NOT NULL,
  about TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create click_metrics table
CREATE TABLE IF NOT EXISTS click_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES therapists(id),
  service_id UUID REFERENCES therapies(id),
  type TEXT NOT NULL,
  user_location JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for active therapists"
  ON therapists
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admin full access for therapists"
  ON therapists
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access for active therapies"
  ON therapies
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admin full access for therapies"
  ON therapies
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access for blog posts"
  ON blog_posts
  FOR SELECT
  USING (true);

CREATE POLICY "Admin full access for blog posts"
  ON blog_posts
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access for company info"
  ON company_info
  FOR SELECT
  USING (true);

CREATE POLICY "Admin full access for company info"
  ON company_info
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access for faqs"
  ON faqs
  FOR SELECT
  USING (true);

CREATE POLICY "Admin full access for faqs"
  ON faqs
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access for click metrics"
  ON click_metrics
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_therapies_updated_at
  BEFORE UPDATE ON therapies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_company_info_updated_at
  BEFORE UPDATE ON company_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();