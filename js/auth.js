// ============================================================
// js/auth.js - Хэрэглэгчийн нэвтрэлт (Session Cache зассан)
// ============================================================
import { supabase, cleanupSubscriptions } from './supabase.js';

let sessionCache = null;
let sessionCacheTime = 0;
const SESSION_TTL = 30000; // 30 сек

export class Auth {
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Auth getCurrentUser error:', error.message);
      return null;
    }
  }

  static async getSession() {
    const now = Date.now();
    if (sessionCache && (now - sessionCacheTime) < SESSION_TTL) return sessionCache;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      sessionCache = session;
      sessionCacheTime = now;
      return session;
    } catch (error) {
      console.error('Auth getSession error:', error.message);
      return null;
    }
  }

  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) return { user: null, session: null, error: error.message };
      sessionCache = data.session;
      sessionCacheTime = Date.now();
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Auth signIn error:', error);
      return { user: null, session: null, error: error.message };
    }
  }

  static async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: metadata.full_name || '', role: metadata.role || 'student', ...metadata },
          emailRedirectTo: window.location.origin + '/index.html'
        }
      });
      if (error) return { user: null, session: null, error: error.message };
      if (data.session) {
        sessionCache = data.session;
        sessionCacheTime = Date.now();
      }
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Auth signUp error:', error);
      return { user: null, session: null, error: error.message };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      sessionCache = null;
      sessionCacheTime = 0;
      cleanupSubscriptions();
      return { error: null };
    } catch (error) {
      console.error('Auth signOut error:', error.message);
      return { error: error.message };
    }
  }

  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/reset-password.html'
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Auth resetPassword error:', error.message);
      return { error: error.message };
    }
  }

  static async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Auth updatePassword error:', error.message);
      return { error: error.message };
    }
  }

  static async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({ data: updates });
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Auth updateProfile error:', error.message);
      return { user: null, error: error.message };
    }
  }

  static async requireAuth(redirectUrl = '/index.html') {
    const session = await this.getSession();
    if (!session) { window.location.href = redirectUrl; return false; }
    return true;
  }

  static async requireTeacher(redirectUrl = '/dashboard.html') {
    const user = await this.getCurrentUser();
    if (!user) { window.location.href = '/index.html'; return false; }
    const role = user.user_metadata?.role || 'student';
    if (role !== 'teacher' && role !== 'admin') { window.location.href = redirectUrl; return false; }
    return true;
  }

  static async getRole() {
    const user = await this.getCurrentUser();
    if (!user) return 'guest';
    return user.user_metadata?.role || 'student';
  }

  static async getDisplayName() {
    const user = await this.getCurrentUser();
    if (!user) return 'Зочин';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Хэрэглэгч';
  }
}

export default Auth;