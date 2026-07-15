"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer, GlassCard, PageHeading } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot, Send, Sparkles, Trash2, User, Wrench, Cpu, AlertTriangle,
  GraduationCap, Loader2, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Msg { role: "user" | "assistant"; content: string; id: string; }

const SUGGESTIONS = [
  { icon: Cpu, text: "Explain how a turbocharger works", level: "beginner" },
  { icon: AlertTriangle, text: "My engine overheats uphill — what could be wrong?", level: "intermediate" },
  { icon: Wrench, text: "Step-by-step: how to bleed brake lines", level: "intermediate" },
  { icon: GraduationCap, text: "What's the difference between MPI and GDI?", level: "beginner" },
  { icon: Zap, text: "How do I diagnose a parasitic battery drain?", level: "expert" },
];

const LEVELS = ["beginner", "intermediate", "expert"] as const;
type Level = (typeof LEVELS)[number];

const WELCOME: Msg = {
  id: "welcome",
  role: "assistant",
  content:
    "🔧 Hello — I'm **MecaAI**, your AI mechanic mentor.\n\nI can teach you automotive mechanics, explain any engine component, walk you through repairs step by step, and help diagnose problems. I'll adapt to your skill level.\n\nWhat would you like to learn or diagnose today?",
};

export function MecaAIView() {
  const [messages, setMessages] = React.useState<Msg[]>([WELCOME]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [level, setLevel] = React.useState<Level>("intermediate");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/meca-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillLevel: level,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const reply = data?.reply?.trim() || "I couldn't generate a response. Please try again.";
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    } catch {
      toast.error("MecaAI is unavailable right now. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([WELCOME]);
    setInput("");
  }

  return (
    <PageContainer>
      <PageHeading
        eyebrow="AI Assistant"
        title="MecaAI"
        description="Your intelligent automotive mechanic mentor — teaches, diagnoses & guides repairs."
        actions={
          <Button variant="outline" size="sm" onClick={reset} className="gap-2">
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        }
      />

      {/* Skill level selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground mr-1">Skill level:</span>
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize border transition-colors",
              level === l
                ? "bg-amber/15 text-amber border-amber/40"
                : "bg-card/50 text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <GlassCard className="flex flex-col h-[calc(100vh-340px)] min-h-[460px] overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto mcx-scroll p-4 sm:p-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center border",
                    m.role === "assistant"
                      ? "bg-gradient-to-br from-amber/20 to-emerald/20 border-amber/30 text-amber"
                      : "bg-card border-border text-muted-foreground"
                  )}
                >
                  {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "assistant"
                      ? "bg-card/70 border border-border/60 mcx-inset-ring"
                      : "bg-amber/10 border border-amber/30 text-foreground"
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:bg-muted [&_code]:text-amber [&_strong]:text-foreground">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center border bg-gradient-to-br from-amber/20 to-emerald/20 border-amber/30 text-amber">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-card/70 border border-border/60 flex items-center gap-2">
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-amber animate-bounce"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </span>
                <span className="text-xs text-muted-foreground">MecaAI is thinking…</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.text}
                  onClick={() => send(s.text)}
                  className="flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-amber hover:border-amber/40 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {s.text}
                </button>
              );
            })}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask MecaAI anything about vehicles…"
              rows={1}
              className="min-h-[44px] max-h-32 resize-none bg-card/60 rounded-xl"
            />
            <Button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="rounded-xl h-11 w-11 p-0 bg-gradient-to-br from-amber to-amber/80 text-amber-foreground hover:opacity-90 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            MecaAI provides educational guidance — always verify critical repairs with service manuals.
          </div>
        </div>
      </GlassCard>
    </PageContainer>
  );
}
