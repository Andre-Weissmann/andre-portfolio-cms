import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("[Supabase] SUPABASE_URL or SUPABASE_ANON_KEY not set — admin CMS features disabled.");
}

// Use placeholder values when env vars are missing so the server boots cleanly.
// Admin CMS routes will fail gracefully when called without valid credentials.
const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder"
);

export default supabase;
