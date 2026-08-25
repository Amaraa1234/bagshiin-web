import { Auth } from './auth.js';
import { DB } from './supabase.js';

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Эрх шалгах: Хэрэв багш биш бол сурагчийн дашборд руу буцаана
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
    const assignments = await DB.fetchAssignments();
    const submissions = await DB.fetchSubmissions();

    const totalAssEl = document.getElementById("totalAssignments");
    const totalSubEl = document.getElementById("totalSubmissions");

    if (totalAssEl) totalAssEl.textContent = assignments.length;
    if (totalSubEl) totalSubEl.textContent = submissions.length;
  } catch (err) {
    console.error("Багшийн дата ачаалахад алдаа гарлаа:", err);
  }
}