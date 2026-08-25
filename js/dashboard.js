/**
 * ============================================================================
 *   js/dashboard.js — SmartClass DASHBOARD хуудасны логик (ES Module)
 * ============================================================================
 */

import { state, SMARTCLASS_DATA, ICONS, TONE, escapeHTML, DB } from "./app.js";
import { Charts } from "./charts.js";
import { Auth } from "./auth.js";
import { IS_SUPABASE_CONFIGURED } from "./supabase.js";

/* ============================================================
   0) CURRENT USER
   ============================================================ */

/** "Бат-Эрдэнэ Ганбаатар" -> "БГ" гэх мэт эхний үсгүүдийг гаргана. */
function getInitials(fullName) {
  if (!fullName) return "ХБ";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ХБ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Бодит нэвтэрсэн хэрэглэгчийн нэрийг тодорхойлно (Үүрэг: ямагт "student").
 *   1) Supabase холбогдсон бол Auth.getCurrentUser()-ээс уншина.
 *   2) Үгүй бол (demo горим) localStorage-аас уншина.
 */
async function loadCurrentUser() {
  if (IS_SUPABASE_CONFIGURED) {
    try {
      const user = await Auth.getCurrentUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Хэрэглэгч";
        return { name, role: "student" };
      }
    } catch (err) {
      console.error("[SmartClass] Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа:", err);
    }
  }

  // Demo горим
  const storedName = localStorage.getItem("smartclass_user_name");
  return {
    name: storedName || "Зочин хэрэглэгч",
    role: "student",
  };
}

/* ============================================================
   1) RENDERERS
   ============================================================ */
function renderStats() {
  const grid = document.getElementById("statGrid");
  if (!grid) return;
  const items = SMARTCLASS_DATA.stats.student || [];
  grid.innerHTML = items.map((s) => {
    const t = TONE[s.tone] || TONE.ocean;
    return `
      <div class="stat-card" style="--tint:${t.bg}; --tint-ink:${t.ink}">
        <div class="stat-card__icon">${ICONS[s.icon] || ICONS.book}</div>
        <div class="stat-card__value">${escapeHTML(s.value)}</div>
        <div class="stat-card__label">${escapeHTML(s.label)}</div>
        <span class="stat-card__delta stat-card__delta--${s.tone === "sun" ? "warn" : "up"}">${escapeHTML(s.delta)}</span>
      </div>`;
  }).join("");
}

function renderActivity() {
  const feed = document.getElementById("activityFeed");
  if (!feed) return;
  feed.innerHTML = SMARTCLASS_DATA.activity.map((a) => `
    <li>
      <span class="activity-feed__icon">${ICONS[a.icon] || ICONS.comment}</span>
      <div class="activity-feed__body">
        <strong>${escapeHTML(a.title)}</strong>
        <p>${escapeHTML(a.detail)}</p>
      </div>
      <span class="activity-feed__time">${escapeHTML(a.time)}</span>
    </li>`).join("");
}

function renderUpNext() {
  const list = document.getElementById("upNextList");
  if (!list) return;
  list.innerHTML = SMARTCLASS_DATA.upNext.map((u) => `
    <li>
      <span class="upnext-list__date">${escapeHTML(u.date)}</span>
      <div>
        <strong>${escapeHTML(u.title)}</strong>
        <p>${escapeHTML(u.detail)}</p>
      </div>
    </li>`).join("");
}

/** "Долоо хоногийн идэвх" bar chart-ыг js/charts.js ашиглан зурна. */
function renderWeeklyChart() {
  const data = SMARTCLASS_DATA.weeklyActivity.student;
  Charts.renderBarChart("weeklyChart", data, "ocean");
}

function populateLibraryFilters() {
  const subjectSel = document.getElementById("filterSubject");
  const gradeSel = document.getElementById("filterGrade");
  if (subjectSel) {
    SMARTCLASS_DATA.subjects.forEach((s) => subjectSel.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`));
  }
  if (gradeSel) {
    SMARTCLASS_DATA.grades.forEach((g) => gradeSel.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`));
  }
}

