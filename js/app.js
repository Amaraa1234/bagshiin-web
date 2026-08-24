/**
 * ============================================================================
 *  js/app.js — SmartClass CORE LAYER
 * ============================================================================
 *  Энэ файл нь бусад бүх скриптийн СУУРЬ давхарга. Дараах зүйлсийг агуулна:
 *    1) STATE        — апп даяар хуваалцах төлөв (role, view, filters гэх мэт)
 *    2) CONSTANTS     — icon SVG-үүд, өнгөний токенууд
 *    3) MOCK DATA     — SMARTCLASS_DATA (жинхэнэ Supabase холбогдох хүртэлх жишиг өгөгдөл)
 *    4) HELPERS       — escapeHTML, DB (өгөгдөл татах/хадгалах давхарга)
 *
 *  Ачаалах дараалал: js/supabase.js, js/auth.js -ын дараа,
 *  js/charts.js болон js/dashboard.js -ээс ӨМНӨ ачаална (dashboard.html дээр).
 *  index.html (нэвтрэх хуудас) энэ файлыг ачаалахгүй — зөвхөн dashboard.html-д хэрэгтэй.
 * ============================================================================
 */

/* ----------------------------------------------------------------------
   1) STATE — dashboard.js-ийн render функцүүд эндээс уншиж/бичнэ
   ---------------------------------------------------------------------- */
const state = {
  role: "student",              // "student" | "teacher"
  activeView: "dashboard",      // dashboard | library | videos | assignments
  libraryFilters: { subject: "all", grade: "all", type: "all", q: "" },
  activePlaylist: "All",
  selectedSubmissionId: null,
  submissions: [],
  assignments: [],
};

/* ----------------------------------------------------------------------
   2) CONSTANTS — inline SVG иконууд болон өнгөний токенууд
   ---------------------------------------------------------------------- */
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

/* ----------------------------------------------------------------------
   3) MOCK DATA — SMARTCLASS_DATA
   Жинхэнэ Supabase хүснэгттэй холбогдоход DB.fetch* функцүүдийн дотоод
   хэрэгжилтийг л сольж өгнө, доорх өгөгдлийн бүтцийг ӨӨРЧЛӨХГҮЙгээр.
   ---------------------------------------------------------------------- */
