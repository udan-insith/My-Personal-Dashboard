type Priority = "low" | "medium" | "high";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
}

interface HistoryPoint {
  date: string; // yyyy-mm-dd
  done: number;
  total: number;
}

namespace DashApp {
  const TODO_KEY = "dash_todos_v1";
  const HISTORY_KEY = "dash_history_v1";
  const AI_USAGE_KEY = "dash_ai_usage_v1";

  export function uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  export function todayKey(d: Date = new Date()): string {
    return d.toISOString().slice(0, 10);
  }

  // ---------- Todos ----------

  export function getTodos(): TodoItem[] {
    try {
      return JSON.parse(localStorage.getItem(TODO_KEY) || "[]");
    } catch {
      return [];
    }
  }

  export function saveTodos(items: TodoItem[]): void {
    localStorage.setItem(TODO_KEY, JSON.stringify(items));
    recordHistoryPoint(items);
  }

  export function addTodo(text: string, priority: Priority): TodoItem {
    const items = getTodos();
    const item: TodoItem = {
      id: uid(),
      text,
      priority,
      done: false,
      createdAt: Date.now(),
    };
    items.unshift(item);
    saveTodos(items);
    return item;
  }

  export function toggleTodo(id: string): void {
    const items = getTodos().map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    );
    saveTodos(items);
  }

  export function deleteTodo(id: string): void {
    const items = getTodos().filter((t) => t.id !== id);
    saveTodos(items);
  }

  export function completionStats(): {
    done: number;
    total: number;
    pct: number;
  } {
    const items = getTodos();
    const done = items.filter((t) => t.done).length;
    const total = items.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { done, total, pct };
  }

  export function currentStreak(): number {
    // Consecutive days (ending today or yesterday) where at least one task was completed.
    const history = getHistory();
    const map = new Map(history.map((h) => [h.date, h.done]));
    let streak = 0;
    let cursor = new Date();
    // allow today to be "in progress" without breaking the streak if it has 0 so far
    if ((map.get(todayKey(cursor)) || 0) === 0) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (true) {
      const key = todayKey(cursor);
      const doneCount = map.get(key);
      if (doneCount && doneCount > 0) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  // ---------- History (for the completion chart) ----------

  function recordHistoryPoint(items: TodoItem[]): void {
    const history = getHistory();
    const key = todayKey();
    const done = items.filter((t) => t.done).length;
    const total = items.length;
    const idx = history.findIndex((h) => h.date === key);
    const point: HistoryPoint = { date: key, done, total };
    if (idx >= 0) history[idx] = point;
    else history.push(point);
    const trimmed = history.slice(-14);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }

  export function getHistory(): HistoryPoint[] {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  }

  // ---------- AI tool usage (for the AI Navigator "recently used" sort) ----------

  export function recordAiUsage(toolId: string): void {
    const raw = localStorage.getItem(AI_USAGE_KEY);
    let usage: Record<string, { count: number; last: number }> = {};
    try {
      usage = raw ? JSON.parse(raw) : {};
    } catch {
      usage = {};
    }
    const entry = usage[toolId] || { count: 0, last: 0 };
    entry.count += 1;
    entry.last = Date.now();
    usage[toolId] = entry;
    localStorage.setItem(AI_USAGE_KEY, JSON.stringify(usage));
  }

  export function getAiUsage(): Record<
    string,
    { count: number; last: number }
  > {
    try {
      return JSON.parse(localStorage.getItem(AI_USAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  // ---------- Formatting helpers ----------

  export function timeAgo(ts: number): string {
    if (!ts) return "never";
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  }

  export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }
}