function renderLibrary() {
  const { subject, grade, q } = state.libraryFilters;
  const items = SMARTCLASS_DATA.library.filter((item) => {
    if (subject !== "all" && item.subject !== subject) return false;
    if (grade !== "all" && item.grade !== grade) return false;
    if (q && !item.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const countEl = document.getElementById("libCount");
  if (countEl) countEl.textContent = items.length;

  const grid = document.getElementById("libraryGrid");
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = `<p style="color:var(--ink-500); grid-column:1/-1;">Эдгээр шүүлтүүрт тохирох материал одоогоор алга байна.</p>`;
    return;
  }

  grid.innerHTML = items.map((b) => {
    const t = TONE[b.tone] || TONE.ocean;
    const actions = `<button class="btn btn--primary btn--sm" style="flex:1">Татах</button><button class="btn btn--ghost btn--sm" style="flex:1">Урьдчилан үзэх</button>`;
    return `
      <article class="book-card">
        <div class="book-card__cover" style="background:${t.solid}">
          ${ICONS.pdf}
          <span class="book-card__type">${escapeHTML(b.type)}</span>
        </div>
        <div class="book-card__body">
          <span class="book-card__subject">${escapeHTML(b.subject)} · ${escapeHTML(b.grade)}</span>
          <h3 class="book-card__title">${escapeHTML(b.title)}</h3>
          <span class="book-card__meta">${escapeHTML(b.size)}</span>
        </div>
        <div class="book-card__actions">${actions}</div>
      </article>`;
  }).join("");
}

function renderPlaylistChips() {
  const row = document.getElementById("playlistChips");
  if (!row) return;
  row.innerHTML = SMARTCLASS_DATA.playlists.map((p) =>
    `<button class="chip ${p === state.activePlaylist ? "is-active" : ""}" data-playlist="${escapeHTML(p)}" type="button">${escapeHTML(p)}</button>`
  ).join("");
}

function renderVideos() {
  const items = SMARTCLASS_DATA.videos.filter((v) => state.activePlaylist === "All" || v.playlist === state.activePlaylist);
  const grid = document.getElementById("videoGrid");
  if (!grid) return;

  grid.innerHTML = items.map((v) => {
    const t = TONE[v.tone] || TONE.ocean;
    return `
      <article class="video-card">
        <div class="video-card__thumb" style="background:${t.solid}">
          <span class="video-card__play">${ICONS.play}</span>
          <span class="video-card__duration">${escapeHTML(v.duration)}</span>
        </div>
        <div class="video-card__body">
          <h3 class="video-card__title">${escapeHTML(v.title)}</h3>
          <p class="video-card__teacher">${escapeHTML(v.teacher)} · ${escapeHTML(v.playlist)}</p>
          <div class="progress-track"><div class="progress-track__fill" style="width:${v.progress}%; background:${t.ink}"></div></div>
        </div>
      </article>`;
  }).join("");
}

/* ---- Даалгавар: сурагчийн kanban ---- */
function renderKanban() {
  const cols = { todo: [], progress: [], done: [] };
  state.assignments.forEach((a) => cols[a.status]?.push(a));

  Object.entries(cols).forEach(([status, tasks]) => {
    const el = document.getElementById(`col-${status}`);
    if (!el) return;
    if (!tasks.length) {
      el.innerHTML = `<p style="color:var(--ink-300); font-size:0.8rem;">Энд одоогоор юу ч алга.</p>`;
      return;
    }
    el.innerHTML = tasks.map((a) => `
      <div class="task-card" data-task="${escapeHTML(a.id)}">
        <span class="task-card__subject">${escapeHTML(a.subject)} · ${escapeHTML(a.grade)}</span>
        <div class="task-card__title">${escapeHTML(a.title)}</div>
        ${a.status === "done"
          ? `<span class="task-card__grade">${escapeHTML(a.grade_score)}/100</span>`
          : `<div class="task-card__due">Хугацаа: ${escapeHTML(a.due)}</div>
             <button class="btn btn--ghost btn--sm task-card__btn" data-toggle-submit="${escapeHTML(a.id)}">Даалгавар илгээх</button>
             <div class="submit-panel" id="submit-${escapeHTML(a.id)}">
               <div class="mini-drop">Файл хавсаргахын тулд дарах эсвэл чирж оруулна уу</div>
               <textarea class="mini-textarea" rows="2" placeholder="Бичгэн хариулт нэмэх (заавал биш)"></textarea>
               <button class="btn btn--primary btn--sm" style="margin-top:8px; width:100%" data-submit-task="${escapeHTML(a.id)}">Илгээх</button>
             </div>`
        }
      </div>`).join("");
  });
}

/* ============================================================
   2) VIEW SWITCHING
   ============================================================ */
function setView(view) {
  state.activeView = view;
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === view));
  document.querySelectorAll(".navlink[data-view]").forEach((n) => n.classList.toggle("is-active", n.dataset.view === view));
  closeSidebarOnMobile();
}

