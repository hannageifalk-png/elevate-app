import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabasePublisheKey =
    import.meta.env.VITE_PUBLISHED_KEY;

export const supabase = createClient(
    supabaseURL,
    supabasePublisheKey
);