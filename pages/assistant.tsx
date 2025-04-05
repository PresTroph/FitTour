// pages/assistant.tsx
"use client";

import { useState } from "react";
import TopNavbar from "@/components/TopNavbar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([...updatedMessages, { role: "assistant", content: "Error getting response." }]);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages([...updatedMessages, { role: "assistant", content: "Failed to connect to assistant." }]);
    }

    setLoading(false);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar />
      <div className="max-w-3xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">AI Fitness Assistant</h1>

        <div className="flex-1 overflow-y-auto mb-4 space-y-3 border p-4 rounded bg-white shadow-sm">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-black text-white self-end text-right"
                  : "bg-gray-100 text-gray-800 self-start"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Ask anything about fitness, travel workouts, nutrition..."
            rows={3}
            className="p-3 border rounded-lg focus:outline-none focus:ring w-full resize-none"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-black text-white px-4 py-2 rounded hover:opacity-90 transition"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
