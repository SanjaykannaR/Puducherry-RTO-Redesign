'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { MessageCircle, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

// ── Types ──
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Suggested questions to get the conversation started ──
const SUGGESTED_QUESTIONS = [
  'How do I apply for a driving license?',
  'What are the fees for vehicle registration?',
  'How to pay road tax online?',
  'What documents are needed for license renewal?',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm the Puducherry RTO AI Assistant. I can help you with driving licenses, vehicle registration, road tax, and other RTO services. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.post<{ response: string }>('/rto/assistant', {
        userMessage,
        currentStep: currentStep || undefined,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I couldn't process your request. ${err.message || 'Please try again later.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggested(q: string) {
    setInput(q);
  }

  function handleClear() {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hello! I'm the Puducherry RTO AI Assistant. I can help you with driving licenses, vehicle registration, road tax, and other RTO services. How can I help you today?",
      },
    ]);
  }

  return (
    <>
      <PageHero
        title="AI Assistant"
        subtitle="Get instant answers about Puducherry RTO services — powered by AI"
      />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <FadeInSection>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>RTO AI Assistant</CardTitle>
                      <CardDescription>Ask anything about RTO services</CardDescription>
                    </div>
                  </div>
                  {messages.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs">
                      Clear Chat
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* ── Chat Messages ── */}
                <div className="h-[420px] overflow-y-auto space-y-4 pr-2 mb-4 scroll-smooth">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted/50 rounded-bl-md'
                        }`}
                      >
                        <div className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5">
                          {msg.content}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── Suggested questions (only when chat is fresh) ── */}
                {messages.length <= 1 && !loading && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSuggested(q)}
                          className="text-xs bg-primary/5 hover:bg-primary/10 text-primary px-3 py-1.5 rounded-full transition-colors border border-primary/10"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Current step context (hidden, used for deeper context) ── */}
                {messages.length > 1 && (
                  <div className="mb-3">
                    <label className="text-xs text-muted-foreground block mb-1">
                      Context (optional — helps the AI give more relevant answers):
                    </label>
                    <Input
                      id="ai-context"
                      aria-label="Additional context for your question"
                      value={currentStep}
                      onChange={(e) => setCurrentStep(e.target.value)}
                      placeholder="e.g. filling vehicle registration form"
                      className="text-xs h-8"
                    />
                  </div>
                )}

                {/* ── Input form ── */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    id="ai-message"
                    aria-label="Type your question about RTO services"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || !input.trim()}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
