/**
 * ============================================================================
 *  js/auth.js — Нэвтрэх / Бүртгүүлэх / Гарах
 * ============================================================================
 */

// Supabase холболтоо импортлож оруулж ирнэ
import { supabase, IS_SUPABASE_CONFIGURED } from './supabase.js'

const Auth = {
 
  /** Шинэ хэрэглэгч бүртгэнэ. role нь user_metadata-д хадгалагдана —
      ингэснээр dashboard.js болон Supabase RLS policy хоёул үүнийг
      нэмэлт query хийлгүйгээр уншиж чадна. */
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
 
  /** "student" эсвэл "teacher" буцаана. Тодорхойгүй бол "student". */
  async getCurrentRole() {
    const user = await this.getCurrentUser();
    return user?.user_metadata?.role === "teacher" ? "teacher" : "student";
  },
 
  /** Нэвтрэх / гарах / token сэргээх үйл явдал сонсоно. */
  onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange((event, session) => callback(event, session));
  },
};
 
/* ----------------------------------------------------------------------
   B) UI WIRING — index.html (Нэвтрэх / Бүртгүүлэх хуудас)
   ---------------------------------------------------------------------- */
function initAuthPageUI() {
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
 
  // Энэ функцийн шаардлагатай элементүүд байхгүй бол (жишээ нь бид
  // dashboard.html дээр байгаа бол) юу ч хийхгүйгээр гарна.
  if (!tabLogin || !tabRegister || !loginForm || !registerForm) return;
 
  const messageBox = document.getElementById("authMessage");
 
  function showTab(tab) {
    const isLogin = tab === "login";
    tabLogin.classList.toggle("is-active", isLogin);
    tabRegister.classList.toggle("is-active", !isLogin);
    tabLogin.setAttribute("aria-selected", isLogin);
    tabRegister.setAttribute("aria-selected", !isLogin);
    loginForm.hidden = !isLogin;
    registerForm.hidden = isLogin;
    const switchToRegisterLine = document.getElementById("switchToRegisterLine");
    const switchToLoginLine = document.getElementById("switchToLoginLine");
    if (switchToRegisterLine) switchToRegisterLine.hidden = !isLogin;
    if (switchToLoginLine) switchToLoginLine.hidden = isLogin;
    clearMessage();
  }
 
  function showMessage(text, kind = "error") {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.hidden = false;
    messageBox.className = `auth-message auth-message--${kind}`;
  }
 
  function clearMessage() {
    if (!messageBox) return;
    messageBox.hidden = true;
    messageBox.textContent = "";
  }
 
  tabLogin.addEventListener("click", () => showTab("login"));
  tabRegister.addEventListener("click", () => showTab("register"));
  document.getElementById("switchToRegister")?.addEventListener("click", () => showTab("register"));
  document.getElementById("switchToLogin")?.addEventListener("click", () => showTab("login"));
 
  // "Би бол: Сурагч / Багш" сонголт (бүртгүүлэх маягт дотор)
  document.querySelectorAll(".auth-role-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".auth-role-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
      const roleInput = document.getElementById("registerRole");
      if (roleInput) roleInput.value = btn.dataset.role;
    });
  });
 
  // ---- Нэвтрэх ----
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
 
    submitBtn.disabled = true;
    submitBtn.textContent = "Нэвтэрч байна…";
    try {
      if (!IS_SUPABASE_CONFIGURED) {
        // Demo горим: js/supabase.js дотор бодит Supabase түлхүүр
        // тохируулаагүй үед хуудсыг шууд дашбоард руу үсрүүлнэ.
        // Хэрэв энэ browser дээр өмнө нь бүртгүүлж нэр хадгалагдсан бол
        // тэрийг хэвээр үлдээж, шинээр зөвхөн нэвтэрч буй тохиолдолд
        // имэйлээс дэвшилтэт нэр гаргаж хадгална.
        if (!localStorage.getItem("smartclass_user_name")) {
          const derivedName = email
            .split("@")[0]
            .replace(/[._-]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          localStorage.setItem("smartclass_user_name", derivedName || "Хэрэглэгч");
        }
        if (!localStorage.getItem("smartclass_user_role")) {
          localStorage.setItem("smartclass_user_role", "student");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.location.href = "dashboard.html";
        return;
      }
      await Auth.signIn(email, password);
      window.location.href = "dashboard.html";
    } catch (err) {
      showMessage(err?.message || "Нэвтрэхэд алдаа гарлаа. Имэйл, нууц үгээ шалгаад дахин оролдоно уу.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
 
  // ---- Бүртгүүлэх ----
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();
    const fullName = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirm").value;
    const role = document.getElementById("registerRole")?.value || "student";
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
 
    if (password !== confirmPassword) {
      showMessage("Нууц үг таарахгүй байна.", "error");
      return;
    }
    if (password.length < 6) {
      showMessage("Нууц үг дор хаяж 6 тэмдэгт байх ёстой.", "error");
      return;
    }
 
    submitBtn.disabled = true;
    submitBtn.textContent = "Бүртгэж байна…";
    try {
      if (!IS_SUPABASE_CONFIGURED) {
        // Demo горим: бүртгүүлэх маягтад бичсэн БОДИТ нэр, сонгосон
        // төрлийг хадгална — dashboard.html-ийн мэндчилгээ үүнийг ашиглана.
        localStorage.setItem("smartclass_user_name", fullName);
        localStorage.setItem("smartclass_user_role", role);
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.location.href = "dashboard.html";
        return;
      }
      await Auth.signUp(email, password, fullName, role);
      showMessage("Бүртгэл амжилттай үүслээ! Имэйлээ шалгаж баталгаажуулаад нэвтэрнэ үү.", "success");
      showTab("login");
    } catch (err) {
      showMessage(err?.message || "Бүртгүүлэхэд алдаа гарлаа. Дахин оролдоно уу.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}
 
/* ----------------------------------------------------------------------
   B) UI WIRING — dashboard.html (Гарах товч)
   ---------------------------------------------------------------------- */
function initDashboardAuthUI() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return; // index.html дээр байхгүй тул чимээгүй гарна
 
  logoutBtn.addEventListener("click", async () => {
    try {
      if (IS_SUPABASE_CONFIGURED) await Auth.signOut();
      localStorage.removeItem("smartclass_user_name");
      localStorage.removeItem("smartclass_user_role");
      if (typeof showToast === "function") showToast("Системээс гарлаа");
    } catch (err) {
      console.error("[SmartClass] Гарахад алдаа гарлаа:", err);
    } finally {
      window.location.href = "index.html";
    }
  });
}
 
document.addEventListener("DOMContentLoaded", () => {
  initAuthPageUI();
  initDashboardAuthUI();
});
 