function applyRole() {
  document.body.dataset.role = "student";

  const asgSub = document.getElementById("asgSub");
  if (asgSub) {
    asgSub.textContent = "Хийх, хийгдэж буй, дүгнэгдсэн ажлуудаа хянана уу.";
  }

  const railRole = document.getElementById("railRole");
  if (railRole) railRole.textContent = "Сурагч";

  renderStats();
  renderLibrary();
  renderVideos();
  renderKanban();
  renderWeeklyChart();
}

/* ============================================================
   3) INTERACTIONS
   ============================================================ */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2600);
}

function closePopovers(except) {
  document.querySelectorAll(".popover").forEach((p) => {
    if (p.id !== except) p.hidden = true;
  });
}

function closeSidebarOnMobile() {
  document.getElementById("sidebar")?.classList.remove("is-open");
  document.getElementById("sidebarScrim")?.classList.remove("is-visible");
}

function bindEvents() {
  document.querySelectorAll(".navlink[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("sidebarScrim");
  document.getElementById("burgerBtn")?.addEventListener("click", () => {
    sidebar?.classList.toggle("is-open");
    scrim?.classList.toggle("is-visible");
  });
  scrim?.addEventListener("click", closeSidebarOnMobile);

  const notifBtn = document.getElementById("notifBtn");
  notifBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const pop = document.getElementById("notifPopover");
    if (!pop) return;
    const willOpen = pop.hidden;
    closePopovers();
    pop.hidden = !willOpen;
    notifBtn.setAttribute("aria-expanded", willOpen);
  });

  document.addEventListener("click", () => closePopovers());

  ["filterSubject", "filterGrade"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", (e) => {
      const key = id.replace("filter", "").toLowerCase();
      state.libraryFilters[key] = e.target.value;
      renderLibrary();
    });
  });

  document.getElementById("globalSearch")?.addEventListener("input", (e) => {
    state.libraryFilters.q = e.target.value;
    if (state.activeView === "library") renderLibrary();
  });

  document.getElementById("playlistChips")?.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-playlist]");
    if (!chip) return;
    state.activePlaylist = chip.dataset.playlist;
    renderPlaylistChips();
    renderVideos();
  });

  /* ---- Материал байршуулах modal ---- */
  const modalScrim = document.getElementById("modalScrim");
  const openModal = () => { if (modalScrim) modalScrim.hidden = false; };
  const closeModal = () => { if (modalScrim) modalScrim.hidden = true; };
  document.getElementById("uploadBookBtn")?.addEventListener("click", openModal);
  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  modalScrim?.addEventListener("click", (e) => { if (e.target === modalScrim) closeModal(); });

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const dropFilename = document.getElementById("dropFilename");

  dropzone?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", () => {
    if (fileInput.files[0] && dropFilename) dropFilename.textContent = `Сонгосон файл: ${fileInput.files[0].name}`;
  });
  ["dragover", "dragleave", "drop"].forEach((evt) => {
    dropzone?.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.toggle("is-drag", evt === "dragover");
      if (evt === "drop" && e.dataTransfer.files[0] && dropFilename) {
        dropFilename.textContent = `Сонгосон файл: ${e.dataTransfer.files[0].name}`;
      }
    });
  });

  document.getElementById("uploadForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("uploadTitle").value.trim();
    if (!title) return;
    const subject = document.getElementById("uploadSubject").value;
    const grade = document.getElementById("uploadGrade").value;
    await DB.uploadLibraryItem({ title, subject, grade, file: fileInput?.files[0]?.name || null });
    SMARTCLASS_DATA.library.unshift({
      id: "l" + Date.now(),
      title, subject, grade,
      type: "PDF",
      size: "—",
      tone: subject === "Нийгэм" ? "ocean" : "forest",
    });
    closeModal();
    e.target.reset();
    if (dropFilename) dropFilename.textContent = "";
    renderLibrary();
    showToast("Материал номын санд нийтлэгдлээ");
  });

  /* ---- Видео байршуулах modal ---- */
  const videoModalScrim = document.getElementById("videoModalScrim");
  const openVideoModal = () => { if (videoModalScrim) videoModalScrim.hidden = false; };
  const closeVideoModal = () => { if (videoModalScrim) videoModalScrim.hidden = true; };
  document.getElementById("uploadVideoBtn")?.addEventListener("click", openVideoModal);
  document.getElementById("videoModalClose")?.addEventListener("click", closeVideoModal);
  videoModalScrim?.addEventListener("click", (e) => { if (e.target === videoModalScrim) closeVideoModal(); });

  const videoDropzone = document.getElementById("videoDropzone");
  const videoFileInput = document.getElementById("videoFileInput");
  const videoDropFilename = document.getElementById("videoDropFilename");

  videoDropzone?.addEventListener("click", () => videoFileInput?.click());
  videoFileInput?.addEventListener("change", () => {
    if (videoFileInput.files[0] && videoDropFilename) videoDropFilename.textContent = `Сонгосон файл: ${videoFileInput.files[0].name}`;
  });
  ["dragover", "dragleave", "drop"].forEach((evt) => {
    videoDropzone?.addEventListener(evt, (e) => {
      e.preventDefault();
      videoDropzone.classList.toggle("is-drag", evt === "dragover");
      if (evt === "drop" && e.dataTransfer.files[0] && videoDropFilename) {
        videoDropFilename.textContent = `Сонгосон файл: ${e.dataTransfer.files[0].name}`;
      }
    });
  });

  document.getElementById("videoUploadForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("videoTitle").value.trim();
    if (!title) return;
    const subject = document.getElementById("videoSubject").value;
    const grade = document.getElementById("videoGrade").value;
    await DB.uploadVideo({ title, subject, grade, file: videoFileInput?.files[0]?.name || null });
    SMARTCLASS_DATA.videos.unshift({
      id: "v" + Date.now(),
      title,
      teacher: SMARTCLASS_DATA.user.name,
      duration: "0:00",
      playlist: subject,
      progress: 0,
      tone: subject === "Нийгэм" ? "ocean" : "forest",
    });
    closeVideoModal();
    e.target.reset();
    if (videoDropFilename) videoDropFilename.textContent = "";
    renderPlaylistChips();
    renderVideos();
    showToast("Видео хичээл амжилттай нэмэгдлээ");
  });

  // Kanban-ын товчнуудад делегацлагдсан сонсогч
  document.getElementById("studentAssignments")?.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest("[data-toggle-submit]");
    if (toggleBtn) {
      const panel = document.getElementById(`submit-${toggleBtn.dataset.toggleSubmit}`);
      if (panel) panel.classList.toggle("is-open");
    }
    const submitBtn = e.target.closest("[data-submit-task]");
    if (submitBtn) {
      const id = submitBtn.dataset.submitTask;
      const task = state.assignments.find((a) => a.id === id);
      if (task) {
        task.status = "progress";
        renderKanban();
        showToast("Даалгавар илгээгдлээ — багш тань удахгүй шалгах болно");
      }
    }
  });
}

/* ============================================================
   4) INIT
   ============================================================ */
async function init() {
  const currentUser = await loadCurrentUser();
  
  if (SMARTCLASS_DATA.user) {
    SMARTCLASS_DATA.user.name = currentUser.name;
    SMARTCLASS_DATA.user.initials = getInitials(currentUser.name);
  }
  state.role = "student";

  // HTML дээрх нэр харуулах элементүүдэд оноох
  const greetName = document.getElementById("greetName");
  const userName = document.getElementById("userName");
  if (greetName) greetName.textContent = currentUser.name;
  if (userName) userName.textContent = currentUser.name;

  populateLibraryFilters();
  renderActivity();
  renderUpNext();
  renderPlaylistChips();
  bindEvents();
  applyRole();
  setView("dashboard");
}

document.addEventListener("DOMContentLoaded", init);