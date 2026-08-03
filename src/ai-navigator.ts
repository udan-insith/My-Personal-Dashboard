declare var DashApp: any;
declare function renderSidebar(activeId: string): void;

interface AiTool {
  id: string;
  name: string;
  desc: string;
  url: string;
  initials: string;
  accent: string;
}

const TOOLS: AiTool[] = [
  {
    id: "claude",
    name: "Claude",
    desc: "Anthropic's assistant for writing, code, and research.",
    url: "https://claude.ai",
    initials: "C",
    accent: "#d97757",
  },
  {
    id: "gemini",
    name: "Gemini",
    desc: "Google's multimodal assistant across search and workspace.",
    url: "https://gemini.google.com",
    initials: "G",
    accent: "#4dc9ff",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    desc: "OpenAI's conversational assistant and coding helper.",
    url: "https://chat.openai.com",
    initials: "GPT",
    accent: "#00ffb2",
  },
  {
    id: "groq",
    name: "Groq",
    desc: "Ultra-fast inference playground for open models.",
    url: "https://groq.com",
    initials: "Gq",
    accent: "#ff2ec4",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    desc: "In-editor AI pair programmer, wired into your repos.",
    url: "https://github.com/features/copilot",
    initials: "Cp",
    accent: "#8b8fa3",
  },
];

function render(): void {
  const usage = DashApp.getAiUsage();
  const sorted = [...TOOLS].sort((a, b) => {
    const ua = usage[a.id]?.last || 0;
    const ub = usage[b.id]?.last || 0;
    return ub - ua;
  });

  const grid = document.getElementById("ai-grid")!;
  grid.innerHTML = sorted
    .map((t, i) => {
      const last = usage[t.id]?.last;
      const count = usage[t.id]?.count || 0;
      return `
      <div class="panel ai-card" style="--card-accent:${t.accent}; animation-delay:${i * 0.05}s" data-id="${t.id}" data-url="${t.url}">
        <div class="ai-badge">${t.initials}</div>
        <div class="ai-name">${t.name}</div>
        <p class="ai-desc">${t.desc}</p>
        <div class="ai-footer">
          <span>${count > 0 ? `opened ${count}\u00D7 \u00B7 ${DashApp.timeAgo(last)}` : "not opened yet"}</span>
          <span class="ai-open">Open <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
        </div>
      </div>`;
    })
    .join("");

  grid.querySelectorAll(".ai-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id")!;
      const url = card.getAttribute("data-url")!;
      DashApp.recordAiUsage(id);
      window.open(url, "_blank", "noopener,noreferrer");
      render();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("ai");
  render();
});
