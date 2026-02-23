-- Test script for health_data table RLS policies
-- Run this in Supabase SQL Editor after running the migration

-- Test 1: Insert sample data
INSERT INTO public.health_data (user_id, date, steps, weight)
VALUES 
  ('test-user-123', '2025-02-01', 8500, 180.5),
  ('test-user-123', '2025-02-02', 12000, 180.2),
  ('test-user-123', '2025-02-03', 9500, 179.8),
  ('test-user-456', '2025-02-01', 7000, 165.0);

-- Test 2: Query data (should return all rows)
SELECT * FROM public.health_data ORDER BY user_id, date;

-- Test 3: Update existing data
UPDATE public.health_data 
SET steps = 13000 
WHERE user_id = 'test-user-123' AND date = '2025-02-02';

-- Test 4: Verify unique constraint (should fail with duplicate key error)
-- INSERT INTO public.health_data (user_id, date, steps, weight)
-- VALUES ('test-user-123', '2025-02-01', 5000, 180.0);

-- Test 5: Upsert operation (insert or update)
INSERT INTO public.health_data (user_id, date, steps, weight)
VALUES ('test-user-123', '2025-02-01', 9000, 180.3)
ON CONFLICT (user_id, date) 
DO UPDATE SET 
  steps = EXCLUDED.steps,
  weight = EXCLUDED.weight,
  updated_at = NOW();

-- Test 6: Query by user_id (should use index)
SELECT * FROM public.health_data 
WHERE user_id = 'test-user-123' 
ORDER BY date DESC;

-- Test 7: Query by date range (should use index)
SELECT * FROM public.health_data 
WHERE user_id = 'test-user-123' 
  AND date >= '2025-02-01' 
  AND date <= '2025-02-03'
ORDER BY date;

-- Test 8: Aggregate queries
SELECT 
  user_id,
  COUNT(*) as entry_count,
  SUM(steps) as total_steps,
  AVG(weight) as avg_weight
FROM public.health_data
GROUP BY user_id;

-- Test 9: Delete test data
DELETE FROM public.health_data WHERE user_id LIKE 'test-user-%';

-- Verify deletion
SELECT COUNT(*) as remaining_test_records 
FROM public.health_data 
WHERE user_id LIKE 'test-user-%';
