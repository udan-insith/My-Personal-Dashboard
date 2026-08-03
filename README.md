# My-Personal-Dashboard
Tracking everyday coding tasks, To-Do list + AI Tools Navigator(Claude, OpenAI, Gemini, Groq, Copilot) For Research.
Personal dashboard I built to keep track of daily tasks, dump files somewhere quick, and jump
to whichever AI tool I'm using that day. Four pages, dark/neon theme, everything runs in the
browser — no backend, no signup, no build tools needed to actually use it.

## What's in each page

- `index.html` – the dashboard itself. Shows today's completion %, a 7-day history chart,
  streak, recent activity, quick links to the other pages.
- `todo.html` – add/check off/delete tasks, filter by active or done. This is what actually
  feeds the charts on the dashboard.
- `filesaver.html` – drag and drop files in, they get stored in the browser (IndexedDB), pull
  them back out with the download button whenever.
- `ai-navigator.html` – cards for Claude, Gemini, ChatGPT, Groq, Copilot. Click one, opens in
  a new tab. Keeps track of what you click most and reorders itself.

## Folder layout

```
index.html / todo.html / filesaver.html / ai-navigator.html   -> the pages
styles/theme.css        -> shared colors, fonts, background animations, sidebar
styles/*.css            -> page-specific styling
dist/*.js               -> compiled JS, this is what the HTML actually loads
src/*.ts                -> TypeScript source, only needed if you're editing
```

## If you want to edit the TypeScript

Everything's already compiled in `dist/`, so you don't need this unless you're changing
something. Needs Node + `npm install -g typescript`, then from this folder:

```
tsc src/shared.ts src/nav.ts src/dashboard.ts src/todo.ts src/filesaver.ts src/ai-navigator.ts --target ES2020 --lib ES2020,DOM --outDir dist --module none --strict false
```

Files compile separately from each other (not as one project), which is why each page script
has a `declare function renderSidebar(...)` line at the top — that's just telling TS "trust
me, this exists at runtime" since nav.js loads before it in the HTML.

## Notes to self

- All data lives in localStorage / IndexedDB in the browser you're using. Different browser
  or incognito = empty dashboard. No sync across devices right now.
- AI Navigator uses plain text/monogram badges instead of the real company logos, mostly to
  avoid ripping actual brand assets. Swap in real icons later if I care enough.
- Storage bar on the file saver page is just a visual reference against 50MB, not an actual
  hard limit — browsers vary a lot on how much they'll actually let you store.
