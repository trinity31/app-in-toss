import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getMenuImageUrl(imagePath) {
  // "/images/food-fortune.png" -> "food-fortune.png"
  const fileName = imagePath.replace('/images/', '')
  const { data } = supabase.storage.from('menu_images').getPublicUrl(fileName)
  return data.publicUrl
}
