import React, { useState } from "react";
import {
  toneOptions,
  languageOptions,
  CustomSelect,
} from "./components/option";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";
import {
  writeDraft,
  uploadPdf,
  deletePdfs,
  type ConversationMessage,
  type Source,
  summarizeDocs,
} from "./api";
import UploadCard from "./components/UploadCard";
import ResponseSection from "./components/ResponseSection";
import HistoryCard from "./components/HistoryCard";

const Home = () => {
  const [intent, setIntent] = useState<string>("");
  const [style, setStyle] = useState<string>("Formal");
  const [language, setLanguage] = useState<string>("English");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMsg, setUploadMsg] = useState<string>("");
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [summarizing, setSummarizing] = useState<boolean>(false);

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

  const handleSummarize = async () => {
    setSummarizing(true);
    setResponse("");
    setSources([]);
    try {
      const result = await summarizeDocs({ style, language });
      setResponse(result.reply);
      setHistory((prev) => [
        ...prev,
        { role: "user", content: "Summarize PDFs" },
        { role: "assistant", content: result.reply },
      ]);
    } catch (error: any) {
      console.error("Summarize failed:", error);
      alert(`Summarize failed: ${error.message}`);
      setResponse("");
    } finally {
      setSummarizing(false);
    }
  };
  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      alert("Please choose one PDF first.");
      return;
    }
    setUploading(true);
    setUploadMsg("");
    try {
      const res = await uploadPdf(pdfFile);
      setUploadMsg(`Upload success. ${res.file}: ${res.chunks} chunks`);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadMsg(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    const target = pdfFile;
    setPdfFile(null);
    if (target) {
      deletePdfs([target.name]).catch((err) => {
        setUploadMsg(`Delete failed: ${err.message}`);
      });
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <Card className="w-full border-blue-100/70 bg-white/90 shadow-xl shadow-blue-100/40 backdrop-blur lg:w-2/3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex h-11 w-11 items-center justify-center text-xl">
                ✨
              </span>
              <CardTitle className="heading-caveat text-center text-5xl font-black text-blue-700">
                AskMyDocs
              </CardTitle>
              <span className="ml-3 inline-flex h-8 items-center rounded-full bg-blue-50 px-3 text-xs font-semibold text-blue-700">
                PDF-powered
              </span>
            </div>
            <p className="mt-2 text-center text-sm text-blue-700">
              Have a conversation with your documents.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <UploadCard
              pdfFile={pdfFile}
              onFileChange={setPdfFile}
              onUpload={handleUpload}
              uploading={uploading}
              uploadMsg={uploadMsg}
              onRemove={removeFile}
            />

            <Textarea
              rows={5}
              placeholder="Ask a question about your PDF"
              value={intent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setIntent(e.target.value)
              }
              className="border-blue-100/80 bg-white/90 shadow-inner shadow-blue-50"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CustomSelect
                label="Choose Tone"
                options={toneOptions}
                value={
                  toneOptions.find((option) => option.value === style) || null
                }
                onChange={(option) => option && setStyle(option.value)}
                className="w-full sm:w-1/2 lg:w-56 h-10 text-sm"
              />

              <CustomSelect
                label="Language"
                options={languageOptions}
                value={
                  languageOptions.find((option) => option.value === language) ||
                  null
                }
                onChange={(option) => option && setLanguage(option.value)}
                className="w-full sm:w-1/2 lg:w-56 h-10 text-sm"
              />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <Button
                onClick={handleSubmit}
                disabled={loading || summarizing}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {loading ? "Answering..." : "Ask question"}
              </Button>
              <Button
                onClick={handleSummarize}
                disabled={summarizing || loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {summarizing
                  ? "Summarizing takes around 1 minute..."
                  : "Summarize PDF"}
              </Button>
            </div>

            <ResponseSection
              response={response}
              copied={copied}
              onCopy={handleCopy}
              sources={sources}
            />
          </CardContent>
        </Card>

        <HistoryCard history={history} onReset={() => setHistory([])} />
      </div>
    </div>
  );
};

export default Home;
