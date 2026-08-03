declare var DashApp: any;
declare function renderSidebar(activeId: string): void;

interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: number;
  blob: Blob;
}

const DB_NAME = "dash_files_db";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addFiles(files: FileList | File[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  Array.from(files).forEach((file) => {
    const record: StoredFile = {
      id: DashApp.uid(),
      name: file.name,
      size: file.size,
      type: file.type || guessType(file.name),
      addedAt: Date.now(),
      blob: file,
    };
    store.put(record);
  });
  await new Promise((res) => (tx.oncomplete = () => res(null)));
  updateFileCount();
  await renderFiles();
}

function getAllFiles(): Promise<StoredFile[]> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).getAll();
        req.onsuccess = () =>
          resolve(
            req.result.sort(
              (a: StoredFile, b: StoredFile) => b.addedAt - a.addedAt,
            ),
          );
        req.onerror = () => reject(req.error);
      }),
  );
}

function deleteFile(id: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

function guessType(name: string): string {
  const ext = name.split(".").pop() || "";
  return ext.toUpperCase();
}

function extBadge(name: string, type: string): string {
  const ext = (name.split(".").pop() || "?").toUpperCase().slice(0, 4);
  return ext;
}

async function updateFileCount(): Promise<void> {
  const files = await getAllFiles();
  localStorage.setItem("dash_file_count_v1", JSON.stringify(files.length));
}

async function renderFiles(): Promise<void> {
  const files = await getAllFiles();
  const list = document.getElementById("file-list")!;

  if (files.length === 0) {
    list.innerHTML = `<p class="empty-note">No files saved yet. Drop something above.</p>`;
  } else {
    list.innerHTML = files
      .map(
        (f, i) => `
      <div class="file-row" data-id="${f.id}" style="animation-delay:${i * 0.03}s">
        <div class="file-badge">${extBadge(f.name, f.type)}</div>
        <div class="file-info">
          <div class="file-name">${escapeHtml(f.name)}</div>
          <div class="file-meta">${DashApp.formatBytes(f.size)} &middot; ${DashApp.timeAgo(f.addedAt)}</div>
        </div>
        <div class="file-actions">
          <button class="icon-btn" data-action="download" data-id="${f.id}" aria-label="Download">
            <svg viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"/></svg>
          </button>
          <button class="icon-btn danger" data-action="delete" data-id="${f.id}" aria-label="Delete">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>`,
      )
      .join("");
  }

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  document.getElementById("storage-label")!.textContent =
    `${files.length} file${files.length === 1 ? "" : "s"} &middot; ${DashApp.formatBytes(totalBytes)} used`.replace(
      "&middot;",
      "\u00B7",
    );
  const cap = 50 * 1024 * 1024; // display-only reference cap
  const pct = Math.min(100, Math.round((totalBytes / cap) * 100));
  (document.getElementById("storage-fill") as HTMLElement).style.width =
    pct + "%";
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("filesaver");
  updateFileCount().then(renderFiles);

  const dropzone = document.getElementById("dropzone")!;
  const input = document.getElementById("file-input") as HTMLInputElement;

  dropzone.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    if (input.files && input.files.length) addFiles(input.files);
    input.value = "";
  });

  ["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    }),
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    }),
  );
  dropzone.addEventListener("drop", (e) => {
    const dt = (e as DragEvent).dataTransfer;
    if (dt && dt.files.length) addFiles(dt.files);
  });

  document.getElementById("file-list")!.addEventListener("click", async (e) => {
    const target = (e.target as HTMLElement).closest(
      "[data-action]",
    ) as HTMLElement | null;
    if (!target) return;
    const id = target.getAttribute("data-id")!;
    const action = target.getAttribute("data-action");

    if (action === "delete") {
      const row = target.closest(".file-row") as HTMLElement;
      row.classList.add("removing");
      setTimeout(async () => {
        await deleteFile(id);
        await updateFileCount();
        await renderFiles();
      }, 260);
    } else if (action === "download") {
      const files = await getAllFiles();
      const file = files.find((f) => f.id === id);
      if (!file) return;
      const url = URL.createObjectURL(file.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  });
});
