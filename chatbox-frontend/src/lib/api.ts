export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function writeDraft(params: {
  intent: string;
  style: string;
  language: string;
  history: ConversationMessage[];
}): Promise<string> {
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
  return (data as { reply: string }).reply;
}

export async function writeDraftWithTemplate(params: {
  intent: string;
  style: string;
  language: string;
  history: ConversationMessage[];
}): Promise<string> {
  const res = await fetch(`${API_BASE}/write_with_template`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text}`);
  }
  const data = await res.json();
  return (data as { reply: string }).reply;
}
