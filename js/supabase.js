import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://yioswlfvqbdyqnhwmxoc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb3N3bGZ2cWJkeXFuaHdteG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODMyMzYsImV4cCI6MjEwMjQ1OTIzNn0.uqZeR18PuzxrcWMlS4JXLlAhblCl0HZndMUG3znbtt8";

export const IS_SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (supabase.auth) {
    console.log("Холбогдсон байна!");
}
