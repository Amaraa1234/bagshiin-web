const state = {
  role: "student",
  activeView: "dashboard",
  libraryFilters: { subject: "all", grade: "all", type: "all", q: "" },
  activePlaylist: "All",
  selectedSubmissionId: null,
  submissions: EDU_DATA.submissions.map((s) => ({ ...s })),
  assignments: EDU_DATA.assignments.map((a) => ({ ...a })),
};

const ICONS = {
  book: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
  clock: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  download: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  trend: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  grade: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>',
  video: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5" width="14" height="14" rx="3"/><path d="m21.5 8.5-5 3 5 3v-6Z"/></svg>',
  comment: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.1-5.3A8.4 8.4 0 1 1 21 11.5Z"/></svg>',
  play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7Z"/></svg>',
  pdf: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/></svg>',
};

const TONE = {
  forest: { bg: "var(--forest-100)", ink: "var(--forest-700)", solid: "linear-gradient(135deg, var(--forest-600), var(--forest-900))" },
  ocean:  { bg: "var(--ocean-100)",  ink: "var(--ocean-700)",  solid: "linear-gradient(135deg, var(--ocean-500), var(--ocean-700))" },
  sun:    { bg: "var(--sun-100)",    ink: "var(--sun-600)",    solid: "linear-gradient(135deg, var(--sun-500), var(--sun-600))" },
};

function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

const DB = {
  async fetchLibrary() { return EDU_DATA.library; },
  async fetchVideos() { return EDU_DATA.videos; },
  async uploadLibraryItem(payload) {
    console.log("[supabase.storage.upload -> library_items.insert]", payload);
    return { ok: true };
  },
  async saveGrade(submissionId, grade, feedback) {
    console.log("[supabase.from('submissions').update]", { submissionId, grade, feedback });
    return { ok: true };
  },
};

function renderStats() {
  const grid = document.getElementById("statGrid");
  const items = EDU_DATA.stats[state.role] || [];
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
  document.getElementById("activityFeed").innerHTML = EDU_DATA.activity.map((a) => `
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
  document.getElementById("upNextList").innerHTML = EDU_DATA.upNext.map((u) => `
    <li>
      <span class="upnext-list__date">${escapeHTML(u.date)}</span>
      <div>
        <strong>${escapeHTML(u.title)}</strong>
        <p>${escapeHTML(u.detail)}</p>
      </div>
    </li>`).join("");
}

function populateLibraryFilters() {
  const subjectSel = document.getElementById("filterSubject");
  const gradeSel = document.getElementById("filterGrade");
  const typeSel = document.getElementById("filterType");
  EDU_DATA.subjects.forEach((s) => subjectSel.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`));
  EDU_DATA.grades.forEach((g) => gradeSel.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`));
  ["PDF", "EPUB"].forEach((t) => typeSel.insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`));
}