const SMARTCLASS_DATA = {

  user: {
    name: "Mönkhbat",
    initials: "MB",
  },

  stats: {
    student: [
      { id: "courses", label: "Идэвхтэй хичээлүүд", value: 6, delta: "+1 энэ улиралд", tone: "forest", icon: "book" },
      { id: "pending", label: "Хийгдээгүй даалгавар", value: 4, delta: "Энэ долоо хоногт 2 дуусна", tone: "sun", icon: "clock" },
      { id: "materials", label: "Хадгалсан материал", value: 18, delta: "+3 энэ долоо хоногт", tone: "ocean", icon: "download" },
      { id: "avg", label: "Дундаж дүн", value: "91%", delta: "Өнгөрсөн улиралтай харьцуулахад +4%", tone: "forest", icon: "trend" },
    ],
    teacher: [
      { id: "courses", label: "Идэвхтэй хичээлүүд", value: 3, delta: "Нийт 128 сурагч", tone: "forest", icon: "book" },
      { id: "pending", label: "Дүгнэх ажил", value: 12, delta: "5 хугацаа хэтэрсэн", tone: "sun", icon: "clock" },
      { id: "materials", label: "Байршуулсан материал", value: 27, delta: "+2 энэ долоо хоногт", tone: "ocean", icon: "download" },
      { id: "avg", label: "Ангийн дундаж", value: "87%", delta: "Өнгөрсөн сартай харьцуулахад +2%", tone: "forest", icon: "trend" },
    ],
  },

  /* js/charts.js-ийн Charts.renderBarChart()-д зориулсан 7 хоногийн жишиг өгөгдөл */
  weeklyActivity: {
    student: [
      { day: "Да", value: 40 }, { day: "Мя", value: 65 }, { day: "Лх", value: 50 },
      { day: "Пү", value: 80 }, { day: "Ба", value: 30 }, { day: "Бя", value: 20 }, { day: "Ня", value: 10 },
    ],
    teacher: [
      { day: "Да", value: 55 }, { day: "Мя", value: 70 }, { day: "Лх", value: 60 },
      { day: "Пү", value: 90 }, { day: "Ба", value: 45 }, { day: "Бя", value: 25 }, { day: "Ня", value: 15 },
    ],
  },

  activity: [
    { icon: "upload", title: "Шинэ материал нэмэгдлээ", detail: "«Эсийн биологи — 4-р бүлэг» Байгалийн ухаан хичээлд нэмэгдлээ.", time: "2 цагийн өмнө" },
    { icon: "grade", title: "Даалгавар дүгнэгдлээ", detail: "Алгебр II — 4-р шалгалт 92/100 дүн авлаа.", time: "5 цагийн өмнө" },
    { icon: "video", title: "Видео хичээл нийтлэгдлээ", detail: "«Ньютоны хуулиуд, 2-р хэсэг» одоо үзэх боломжтой боллоо.", time: "Өчигдөр" },
    { icon: "comment", title: "Санал хүсэлт ирлээ", detail: "Багш Оюунаа таны эссений нооргонд санал үлдээлээ.", time: "2 өдрийн өмнө" },
  ],

  upNext: [
    { date: "08/18", title: "Дэлхийн түүхийн эссений хугацаа", detail: "Ноорог хувилбар • 500 үг" },
    { date: "08/20", title: "Шууд хичээл: Органик хими", detail: "10:00 — B танхим / Онлайн" },
    { date: "08/22", title: "Алгебр II — 5-р шалгалт", detail: "6–7-р бүлгийг хамарна" },
  ],

  subjects: ["Математик", "Байгалийн ухаан", "Уран зохиол", "Түүх", "Хэл шинжлэл"],
  grades: ["7-р анги", "8-р анги", "9-р анги", "10-р анги", "11-р анги", "12-р анги"],

  library: [
    { id: "l1", title: "Алгебрийн үндэс", subject: "Математик", grade: "9-р анги", type: "PDF", size: "4.2 MB", tone: "forest" },
    { id: "l2", title: "Эсийн биологи — 4-р бүлэг", subject: "Байгалийн ухаан", grade: "10-р анги", type: "PDF", size: "6.8 MB", tone: "ocean" },
    { id: "l3", title: "Шүлгийн түүвэр", subject: "Уран зохиол", grade: "8-р анги", type: "EPUB", size: "1.9 MB", tone: "sun" },
    { id: "l4", title: "Дэлхийн түүх: XX зуун", subject: "Түүх", grade: "11-р анги", type: "PDF", size: "9.1 MB", tone: "forest" },
    { id: "l5", title: "Монгол хэлний дасгалын дэвтэр", subject: "Хэл шинжлэл", grade: "7-р анги", type: "PDF", size: "3.3 MB", tone: "ocean" },
    { id: "l6", title: "Органик химийн тэмдэглэл", subject: "Байгалийн ухаан", grade: "12-р анги", type: "PDF", size: "5.5 MB", tone: "sun" },
    { id: "l7", title: "Геометрийн дасгал", subject: "Математик", grade: "8-р анги", type: "PDF", size: "2.4 MB", tone: "forest" },
    { id: "l8", title: "Сонгодог өгүүллэгүүд", subject: "Уран зохиол", grade: "9-р анги", type: "EPUB", size: "2.1 MB", tone: "ocean" },
  ],

  playlists: ["All", "Математик", "Байгалийн ухаан", "Түүх"],

  videos: [
    { id: "v1", title: "Ньютоны хуулиуд, 2-р хэсэг", teacher: "B. Erdene", duration: "18:42", playlist: "Байгалийн ухаан", progress: 65, tone: "ocean" },
    { id: "v2", title: "Квадрат тэгшитгэл тайлбарлав", teacher: "T. Naran", duration: "22:10", playlist: "Математик", progress: 100, tone: "forest" },
    { id: "v3", title: "Францын хувьсгал", teacher: "S. Oyunaa", duration: "27:05", playlist: "Түүх", progress: 0, tone: "sun" },
    { id: "v4", title: "Эсийн хуваагдал ба митоз", teacher: "B. Erdene", duration: "15:30", playlist: "Байгалийн ухаан", progress: 30, tone: "ocean" },
    { id: "v5", title: "Тригонометрийн танилцуулга", teacher: "T. Naran", duration: "20:12", playlist: "Математик", progress: 0, tone: "forest" },
    { id: "v6", title: "Хүйтэн дайны эх үүсвэр", teacher: "S. Oyunaa", duration: "24:48", playlist: "Түүх", progress: 80, tone: "sun" },
  ],

  assignments: [
    { id: "a1", subject: "Математик", title: "Алгебр II — 5-р шалгалт", due: "8-р сарын 22", status: "todo", student: "Mönkhbat" },
    { id: "a2", subject: "Түүх", title: "Дэлхийн түүхийн эссений ноорог", due: "8-р сарын 18", status: "todo", student: "Mönkhbat" },
    { id: "a3", subject: "Байгалийн ухаан", title: "Лабораторийн тайлан: Фотосинтез", due: "8-р сарын 16", status: "progress", student: "Mönkhbat" },
    { id: "a4", subject: "Хэл шинжлэл", title: "Үгсийн сан 12", due: "8-р сарын 14", status: "progress", student: "Mönkhbat" },
    { id: "a5", subject: "Математик", title: "Алгебр II — 4-р шалгалт", due: "8-р сарын 10", status: "done", grade: 92, student: "Mönkhbat" },
    { id: "a6", subject: "Уран зохиол", title: "Шүлгийн шинжилгээ", due: "8-р сарын 6", status: "done", grade: 88, student: "Mönkhbat" },
  ],

  submissions: [
    { id: "s1", student: "Mönkhbat", initials: "MB", subject: "Байгалийн ухаан", title: "Лабораторийн тайлан: Фотосинтез", submitted: "8-р сарын 15", status: "pending", text: "Фотосинтез нь гэрлийн энергийг глюкоз хэлбэрээр хадгалагдах химийн энерги болгон хувиргадаг. Энэ туршилтад бид Элодеагийн хүчилтөрөгчийн ялгаралтыг өөр өөр гэрлийн эрчимд хэмжсэн..." },
    { id: "s2", student: "Anujin", initials: "AN", subject: "Математик", title: "Алгебр II — 5-р шалгалт", submitted: "8-р сарын 15", status: "pending", text: "1) x = 4, -3  2) Дискриминант = 25, хоёр бодит язгуур  3) Оройн хэлбэр: y = (x-2)² + 1 ..." },
    { id: "s3", student: "Bilguun", initials: "BL", subject: "Түүх", title: "Дэлхийн түүхийн эссений ноорог", submitted: "8-р сарын 14", status: "pending", text: "Хүйтэн дайны эх үүсвэрийг Дэлхийн 2-р дайны дараа АНУ, ЗХУ хоёрын үзэл суртлын зөрүүнээс хайж болно..." },
    { id: "s4", student: "Sarnai", initials: "SR", subject: "Байгалийн ухаан", title: "Лабораторийн тайлан: Фотосинтез", submitted: "8-р сарын 13", status: "graded", grade: 95, feedback: "Маш сайн шинжилгээ, цэвэрхэн өгөгдлийн хүснэгттэй байна.", text: "Манай таамаглал бол гэрлийн эрчим нэмэгдэхэд хүчилтөрөгчийн ялгаралтын хурд нэмэгдэнэ гэсэн байсан..." },
  ],
};

