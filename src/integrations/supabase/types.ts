export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      apostille_requests: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          destination_country: string | null
          document_types: string[] | null
          document_urls: string[] | null
          estimated_completion: string | null
          id: string
          status: Database["public"]["Enums"]["application_status"] | null
          tracking_number: string | null
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          destination_country?: string | null
          document_types?: string[] | null
          document_urls?: string[] | null
          estimated_completion?: string | null
          id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          destination_country?: string | null
          document_types?: string[] | null
          document_urls?: string[] | null
          estimated_completion?: string | null
          id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apostille_requests_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_logs: {
        Row: {
          created_at: string
          email: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          login_method: string
          role_type: string
          success: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          login_method: string
          role_type: string
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          login_method?: string
          role_type?: string
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      consultation_requests: {
        Row: {
          ai_routing_metadata: Json | null
          country_of_interest: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          intent_confidence: number | null
          message: string | null
          phone: string | null
          profile_id: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
        }
        Insert: {
          ai_routing_metadata?: Json | null
          country_of_interest?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          intent_confidence?: number | null
          message?: string | null
          phone?: string | null
          profile_id?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Update: {
          ai_routing_metadata?: Json | null
          country_of_interest?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          intent_confidence?: number | null
          message?: string | null
          phone?: string | null
          profile_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "universal_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      education_applications: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          documents_uploaded: string[] | null
          education_level: string | null
          id: string
          ielts_score: number | null
          preferred_country: string | null
          preferred_course: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          target_intake: string | null
          university_matches: Json | null
          updated_at: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          documents_uploaded?: string[] | null
          education_level?: string | null
          id?: string
          ielts_score?: number | null
          preferred_country?: string | null
          preferred_course?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          target_intake?: string | null
          university_matches?: Json | null
          updated_at?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          documents_uploaded?: string[] | null
          education_level?: string | null
          id?: string
          ielts_score?: number | null
          preferred_country?: string | null
          preferred_course?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          target_intake?: string | null
          university_matches?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_applications_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      intent_routing_logs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          detected_service: Database["public"]["Enums"]["service_type"] | null
          id: string
          response_time_ms: number | null
          routing_metadata: Json | null
          user_query: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          detected_service?: Database["public"]["Enums"]["service_type"] | null
          id?: string
          response_time_ms?: number | null
          routing_metadata?: Json | null
          user_query: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          detected_service?: Database["public"]["Enums"]["service_type"] | null
          id?: string
          response_time_ms?: number | null
          routing_metadata?: Json | null
          user_query?: string
        }
        Relationships: []
      }
      recruitment_applications: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          cv_url: string | null
          experience_years: number | null
          id: string
          job_matches: Json | null
          job_title: string | null
          parsed_cv_data: Json | null
          preferred_locations: string[] | null
          salary_expectation: string | null
          skills: string[] | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          cv_url?: string | null
          experience_years?: number | null
          id?: string
          job_matches?: Json | null
          job_title?: string | null
          parsed_cv_data?: Json | null
          preferred_locations?: string[] | null
          salary_expectation?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          cv_url?: string | null
          experience_years?: number | null
          id?: string
          job_matches?: Json | null
          job_title?: string | null
          parsed_cv_data?: Json | null
          preferred_locations?: string[] | null
          salary_expectation?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_applications_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_inquiries: {
        Row: {
          budget_range: string | null
          consultation_id: string | null
          created_at: string | null
          destination: string | null
          id: string
          itinerary_suggestions: Json | null
          special_requirements: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          travel_dates_end: string | null
          travel_dates_start: string | null
          travelers_count: number | null
          trip_type: string | null
          updated_at: string | null
        }
        Insert: {
          budget_range?: string | null
          consultation_id?: string | null
          created_at?: string | null
          destination?: string | null
          id?: string
          itinerary_suggestions?: Json | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          travel_dates_end?: string | null
          travel_dates_start?: string | null
          travelers_count?: number | null
          trip_type?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_range?: string | null
          consultation_id?: string | null
          created_at?: string | null
          destination?: string | null
          id?: string
          itinerary_suggestions?: Json | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          travel_dates_end?: string | null
          travel_dates_start?: string | null
          travelers_count?: number | null
          trip_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_inquiries_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      universal_profiles: {
        Row: {
          country: string | null
          country_code: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          metadata: Json | null
          phone: string | null
          preferred_services:
            | Database["public"]["Enums"]["service_type"][]
            | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          metadata?: Json | null
          phone?: string | null
          preferred_services?:
            | Database["public"]["Enums"]["service_type"][]
            | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          metadata?: Json | null
          phone?: string | null
          preferred_services?:
            | Database["public"]["Enums"]["service_type"][]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wise_score_leads: {
        Row: {
          academic_division: string | null
          academic_grade: string | null
          advice: string | null
          created_at: string
          current_education: string | null
          destination_country: string | null
          email: string
          english_score: string | null
          english_test: string | null
          full_name: string
          grading_scheme: string | null
          has_research_papers: boolean | null
          has_standardized_tests: boolean | null
          has_visa_risk: boolean | null
          id: string
          nationality: string | null
          phone: string | null
          preferred_intake: string | null
          program_level: string | null
          raw_form_data: Json | null
          score_tier: string | null
          test_score: string | null
          test_type: string | null
          updated_at: string
          utm_campaign: string | null
          utm_source: string | null
          wise_score: number | null
        }
        Insert: {
          academic_division?: string | null
          academic_grade?: string | null
          advice?: string | null
          created_at?: string
          current_education?: string | null
          destination_country?: string | null
          email: string
          english_score?: string | null
          english_test?: string | null
          full_name: string
          grading_scheme?: string | null
          has_research_papers?: boolean | null
          has_standardized_tests?: boolean | null
          has_visa_risk?: boolean | null
          id?: string
          nationality?: string | null
          phone?: string | null
          preferred_intake?: string | null
          program_level?: string | null
          raw_form_data?: Json | null
          score_tier?: string | null
          test_score?: string | null
          test_type?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_source?: string | null
          wise_score?: number | null
        }
        Update: {
          academic_division?: string | null
          academic_grade?: string | null
          advice?: string | null
          created_at?: string
          current_education?: string | null
          destination_country?: string | null
          email?: string
          english_score?: string | null
          english_test?: string | null
          full_name?: string
          grading_scheme?: string | null
          has_research_papers?: boolean | null
          has_standardized_tests?: boolean | null
          has_visa_risk?: boolean | null
          id?: string
          nationality?: string | null
          phone?: string | null
          preferred_intake?: string | null
          program_level?: string | null
          raw_form_data?: Json | null
          score_tier?: string | null
          test_score?: string | null
          test_type?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_source?: string | null
          wise_score?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "completed"
      service_type: "education" | "recruitment" | "travel" | "apostille"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: [
        "pending",
        "in_review",
        "approved",
        "rejected",
        "completed",
      ],
      service_type: ["education", "recruitment", "travel", "apostille"],
    },
  },
} as const
