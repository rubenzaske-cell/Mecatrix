"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer, GlassCard, PageHeading, LevelBadge } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/mecatrix/nav-store";
import { TRAINING_SCENARIOS, getEngine, type TrainingScenario } from "@/data/catalog";
import {
  ClipboardList, Timer, Target, CheckCircle2, XCircle, ArrowRight,
  Trophy, RotateCcw, Lightbulb, Wrench, Activity, Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Feedback {
  diagnosticAccuracy: number;
  repairAccuracy: number;
  timeTaken: string;
  mistakes: number;
  recommendation: string;
}

export function TrainingView() {
  const [active, setActive] = React.useState<TrainingScenario | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(0);
  const [startTime, setStartTime] = React.useState(0);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [mistakes, setMistakes] = React.useState(0);
  const { setView } = useNav();

  function start(s: TrainingScenario) {
    setActive(s);
    setSelected(null);
    setStep(0);
    setStartTime(Date.now());
    setFeedback(null);
    setMistakes(0);
  }

  function submitDiagnosis() {
    if (!active) return;
    if (selected === active.correctComponentId) {
      toast.success("Correct diagnosis!");
      setStep(1);
    } else {
      setMistakes((m) => m + 1);
      toast.error("Not quite — review the symptoms and try again");
    }
  }

  function nextStep() {
    if (!active) return;
    if (step < active.steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  function finish() {
    if (!active) return;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const diagAccuracy = mistakes === 0 ? 100 : Math.max(40, 100 - mistakes * 25);
    const repairAccuracy = Math.max(60, 100 - mistakes * 10);
    setFeedback({
      diagnosticAccuracy: diagAccuracy,
      repairAccuracy,
      timeTaken: `${min}m ${sec}s`,
      mistakes,
      recommendation:
        mistakes === 0
          ? "Flawless execution! You diagnosed and repaired efficiently. Try a harder scenario next."
          : mistakes <= 2
          ? "Solid work. Review the symptom-to-component correlation to improve diagnostic speed."
          : "Keep practicing — focus on systematic diagnosis: verify symptoms, isolate the system, then the component.",
    });
  }

  function reset() {
    setActive(null); setSelected(null); setStep(0); setFeedback(null); setMistakes(0);
  }

  if (active && feedback) {
    return <ResultsView scenario={active} feedback={feedback} onReset={reset} onVisualize={() => setView("workshop", { engineId: active.engineId })} />;
  }

  if (active) {
    const engine = getEngine(active.engineId);
    return (
      <PageContainer>
        <PageHeading
          eyebrow="Training Simulator"
          title={active.title}
          description={active.scenario}
          actions={<Button variant="outline" size="sm" onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Exit</Button>}
        />
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main task */}
          <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-amber" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber">Reported Symptom</span>
              </div>
              <p className="text-sm leading-relaxed">{active.symptom}</p>
              <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                Elapsed: <span className="font-mono text-foreground">{Math.floor((Date.now() - startTime) / 60000)}m {Math.floor(((Date.now() - startTime) / 1000) % 60)}s</span>
                · Estimated: {active.estimatedTime}
              </div>
            </GlassCard>

            {step === 0 ? (
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-amber" />
                  <h3 className="font-semibold text-sm">Step 1 — Diagnose the root cause</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Select the component most likely responsible for the symptom:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {engine.components.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c.id)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-2.5 text-left text-sm transition-colors",
                        selected === c.id ? "bg-amber/10 border-amber/40" : "border-border/60 hover:border-amber/30 bg-card/40"
                      )}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </button>
                  ))}
                </div>
                <Button onClick={submitDiagnosis} disabled={!selected} className="mt-4 w-full gap-2 bg-amber text-amber-foreground hover:bg-amber/90">
                  <CheckCircle2 className="h-4 w-4" /> Confirm Diagnosis
                </Button>
                {mistakes > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[oklch(0.68_0.21_25)]">
                    <XCircle className="h-3.5 w-3.5" /> {mistakes} incorrect attempt{mistakes > 1 ? "s" : ""}
                  </div>
                )}
              </GlassCard>
            ) : (
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-emerald" />
                  <h3 className="font-semibold text-sm">Step 2 — Guided Repair ({step}/{active.steps.length})</h3>
                </div>
                <div className="space-y-2 mb-4">
                  {active.steps.map((s, i) => (
                    <div key={i} className={cn(
                      "flex items-start gap-2.5 rounded-lg p-2.5 text-sm",
                      i < step ? "bg-emerald/5 border border-emerald/20" : i === step ? "bg-amber/10 border border-amber/30" : "bg-card/30 border border-border/40 opacity-60"
                    )}>
                      <span className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5",
                        i < step ? "bg-emerald text-emerald-foreground" : i === step ? "bg-amber text-amber-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {i < step ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                      </span>
                      <span className="text-xs leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={nextStep} className="w-full gap-2 bg-emerald text-emerald-foreground hover:bg-emerald/90">
                  {step < active.steps.length - 1 ? <>Next Step <ArrowRight className="h-4 w-4" /></> : <>Finish Repair <Trophy className="h-4 w-4" /></>}
                </Button>
              </GlassCard>
            )}
          </div>

          {/* Hint sidebar */}
          <div className="space-y-4">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Boxes className="h-4 w-4 text-amber" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Engine</span>
              </div>
              <div className="text-sm font-medium">{engine.name}</div>
              <div className="text-[11px] text-muted-foreground">{engine.category} · {engine.displacement}</div>
              <Button size="sm" variant="ghost" onClick={() => setView("workshop", { engineId: engine.id })} className="mt-2 gap-1 text-amber hover:text-amber hover:bg-amber/10 h-7 text-xs">
                Inspect 3D <ArrowRight className="h-3 w-3" />
              </Button>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber">Hint</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Think systematically: which system does the symptom point to? Then which component in that system is most likely to cause exactly this behavior?
              </p>
            </GlassCard>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Scenario selection
  return (
    <PageContainer>
      <PageHeading
        eyebrow="Practice Safely"
        title="Virtual Training Mode"
        description="Diagnose and repair simulated mechanical failures. Get detailed performance feedback without risking real components."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TRAINING_SCENARIOS.map((s, i) => {
          const engine = getEngine(s.engineId);
          return (
            <motion.button key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} onClick={() => start(s)} className="text-left">
              <GlassCard className="p-5 h-full hover:border-amber/40 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-10 w-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <LevelBadge level={s.difficulty} />
                </div>
                <div className="font-semibold text-sm">{s.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.scenario}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Badge variant="outline" className="text-[10px]">{engine.name}</Badge>
                  <Badge variant="outline" className="text-[10px]"><Timer className="h-2.5 w-2.5" /> {s.estimatedTime}</Badge>
                </div>
                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Diagnose & repair</span>
                  <span className="text-xs font-medium text-amber flex items-center gap-1">Start <ArrowRight className="h-3 w-3" /></span>
                </div>
              </GlassCard>
            </motion.button>
          );
        })}
      </div>
    </PageContainer>
  );
}

