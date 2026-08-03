declare var DashApp: any;
declare function renderSidebar(activeId: string): void;

type Filter = "all" | "active" | "done";
let currentFilter: Filter = "all";

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function renderProgress(): void {
  const stats = DashApp.completionStats();
  (document.getElementById("progress-fill") as HTMLElement).style.width =
    stats.pct + "%";
  document.getElementById("progress-label")!.textContent =
    `${stats.pct}% complete — ${stats.done}/${stats.total} tasks`;
}

function renderList(): void {
  const all = DashApp.getTodos();
  const items = all.filter((t: any) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  const list = document.getElementById("todo-list")!;

  if (items.length === 0) {
    list.innerHTML = `<p class="empty-note">${
      all.length === 0
        ? "No tasks yet. Add your first one above."
        : "Nothing here for this filter."
    }</p>`;
    return;
  }

  list.innerHTML = items
    .map(
      (t: any, i: number) => `
    <div class="todo-item ${t.done ? "done" : ""}" data-id="${t.id}" style="animation-delay:${i * 0.03}s">
      <div class="check ${t.done ? "done" : ""}" data-action="toggle" data-id="${t.id}"></div>
      <span class="todo-text">${escapeHtml(t.text)}</span>
      <span class="priority-tag ${t.priority}">${t.priority}</span>
      <button class="del-btn" data-action="delete" data-id="${t.id}" aria-label="Delete task">
        <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>`,
    )
    .join("");
}
