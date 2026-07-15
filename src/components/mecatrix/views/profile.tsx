"use client";

import * as React from "react";
import { PageContainer, GlassCard, PageHeading, ProgressRing, Stat } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Award, Wrench, GraduationCap, Cpu, Zap, Shield, TrendingUp, Edit3, Bot,
} from "lucide-react";
import { useNav } from "@/lib/mecatrix/nav-store";
import { COURSES } from "@/data/catalog";

export function ProfileView() {
  const { setView } = useNav();
  const [name, setName] = React.useState("Alex Mechanic");
  const [level, setLevel] = React.useState("Intermediate");
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("mcx-profile");
      if (stored) {
        const p = JSON.parse(stored);
        if (p.name) setName(p.name);
        if (p.level) setLevel(p.level);
      }
    } catch { /* ignore */ }
  }, []);

  function save() {
    localStorage.setItem("mcx-profile", JSON.stringify({ name, level }));
    setEditing(false);
  }

  // Compute some stats from localStorage
  const courseProgress = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("mcx-courses") || "{}"); } catch { return {}; }
  }, []);
  const completedCourses = Object.values(courseProgress).filter((v) => (v as number) >= 100).length;
  const xp = completedCourses * 120 + 340;
  const rank = xp >= 1000 ? "Master Mechanic" : xp >= 500 ? "Senior Mechanic" : "Apprentice";

  return (
    <PageContainer>
      <PageHeading eyebrow="Your Identity" title="User Profile" description="Your mechanic journey, achievements and skill progression." />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Identity card */}
        <GlassCard className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-amber/30">
                <AvatarFallback className="bg-gradient-to-br from-amber/20 to-emerald/20 text-2xl font-bold text-amber">
                  {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber flex items-center justify-center border-4 border-background">
                <Award className="h-3.5 w-3.5 text-amber-foreground" />
              </span>
            </div>
            {editing ? (
              <div className="w-full mt-4 space-y-2">
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-center rounded-lg bg-card/60 border border-input px-3 py-2 text-sm" />
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-lg bg-card/60 border border-input px-3 py-2 text-sm">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={save} className="flex-1 bg-amber text-amber-foreground hover:bg-amber/90">Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-semibold text-lg mt-4">{name}</div>
                <Badge variant="outline" className="mt-1 bg-amber/10 text-amber border-amber/30">{level} · {rank}</Badge>
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="mt-3 gap-1.5 text-xs">
                  <Edit3 className="h-3 w-3" /> Edit profile
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Experience</span>
              <span className="text-xs font-medium text-amber">{xp} XP</span>
            </div>
            <div className="flex items-center gap-3">
              <ProgressRing value={(xp % 500) / 5} size={56} />
              <div className="text-xs">
                <div className="font-medium">{500 - (xp % 500)} XP to next rank</div>
                <div className="text-muted-foreground">Keep diagnosing & learning!</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBlock icon={GraduationCap} value={completedCourses} label="Courses Done" accent="text-emerald" />
            <StatBlock icon={Wrench} value="12" label="Diagnoses" accent="text-amber" />
            <StatBlock icon={Cpu} value="8" label="Engines Studied" accent="text-amber" />
            <StatBlock icon={Zap} value="94%" label="AI Accuracy" accent="text-emerald" />
          </div>

          {/* Achievements */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-amber" />
              <h3 className="font-semibold text-sm">Achievements</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: Bot, label: "First Question", desc: "Asked MecaAI", unlocked: true, color: "text-emerald" },
                { icon: Shield, label: "Safe Player", desc: "Completed training", unlocked: true, color: "text-amber" },
                { icon: TrendingUp, label: "Fast Learner", desc: "3 courses", unlocked: completedCourses >= 3, color: "text-amber" },
                { icon: Cpu, label: "Engine Guru", desc: "All engines viewed", unlocked: false, color: "text-muted-foreground" },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.label} className={`rounded-xl border p-3 text-center ${a.unlocked ? "bg-card/60 border-border/60" : "bg-card/20 border-border/40 opacity-50"}`}>
                    <Icon className={`h-5 w-5 mx-auto mb-1.5 ${a.color}`} />
                    <div className="text-[11px] font-medium">{a.label}</div>
                    <div className="text-[9px] text-muted-foreground">{a.desc}</div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Quick actions */}
          <GlassCard className="p-5">
            <h3 className="font-semibold text-sm mb-3">Continue learning</h3>
            <div className="space-y-2">
              {COURSES.slice(0, 2).map((c) => (
                <button key={c.id} onClick={() => setView("courses")} className="w-full flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-3 text-left hover:border-amber/40 transition-colors">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${c.accent}22`, color: c.accent }}>
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.title}</div>
                    <div className="text-[11px] text-muted-foreground">{c.duration} · {c.lessons} lessons</div>
                  </div>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}

function StatBlock({ icon: Icon, value, label, accent }: { icon: React.ComponentType<{ className?: string }>; value: string | number; label: string; accent: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-3.5">
      <Icon className={`h-4 w-4 mb-2 ${accent}`} />
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
