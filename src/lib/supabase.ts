import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          title: string
          amount: number
          category: string
          date: string
          notes: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          amount: number
          category: string
          date: string
          notes?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          amount?: number
          category?: string
          date?: string
          notes?: string | null
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}

export type Expense = Database['public']['Tables']['expenses']['Row']