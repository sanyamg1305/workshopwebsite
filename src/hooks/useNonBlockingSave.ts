import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

/**
 * useNonBlockingSave
 * 
 * A high-performance hook for background data persistence with Supabase.
 * Ensures the UI remains responsive and navigation is never blocked, 
 * even if the save operation fails or is slow.
 */
export const useNonBlockingSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastError, setLastError] = useState<any>(null);

  const saveInBackground = useCallback(async (
    table: string,
    data: any,
    onSuccess?: (data: any) => void,
    onFailure?: (error: any) => void
  ) => {
    // 1. CRITICAL: Never block the UI. We fire the save and manage state internally.
    setIsSaving(true);
    setLastError(null);

    // Using a separate async block to avoid blocking the main flow
    (async () => {
      try {
        console.log(`[Persistence] Background save started for table: ${table}`);
        
        // 2. Supabase Upsert Logic
        const { data: record, error } = await supabase
          .from(table)
          .upsert(data, { onConflict: 'user_uid' })
          .select()
          .single();

        if (error) {
          console.error(`[Persistence] Supabase Error:`, error);
          setLastError(error);
          if (onFailure) onFailure(error);
          return;
        }

        console.log(`[Persistence] Save successful:`, record);
        if (onSuccess) onSuccess(record);
        
      } catch (err) {
        console.error(`[Persistence] Unexpected Error:`, err);
        setLastError(err);
        if (onFailure) onFailure(err);
      } finally {
        setIsSaving(false);
      }
    })();
    
    // Immediately return control to the caller (non-blocking)
    return true; 
  }, []);

  return {
    saveInBackground,
    isSaving,
    lastError
  };
};
