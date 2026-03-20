import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export const saveWorkshopSubmission = async (data: any) => {
  const { id, ...rest } = data;
  
  if (id) {
    const { data: result, error } = await supabase
      .from('workshop_submissions')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  } else {
    const { data: result, error } = await supabase
      .from('workshop_submissions')
      .insert(rest)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }
};
