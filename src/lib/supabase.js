import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frhhcomvgwpisgxnjdyk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaGhjb212Z3dwaXNneG5qZHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NDU2MjEsImV4cCI6MjA4NzIyMTYyMX0.CfdkFvzqT3Ok-zdmgBeNfEpoRemD-f5qcjQNBomwuwY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
