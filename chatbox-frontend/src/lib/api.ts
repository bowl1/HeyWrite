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

export async function uploadPdfs(files: File[]): Promise<{ status: string; files: { file: string; chunks: number }[] }> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

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
