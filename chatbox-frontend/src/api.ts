export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Source = {
  page: number | string;
  source?: string;
  paragraph?: number | string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function writeDraft(params: {
  intent: string;
  style: string;
  language: string;
  history: ConversationMessage[];
}): Promise<{ reply: string; sources: Source[] }> {
  const res = await fetch(`${API_BASE}/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data as { reply: string; sources: Source[] };
}

export async function uploadPdf(
  file: File,
): Promise<{ status: string; file: string; chunks: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload_pdf`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text}`);
  }

  return res.json();
}

export async function deletePdfs(
  files: string[],
): Promise<{ status: string; deleted: number }> {
  const res = await fetch(`${API_BASE}/delete_files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text}`);
  }

  return res.json();
}

export async function summarizeDocs(params: {
  style: string;
  language: string;
}): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text}`);
  }

  return res.json();
}
