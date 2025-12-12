import { createClient } from "@supabase/supabase-js";
  

export const supabase = crreateClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);
