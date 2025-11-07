import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      apartments: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          postal_code: string | null
          currency: string
          timezone: string
          created_by: string
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['apartments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['apartments']['Insert']>
      }
      apartment_members: {
        Row: {
          id: string
          apartment_id: string
          user_id: string
          location_id: string | null
          role: 'admin' | 'member' | 'guest'
          status: 'pending' | 'active' | 'inactive' | 'suspended' | 'moved_out'
          name: string
          phone: string
          email: string
          photo_url: string | null
          identity_card_url: string | null
          cv_url: string | null
          labor_card_url: string | null
          move_in_date: string | null
          move_out_date: string | null
          monthly_rate_override: number | null
          emergency_contact: Json | null
          relationship_to_others: string | null
          invited_by: string | null
          opt_ins: Json
          loyalty_points: number
          loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
          metadata: Json
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

