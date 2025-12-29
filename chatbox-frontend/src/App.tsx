import React, { useState } from "react";
import { toneOptions, languageOptions, CustomSelect } from "./components/option";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";
import {
  writeDraft,
  writeDraftWithTemplate,
  type ConversationMessage,
} from "./lib/api";

const Home = () => {
  const [intent, setIntent] = useState<string>("");
  const [style, setStyle] = useState<string>("Formal");
  const [language, setLanguage] = useState<string>("English");
  const [response, setResponse] = useState<string>("");
  const [lastResponse, setLastResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<ConversationMessage[]>([]);

  const handleSubmit = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setLastResponse(response);
    setResponse("");

    try {
      const reply = await writeDraft({ intent, style, language, history });
      setResponse(reply);
      setHistory((prev) => [
        ...prev,
        { role: "user", content: intent },
        { role: "assistant", content: reply },
      ]);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      alert(`Generation failed: ${error.message}`);
      setResponse("");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithTemplate = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setLastResponse(response);
    setResponse("");

    try {
      const reply = await writeDraftWithTemplate({
        intent,
        style,
        language,
        history,
      });

      setResponse(reply);
      setHistory((prev) => [
        ...prev,
        { role: "user", content: intent },
        { role: "assistant", content: reply },
      ]);
    } catch (error: any) {
      console.error("Error in handleSubmitWithTemplate:", error);
      alert(`Generation failed: ${error.message}`);
      setResponse("");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    setResponse(lastResponse);
    const newHistory = [...history];
    for (let i = newHistory.length - 1; i >= 0; i--) {
      if (newHistory[i].role === "assistant") {
        newHistory[i].content = lastResponse;
        break;
      }
    }
    setHistory(newHistory);
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-3xl text-blue-700">
              Hey Write!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              rows={5}
              placeholder="Describe what you want to write, e.g., an invitation email for a meeting"
              value={intent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setIntent(e.target.value)
              }
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

            <div className="flex items-center justify-between gap-4">
              {lastResponse && (
                <Button
                  onClick={handleUndo}
                  variant="default"
                  className="w-full"
                  size="sm"
                >
                  ⬅️ Back to Last Version
                </Button>
              )}
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
                onClick={handleSubmitWithTemplate}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                Generate with Template
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {loading
                  ? "Writing... It takes around 1 minute"
                  : "✨ Generate something wild"}
              </Button>
            </div>

            {response && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">
                    Your Draft
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
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-slate-800">
              🕒 Conversation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-xl border p-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "border-cyan-100 bg-cyan-50"
                      : "border-amber-100 bg-amber-50"
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
