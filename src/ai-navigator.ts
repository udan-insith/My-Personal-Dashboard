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
