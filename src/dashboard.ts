declare var DashApp: any;
declare function renderSidebar(activeId: string): void;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still up, Udan";
  if (h < 12) return "Good morning, Udan";
  if (h < 18) return "Good afternoon, Udan";
  return "Good evening, Udan";
}

function renderStats(): void {
  const stats = DashApp.completionStats();
  const streak = DashApp.currentStreak();
  const files = JSON.parse(localStorage.getItem("dash_file_count_v1") || "0");

  document.getElementById("greet")!.textContent = greeting();
  document.getElementById("greet-sub")!.textContent =
    stats.total === 0
      ? "No tasks yet — add one on the To-Do page to get started."
      : `${stats.done} of ${stats.total} tasks complete today`;

  document.getElementById("stat-pct")!.textContent = stats.pct + "%";
  document.getElementById("stat-tasks")!.textContent =
    `${stats.done}/${stats.total}`;
  document.getElementById("stat-streak")!.textContent =
    streak + (streak === 1 ? " day" : " days");
  document.getElementById("stat-files")!.textContent = String(files);
}
