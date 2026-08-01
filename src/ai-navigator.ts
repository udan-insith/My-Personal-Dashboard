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
