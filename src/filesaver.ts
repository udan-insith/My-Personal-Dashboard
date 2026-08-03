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
