"use client";

import * as React from "react";
import { PageContainer, GlassCard, PageHeading } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useNav } from "@/lib/mecatrix/nav-store";
import {
  Moon, Sun, Bell, Volume2, Zap, Shield, Globe, Database,
  Trash2, Info, ChevronRight, Languages,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { setView } = useNav();
  const [prefs, setPrefs] = React.useState({
    notifications: true,
    sound: true,
    animations: true,
    autoDiagnose: false,
    highContrast: false,
  });

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("mcx-prefs");
      if (stored) setPrefs((p) => ({ ...p, ...JSON.parse(stored) }));
    } catch { /* ignore */ }
  }, []);

  function update<K extends keyof typeof prefs>(key: K, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem("mcx-prefs", JSON.stringify(next));
  }

  function clearData() {
    ["mcx-courses", "mcx-profile", "mcx-prefs"].forEach((k) => localStorage.removeItem(k));
    toast.success("Local progress data cleared");
  }

  return (
    <PageContainer>
      <PageHeading eyebrow="Preferences" title="Settings" description="Customize Mecatrix to your workflow and environment." />

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Appearance */}
        <GlassCard className="p-5">
          <SectionHeader icon={theme === "dark" ? Moon : Sun} title="Appearance" />
          <Row label="Theme" desc="Switch between dark and light mode">
            <div className="flex items-center gap-1 rounded-full border border-border p-0.5">
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${theme === "dark" ? "bg-amber/20 text-amber" : "text-muted-foreground"}`}
              >
                <Moon className="h-3 w-3" /> Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${theme === "light" ? "bg-amber/20 text-amber" : "text-muted-foreground"}`}
              >
                <Sun className="h-3 w-3" /> Light
              </button>
            </div>
          </Row>
          <Row label="Animations" desc="Enable smooth transitions">
            <Switch checked={prefs.animations} onCheckedChange={(v) => update("animations", v)} />
          </Row>
          <Row label="High contrast" desc="Increase visual contrast">
            <Switch checked={prefs.highContrast} onCheckedChange={(v) => update("highContrast", v)} />
          </Row>
        </GlassCard>

        {/* AI & Diagnosis */}
        <GlassCard className="p-5">
          <SectionHeader icon={Zap} title="AI & Diagnosis" />
          <Row label="MecaAI skill level" desc="Adapt AI explanations">
            <Select defaultValue="intermediate">
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Auto-diagnose uploads" desc="Run diagnosis when media is added">
            <Switch checked={prefs.autoDiagnose} onCheckedChange={(v) => update("autoDiagnose", v)} />
          </Row>
          <Row label="Language" desc="Interface language">
            <Select defaultValue="en">
              <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </GlassCard>

        {/* Notifications */}
        <GlassCard className="p-5">
          <SectionHeader icon={Bell} title="Notifications" />
          <Row label="Push notifications" desc="Diagnosis & course updates">
            <Switch checked={prefs.notifications} onCheckedChange={(v) => update("notifications", v)} />
          </Row>
          <Row label="Sound effects" desc="Audio feedback on actions">
            <Switch checked={prefs.sound} onCheckedChange={(v) => update("sound", v)} />
          </Row>
        </GlassCard>

        {/* Data & Privacy */}
        <GlassCard className="p-5">
          <SectionHeader icon={Shield} title="Data & Privacy" />
          <Row label="Stored diagnoses" desc="Saved to your local database">
            <Button size="sm" variant="outline" onClick={() => setView("history")} className="h-8 text-xs gap-1.5">
              View <ChevronRight className="h-3 w-3" />
            </Button>
          </Row>
          <Row label="Clear local progress" desc="Reset courses & profile data">
            <Button size="sm" variant="outline" onClick={clearData} className="h-8 text-xs gap-1.5 border-[oklch(0.68_0.21_25)]/30 text-[oklch(0.68_0.21_25)] hover:bg-[oklch(0.68_0.21_25)]/10">
              <Trash2 className="h-3 w-3" /> Clear
            </Button>
          </Row>
          <Row label="Privacy" desc="Diagnoses are estimates, not guarantees">
            <Button size="sm" variant="ghost" onClick={() => toast.info("Mecatrix stores data locally on this device.")} className="h-8 text-xs gap-1.5">
              <Info className="h-3 w-3" /> Learn
            </Button>
          </Row>
        </GlassCard>
      </div>

      {/* About */}
      <GlassCard className="p-5 mt-4">
        <SectionHeader icon={Info} title="About Mecatrix" />
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <Info2 icon={Database} label="Version" value="1.0.0" />
          <Info2 icon={Globe} label="Engine" value="Next.js 16 + R3F" />
          <Info2 icon={Zap} label="AI Engine" value="MecaAI v1" />
        </div>
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          Mecatrix combines AI vision, audio analysis, immersive 3D engines and intelligent
          guidance into one platform for learners, students and professional mechanics. All
          diagnostics are confidence-ranked estimates — always verify critical repairs with
          official service manuals.
        </p>
      </GlassCard>
    </PageContainer>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-amber" />
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
      <div className="min-w-0 pr-3">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Info2({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/40 p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
