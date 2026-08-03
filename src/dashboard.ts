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

function renderDonut(): void {
  const stats = DashApp.completionStats();
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (stats.pct / 100) * circumference;
  const fill = document.getElementById(
    "donut-fill",
  ) as unknown as SVGCircleElement;
  const center = document.getElementById("donut-center-text")!;
  fill.style.strokeDasharray = String(circumference);
  // animate from full offset on first paint
  requestAnimationFrame(() => {
    fill.style.strokeDashoffset = String(offset);
  });
  center.textContent = stats.pct + "%";
}

function renderBarChart(): void {
  const history = DashApp.getHistory();
  const container = document.getElementById("bar-chart")!;
  container.innerHTML = "";

  if (history.length === 0) {
    container.innerHTML = `<p class="empty-note">No history yet — completion data will appear here once you check off tasks over a few days.</p>`;
    return;
  }

  // Always show the last 7 available days, oldest to newest.
  const points = history.slice(-7);

  points.forEach(
    (p: { date: string; done: number; total: number }, i: number) => {
      const pct = p.total === 0 ? 0 : Math.round((p.done / p.total) * 100);
      const col = document.createElement("div");
      col.className = "bar-col";
      const d = new Date(p.date + "T00:00:00");
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      col.innerHTML = `
      <div class="bar-tooltip">${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} &middot; ${pct}% (${p.done}/${p.total})</div>
      <div class="bar-track"><div class="bar-fill" data-pct="${pct}"></div></div>
      <div class="bar-label">${label}</div>
    `;
      container.appendChild(col);
      const fill = col.querySelector(".bar-fill") as HTMLElement;
      setTimeout(
        () => {
          fill.style.height = Math.max(pct, 3) + "%";
        },
        80 * i + 100,
      );
    },
  );
}

function renderActivity(): void {
  const todos = DashApp.getTodos()
    .slice()
    .sort((a: any, b: any) => b.createdAt - a.createdAt)
    .slice(0, 5);
  const list = document.getElementById("activity-list")!;
  if (todos.length === 0) {
    list.innerHTML = `<p class="empty-note">Nothing logged yet. Tasks you add will show up here.</p>`;
    return;
  }
  list.innerHTML = todos
    .map(
      (t: any) => `
      <div class="activity-item">
        <span class="activity-dot" style="${t.done ? "" : "opacity:.3;box-shadow:none;"}"></span>
        <span style="${t.done ? "color:var(--dim);text-decoration:line-through;" : ""}">${escapeHtml(t.text)}</span>
        <span class="activity-time">${DashApp.timeAgo(t.createdAt)}</span>
      </div>`,
    )
    .join("");
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("dashboard");
  renderStats();
  renderDonut();
  renderBarChart();
  renderActivity();
});
