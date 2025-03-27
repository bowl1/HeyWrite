import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [intent, setIntent] = useState("");
  const [style, setStyle] = useState("Formal");
  const [language, setLanguage] = useState("English");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);


  const handleSubmit = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setResponse("");

    const res = await fetch("http://localhost:8000/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, style, language }),
    });

    const data = await res.json();
    setResponse(data.reply);
    setLoading(false);
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

        <button
          className="generate-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Writing..." : "✨ Generate"}
        </button>

        {response && (
          <div className="response-box">
            <h2 className="response-title">Your Draft</h2>
             <button className="copy-button" onClick={handleCopy}>
              {copied ? " Copied!" : "Copy"}
            </button>
            <div className="response-text">{response}</div>
           
          </div>
        )}
      </div>
    </div>
  );
}
