import { supabase } from "@/integrations/supabase/client";
import { useCallback, useState } from "react";

export function useDeleteCandidate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCandidate = useCallback(async (candidateId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Delete candidate (cascade delete will handle related records via foreign keys)
      const { error: candidateError } = await (supabase.from("candidates") as any)
        .delete()
        .eq("id", candidateId);

      if (candidateError) throw new Error(`Failed to delete candidate: ${candidateError.message}`);

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete candidate";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteCandidate, isLoading, error };
}
