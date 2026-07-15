"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PageContainer, GlassCard, PageHeading, ProgressRing } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { COURSES, type Course } from "@/data/catalog";
import { LevelBadge } from "@/components/mecatrix/ui/primitives";
import { Clock, BookOpen, Play, CheckCircle2, ArrowRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNav } from "@/lib/mecatrix/nav-store";
import { toast } from "sonner";

export function CoursesView() {
  const [progress, setProgress] = React.useState<Record<string, number>>({});
  const { setView } = useNav();

  React.useEffect(() => {
    try { setProgress(JSON.parse(localStorage.getItem("mcx-courses") || "{}")); } catch { /* ignore */ }
  }, []);

  function save(p: Record<string, number>) {
    setProgress(p);
    localStorage.setItem("mcx-courses", JSON.stringify(p));
  }

  function start(c: Course) {
    const next = { ...progress, [c.id]: Math.max(progress[c.id] ?? 0, 5) };
    save(next);
    toast.success(`Starting: ${c.title}`);
  }

  function complete(c: Course) {
    const next = { ...progress, [c.id]: 100 };
    save(next);
    toast.success("Course marked complete");
  }

  const completedCount = Object.values(progress).filter((v) => v >= 100).length;

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Structured Learning"
        title="Training Courses"
        description={`${COURSES.length} expert-led courses from beginner theory to advanced diagnostics.`}
        actions={
          <div className="flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/5 px-3 py-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
            <span className="text-emerald font-medium">{completedCount}</span> completed
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COURSES.map((c, i) => {
          const p = progress[c.id] ?? 0;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
              <GlassCard className="h-full flex flex-col overflow-hidden hover:border-amber/40 transition-colors">
                <div className="relative h-28 overflow-hidden" style={{ background: `radial-gradient(circle at 30% 20%, ${c.accent}33, transparent 70%)` }}>
                  <div className="absolute inset-0 mcx-grid-bg opacity-40" />
                  <div className="absolute top-3 left-3"><LevelBadge level={c.level} /></div>
                  <div className="absolute top-3 right-3">
                    {p >= 100 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald/20 text-emerald border border-emerald/30 px-2 py-0.5 text-[10px] font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </span>
                    ) : p > 0 ? (
                      <span className="rounded-full bg-amber/20 text-amber border border-amber/30 px-2 py-0.5 text-[10px] font-medium">{p}%</span>
                    ) : null}
                  </div>
                  <div className="absolute bottom-2 right-3 text-amber">
                    <GraduationCap className="h-7 w-7" style={{ color: c.accent }} strokeWidth={1.4} />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1.5">
                    <Clock className="h-3 w-3" /> {c.duration} · <BookOpen className="h-3 w-3" /> {c.lessons} lessons
                  </div>
                  <div className="font-semibold text-sm leading-snug">{c.title}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2 flex-1">{c.description}</p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.topics.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-md bg-card/60 border border-border/60 px-1.5 py-0.5 text-[9px] text-muted-foreground">{t}</span>
                    ))}
                  </div>

                  {p > 0 && p < 100 && <Progress value={p} className="h-1 mt-3" />}

                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/60">
                    <Button size="sm" onClick={() => start(c)} className="flex-1 gap-1.5 bg-amber text-amber-foreground hover:bg-amber/90 h-8">
                      <Play className="h-3.5 w-3.5" /> {p > 0 ? "Continue" : "Start"}
                    </Button>
                    {p < 100 && (
                      <Button size="sm" variant="outline" onClick={() => complete(c)} className="h-8 text-xs">Mark done</Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => setView("training")} className="gap-2 border-emerald/30 text-emerald hover:bg-emerald/10">
          Ready to practice? Try Virtual Training
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </PageContainer>
  );
}
