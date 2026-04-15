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
      candidates: {
        Row: {
          admin_notes: string | null
          created_at: string
          date_of_birth: string | null
          drive_document_url: string | null
          drive_folder_id: string | null
          drive_folder_url: string | null
          full_name: string
          id: string
          interview_availability: string | null
          interview_result: string | null
          invoice_amount: number | null
          invoice_notes: string | null
          invoice_number: string | null
          job_listing_id: string | null
          marital_status: string | null
          nationality: string | null
          passport_expiry_date: string | null
          passport_issue_date: string | null
          passport_number: string | null
          pcc_status: string | null
          recruiter_id: string
          target_country: string | null
          trade: string | null
          updated_at: string
          visa_status: string | null
          work_permit_status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          drive_document_url?: string | null
          drive_folder_id?: string | null
          drive_folder_url?: string | null
          full_name: string
          id?: string
          interview_availability?: string | null
          interview_result?: string | null
          invoice_amount?: number | null
          invoice_notes?: string | null
          invoice_number?: string | null
          job_listing_id?: string | null
          marital_status?: string | null
          nationality?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_number?: string | null
          pcc_status?: string | null
          recruiter_id: string
          target_country?: string | null
          trade?: string | null
          updated_at?: string
          visa_status?: string | null
          work_permit_status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          drive_document_url?: string | null
          drive_folder_id?: string | null
          drive_folder_url?: string | null
          full_name?: string
          id?: string
          interview_availability?: string | null
          interview_result?: string | null
          invoice_amount?: number | null
          invoice_notes?: string | null
          invoice_number?: string | null
          job_listing_id?: string | null
          marital_status?: string | null
          nationality?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_number?: string | null
          pcc_status?: string | null
          recruiter_id?: string
          target_country?: string | null
          trade?: string | null
          updated_at?: string
          visa_status?: string | null
          work_permit_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      employer_hiring_requests: {
        Row: {
          company_name: string | null
          created_at: string | null
          deadline: string | null
          email: string
          id: string
          message: string | null
          phone: string | null
          quantity: number | null
          role: string
          status: string | null
          target_country: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          deadline?: string | null
          email: string
          id?: string
          message?: string | null
          phone?: string | null
          quantity?: number | null
          role: string
          status?: string | null
          target_country?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          deadline?: string | null
          email?: string
          id?: string
          message?: string | null
          phone?: string | null
          quantity?: number | null
          role?: string
          status?: string | null
          target_country?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      intent_leads: {
        Row: {
          confidence_score: number | null
          created_at: string
          detected_keywords: string[] | null
          email: string | null
          full_name: string | null
          id: string
          intent_query: string
          metadata: Json | null
          phone: string | null
          resume_url: string | null
          route: string
          status: string | null
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          detected_keywords?: string[] | null
          email?: string | null
          full_name?: string | null
          id?: string
          intent_query: string
          metadata?: Json | null
          phone?: string | null
          resume_url?: string | null
          route: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          detected_keywords?: string[] | null
          email?: string | null
          full_name?: string | null
          id?: string
          intent_query?: string
          metadata?: Json | null
          phone?: string | null
          resume_url?: string | null
          route?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
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
      invoices: {
        Row: {
          amount: number | null
          candidate_id: string | null
          created_at: string | null
          id: string
          service_type: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          service_type?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          service_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          admin_notes: string | null
          agent_id: string | null
          country_applied: string | null
          created_at: string
          current_location: string | null
          date_of_birth: string | null
          doc_links: Json | null
          drive_folder_id: string | null
          drive_folder_link: string | null
          first_name: string | null
          full_name: string
          id: string
          interview_availability: string | null
          interview_status: string | null
          job_listing_id: string | null
          last_name: string | null
          marital_status: string | null
          nationality: string | null
          passport_expiry_date: string | null
          passport_issue_date: string | null
          passport_number: string | null
          pcc_status: string | null
          position_applied: string
          status: string
          telegram_number: string | null
          trade: string | null
          updated_at: string
          visa_status: string | null
          whatsapp_number: string | null
          work_permit_status: string | null
        }
        Insert: {
          admin_notes?: string | null
          agent_id?: string | null
          country_applied?: string | null
          created_at?: string
          current_location?: string | null
          date_of_birth?: string | null
          doc_links?: Json | null
          drive_folder_id?: string | null
          drive_folder_link?: string | null
          first_name?: string | null
          full_name: string
          id?: string
          interview_availability?: string | null
          interview_status?: string | null
          job_listing_id?: string | null
          last_name?: string | null
          marital_status?: string | null
          nationality?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_number?: string | null
          pcc_status?: string | null
          position_applied: string
          status?: string
          telegram_number?: string | null
          trade?: string | null
          updated_at?: string
          visa_status?: string | null
          whatsapp_number?: string | null
          work_permit_status?: string | null
        }
        Update: {
          admin_notes?: string | null
          agent_id?: string | null
          country_applied?: string | null
          created_at?: string
          current_location?: string | null
          date_of_birth?: string | null
          doc_links?: Json | null
          drive_folder_id?: string | null
          drive_folder_link?: string | null
          first_name?: string | null
          full_name?: string
          id?: string
          interview_availability?: string | null
          interview_status?: string | null
          job_listing_id?: string | null
          last_name?: string | null
          marital_status?: string | null
          nationality?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_number?: string | null
          pcc_status?: string | null
          position_applied?: string
          status?: string
          telegram_number?: string | null
          trade?: string | null
          updated_at?: string
          visa_status?: string | null
          whatsapp_number?: string | null
          work_permit_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          category: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          demand_level: string | null
          gender: string | null
          id: string
          job_title: string
          last_updated: string | null
          nationality: string | null
          remaining_vacancies: number
          salary_currency: string | null
          salary_display: string | null
          salary_max: number | null
          salary_min: number | null
          status: string | null
          total_vacancies: number
          updated_at: string | null
          vacancies: number | null
        }
        Insert: {
          category?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          demand_level?: string | null
          gender?: string | null
          id?: string
          job_title: string
          last_updated?: string | null
          nationality?: string | null
          remaining_vacancies?: number
          salary_currency?: string | null
          salary_display?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          total_vacancies?: number
          updated_at?: string | null
          vacancies?: number | null
        }
        Update: {
          category?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          demand_level?: string | null
          gender?: string | null
          id?: string
          job_title?: string
          last_updated?: string | null
          nationality?: string | null
          remaining_vacancies?: number
          salary_currency?: string | null
          salary_display?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          total_vacancies?: number
          updated_at?: string | null
          vacancies?: number | null
        }
        Relationships: []
      }
      job_terms: {
        Row: {
          accommodation: string | null
          annual_leave: string | null
          contract_period: string | null
          country: string
          created_at: string | null
          food: string | null
          id: string
          joining_ticket: string | null
          overtime: string | null
          probation: string | null
          return_ticket: string | null
          special_notes: string | null
          transportation: string | null
          updated_at: string | null
          working_days: string | null
          working_hours: string | null
        }
        Insert: {
          accommodation?: string | null
          annual_leave?: string | null
          contract_period?: string | null
          country: string
          created_at?: string | null
          food?: string | null
          id?: string
          joining_ticket?: string | null
          overtime?: string | null
          probation?: string | null
          return_ticket?: string | null
          special_notes?: string | null
          transportation?: string | null
          updated_at?: string | null
          working_days?: string | null
          working_hours?: string | null
        }
        Update: {
          accommodation?: string | null
          annual_leave?: string | null
          contract_period?: string | null
          country?: string
          created_at?: string | null
          food?: string | null
          id?: string
          joining_ticket?: string | null
          overtime?: string | null
          probation?: string | null
          return_ticket?: string | null
          special_notes?: string | null
          transportation?: string | null
          updated_at?: string | null
          working_days?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agent_terms_accepted: boolean
          agent_terms_accepted_at: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          nationality: string | null
          preferred_agent_id: string | null
          preferred_location: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          agent_terms_accepted?: boolean
          agent_terms_accepted_at?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          nationality?: string | null
          preferred_agent_id?: string | null
          preferred_location?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          agent_terms_accepted?: boolean
          agent_terms_accepted_at?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          nationality?: string | null
          preferred_agent_id?: string | null
          preferred_location?: string | null
          updated_at?: string
          whatsapp?: string | null
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          admission_date: string | null
          admission_fee: string | null
          cgpa_requirement: string | null
          country: string
          created_at: string | null
          deadline: string | null
          english_cert: string | null
          fee_numeric: number | null
          id: string
          link: string | null
          status: string | null
          type: string | null
          university_name: string
          updated_at: string | null
        }
        Insert: {
          admission_date?: string | null
          admission_fee?: string | null
          cgpa_requirement?: string | null
          country: string
          created_at?: string | null
          deadline?: string | null
          english_cert?: string | null
          fee_numeric?: number | null
          id?: string
          link?: string | null
          status?: string | null
          type?: string | null
          university_name: string
          updated_at?: string | null
        }
        Update: {
          admission_date?: string | null
          admission_fee?: string | null
          cgpa_requirement?: string | null
          country?: string
          created_at?: string | null
          deadline?: string | null
          english_cert?: string | null
          fee_numeric?: number | null
          id?: string
          link?: string | null
          status?: string | null
          type?: string | null
          university_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      university_programs: {
        Row: {
          admission_requirement: string | null
          country: string
          course_name: string
          created_at: string | null
          department: string | null
          id: string
          level: string | null
          link: string | null
          status: string | null
          tuition_fee: string | null
          university_name: string
          updated_at: string | null
        }
        Insert: {
          admission_requirement?: string | null
          country: string
          course_name: string
          created_at?: string | null
          department?: string | null
          id?: string
          level?: string | null
          link?: string | null
          status?: string | null
          tuition_fee?: string | null
          university_name: string
          updated_at?: string | null
        }
        Update: {
          admission_requirement?: string | null
          country?: string
          course_name?: string
          created_at?: string | null
          department?: string | null
          id?: string
          level?: string | null
          link?: string | null
          status?: string | null
          tuition_fee?: string | null
          university_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          age: number | null
          company_name: string | null
          contact_number: string | null
          created_at: string
          full_name: string | null
          gender: string | null
          id: string
          is_verified: boolean
          passport_number: string | null
          pcc_file_url: string | null
          pcc_link: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["partner_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          company_name?: string | null
          contact_number?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          is_verified?: boolean
          passport_number?: string | null
          pcc_file_url?: string | null
          pcc_link?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["partner_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          company_name?: string | null
          contact_number?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          is_verified?: boolean
          passport_number?: string | null
          pcc_file_url?: string | null
          pcc_link?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["partner_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      visa_predictions: {
        Row: {
          accommodation: string | null
          action_items: Json | null
          career_plan: string | null
          created_at: string
          employment: string | null
          family_home: string[] | null
          family_in_destination: string | null
          financial_liabilities: string | null
          funds_history: string | null
          id: string
          income_source: string | null
          medical_test: string | null
          monthly_income: string | null
          offer_letter: string | null
          passport_status: string | null
          police_clearance: string | null
          program_available_home: string | null
          property_ownership: string | null
          reapplied_successfully: string | null
          refusal_country: string | null
          risk_flags: Json | null
          sop_status: string | null
          sponsor_profession: string | null
          sponsor_type: string | null
          studied_abroad: string | null
          studied_abroad_country: string | null
          sudden_deposit: string | null
          target_country: string | null
          tax_documents: string | null
          total_funds: string | null
          transcripts: string | null
          travel_history_boost: number | null
          user_id: string
          valid_visas: string[] | null
          visa_refusals: string | null
          visa_success_probability: number | null
        }
        Insert: {
          accommodation?: string | null
          action_items?: Json | null
          career_plan?: string | null
          created_at?: string
          employment?: string | null
          family_home?: string[] | null
          family_in_destination?: string | null
          financial_liabilities?: string | null
          funds_history?: string | null
          id?: string
          income_source?: string | null
          medical_test?: string | null
          monthly_income?: string | null
          offer_letter?: string | null
          passport_status?: string | null
          police_clearance?: string | null
          program_available_home?: string | null
          property_ownership?: string | null
          reapplied_successfully?: string | null
          refusal_country?: string | null
          risk_flags?: Json | null
          sop_status?: string | null
          sponsor_profession?: string | null
          sponsor_type?: string | null
          studied_abroad?: string | null
          studied_abroad_country?: string | null
          sudden_deposit?: string | null
          target_country?: string | null
          tax_documents?: string | null
          total_funds?: string | null
          transcripts?: string | null
          travel_history_boost?: number | null
          user_id: string
          valid_visas?: string[] | null
          visa_refusals?: string | null
          visa_success_probability?: number | null
        }
        Update: {
          accommodation?: string | null
          action_items?: Json | null
          career_plan?: string | null
          created_at?: string
          employment?: string | null
          family_home?: string[] | null
          family_in_destination?: string | null
          financial_liabilities?: string | null
          funds_history?: string | null
          id?: string
          income_source?: string | null
          medical_test?: string | null
          monthly_income?: string | null
          offer_letter?: string | null
          passport_status?: string | null
          police_clearance?: string | null
          program_available_home?: string | null
          property_ownership?: string | null
          reapplied_successfully?: string | null
          refusal_country?: string | null
          risk_flags?: Json | null
          sop_status?: string | null
          sponsor_profession?: string | null
          sponsor_type?: string | null
          studied_abroad?: string | null
          studied_abroad_country?: string | null
          sudden_deposit?: string | null
          target_country?: string | null
          tax_documents?: string | null
          total_funds?: string | null
          transcripts?: string | null
          travel_history_boost?: number | null
          user_id?: string
          valid_visas?: string[] | null
          visa_refusals?: string | null
          visa_success_probability?: number | null
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
      wisescore_results: {
        Row: {
          academic_score: number | null
          action_items: Json | null
          admission_score: number | null
          age_range: string | null
          created_at: string
          current_status: string | null
          education_gap: string | null
          email: string | null
          english_score: number | null
          english_test: string | null
          field: string | null
          grading_system: string | null
          has_passport: boolean | null
          highest_education: string | null
          id: string
          nationality: string | null
          rejection_risk: string | null
          scholarship_score: number | null
          specific_program: string | null
          study_level: string | null
          target_country: string | null
          top_universities: Json | null
          user_id: string
          visa_score: number | null
          whatsapp: string | null
          wise_score: number | null
        }
        Insert: {
          academic_score?: number | null
          action_items?: Json | null
          admission_score?: number | null
          age_range?: string | null
          created_at?: string
          current_status?: string | null
          education_gap?: string | null
          email?: string | null
          english_score?: number | null
          english_test?: string | null
          field?: string | null
          grading_system?: string | null
          has_passport?: boolean | null
          highest_education?: string | null
          id?: string
          nationality?: string | null
          rejection_risk?: string | null
          scholarship_score?: number | null
          specific_program?: string | null
          study_level?: string | null
          target_country?: string | null
          top_universities?: Json | null
          user_id: string
          visa_score?: number | null
          whatsapp?: string | null
          wise_score?: number | null
        }
        Update: {
          academic_score?: number | null
          action_items?: Json | null
          admission_score?: number | null
          age_range?: string | null
          created_at?: string
          current_status?: string | null
          education_gap?: string | null
          email?: string | null
          english_score?: number | null
          english_test?: string | null
          field?: string | null
          grading_system?: string | null
          has_passport?: boolean | null
          highest_education?: string | null
          id?: string
          nationality?: string | null
          rejection_risk?: string | null
          scholarship_score?: number | null
          specific_program?: string | null
          study_level?: string | null
          target_country?: string | null
          top_universities?: Json | null
          user_id?: string
          visa_score?: number | null
          whatsapp?: string | null
          wise_score?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role_type: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      application_status:
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "completed"
      partner_status: "pending" | "approved" | "rejected"
      service_type: "education" | "recruitment" | "travel" | "apostille"
      user_role: "student" | "partner" | "admin" | "candidate" | "recruiter"
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
      partner_status: ["pending", "approved", "rejected"],
      service_type: ["education", "recruitment", "travel", "apostille"],
      user_role: ["student", "partner", "admin", "candidate", "recruiter"],
    },
  },
} as const
