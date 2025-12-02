import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConsultationData {
  serviceType: 'education' | 'recruitment' | 'travel' | 'apostille';
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  countryOfInterest?: string;
  intentConfidence?: number;
  aiRoutingMetadata?: Record<string, unknown>;
}

interface SubmitResult {
  success: boolean;
  consultationId?: string;
  message: string;
  profileId?: string;
}

interface UseSubmitConsultationReturn {
  submitConsultation: (data: ConsultationData) => Promise<SubmitResult | null>;
  isSubmitting: boolean;
  error: string | null;
}

export const useSubmitConsultation = (): UseSubmitConsultationReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const submitConsultation = useCallback(async (data: ConsultationData): Promise<SubmitResult | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: result, error: invokeError } = await supabase.functions.invoke('submit-consultation', {
        body: data
      });

      if (invokeError) {
        console.error('Submit consultation error:', invokeError);
        setError(invokeError.message);
        toast({
          title: "Submission Failed",
          description: invokeError.message,
          variant: "destructive"
        });
        return null;
      }

      const response = result as SubmitResult;
      
      if (response.success) {
        toast({
          title: "Consultation Request Submitted!",
          description: response.message,
        });
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit consultation';
      console.error('Consultation submission error:', err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [toast]);

  return {
    submitConsultation,
    isSubmitting,
    error
  };
};
