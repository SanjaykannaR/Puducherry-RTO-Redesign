"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";

// ── Types ──
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  navigation?: { path: string; hint: string } | null;
  loginSuggested?: boolean;
}

interface ChatApiResponse {
  response: string;
  language: string;
  navigation?: { path: string; hint: string } | null;
  login_suggested?: boolean;
}

const CHATBOT_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const WELCOME_MESSAGES: Record<string, string> = {
  en: "Hello! I'm the Puducherry RTO Assistant. I can help you with:\n\n• Driving License (new, renewal, duplicate)\n• Learner's License (LLR)\n• Vehicle Registration\n• Traffic Challans & Penalties\n• Fees & Documents\n• Navigation on this portal\n\nHow can I help you today?",
  ta: "வணக்கம்! நான் புதுச்சேரி ஆர்.டி.ஓ உதவியாளர். நான் உங்களுக்கு இவற்றில் உதவ முடியும்:\n\n• ஓட்டுநர் உரிமம் (புதிய, புதுப்பித்தல், நகல்)\n• கற்றோர் உரிமம் (எல்.எல்.ஆர்.)\n• வாகன பதிவு\n• போக்குவரத்து சால்லன் & அபராதங்கள்\n• கட்டணங்கள் & ஆவணங்கள்\n• இந்த போர்ட்டலில் வழிசெலுத்தல்\n\nஇன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
  fr: "Bonjour ! Je suis l'assistant RTO de Pondichéry. Je peux vous aider avec :\n\n• Permis de conduire (nouveau, renouvellement, double)\n• Permis d'apprenti (LLR)\n• Immatriculation de véhicules\n• Contraventions & pénalités\n• Frais & documents\n• Navigation sur ce portail\n\nComment puis-je vous aider aujourd'hui ?",
};

const QUICK_REPLIES: Record<string, string[]> = {
  en: [
    "How to renew my driving license?",
    "Documents needed for new license",
    "Vehicle registration process",
    "Traffic fine amounts",
  ],
  ta: [
    "ஓட்டுநர் உரிமத்தை எப்படி புதுப்பிப்பது?",
    "புதிய உரிமத்திற்கு தேவையான ஆவணங்கள்",
    "வாகன பதிவு செயல்முறை",
    "போக்குவரத்து அபராத தொகை",
  ],
  fr: [
    "Comment renouveler mon permis ?",
    "Documents nécessaires pour un nouveau permis",
    "Processus d'immatriculation",
    "Montant des amendes",
  ],
};

const LANG_OPTIONS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export default function ChatWidget() {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<string>(locale || "en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.en,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, lang, messages.length]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${CHATBOT_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, language: lang, history }),
      });

      if (!res.ok) throw new Error("Chat API error");

      const data: ChatApiResponse = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        navigation: data.navigation || null,
        loginSuggested: data.login_suggested || false,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update language if API detected a different one
      if (data.language && data.language !== lang) {
        setLang(data.language);
      }
    } catch {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content:
          lang === "ta"
            ? "மன்னிக்கவும், ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும் அல்லது எங்கள் ஹெல்ப்லைனை தொடர்பு கொள்ளவும்: +91 413 222 1234"
            : lang === "fr"
              ? "Désolé, une erreur s'est produite. Veuillez réessayer ou contacter notre assistance : +91 413 222 1234"
              : "Sorry, something went wrong. Please try again or contact our helpline: +91 413 222 1234",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating Chat Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-110 active:scale-95"
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900" style={{ height: "min(560px, calc(100vh - 8rem))" }}>
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                RTO
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {lang === "ta" ? "ஆர்.டி.ஓ உதவியாளர்" : lang === "fr" ? "Assistant RTO" : "RTO Assistant"}
                </h3>
                <p className="text-xs text-blue-100">
                  {lang === "ta" ? "புதுச்சேரி போக்குவரத்து துறை" : lang === "fr" ? "Département des Transports" : "Puducherry Transport Dept"}
                </p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex gap-1">
              {LANG_OPTIONS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    lang === l.code ? "bg-white text-blue-600" : "text-blue-100 hover:bg-blue-500"
                  }`}
                  title={l.label}
                >
                  {l.flag}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Navigation button */}
                  {msg.navigation && (
                    <button
                      onClick={() => (window.location.href = msg.navigation!.path)}
                      className="mt-2 flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {msg.navigation.hint}
                    </button>
                  )}

                  {/* Login suggestion */}
                  {msg.loginSuggested && (
                    <button
                      onClick={() => (window.location.href = "/login")}
                      className="mt-2 flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      {lang === "ta" ? "உள்நுழைய" : lang === "fr" ? "Se connecter" : "Log In"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Replies (only show when no messages beyond welcome) */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES[lang]?.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(reply)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  lang === "ta"
                    ? "உங்கள் கேள்வியை உள்ளிடவும்..."
                    : lang === "fr"
                      ? "Tapez votre question..."
                      : "Type your question..."
                }
                className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
