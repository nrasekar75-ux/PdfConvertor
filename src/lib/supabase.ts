import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Conversion = {
  id: string;
  user_id: string;
  conversion_type: string;
  input_filename: string;
  output_filename: string | null;
  status: 'pending' | 'completed' | 'failed';
  error_message: string | null;
  file_size_input: number | null;
  file_size_output: number | null;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
};
