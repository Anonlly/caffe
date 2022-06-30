import { createClient } from '@supabase/supabase-js'

const supabaseUrl = `https://hknnhacamqrcalaqobvh.supabase.co`
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjEzMDk0MCwiZXhwIjoxOTMxNzA2OTQwfQ.k22HKqpD5_rYVijuMXjCt2sskq1x0fIQNvFp_FFp6Ws"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)