// Хуулбарласан ажлын хувиар state-ийн массивуудыг дүүргэнэ (эх өгөгдлийг хамгаална)
state.submissions = SMARTCLASS_DATA.submissions.map((s) => ({ ...s }));
state.assignments = SMARTCLASS_DATA.assignments.map((a) => ({ ...a }));

/* ----------------------------------------------------------------------
   4) HELPERS
   ---------------------------------------------------------------------- */

/** HTML-руу шууд оруулахаас өмнө текстийг аюулгүй болгоно (XSS хамгаалалт). */
function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

/**
 * DB — өгөгдөл татах/хадгалах давхарга.
 * Одоогоор SMARTCLASS_DATA-с уншиж, консол руу log хийж байгаа боловч
 * Supabase төслөө холбоход ЗӨВХӨН эндэх функцүүдийн БИЕИЙГ л сольж
 * өгнө — dashboard.js-ийг өөрчлөх шаардлагагүй.
 */
const DB = {
  async fetchLibrary() {
    // const { data, error } = await supabaseClient.from('library_items').select('*');
    // if (error) throw error;
    // return data;
    return SMARTCLASS_DATA.library;
  },
  async fetchVideos() {
    // const { data, error } = await supabaseClient.from('videos').select('*');
    // if (error) throw error;
    // return data;
    return SMARTCLASS_DATA.videos;
  },
  async uploadLibraryItem(payload) {
    // const { error } = await supabaseClient.from('library_items').insert(payload);
    // if (error) throw error;
    console.log("[SmartClass] library_items.insert ->", payload);
    return { ok: true };
  },
  async saveGrade(submissionId, grade, feedback) {
    // const { error } = await supabaseClient.from('submissions')
    //   .update({ grade, feedback, status: 'graded' }).eq('id', submissionId);
    // if (error) throw error;
    console.log("[SmartClass] submissions.update ->", { submissionId, grade, feedback });
    return { ok: true };
  },
};
