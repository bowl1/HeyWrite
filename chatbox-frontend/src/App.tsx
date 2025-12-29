import React, { useRef, useState } from "react";
import { toneOptions, languageOptions, CustomSelect } from "./components/option";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";
import {
  writeDraft,
  uploadPdfs,
  type ConversationMessage,
  type Source,
} from "./lib/api";

const Home = () => {
  const [intent, setIntent] = useState<string>("");
  const [style, setStyle] = useState<string>("Formal");
  const [language, setLanguage] = useState<string>("English");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMsg, setUploadMsg] = useState<string>("");
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setResponse("");
    setSources([]);

    try {
      const result = await writeDraft({ intent, style, language, history });
      setResponse(result.reply);
      setSources(result.sources || []);
      setHistory((prev) => [
        ...prev,
        { role: "user", content: intent },
        { role: "assistant", content: result.reply },
      ]);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      alert(`Generation failed: ${error.message}`);
      setResponse("");
    } finally {
      setLoading(false);
    }
  };
  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async () => {
    if (!pdfFiles.length) {
      alert("Please choose up to 5 PDFs first.");
      return;
    }
    setUploading(true);
    setUploadMsg("");
    try {
      const res = await uploadPdfs(pdfFiles);
      const summary = res.files
        .map((f) => `${f.file}: ${f.chunks} chunks`)
        .join("; ");
      setUploadMsg(`Upload success. ${summary}`);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadMsg(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (idx: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen px-4 py-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <Card className="w-full border-blue-100/70 bg-white/90 shadow-xl shadow-blue-100/40 backdrop-blur lg:w-2/3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-lg">✨</span>
              <CardTitle className="text-center text-3xl font-black text-blue-700">
                Ask me anything
              </CardTitle>
              <span className="inline-flex h-8 items-center rounded-full bg-blue-50 px-3 text-xs font-semibold text-blue-700">
                PDF-powered
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-dashed border-blue-200 bg-white/70 p-4 shadow-inner">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                    📄
                  </span>
                  <div className="flex flex-col">
                    <span>Upload PDFs (max 5) to ground answers</span>
                    <span className="text-xs font-normal text-slate-500">
                      The more relevant the PDF, the better the answer
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {pdfFiles.map((file, idx) => (
                    <div
                      key={file.name + idx}
                      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100/80 text-xs font-semibold text-blue-800 shadow-sm"
                      title={file.name}
                    >
                      {file.name.slice(0, 2).toUpperCase()}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-600 shadow hover:bg-slate-100"
                        aria-label={`Remove ${file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setPdfFiles((prev) =>
                    [...prev, ...files].slice(0, 5)
                  );
                }}
                className="hidden"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button onClick={triggerFileSelect} variant="secondary" size="sm">
                  Choose file
                </Button>
                <Button onClick={handleUpload} disabled={uploading} size="sm">
                  {uploading ? "Uploading & Indexing..." : "Upload & Index"}
                </Button>
                {uploadMsg && (
                  <span className="text-xs text-slate-600">{uploadMsg}</span>
                )}
              </div>
            </div>

            <Textarea
              rows={5}
              placeholder="Ask a question about your PDF"
              value={intent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setIntent(e.target.value)
              }
              className="border-blue-100/80 bg-white/90 shadow-inner shadow-blue-50"
            />

            <div className="space-y-4">
              <CustomSelect
                label="Choose Tone"
                options={toneOptions}
                value={toneOptions.find((option) => option.value === style) || null}
                onChange={(option) => option && setStyle(option.value)}
              />

              <CustomSelect
                label="Language"
                options={languageOptions}
                value={
                  languageOptions.find((option) => option.value === language) ||
                  null
                }
                onChange={(option) => option && setLanguage(option.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button
                onClick={() => setHistory([])}
                variant="outline"
                className="w-full"
                size="sm"
              >
                🔄 Reset Conversation
              </Button>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {loading ? "Answering..." : "Ask question"}
              </Button>
            </div>

            {response && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">
                    Answer
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div
                  className="whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 p-4 text-base leading-relaxed text-slate-900"
                  data-testid="main-reply"
                >
                  {response}
                </div>
                {sources.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <div className="font-semibold text-slate-800">
                      Sources
                    </div>
                    <ul className="mt-2 space-y-1">
                      {sources.map((src, idx) => (
                        <li key={`${src.source}-${src.page}-${idx}`} className="break-words">
                          <span>
                            Source: page {src.page}
                            {src.paragraph ? `, paragraph ${src.paragraph}` : ""}
                          </span>
                          {src.source ? (
                            <div className="text-slate-500">
                              ({src.source})
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full border-pink-100/70 bg-white/90 shadow-xl shadow-pink-100/40 backdrop-blur lg:w-1/3">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm">🕒</span>
              <CardTitle className="text-2xl text-slate-800">
                Conversation History
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-xl border p-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "border-cyan-100 bg-cyan-50/80"
                      : "border-amber-100 bg-amber-50/80"
                  }`}
                >
                  <strong className="text-slate-800">
                    {msg.role === "user" ? "You" : "HeyWrite"}:
                  </strong>
                  <p className="mt-1 text-slate-700">{msg.content}</p>
                </div>
              ))}
              {!history.length && (
                <p className="text-sm text-slate-500">
                  Start chatting to see your conversation history here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