function renderLibrary() {
  const { subject, grade, type, q } = state.libraryFilters;
  const items = EDU_DATA.library.filter((item) => {
    if (subject !== "all" && item.subject !== subject) return false;
    if (grade !== "all" && item.grade !== grade) return false;
    if (type !== "all" && item.type !== type) return false;
    if (q && !item.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  document.getElementById("libCount").textContent = items.length;

  const grid = document.getElementById("libraryGrid");
  if (items.length === 0) {
    grid.innerHTML = `<p style="color:var(--ink-500); grid-column:1/-1;">Эдгээр шүүлтүүрт тохирох материал одоогоор алга байна.</p>`;
    return;
  }

  grid.innerHTML = items.map((b) => {
    const t = TONE[b.tone] || TONE.ocean;
    const actions = state.role === "teacher"
      ? `<button class="btn btn--ghost btn--sm" style="flex:1">Засах</button><button class="btn btn--ghost btn--sm" style="flex:1">Устгах</button>`
      : `<button class="btn btn--primary btn--sm" style="flex:1">Татах</button><button class="btn btn--ghost btn--sm" style="flex:1">Урьдчилан үзэх</button>`;
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
  row.innerHTML = EDU_DATA.playlists.map((p) =>
    `<button class="chip ${p === state.activePlaylist ? "is-active" : ""}" data-playlist="${escapeHTML(p)}" type="button">${escapeHTML(p)}</button>`
  ).join("");
}

function renderVideos() {
  const items = EDU_DATA.videos.filter((v) => state.activePlaylist === "All" || v.playlist === state.activePlaylist);
  const grid = document.getElementById("videoGrid");
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
          ${state.role === "student" ? `
            <div class="progress-track"><div class="progress-track__fill" style="width:${v.progress}%; background:${t.ink}"></div></div>
          ` : ""}
        </div>
      </article>`;
  }).join("");
}

/* ---- Assignments: student kanban ---- */
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
        <span class="task-card__subject">${escapeHTML(a.subject)}</span>
        <div class="task-card__title">${escapeHTML(a.title)}</div>
        ${a.status === "done"
          ? `<span class="task-card__grade">${escapeHTML(a.grade)}/100</span>`
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

/* ---- Assignments: teacher grading queue ---- */
function renderSubmissions() {
  const list = document.getElementById("submissionList");
  if (!list) return;
  list.innerHTML = state.submissions.map((s) => `
    <button class="submission-row ${s.id === state.selectedSubmissionId ? "is-selected" : ""}" data-submission="${escapeHTML(s.id)}" type="button">
      <span class="avatar avatar--sm">${escapeHTML(s.initials)}</span>
      <span class="submission-row__body">
        <strong>${escapeHTML(s.student)} · ${escapeHTML(s.title)}</strong>
        <p>${escapeHTML(s.subject)} · илгээсэн ${escapeHTML(s.submitted)}</p>
      </span>
      <span class="status-pill status-pill--${s.status === "graded" ? "graded" : "pending"}">
        ${s.status === "graded" ? escapeHTML(s.grade) + "/100" : "Хүлээгдэж буй"}
      </span>
    </button>`).join("");

  renderGradingPanel();
}

function renderGradingPanel() {
  const empty = document.getElementById("gradingEmpty");
  const form = document.getElementById("gradingForm");
  const sub = state.submissions.find((s) => s.id === state.selectedSubmissionId);

  if (!sub) {
    if (empty) empty.hidden = false;
    if (form) form.hidden = true;
    return;
  }
  if (empty) empty.hidden = true;
  if (form) form.hidden = false;

  document.getElementById("gradeAvatar").textContent = sub.initials;
  document.getElementById("gradeStudentName").textContent = sub.student;
  document.getElementById("gradeAssignmentName").textContent = `${sub.subject} · ${sub.title}`;
  document.getElementById("gradeSubmissionText").textContent = sub.text;
  document.getElementById("gradeScore").value = sub.grade ?? "";
  document.getElementById("gradeFeedback").value = sub.feedback ?? "";
}

function setView(view) {
  state.activeView = view;
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === view));
  document.querySelectorAll(".navlink[data-view]").forEach((n) => n.classList.toggle("is-active", n.dataset.view === view));
  closeSidebarOnMobile();
}

function applyRole() {
  const isTeacher = state.role === "teacher";
  document.body.dataset.role = state.role;

  document.querySelectorAll("[data-role]").forEach((el) => {
    if (el.id === "studentAssignments" || el.id === "teacherAssignments") return;
    const shouldShow = el.dataset.role === state.role;
    el.hidden = !shouldShow;
  });

  const studentAsg = document.getElementById("studentAssignments");
  const teacherAsg = document.getElementById("teacherAssignments");
  if (studentAsg) studentAsg.hidden = isTeacher;
  if (teacherAsg) teacherAsg.hidden = !isTeacher;

  const asgSub = document.getElementById("asgSub");
  if (asgSub) {
    asgSub.textContent = isTeacher
      ? "Сурагчдын ажлыг шалгаж, дүн өгнө үү."
      : "Хийх, хийгдэж буй, дүгнэгдсэн ажлуудаа хянана уу.";
  }

  const roleLabel = isTeacher ? "Багш" : "Сурагч";
  document.getElementById("profileRole").textContent = roleLabel;
  document.getElementById("railRole").textContent = roleLabel;
  document.querySelectorAll(".role-switch__btn").forEach((b) => {
    const active = b.dataset.role === state.role;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-selected", active);
  });

  renderStats();
  renderLibrary();
  renderVideos();
  renderKanban();
  renderSubmissions();
}

function showToast(message) {
  const toast = document.getElementById("toast");
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
    sidebar.classList.toggle("is-open");
    scrim.classList.toggle("is-visible");
  });
  scrim?.addEventListener("click", closeSidebarOnMobile);

  document.querySelectorAll(".role-switch__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.role = btn.dataset.role;
      applyRole();
      showToast(`Одоо ${state.role === "teacher" ? "Багш" : "Сурагч"} горимоор харж байна`);
    });
  });

  const notifBtn = document.getElementById("notifBtn");
  const profileBtn = document.getElementById("profileBtn");
  notifBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const pop = document.getElementById("notifPopover");
    const willOpen = pop.hidden;
    closePopovers();
    pop.hidden = !willOpen;
    notifBtn.setAttribute("aria-expanded", willOpen);
  });

  profileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const pop = document.getElementById("profilePopover");
    const willOpen = pop.hidden;
    closePopovers();
    pop.hidden = !willOpen;
    profileBtn.setAttribute("aria-expanded", willOpen);
  });

  document.addEventListener("click", () => closePopovers());

  ["filterSubject", "filterGrade", "filterType"].forEach((id) => {
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

  const modalScrim = document.getElementById("modalScrim");
  const openModal = () => { modalScrim.hidden = false; };
  const closeModal = () => { modalScrim.hidden = true; };
  document.getElementById("uploadBookBtn")?.addEventListener("click", openModal);
  document.getElementById("uploadVideoBtn")?.addEventListener("click", () => showToast("Видео байршуулах нь мөн адил урсгалыг ашиглана — идэвхжүүлэхийн тулд Supabase Storage-тай холбоно уу."));
  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  modalScrim?.addEventListener("click", (e) => { if (e.target === modalScrim) closeModal(); });

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const dropFilename = document.getElementById("dropFilename");
  
  dropzone?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", () => {
    if (fileInput.files[0]) dropFilename.textContent = `Сонгосон файл: ${fileInput.files[0].name}`;
  });

  ["dragover", "dragleave", "drop"].forEach((evt) => {
    dropzone?.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.toggle("is-drag", evt === "dragover");
      if (evt === "drop" && e.dataTransfer.files[0]) {
        dropFilename.textContent = `Сонгосон файл: ${e.dataTransfer.files[0].name}`;
      }
    });
  });

  document.getElementById("uploadForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("uploadTitle").value.trim();
    if (!title) return;
    await DB.uploadLibraryItem({
      title,
      subject: document.getElementById("uploadSubject").value,
      grade: document.getElementById("uploadGrade").value,
      file: fileInput.files[0]?.name || null,
    });
    EDU_DATA.library.unshift({
      id: "l" + Date.now(),
      title,
      subject: document.getElementById("uploadSubject").value,
      grade: document.getElementById("uploadGrade").value,
      type: "PDF",
      size: "—",
      tone: ["forest", "ocean", "sun"][Math.floor(Math.random() * 3)],
    });
    closeModal();
    e.target.reset();
    if (dropFilename) dropFilename.textContent = "";
    renderLibrary();
    showToast("Материал номын санд нийтлэгдлээ");
  });

  // Kanban делегацын аюулгүй сонсогч
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

  document.getElementById("submissionList")?.addEventListener("click", (e) => {
    const row = e.target.closest("[data-submission]");
    if (!row) return;
    state.selectedSubmissionId = row.dataset.submission;
    renderSubmissions();
  });

  document.getElementById("gradingForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sub = state.submissions.find((s) => s.id === state.selectedSubmissionId);
    if (!sub) return;
    const grade = document.getElementById("gradeScore").value;
    const feedback = document.getElementById("gradeFeedback").value;
    await DB.saveGrade(sub.id, grade, feedback);
    sub.status = "graded";
    sub.grade = grade;
    sub.feedback = feedback;
    renderSubmissions();
    showToast(`${sub.student}-д дүн хадгалагдлаа`);
  });
}

function init() {
  document.getElementById("greetName").textContent = EDU_DATA.user.name;
  document.getElementById("profileName").textContent = EDU_DATA.user.name;

  populateLibraryFilters();
  renderActivity();
  renderUpNext();
  renderPlaylistChips();
  bindEvents();
  applyRole();
  setView("dashboard");
}

document.addEventListener("DOMContentLoaded", init);
  