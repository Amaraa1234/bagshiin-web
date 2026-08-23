/**
 * js/data.js
 * SmartClass — placeholder dataset shaped the way it would arrive from
 * Supabase (e.g. `supabaseClient.from('library_items').select('*')`).
 * Swap the DB.fetch* functions in js/dashboard.js for real Supabase
 * queries later — the render layer doesn't need to change.
 *
 * Load order matters: this file must load AFTER js/supabase.js and
 * BEFORE js/charts.js and js/dashboard.js (see index.html).
 */

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

  /* Used by js/charts.js to draw the "Долоо хоногийн идэвх" bar chart
     on the dashboard. Values are 0-100 (percent of daily target). */
  weeklyActivity: {
    student: [
      { day: "Да", value: 40 },
      { day: "Мя", value: 65 },
      { day: "Лх", value: 50 },
      { day: "Пү", value: 80 },
      { day: "Ба", value: 30 },
      { day: "Бя", value: 20 },
      { day: "Ня", value: 10 },
    ],
    teacher: [
      { day: "Да", value: 55 },
      { day: "Мя", value: 70 },
      { day: "Лх", value: 60 },
      { day: "Пү", value: 90 },
      { day: "Ба", value: 45 },
      { day: "Бя", value: 25 },
      { day: "Ня", value: 15 },
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