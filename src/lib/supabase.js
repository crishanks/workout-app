import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frhhcomvgwpisgxnjdyk.supabase.co';
const supabaseAnonKey = 'sb_publishable_zuJBTQ88s0UDilnNYXj5Tg_DaBUjT8s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
