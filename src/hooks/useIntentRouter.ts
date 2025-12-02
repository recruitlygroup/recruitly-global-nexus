import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface IntentResult {
  service: 'education' | 'recruitment' | 'travel' | 'apostille' | null;
  confidence: number;
  suggestedAction: string;
  keywords: string[];
  reasoning: string;
  responseTimeMs?: number;
}

interface UseIntentRouterReturn {
  analyzeIntent: (query: string, context?: { country?: string; previousService?: string }) => Promise<IntentResult | null>;
  isLoading: boolean;
  error: string | null;
  lastResult: IntentResult | null;
}

export const useIntentRouter = (): UseIntentRouterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<IntentResult | null>(null);

  const analyzeIntent = useCallback(async (
    query: string,
    context?: { country?: string; previousService?: string }
  ): Promise<IntentResult | null> => {
    if (!query || query.trim().length < 3) {
      setLastResult(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('intent-router', {
        body: { query, context }
      });

      if (invokeError) {
        console.error('Intent router error:', invokeError);
        setError(invokeError.message);
        return null;
      }

      const result = data as IntentResult;
      setLastResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze intent';
      console.error('Intent analysis error:', err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analyzeIntent,
    isLoading,
    error,
    lastResult
  };
};
