import { Auth } from './auth.js';
import { DB } from './supabase.js';

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Эрх шалгах
  const role = await Auth.getCurrentRole();
  const localRole = localStorage.getItem("smartclass_user_role");
  
  const currentRole = role || localRole;
  if (currentRole !== "teacher") {
    window.location.href = "dashboard.html";
    return;
  }

  // 2. Багшийн нэрийг харуулах
  const userNameDisplay = document.getElementById("userNameDisplay");
  if (userNameDisplay) {
    const user = await Auth.getCurrentUser();
    const name = user?.user_metadata?.full_name || localStorage.getItem("smartclass_user_name") || "Багш";
    userNameDisplay.textContent = `${name} (Багш)`;
  }

  // 3. Багшийн датаг ачаалах
  loadTeacherData();
});

async function loadTeacherData() {
  try {
    // Датаг зэрэг дуудах
    const [assignments, submissions, students] = await Promise.all([
      DB.fetchAssignments(),
      DB.fetchSubmissions(),
      DB.fetchStudents()
    ]);

    // Статистик шинэчлэх
    const totalAssEl = document.getElementById("totalAssignments");
    const totalSubEl = document.getElementById("totalSubmissions");
    const totalStdEl = document.getElementById("totalStudents");

    if (totalAssEl) totalAssEl.textContent = assignments?.length || 0;
    if (totalSubEl) totalSubEl.textContent = submissions?.length || 0;
    if (totalStdEl) totalStdEl.textContent = students?.length || 0;

    // Сурагчдын хүснэгтийг засах
    renderStudentsTable(students);

  } catch (err) {
    console.error("Багшийн дата ачаалахад алдаа гарлаа:", err);
  }
}

function renderStudentsTable(students) {
  const tableBody = document.getElementById("studentsTableBody");
  if (!tableBody) return;

  if (!students || students.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Одоогоор сурагчийн мэдээлэл байхгүй байна.</td></tr>`;
    return;
  }

  tableBody.innerHTML = students.map(student => `
    <tr>
      <td><strong>${student.full_name || 'Нэргүй'}</strong></td>
      <td>${student.grade || '-'}</td>
      <td>${student.subject || '-'}</td>
      <td>${student.avg_grade ? student.avg_grade + '%' : '0%'}</td>
      <td>
        <span class="badge ${student.pending_count > 0 ? 'badge-warning' : 'badge-success'}">
          ${student.pending_count || 0} даалгавар
        </span>
      </td>
    </tr>
  `).join('');
}