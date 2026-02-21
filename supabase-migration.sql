-- Migration to add round_data and exercise_variants tables

-- Table for storing round data (replaces localStorage 'shreddit-round')
CREATE TABLE IF NOT EXISTS round_data (
  user_id TEXT PRIMARY KEY,
  round INTEGER NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for storing exercise variant selections (replaces localStorage 'shreddit-variants')
CREATE TABLE IF NOT EXISTS exercise_variants (
  user_id TEXT PRIMARY KEY,
  variants JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE round_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_variants ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since we're using anonymous user IDs)
CREATE POLICY "Allow all operations on round_data" ON round_data
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on exercise_variants" ON exercise_variants
  FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_round_data_user_id ON round_data(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_variants_user_id ON exercise_variants(user_id);

-- Note: workout_sessions table should already exist from previous setup
-- If not, create it with:
-- CREATE TABLE IF NOT EXISTS workout_sessions (
--   id BIGSERIAL PRIMARY KEY,
--   user_id TEXT NOT NULL,
--   day TEXT NOT NULL,
--   date DATE NOT NULL,
--   week INTEGER NOT NULL,
--   round INTEGER NOT NULL DEFAULT 1,
--   timestamp TIMESTAMPTZ NOT NULL,
--   exercises JSONB NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
