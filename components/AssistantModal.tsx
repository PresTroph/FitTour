// components/AssistantModal.tsx

"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function stripMarkdown(text: string) {
  return text
    .replace(/[*_~`>#+=-]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/!\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AssistantModal({ isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [speakResponse, setSpeakResponse] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
        setSpeakResponse(true);
      };

      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setLoadingTTS(false);
  };

  const playTTS = async (text: string) => {
    if (!text.trim()) return;
    const cleanText = stripMarkdown(text);

    try {
      stopSpeaking();
      setIsSpeaking(true);
      setLoadingTTS(true);

      const response = await fetch("/api/tts-elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to fetch TTS stream");
      }

      const reader = response.body.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      const audioData = await new Response(stream).blob();
      const audioUrl = URL.createObjectURL(audioData);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setLoadingTTS(false);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setLoadingTTS(false);
      };

      audio.play();
    } catch (err) {
      console.error("❌ Streaming TTS error:", err);
      setIsSpeaking(false);
      setLoadingTTS(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      const raw = data?.reply || data?.response || JSON.stringify(data);

      const cleaned =
        typeof raw === "string" && raw.startsWith("{\"reply\"")
          ? JSON.parse(raw).reply || raw
          : raw;

      const aiMessage = { role: "assistant", content: cleaned };
      setMessages((prev) => [...prev, aiMessage]);

      if (speakResponse) {
        await playTTS(cleaned);
        setSpeakResponse(false);
      }
    } catch (err) {
      console.error("❌ Assistant error:", err);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-lg text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Chat with AI Assistant</h2>

        <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto text-sm whitespace-pre-wrap mb-4">
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.role === "user" ? (
                <p className="font-medium text-right text-black bg-gray-200 p-2 rounded mb-1">
                  {msg.content}
                </p>
              ) : (
                <p className="text-gray-800 bg-white p-2 rounded">{msg.content}</p>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="text-sm text-gray-500 italic mt-2">Assistant is thinking...</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSpeakResponse(false);
            }}
            placeholder="Ask anything about workouts, features, fitness goals..."
            className="flex-grow border border-gray-300 rounded px-4 py-2 text-sm"
          />

          {/* ➤ Send */}
          <button
            onClick={handleSend}
            className="bg-black text-white text-sm px-4 py-2 rounded hover:opacity-90"
          >
            ➤
          </button>

          {/* 🎤 Mic */}
          <button
            onClick={startListening}
            className={`px-3 py-2 text-sm rounded ${isListening ? "bg-blue-700" : "bg-blue-500"} text-white`}
            title="Speak"
          >
            🎤
          </button>

          {/* 🔈 or ⏹️ or ⏳ */}
          {loadingTTS || isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className={`px-3 py-2 text-sm rounded ${
                loadingTTS ? "bg-yellow-400 animate-pulse" : "bg-red-500 hover:bg-red-600"
              } text-white`}
              title={loadingTTS ? "Preparing voice..." : "Stop speaking"}
            >
              {loadingTTS ? "⏳" : "⏹️"}
            </button>
          ) : (
            <button
              onClick={() => playTTS(messages[messages.length - 1]?.content || "")}
              className="px-3 py-2 text-sm rounded bg-green-500 text-white hover:bg-green-600"
              title="Play response"
            >
              🔈
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



