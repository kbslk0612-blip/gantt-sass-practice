import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase key exists:', Boolean(supabaseKey))
console.log('Supabase key start:', supabaseKey?.slice(0, 24))
console.log('Supabase key length:', supabaseKey?.length)

export const supabase = createClient(supabaseUrl, supabaseKey)