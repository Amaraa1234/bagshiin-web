const EDU_DATA = {

  user: {
    name: "Нийгэм",
    initials: "MB",
  },

  stats: {
    student: [
      { id: "courses", label: "Нийгэм", value: 6, delta: "Нийгэм", tone: "forest", icon: "book" },
      { id: "pending", label: "Нийгэм", value: 4, delta: "Нийгэм", tone: "sun", icon: "clock" },
      { id: "materials", label: "Нийгэм", value: 18, delta: "Нийгэм", tone: "ocean", icon: "download" },
      { id: "avg", label: "Нийгэм", value: "91%", delta: "Нийгэм", tone: "forest", icon: "trend" },
    ],
    teacher: [
      { id: "courses", label: "Нийгэм", value: 3, delta: "Нийгэм", tone: "forest", icon: "book" },
      { id: "pending", label: "Нийгэм", value: 12, delta: "Нийгэм", tone: "sun", icon: "clock" },
      { id: "materials", label: "Нийгэм", value: 27, delta: "Нийгэм", tone: "ocean", icon: "download" },
      { id: "avg", label: "Нийгэм", value: "87%", delta: "Нийгэм", tone: "forest", icon: "trend" },
    ],
  },

  activity: [
    { icon: "upload", title: "Нийгэм", detail: "Нийгэм", time: "Нийгэм" },
    { icon: "grade", title: "Нийгэм", detail: "Нийгэм", time: "Нийгэм" },
    { icon: "video", title: "Нийгэм", detail: "Нийгэм", time: "Нийгэм" },
    { icon: "comment", title: "Нийгэм", detail: "Нийгэм", time: "Нийгэм" },
  ],

  upNext: [
    { date: "08/18", title: "Нийгэм", detail: "Нийгэм" },
    { date: "08/20", title: "Нийгэм", detail: "Нийгэм" },
    { date: "08/22", title: "Нийгэм", detail: "Нийгэм" },
  ],

  subjects: ["Нийгэм", "Нийгэм", "Нийгэм", "Нийгэм", "Нийгэм"],
  grades: ["Нийгэм", "Нийгэм", "Нийгэм", "Нийгэм", "Нийгэм", "Нийгэм"],

  library: [
    { id: "l1", title: "Нийгэм", subject: "Нийгэм", grade: "Нийгэм", type: "PDF", size: "4.2 MB", tone: "forest" },
    { id: "l2", title: "Нийгэм", subject: "Нийгэм", grade: "Нийгэм", type: "PDF", size: "6.8 MB", tone: "ocean" },
    { id: "l3", title: "Нийгэм", subject: "Нийгэм", grade: "Нийгэм", type: "EPUB", size: "1.9 MB", tone: "sun" },
    { id: "l4", title: "Нийгэм", subject: "Нийгэм", grade: "Нийгэм", type: "PDF", size: "9.1 MB", tone: "forest" },
    { id: "l5", title: "Нийгэм", subject: "Нийгэм", grade: "Нийгэм", type: "PDF", size: "3.3 MB", tone: "ocean" },
    { id: "l6", title: "Нийгэм", subject: "Нийгэм", grade: "Нийгэм", type: "PDF", size: "5.5 MB", tone: "sun" },
    { id: "l7", title: "Нийгэм", subject: "Нийгэм", grade: "Нийгэм", type: "PDF", size: "2.4 MB", tone: "forest" },
    { id: "l8", title: "Нийгэм", subject: "Нийгэм", grade: "Нийгэм", type: "EPUB", size: "2.1 MB", tone: "ocean" },
  ],

  playlists: ["All", "Нийгэм", "Нийгэм", "Нийгэм"],

  videos: [
    { id: "v1", title: "Нийгэм", teacher: "B. Erdene", duration: "18:42", playlist: "Нийгэм", progress: 65, tone: "ocean" },
    { id: "v2", title: "Нийгэм", teacher: "T. Naran", duration: "22:10", playlist: "Нийгэм", progress: 100, tone: "forest" },
    { id: "v3", title: "Нийгэм", teacher: "S. Oyunaa", duration: "27:05", playlist: "Нийгэм", progress: 0, tone: "sun" },
    { id: "v4", title: "Нийгэм", teacher: "B. Erdene", duration: "15:30", playlist: "Нийгэм", progress: 30, tone: "ocean" },
    { id: "v5", title: "Нийгэм", teacher: "T. Naran", duration: "20:12", playlist: "Нийгэм", progress: 0, tone: "forest" },
    { id: "v6", title: "Нийгэм", teacher: "S. Oyunaa", duration: "24:48", playlist: "Нийгэм", progress: 80, tone: "sun" },
  ],

  assignments: [
    { id: "a1", subject: "Нийгэм", title: "Нийгэм", due: "Нийгэм", status: "todo", student: "Mönkhbat" },
    { id: "a2", subject: "Нийгэм", title: "Нийгэм", due: "Нийгэм", status: "todo", student: "Mönkhbat" },
    { id: "a3", subject: "Нийгэм", title: "Нийгэм", due: "Нийгэм", status: "progress", student: "Mönkhbat" },
    { id: "a4", subject: "Нийгэм", title: "Нийгэм", due: "Нийгэм", status: "progress", student: "Mönkhbat" },
    { id: "a5", subject: "Нийгэм", title: "Нийгэм", due: "Нийгэм", status: "done", grade: 92, student: "Mönkhbat" },
    { id: "a6", subject: "Нийгэм", title: "Нийгэм", due: "Нийгэм", status: "done", grade: 88, student: "Mönkhbat" },
  ],

  submissions: [
    { id: "s1", student: "Mönkhbat", initials: "MB", subject: "Нийгэм", title: "Нийгэм", submitted: "Нийгэм", status: "pending", text: "Нийгэм" },
    { id: "s2", student: "Anujin", initials: "AN", subject: "Нийгэм", title: "Нийгэм", submitted: "Нийгэм", status: "pending", text: "Нийгэм" },
    { id: "s3", student: "Bilguun", initials: "BL", subject: "Нийгэм", title: "Нийгэм", submitted: "Нийгэм", status: "pending", text: "Нийгэм" },
    { id: "s4", student: "Sarnai", initials: "SR", subject: "Нийгэм", title: "Нийгэм", submitted: "Нийгэм", status: "graded", grade: 95, feedback: "Нийгэм", text: "Нийгэм" },
  ],
};