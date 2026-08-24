/**
 * ============================================================================
 *  js/supabase.js — Supabase client
 * ============================================================================
 *  Хамгийн эхэнд ачаалагдах ёстой файл (Supabase SDK CDN-ийн дараа).
 *  Бусад бүх js файл (auth.js, app.js, dashboard.js) `supabaseClient`
 *  глобал хувьсагчийг эндээс ашиглана.
 *
 *  Утгуудаа Supabase project → Settings → API хэсгээс аваарай.
 *  ⚠️ service_role key-г ХЭЗЭЭ Ч frontend кодонд бичихгүй — зөвхөн anon key.
 * ============================================================================
 */

const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

if (!window.supabase) {
  console.error(
    "[SmartClass] Supabase JS SDK олдсонгүй. HTML файл дотор " +
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2 -г js/supabase.js -ээс " +
    "ӨМНӨ холбосон эсэхээ шалгана уу."
  );
}

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/** true бол та бодит Supabase түлхүүрүүдээ хараахан оруулаагүй байна гэсэн үг. */
const IS_SUPABASE_CONFIGURED = SUPABASE_URL.indexOf("YOUR-PROJECT-REF") === -1;
