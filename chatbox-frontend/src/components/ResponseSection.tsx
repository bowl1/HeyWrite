import React from "react";
import { Button } from "./ui/button";
import { type Source } from "../api";

type ResponseSectionProps = {
  response: string;
  copied: boolean;
  onCopy: () => void;
  sources: Source[];
};

const ResponseSection = ({
  response,
  copied,
  onCopy,
  sources,
}: ResponseSectionProps) => {
  if (!response) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Answer</h2>
        <Button variant="ghost" size="sm" onClick={onCopy}>
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
          <div className="font-semibold text-slate-800">Sources</div>
          <ul className="mt-2 space-y-1">
            {sources.map((src, idx) => (
              <li
                key={`${src.source}-${src.page}-${idx}`}
                className="break-words"
              >
                <span>
                  Source: page {src.page}
                  {src.paragraph ? `, paragraph ${src.paragraph}` : ""}
                </span>
                {src.source ? (
                  <div className="text-slate-500">({src.source})</div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResponseSection;