function ResultsView({ scenario, feedback, onReset, onVisualize }: {
  scenario: TrainingScenario; feedback: Feedback; onReset: () => void; onVisualize: () => void;
}) {
  return (
    <PageContainer>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
        <GlassCard className="p-8 max-w-2xl mx-auto text-center mcx-border-gradient">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber/20 to-emerald/20 flex items-center justify-center text-amber mx-auto mb-4">
            <Trophy className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Training Complete</h2>
          <p className="text-sm text-muted-foreground mt-1">{scenario.title}</p>

          <div className="grid grid-cols-2 gap-3 mt-6 text-left">
            <Metric label="Diagnostic Accuracy" value={`${feedback.diagnosticAccuracy}%`} good={feedback.diagnosticAccuracy >= 80} />
            <Metric label="Repair Accuracy" value={`${feedback.repairAccuracy}%`} good={feedback.repairAccuracy >= 80} />
            <Metric label="Completion Time" value={feedback.timeTaken} good />
            <Metric label="Mistakes Made" value={String(feedback.mistakes)} good={feedback.mistakes === 0} />
          </div>

          <div className="mt-5 rounded-xl bg-amber/5 border border-amber/20 p-4 text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber mb-1.5">
              <Lightbulb className="h-3.5 w-3.5" /> MecaAI Recommendation
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{feedback.recommendation}</p>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onVisualize} className="flex-1 gap-2 border-emerald/30 text-emerald hover:bg-emerald/10">
              <Boxes className="h-4 w-4" /> Visualize Engine
            </Button>
            <Button onClick={onReset} className="flex-1 gap-2 bg-amber text-amber-foreground hover:bg-amber/90">
              <RotateCcw className="h-4 w-4" /> New Scenario
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </PageContainer>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={cn("rounded-xl border p-3", good ? "bg-emerald/5 border-emerald/20" : "bg-amber/5 border-amber/20")}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-xl font-bold mt-1", good ? "text-emerald" : "text-amber")}>{value}</div>
    </div>
  );
}
