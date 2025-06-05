import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [intent, setIntent] = useState("");
  const [style, setStyle] = useState("Formal");
  const [language, setLanguage] = useState("English");
  const [response, setResponse] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : process.env.REACT_APP_API_URL;

  const handleSubmit = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setLastResponse(response);
    setResponse("");

    const res = await fetch(`${BASE_URL}/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, style, language, history: history || [] }),
    });

    const data = await res.json();
    setResponse(data.reply);
    // 更新历史记录
    setHistory([
      ...history,
      { role: "user", content: intent },
      { role: "assistant", content: data.reply },
    ]);
    setLoading(false);
  };

  const handleSubmitWithTemplate = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setLastResponse(response);
    setResponse("");
  
    try {
      const res = await fetch(`${BASE_URL}/write_with_template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, style, language, history: history || [] }),
      });
  
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errText}`);
      }
  
      const data = await res.json();
      const parsed = data.reply; 
  
      setResponse(parsed);
      setHistory([
        ...history,
        { role: "user", content: intent },
        { role: "assistant", content: parsed},
      ]);
    } catch (error) {
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
        newHistory[i] = {
          role: "assistant",
          content: lastResponse, 
        };
        break;
      }
    }
    setHistory(newHistory);
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page-container">
      <div className="chat-box">
        <h1 className="title">Hey Write!</h1>

        <textarea
          className="intent-textarea"
          rows={5}
          placeholder="Describe what you want to write, e.g., an invitation email for a meeting"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
        ></textarea>

        <div className="selectors">
          <div className="select-group">
            <label className="label">Choose Tone</label>
            <select
              className="select"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="Formal">Formal</option>
              <option value="Casual">Casual</option>
              <option value="Polite Push">Polite Push</option>
              <option value="Concise & Direct">Concise & Direct</option>
              <option value="Humorous">Humorous</option>
              <option value="Creative">Creative</option>
            </select>
          </div>

          <div className="select-group">
            <label className="label">Language</label>
            <select
              className="select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Danish">Dansk</option>
              <option value="Chinese">中文</option>
            </select>
          </div>
        </div>

        <div className="response-controls">
          {lastResponse && (
            <button className="undo-button" onClick={handleUndo}>
              ⬅️ Back to Last Version
            </button>
          )}

          <button className="reset-button" onClick={() => setHistory([])}>
            🔄 Reset Conversation
          </button>
        </div>

        <div className="generate-buttons">
          <button
            className="generate-button"
            onClick={handleSubmitWithTemplate}
            disabled={loading}
          >
            Generate with Template
          </button>
          <button
            className="generate-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Writing... It takes around 1 minute"
              : "✨ Generate something wild"}
          </button>
        </div>

        {response && (
          <div className="response-box">
            <h2 className="response-title">Your Draft</h2>
            <button className="copy-button" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </button>
            <div className="response-text">{response}</div>
          </div>
        )}
      </div>

      <div className="history-panel">
        <h2>🕒 Conversation History</h2>
        {history.map((msg, index) => (
          <div key={index} className={`msg ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "HeyWrite"}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
