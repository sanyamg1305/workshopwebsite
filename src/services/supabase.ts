import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to hardcoded values for the preview environment
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (process.env as any).VITE_SUPABASE_URL || 'https://aocccmaofrektmcnsgda.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (process.env as any).VITE_SUPABASE_ANON_KEY || 'sb_publishable_QoYwA0c28sESjdwB6Bv3Pg_S_xgpvSA';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
