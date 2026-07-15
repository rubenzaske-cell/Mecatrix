"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer, GlassCard, PageHeading } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Wrench, CheckCircle2, X, ListChecks, Target, BookOpen, Sparkles, Loader2, ShieldAlert,
} from "lucide-react";
import { TOOLS, type ToolItem } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = ["All", "Wrenches", "Sockets", "Screwdrivers", "Specialty", "Diagnostic", "Lifting"] as const;

export function ToolsView() {
  const [cat, setCat] = React.useState<(typeof CATEGORIES)[number]>("All");
  const [selected, setSelected] = React.useState<ToolItem | null>(null);
  const filtered = cat === "All" ? TOOLS : TOOLS.filter((t) => t.category === cat);

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Interactive Catalog"
        title="Tool Collection"
        description={`${TOOLS.length} professional tools with interactive tutorials, correct procedures and recommended applications.`}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Tool list */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                  cat === c ? "bg-amber/15 text-amber border-amber/40" : "bg-card/50 text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                onClick={() => setSelected(t)}
                className="text-left"
              >
                <GlassCard className={cn(
                  "p-4 h-full hover:border-amber/40 transition-colors",
                  selected?.id === t.id && "border-amber/40 bg-amber/5"
                )}>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${t.color}22`, color: t.color }}>
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{t.category}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">{t.description}</p>
                </GlassCard>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <ToolDetail tool={selected} onClose={() => setSelected(null)} />
              </motion.div>
            ) : (
              <GlassCard className="p-5 text-center sticky top-20">
                <div className="h-12 w-12 rounded-xl bg-amber/10 flex items-center justify-center text-amber mx-auto mb-3">
                  <Wrench className="h-6 w-6" />
                </div>
                <div className="font-semibold text-sm">Select a tool</div>
                <p className="text-xs text-muted-foreground mt-1">
                  View tutorials, correct procedures and ask MecaAI to verify you've chosen the right tool for the job.
                </p>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}

function ToolDetail({ tool, onClose }: { tool: ToolItem; onClose: () => void }) {
  const [task, setTask] = React.useState("");
  const [checking, setChecking] = React.useState(false);
  const [verdict, setVerdict] = React.useState<null | { correct: boolean; reason: string; alternative?: string }>(null);

  async function verify() {
    if (!task.trim()) {
      toast.error("Describe the task first");
      return;
    }
    setChecking(true);
    setVerdict(null);
    try {
      const res = await fetch("/api/meca-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillLevel: "intermediate",
          messages: [{
            role: "user",
            content: `I want to use the "${tool.name}" (${tool.category}) for this task: "${task}". Is this the CORRECT tool? Respond with VALID JSON ONLY: {"correct": boolean, "reason": "short explanation", "alternative": "better tool name if incorrect, else null"}. Consider safety and proper procedure.`,
          }],
        }),
      });
      const data = await res.json();
      const cleaned = (data.reply || "").replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        setVerdict(JSON.parse(match[0]));
      } else {
        setVerdict({ correct: true, reason: data.reply });
      }
    } catch {
      toast.error("Could not verify tool choice");
    } finally {
      setChecking(false);
    }
  }

  return (
    <GlassCard className="p-5 sticky top-20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: `${tool.color}22`, color: tool.color }}>
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">{tool.name}</div>
            <Badge variant="outline" className="text-[10px] mt-0.5">{tool.category}</Badge>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{tool.description}</p>

      <Block icon={Target} label="Recommended uses" color="text-amber">
        <ul className="space-y-0.5">{tool.uses.map((u, i) => <li key={i} className="flex gap-1.5"><span>•</span>{u}</li>)}</ul>
      </Block>

      <Block icon={ListChecks} label="Correct procedure" color="text-emerald">
        <ol className="space-y-0.5">{tool.procedure.map((p, i) => <li key={i} className="flex gap-1.5"><span className="text-emerald">{i + 1}.</span>{p}</li>)}</ol>
      </Block>

      <Block icon={BookOpen} label="Applications" color="text-[oklch(0.78_0.17_75)]">
        <div className="flex flex-wrap gap-1">
          {tool.applications.map((a) => <span key={a} className="rounded-md bg-card/60 border border-border/60 px-1.5 py-0.5 text-[10px]">{a}</span>)}
        </div>
      </Block>

      {/* AI verify tool choice */}
      <div className="mt-4 pt-4 border-t border-border/60">
        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber">
          <Sparkles className="h-3 w-3" /> Verify with MecaAI
        </div>
        <Textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe the task you want to do…"
          rows={2}
          className="bg-card/60 text-xs resize-none mb-2"
        />
        <Button onClick={verify} disabled={checking} size="sm" className="w-full gap-2 bg-amber text-amber-foreground hover:bg-amber/90">
          {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {checking ? "Checking…" : "Is this the right tool?"}
        </Button>
        {verdict && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn(
            "mt-2 rounded-lg border p-2.5 text-xs",
            verdict.correct ? "bg-emerald/5 border-emerald/30" : "bg-[oklch(0.68_0.21_25)]/5 border-[oklch(0.68_0.21_25)]/30"
          )}>
            <div className={cn("flex items-center gap-1.5 font-medium mb-1", verdict.correct ? "text-emerald" : "text-[oklch(0.68_0.21_25)]")}>
              {verdict.correct ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              {verdict.correct ? "Correct choice" : "Not ideal"}
            </div>
            <p className="text-muted-foreground leading-relaxed">{verdict.reason}</p>
            {verdict.alternative && verdict.alternative !== "null" && (
              <p className="text-amber mt-1">Recommended: {verdict.alternative}</p>
            )}
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}

function Block({ icon: Icon, label, color, children }: { icon: React.ComponentType<{ className?: string }>; label: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className={cn("flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider", color)}>
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-[11px] text-muted-foreground leading-relaxed pl-4">{children}</div>
    </div>
  );
}
