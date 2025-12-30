import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { type ConversationMessage } from "../lib/api";

type HistoryCardProps = {
  history: ConversationMessage[];
};

const HistoryCard = ({ history }: HistoryCardProps) => {
  return (
    <Card className="w-full border-pink-100/70 bg-white/90 shadow-xl shadow-pink-100/40 backdrop-blur lg:w-1/3">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm">
            🕒
          </span>
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
  );
};

export default HistoryCard;
