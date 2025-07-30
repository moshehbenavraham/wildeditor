-- Luminari Wilderness Editor Database Setup
-- 
-- DEVELOPMENT: Run this script in your Supabase SQL editor for local development
-- PRODUCTION: Python backend will connect directly to LuminariMUD's existing MySQL spatial tables

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vnum INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  properties TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create paths table  
CREATE TABLE IF NOT EXISTS paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vnum INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create points table
CREATE TABLE IF NOT EXISTS points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinate JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_regions_vnum ON regions(vnum);
CREATE INDEX IF NOT EXISTS idx_regions_type ON regions(type);
CREATE INDEX IF NOT EXISTS idx_paths_vnum ON paths(vnum);
CREATE INDEX IF NOT EXISTS idx_paths_type ON paths(type);
CREATE INDEX IF NOT EXISTS idx_points_type ON points(type);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paths_updated_at BEFORE UPDATE ON paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_points_updated_at BEFORE UPDATE ON points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated read regions" ON regions
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated read paths" ON paths
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated read points" ON points
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert regions" ON regions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update regions" ON regions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete regions" ON regions
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert paths" ON paths
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update paths" ON paths
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete paths" ON paths
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert points" ON points
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update points" ON points
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete points" ON points
    FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions to authenticated users
GRANT ALL ON regions TO authenticated;
GRANT ALL ON paths TO authenticated;
GRANT ALL ON points TO authenticated;

-- Grant permissions to service role (for backend)
GRANT ALL ON regions TO service_role;
GRANT ALL ON paths TO service_role;
GRANT ALL ON points TO service_role;