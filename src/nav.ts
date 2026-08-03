declare var DashApp: any;

interface NavLink {
  href: string;
  label: string;
  icon: string;
  id: string;
}

const NAV_LINKS: NavLink[] = [
  {
    id: "dashboard",
    href: "index.html",
    label: "Dashboard",
    icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z",
  },
  {
    id: "todo",
    href: "todo.html",
    label: "To-Do List",
    icon: "M9 11l3 3L22 4M4 6h.01M4 12h.01M4 18h.01M9 6h11M9 18h11",
  },
  {
    id: "filesaver",
    href: "filesaver.html",
    label: "File Saver",
    icon: "M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2z",
  },
  {
    id: "ai",
    href: "ai-navigator.html",
    label: "AI Navigator",
    icon: "M12 2l1.6 4.9L18.5 8l-4.9 1.6L12 14.5l-1.6-4.9L5.5 8l4.9-1.1z",
  },
];

function renderSidebar(activeId: string): void {
  const root = document.getElementById("sidebar-root");
  if (!root) return;

  const stats = DashApp.completionStats();

  root.innerHTML = `
    <div class="side-brand">
      <span class="brand-dot"></span>
      <span class="brand-text">NEXUS<span class="brand-accent">.</span></span>
    </div>
    <nav class="side-nav">
      ${NAV_LINKS.map(
        (l) => `
        <a class="side-link ${l.id === activeId ? "active" : ""}" href="${l.href}">
          <svg viewBox="0 0 24 24" class="side-icon"><path d="${l.icon}"/></svg>
          <span>${l.label}</span>
        </a>`,
      ).join("")}
    </nav>
    <div class="side-mini">
      <div class="side-mini-label">today's progress</div>
      <div class="side-mini-track"><div class="side-mini-fill" style="width:${stats.pct}%"></div></div>
      <div class="side-mini-pct">${stats.pct}% &middot; ${stats.done}/${stats.total}</div>
    </div>
    <div class="side-clock" id="side-clock"></div>
  `;

  const clockEl = document.getElementById("side-clock");
  const tick = () => {
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  tick();
  setInterval(tick, 1000);
}

function spawnParticles(count: number = 22): void {
  const field = document.createElement("div");
  field.className = "particle-field";
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDelay = Math.random() * 10 + "s";
    p.style.animationDuration = 9 + Math.random() * 8 + "s";
    p.style.opacity = (0.15 + Math.random() * 0.35).toFixed(2);
    field.appendChild(p);
  }
  document.body.appendChild(field);
}

document.addEventListener("DOMContentLoaded", () => {
  spawnParticles();
});
