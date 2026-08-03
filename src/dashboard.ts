declare var DashApp: any;
declare function renderSidebar(activeId: string): void;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still up, Udan";
  if (h < 12) return "Good morning, Udan";
  if (h < 18) return "Good afternoon, Udan";
  return "Good evening, Udan";
}
