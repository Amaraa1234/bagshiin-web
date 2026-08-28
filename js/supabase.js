
// ============================================================
// js/supabase.js - БҮРЭН ХУВИЛБАР (Storage + Signed URL + Кэш)
// ============================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://yioswlfvqbdyqnhwmxoc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb3N3bGZ2cWJkeXFuaHdteG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODMyMzYsImV4cCI6MjEwMjQ1OTIzNn0.uqZeR18PuzxrcWMlS4JXLlAhblCl0HZndMUG3znbtt8";

export const IS_SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const BUCKET_NAME = 'materials';

let supabaseInstance = null;
let activeChannels = [];

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: 'pkce' },
      realtime: { params: { eventsPerSecond: 4 } },
      global: { headers: { 'x-application-name': 'my-app' } }
    });
    supabaseInstance.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') cleanupSubscriptions();
    });
  }
  return supabaseInstance;
}

export const supabase = getSupabase();

// ==================== КЭШ ====================
const queryCache = new Map();
export async function cachedQuery(key, fetchFn, ttl = 60000) {
  const now = Date.now();
  if (queryCache.has(key)) {
    const entry = queryCache.get(key);
    if (now - entry.timestamp < ttl) return entry.data;
    queryCache.delete(key);
  }
  const data = await fetchFn();
  queryCache.set(key, { data, timestamp: now });
  return data;
}
export function invalidateCache(key) {
  if (key) queryCache.delete(key);
  else queryCache.clear();
}

// ==================== REAL-TIME ====================
export function cleanupSubscriptions() {
  activeChannels.forEach(ch => { try { ch.unsubscribe(); } catch (_) {} });
  activeChannels = [];
}
export function trackSubscription(channel) {
  activeChannels.push(channel);
  return channel;
}

// ==================== STORAGE (БҮРЭН) ====================
export async function uploadFileToStorage(file, folder = 'library') {
  if (!file) throw new Error('Файл сонгоогүй байна');
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw new Error(`Байршуулалт амжилтгүй: ${error.message}`);
  return data.path;
}

export function getPublicUrl(path) {
  return supabase.storage.from(BUCKET_NAME).getPublicUrl(path).data.publicUrl;
}

export async function getSignedFileUrl(path, expiresIn = 60) {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  } catch (err) {
    console.error('Signed URL generation error:', err.message);
    return null;
  }
}

export async function deleteFileFromStorage(path) {
  if (!path) return false;
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Delete file error:', err.message);
    return false;
  }
}

// Хялбарчилсан нэр (dashboard.html-д хэрэглэгдэнэ)
export const uploadFile = uploadFileToStorage;