import { createClient } from '@supabase/supabase-js'

// These environment variables need to be set in your Vercel project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error)
  throw new Error(error.message || 'An error occurred with the database')
} 