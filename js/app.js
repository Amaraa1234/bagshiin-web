/**
 * ============================================================================
 *  js/app.js — SmartClass CORE LAYER
 * ============================================================================
 *  Энэ файл нь бусад бүх скриптийн СУУРЬ давхарга. Дараах зүйлсийг агуулна:
 *    1) STATE        — апп даяар хуваалцах төлөв (view, filters гэх мэт)
 *    2) CONSTANTS     — icon SVG-үүд, өнгөний токенууд
 *    3) MOCK DATA     — SMARTCLASS_DATA (жинхэнэ Supabase холбогдох хүртэлх жишиг өгөгдөл)
 *    4) HELPERS       — escapeHTML, DB (өгөгдөл татах/хадгалах давхарга)
 * ============================================================================
 */

/* ----------------------------------------------------------------------
   1) STATE — dashboard.js-ийн render функцүүд эндээс уншиж/бичнэ
   ---------------------------------------------------------------------- */
export const state = {
  role: "student",              // Зөвхөн "student" горим
  activeView: "dashboard",      // dashboard | library | videos | assignments
  libraryFilters: { subject: "all", grade: "all", q: "" },
  activePlaylist: "All",
  assignments: [],
};

/* ----------------------------------------------------------------------
   2) CONSTANTS — inline SVG иконууд болон өнгөний токенууд
   ---------------------------------------------------------------------- */
