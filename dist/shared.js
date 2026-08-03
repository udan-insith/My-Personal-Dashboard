"use strict";
// shared.ts — compiled to dist/shared.js and loaded first on every page.
// Exposes a global `DashApp` namespace so every page script can read/write
// the same localStorage-backed state without a bundler or module loader.
var DashApp;
(function (DashApp) {
  const TODO_KEY = "dash_todos_v1";
  const HISTORY_KEY = "dash_history_v1";
  const AI_USAGE_KEY = "dash_ai_usage_v1";
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  DashApp.uid = uid;
  function todayKey(d = new Date()) {
    return d.toISOString().slice(0, 10);
  }
  DashApp.todayKey = todayKey;
  // ---------- Todos ----------
  function getTodos() {
    try {
      return JSON.parse(localStorage.getItem(TODO_KEY) || "[]");
    } catch {
      return [];
    }
  }
  DashApp.getTodos = getTodos;
  function saveTodos(items) {
    localStorage.setItem(TODO_KEY, JSON.stringify(items));
    recordHistoryPoint(items);
  }
  DashApp.saveTodos = saveTodos;
  function addTodo(text, priority) {
    const items = getTodos();
    const item = {
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
  DashApp.addTodo = addTodo;
  function toggleTodo(id) {
    const items = getTodos().map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    );
    saveTodos(items);
  }
  DashApp.toggleTodo = toggleTodo;
  function deleteTodo(id) {
    const items = getTodos().filter((t) => t.id !== id);
    saveTodos(items);
  }
  DashApp.deleteTodo = deleteTodo;
  function completionStats() {
    const items = getTodos();
    const done = items.filter((t) => t.done).length;
    const total = items.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { done, total, pct };
  }
  DashApp.completionStats = completionStats;
  function currentStreak() {
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
  DashApp.currentStreak = currentStreak;
  // ---------- History (for the completion chart) ----------
  function recordHistoryPoint(items) {
    const history = getHistory();
    const key = todayKey();
    const done = items.filter((t) => t.done).length;
    const total = items.length;
    const idx = history.findIndex((h) => h.date === key);
    const point = { date: key, done, total };
    if (idx >= 0) history[idx] = point;
    else history.push(point);
    const trimmed = history.slice(-14);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  }
  DashApp.getHistory = getHistory;
  // ---------- AI tool usage (for the AI Navigator "recently used" sort) ----------
  function recordAiUsage(toolId) {
    const raw = localStorage.getItem(AI_USAGE_KEY);
    let usage = {};
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
  DashApp.recordAiUsage = recordAiUsage;
  function getAiUsage() {
    try {
      return JSON.parse(localStorage.getItem(AI_USAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }
  DashApp.getAiUsage = getAiUsage;
  // ---------- Formatting helpers ----------
  function timeAgo(ts) {
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
  DashApp.timeAgo = timeAgo;
  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }
  DashApp.formatBytes = formatBytes;
})(DashApp || (DashApp = {}));
