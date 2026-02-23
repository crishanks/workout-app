-- Migration to add round_data and exercise_variants tables

-- Table for storing round data (replaces localStorage 'shreddit-round')
CREATE TABLE IF NOT EXISTS public.round_data (
  user_id TEXT PRIMARY KEY,
  round INTEGER NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for storing exercise variant selections (replaces localStorage 'shreddit-variants')
CREATE TABLE IF NOT EXISTS public.exercise_variants (
  user_id TEXT PRIMARY KEY,
  variants JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.round_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on round_data" ON public.round_data;
DROP POLICY IF EXISTS "Allow all operations on exercise_variants" ON public.exercise_variants;

-- Create policies to allow all operations (since we're using anonymous user IDs)
CREATE POLICY "Allow all operations on round_data" ON public.round_data
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on exercise_variants" ON public.exercise_variants
  FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_round_data_user_id ON public.round_data(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_variants_user_id ON public.exercise_variants(user_id);

-- Table for storing health data from Apple Health (steps and weight)
CREATE TABLE IF NOT EXISTS public.health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  steps INTEGER,
  weight DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on health_data" ON public.health_data;

-- Create policy to allow all operations (since we're using anonymous user IDs)
CREATE POLICY "Allow all operations on health_data" ON public.health_data
  FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_data_user_id ON public.health_data(user_id);
CREATE INDEX IF NOT EXISTS idx_health_data_user_date ON public.health_data(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_health_data_date ON public.health_data(date);

-- Verify tables were created
SELECT 'round_data table created' as status WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'round_data'
);

SELECT 'exercise_variants table created' as status WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'exercise_variants'
);

SELECT 'health_data table created' as status WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'health_data'
);
