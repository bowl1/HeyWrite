import React, { useState } from "react";
import Select from "react-select";
import {
  PageContainer,
  ChatBox,
  Title,
  IntentTextarea,
  Selectors,
  SelectGroup,
  Label,
  StyledSelect,
  ResponseControls,
  UndoButton,
  ResetButton,
  GenerateButtons,
  GenerateButton,
  ResponseBox,
  ResponseTitle,
  CopyButton,
  ResponseText,
  HistoryPanel,
  Message,
} from "./App-style.js";

export default function Home() {
  const [intent, setIntent] = useState("");
  const [style, setStyle] = useState("Formal");
  const [language, setLanguage] = useState("English");
  const [response, setResponse] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const toneOptions = [
    { value: "Formal", label: "Formal" },
    { value: "Casual", label: "Casual" },
    { value: "Polite Push", label: "Polite Push" },
    { value: "Concise & Direct", label: "Concise & Direct" },
    { value: "Humorous", label: "Humorous" },
    { value: "Creative", label: "Creative" },
  ];

  const languageOptions = [
    { value: "English", label: "English" },
    { value: "Danish", label: "Dansk" },
    { value: "Chinese", label: "中文" },
  ];

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
        body: JSON.stringify({
          intent,
          style,
          language,
          history: history || [],
        }),
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
        { role: "assistant", content: parsed },
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
    <PageContainer className="page-home">
      <ChatBox>
        <Title>Hey Write!</Title>

        <IntentTextarea
          rows={5}
          placeholder="Describe what you want to write, e.g., an invitation email for a meeting"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
        />

        <Selectors>
          <SelectGroup>
            <Label>Choose Tone</Label>
            <Select
              styles={StyledSelect}
              options={toneOptions}
              value={toneOptions.find((option) => option.value === style)}
              onChange={(selectedOption) => setStyle(selectedOption.value)}
              isSearchable={false}
            />
          </SelectGroup>

          <SelectGroup>
            <Label>Language</Label>
            <Select
              styles={StyledSelect}
              options={languageOptions}
              value={languageOptions.find(
                (option) => option.value === language
              )}
              onChange={(selectedOption) => setLanguage(selectedOption.value)}
              isSearchable={false}
            />
          </SelectGroup>
        </Selectors>

        <ResponseControls>
          {lastResponse && (
            <UndoButton onClick={handleUndo}>
              ⬅️ Back to Last Version
            </UndoButton>
          )}
          <ResetButton onClick={() => setHistory([])}>
            🔄 Reset Conversation
          </ResetButton>
        </ResponseControls>

        <GenerateButtons>
          <GenerateButton onClick={handleSubmitWithTemplate} disabled={loading}>
            Generate with Template
          </GenerateButton>
          <GenerateButton onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Writing... It takes around 1 minute"
              : "✨ Generate something wild"}
          </GenerateButton>
        </GenerateButtons>

        {response && (
          <ResponseBox>
            <ResponseTitle>Your Draft</ResponseTitle>
            <CopyButton onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </CopyButton>
            <ResponseText>{response}</ResponseText>
          </ResponseBox>
        )}
      </ChatBox>

      <HistoryPanel>
        <h2>🕒 Conversation History</h2>
        {history.map((msg, index) => (
          <Message key={index} className={msg.role}>
            <strong>{msg.role === "user" ? "You" : "HeyWrite"}:</strong>
            <p>{msg.content}</p>
          </Message>
        ))}
      </HistoryPanel>
    </PageContainer>
  );
}
