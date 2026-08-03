"use strict";
let currentFilter = "all";
function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
function renderProgress() {
  const stats = DashApp.completionStats();
  document.getElementById("progress-fill").style.width = stats.pct + "%";
  document.getElementById("progress-label").textContent =
    `${stats.pct}% complete — ${stats.done}/${stats.total} tasks`;
}
function renderList() {
  const all = DashApp.getTodos();
  const items = all.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });
  const list = document.getElementById("todo-list");
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
      (t, i) => `
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
function refreshAll() {
  renderProgress();
  renderList();
  renderSidebarMini();
}
function renderSidebarMini() {
  // sidebar mini progress is drawn once on load by nav.ts; re-render it so it stays live too.
  if (typeof window.renderSidebar === "function") {
    window.renderSidebar("todo");
  }
}
function handleAdd() {
  const input = document.getElementById("new-task");
  const priority = document.getElementById("new-priority").value;
  const text = input.value.trim();
  if (!text) return;
  DashApp.addTodo(text, priority);
  input.value = "";
  input.focus();
  refreshAll();
}
document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("todo");
  refreshAll();
  document.getElementById("add-btn").addEventListener("click", handleAdd);
  document.getElementById("new-task").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAdd();
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.getAttribute("data-filter");
      renderList();
    });
  });
  document.getElementById("todo-list").addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const id = target.getAttribute("data-id");
    const action = target.getAttribute("data-action");
    if (action === "toggle") {
      DashApp.toggleTodo(id);
      refreshAll();
    } else if (action === "delete") {
      const row = target.closest(".todo-item");
      row.classList.add("removing");
      setTimeout(() => {
        DashApp.deleteTodo(id);
        refreshAll();
      }, 280);
    }
  });
});