export const ICONS = {
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

export const TONE = {
  forest: { bg: "var(--forest-100)", ink: "var(--forest-700)", solid: "linear-gradient(135deg, var(--forest-600), var(--forest-900))" },
  ocean:  { bg: "var(--ocean-100)",  ink: "var(--ocean-700)",  solid: "linear-gradient(135deg, var(--ocean-500), var(--ocean-700))" },
  sun:    { bg: "var(--sun-100)",    ink: "var(--sun-600)",    solid: "linear-gradient(135deg, var(--sun-500), var(--sun-600))" },
};

/* ----------------------------------------------------------------------
   3) MOCK DATA — SMARTCLASS_DATA
   ---------------------------------------------------------------------- */
export const SMARTCLASS_DATA = {
  user: {
    name: "Зочин хэрэглэгч",
    initials: "ЗХ",
  },
  stats: {
    student: [
      { id: "courses", label: "Идэвхтэй хичээлүүд", value: 2, delta: "Түүх, Нийгэм", tone: "forest", icon: "book" },
      { id: "pending", label: "Хийгдээгүй даалгавар", value: 3, delta: "Энэ долоо хоногт 1 дуусна", tone: "sun", icon: "clock" },
      { id: "materials", label: "Хадгалсан материал", value: 12, delta: "+2 энэ долоо хоногт", tone: "ocean", icon: "download" },
      { id: "avg", label: "Дундаж дүн", value: "90%", delta: "Өнгөрсөн улиралтай харьцуулахад +3%", tone: "forest", icon: "trend" },
    ],
  },
  weeklyActivity: {
    student: [
      { day: "Да", value: 40 }, { day: "Мя", value: 65 }, { day: "Лх", value: 50 },
      { day: "Пү", value: 80 }, { day: "Ба", value: 30 }, { day: "Бя", value: 20 }, { day: "Ня", value: 10 },
    ],
  },
  activity: [
    { icon: "upload", title: "Шинэ материал нэмэгдлээ", detail: "«Чингис хааны эпох» Түүх хичээлд нэмэгдлээ.", time: "2 цагийн өмнө" },
    { icon: "grade", title: "Даалгавар дүгнэгдлээ", detail: "Хүйтэн дайны шалгалт 92/100 дүн авлаа.", time: "5 цагийн өмнө" },
    { icon: "video", title: "Видео хичээл нийтлэгдлээ", detail: "«Иргэний нийгмийн үндэс» одоо үзэх боломжтой боллоо.", time: "Өчигдөр" },
    { icon: "comment", title: "Санал хүсэлт ирлээ", detail: "Багш Оюунаа таны эссений нооргонд санал үлдээлээ.", time: "2 өдрийн өмнө" },
  ],
  upNext: [
    { date: "08/18", title: "Иргэний нийгмийн тайлангийн хугацаа", detail: "Ноорог хувилбар • 500 үг" },
    { date: "08/20", title: "Шууд хичээл: Дэлхийн 2-р дайн", detail: "10:00 — B танхим / Онлайн" },
    { date: "08/22", title: "Хүйтэн дайны шалгалт", detail: "3–4-р бүлгийг хамарна" },
  ],
  subjects: ["Түүх", "Нийгэм"],
  grades: ["7-р анги", "8-р анги", "9-р анги", "10-р анги", "11-р анги", "12-р анги"],
  library: [
    { id: "l1", title: "Эртний Монголын түүх", subject: "Түүх", grade: "8-р анги", type: "PDF", size: "4.1 MB", tone: "forest" },
    { id: "l2", title: "Дэлхийн түүх: XX зуун", subject: "Түүх", grade: "11-р анги", type: "PDF", size: "9.1 MB", tone: "forest" },
    { id: "l3", title: "Иргэний нийгэм ба төр", subject: "Нийгэм", grade: "10-р анги", type: "EPUB", size: "2.0 MB", tone: "ocean" },
    { id: "l4", title: "Чингис хааны эпох", subject: "Түүх", grade: "9-р анги", type: "PDF", size: "5.4 MB", tone: "forest" },
    { id: "l5", title: "Нийгэм судлалын дасгал", subject: "Нийгэм", grade: "7-р анги", type: "PDF", size: "3.0 MB", tone: "ocean" },
    { id: "l6", title: "Хүйтэн дайны түүх", subject: "Түүх", grade: "12-р анги", type: "PDF", size: "6.2 MB", tone: "forest" },
    { id: "l7", title: "Эдийн засаг ба нийгэм", subject: "Нийгэм", grade: "11-р анги", type: "PDF", size: "3.6 MB", tone: "ocean" },
    { id: "l8", title: "Соёл иргэншлийн түүх", subject: "Түүх", grade: "8-р анги", type: "EPUB", size: "2.4 MB", tone: "forest" },
  ],
  playlists: ["All", "Түүх", "Нийгэм"],
  videos: [
    { id: "v1", title: "Чингис хааны эзэнт улс", teacher: "B. Erdene", duration: "18:42", playlist: "Түүх", progress: 65, tone: "forest" },
    { id: "v2", title: "Иргэний нийгмийн үндэс", teacher: "T. Naran", duration: "16:10", playlist: "Нийгэм", progress: 100, tone: "ocean" },
    { id: "v3", title: "Францын хувьсгал", teacher: "S. Oyunaa", duration: "27:05", playlist: "Түүх", progress: 0, tone: "forest" },
    { id: "v4", title: "Хүйтэн дайны эх үүсвэр", teacher: "B. Erdene", duration: "21:15", playlist: "Түүх", progress: 30, tone: "forest" },
    { id: "v5", title: "Ардчилал ба нийгэм", teacher: "T. Naran", duration: "19:40", playlist: "Нийгэм", progress: 0, tone: "ocean" },
    { id: "v6", title: "Дэлхийн 2-р дайн", teacher: "S. Oyunaa", duration: "24:48", playlist: "Түүх", progress: 80, tone: "forest" },
  ],
  assignments: [
    { id: "a1", subject: "Түүх", title: "Чингис хааны тухай эссэ", due: "8-р сарын 22", grade: "9-р анги", status: "todo", student: "Mönkhbat" },
    { id: "a2", subject: "Нийгэм", title: "Иргэний нийгмийн тайлан", due: "8-р сарын 18", grade: "10-р анги", status: "todo", student: "Mönkhbat" },
    { id: "a3", subject: "Түүх", title: "Дэлхийн 2-р дайны шинжилгээ", due: "8-р сарын 16", grade: "11-р анги", status: "progress", student: "Mönkhbat" },
    { id: "a4", subject: "Нийгэм", title: "Нийгмийн бүтцийн судалгаа", due: "8-р сарын 14", grade: "8-р анги", status: "progress", student: "Mönkhbat" },
    { id: "a5", subject: "Түүх", title: "Хүйтэн дайны шалгалт", due: "8-р сарын 10", grade: "12-р анги", status: "done", grade_score: 92, student: "Mönkhbat" },
    { id: "a6", subject: "Нийгэм", title: "Эдийн засгийн эссэ", due: "8-р сарын 6", grade: "11-р анги", status: "done", grade_score: 88, student: "Mönkhbat" },
  ],
};

// State-д зориулсан хуулбар үүсгэх
state.assignments = SMARTCLASS_DATA.assignments.map((a) => ({ ...a }));

/* ----------------------------------------------------------------------
   4) HELPERS
   ---------------------------------------------------------------------- */

/** HTML-руу шууд оруулахаас өмнө текстийг аюулгүй болгоно (XSS хамгаалалт). */
export function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

/**
 * DB — өгөгдөл татах/хадгалах давхарга.
 * Supabase төслөө холбоход ЗӨВХӨН эндэх функцүүдийн БИЕИЙГ л солино.
 */
export const DB = {
  async fetchLibrary() {
    return SMARTCLASS_DATA.library;
  },
  async fetchVideos() {
    return SMARTCLASS_DATA.videos;
  },
};