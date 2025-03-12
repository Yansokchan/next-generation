// This file is automatically generated. Do not edit it directly.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://khtkcvecjfjzmoormqjp.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodGtjdmVjamZqem1vb3JtcWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjk5ODUsImV4cCI6MjA1Njg0NTk4NX0.n-GfbUikJ0QkxHrgW1SyGA-vV1k8xrvq4m4SRZ4H970";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
