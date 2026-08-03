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
