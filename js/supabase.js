const SUPABASE_URL = 'https://lvhfclsnvtzijpizjavf.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HZ_HAmSBMR-SaPuO6hz1qg_JGb71Jox'

const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_KEY)