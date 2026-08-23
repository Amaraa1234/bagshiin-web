/**
 * js/auth.js
 * SmartClass — authentication.
 *
 * Wraps Supabase Auth for sign up / sign in / sign out and exposes the
 * signed-in user's role (student | teacher), which js/dashboard.js reads
 * to decide what to render. Load order: after js/supabase.js.
 */

const Auth = {

  /**
   * Register a new account. Role is stored in user_metadata so
   * dashboard.js and Supabase Row Level Security policies can both
   * read it without an extra query.
   */
  async signUp(email, password, fullName, role = "student") {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
  },

  async getCurrentSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  },

  /** Returns "student" or "teacher". Falls back to "student" if unset. */
  async getCurrentRole() {
    const user = await this.getCurrentUser();
    return user?.user_metadata?.role === "teacher" ? "teacher" : "student";
  },

  /** Subscribe to sign-in / sign-out / token-refresh events. */
  onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange((event, session) => callback(event, session));
  },
};

/* Wire the sidebar's sign-out button (#logoutBtn in index.html) once the
   DOM is ready. Кeeps this file self-contained so dashboard.js doesn't
   need to know anything about auth. */
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", async () => {
    try {
      await Auth.signOut();
      if (typeof showToast === "function") {
        showToast("Системээс гарлаа");
      }
      window.location.href = "login.html";
    } catch (err) {
      console.error("[SmartClass] Гарахад алдаа гарлаа:", err);
      if (typeof showToast === "function") {
        showToast("Гарах явцад алдаа гарлаа. Дахин оролдоно уу.");
      }
    }
  });
});