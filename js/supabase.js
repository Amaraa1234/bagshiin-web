/**
 * js/supabase.js
 * SmartClass — Supabase client.
 *
 * IMPORTANT: this file must load AFTER the Supabase JS CDN script tag
 * and BEFORE every other SmartClass script (auth.js, data.js, charts.js,
 * dashboard.js). It exposes a single global: `supabaseClient`.
 *
 * Get these two values from your Supabase project:
 *   Project Settings → API → Project URL / anon public key
 * Never put your service_role key in frontend code — anon key only.
 */

const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

if (!window.supabase) {
  console.error(
    "[SmartClass] Supabase JS SDK олдсонгүй. index.html дотор https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2 -г js/supabase.js -ээс өмнө холбосон эсэхийг шалгана уу."
  );
}

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;