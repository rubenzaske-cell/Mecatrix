"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer, GlassCard, PageHeading, StatusBadge } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useNav } from "@/lib/mecatrix/nav-store";
import {
  Camera, Mic, MicOff, X, ImagePlus, Loader2, Stethoscope,
  Car, ShieldAlert, Lightbulb, Wrench, ArrowRight, AudioLines, FileVideo, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Status } from "@/data/catalog";

interface Finding {
  component: string;
  status: Status;
  confidence: number;
  symptom: string;
  cause: string;
  explanation: string;
  recommendation: string;
  tools: string[];
  difficulty: string;
}
interface DiagnosisResult {
  vehicleIdentification: {
    manufacturer: string; model: string; year: string; engineType: string;
    displacement: string; fuelSystem: string; confidence: number;
  };
  overallConfidence: number;
  severity: Status;
  summary: string;
  findings: Finding[];
  recommendedActions: string[];
}

export function DiagnoseView() {
  const { setView } = useNav();
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [symptoms, setSymptoms] = React.useState("");
  const [vehicleContext, setVehicleContext] = React.useState("");
  const [recording, setRecording] = React.useState(false);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string>("");
  const [transcript, setTranscript] = React.useState("");
  const [transcribing, setTranscribing] = React.useState(false);
  const [diagnosing, setDiagnosing] = React.useState(false);
  const [stage, setStage] = React.useState("");
  const [result, setResult] = React.useState<DiagnosisResult | null>(null);

  const mediaRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function onPickPhotos(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).slice(0, 5);
    const dataUrls = await Promise.all(arr.map(fileToDataUrl));
    setPhotos((p) => [...p, ...dataUrls].slice(0, 5));
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        await transcribeBlob(blob);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }

  async function transcribeBlob(blob: Blob) {
    setTranscribing(true);
    try {
      const base64 = await blobToBase64(blob);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64 }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTranscript(data.transcript || "(no speech detected)");
      if (!data.transcript) toast.info("No speech detected in the recording — try describing symptoms.");
    } catch {
      toast.error("Transcription failed");
    } finally {
      setTranscribing(false);
    }
  }

  async function runDiagnosis() {
    if (photos.length === 0 && !transcript && !symptoms.trim()) {
      toast.error("Add at least one photo, voice note, or symptom");
      return;
    }
    setDiagnosing(true);
    setResult(null);
    try {
      setStage("Analyzing engine photos with vision AI…");
      const audioBase64 = audioBlob ? await blobToBase64(audioBlob) : "";
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos,
          audioTranscript: transcript,
          symptoms,
          vehicleContext,
          audio: audioBase64, // also pass so backend could re-transcribe if needed
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || "Diagnosis failed");
      }
      const data = await res.json();
      setResult(data.result);
      toast.success("Diagnosis complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Diagnosis failed");
    } finally {
      setDiagnosing(false);
      setStage("");
    }
  }

  function reset() {
    setPhotos([]); setSymptoms(""); setVehicleContext("");
    setAudioBlob(null); setAudioUrl(""); setTranscript(""); setResult(null);
  }

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Intelligent Diagnosis"
        title="Diagnose My Vehicle"
        description="Upload engine photos, record a voice note of symptoms, and let MecaAI combine all evidence into a confidence-ranked diagnosis."
      />

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Input column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Photos */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-amber" />
                <h3 className="font-semibold text-sm">Engine Photos</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">{photos.length}/5</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onPickPhotos(e.target.files)}
            />
            {photos.length === 0 ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-border/70 hover:border-amber/50 bg-card/30 p-8 text-center transition-colors"
              >
                <ImagePlus className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm font-medium">Add engine photos</div>
                <div className="text-xs text-muted-foreground mt-1">Up to 5 · engine bay, components, leaks</div>
              </button>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border/60 group">
                    <img src={src} alt={`Engine ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-border/70 hover:border-amber/50 flex items-center justify-center text-muted-foreground"
                  >
                    <ImagePlus className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </GlassCard>

          {/* Audio */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AudioLines className="h-4 w-4 text-emerald" />
                <h3 className="font-semibold text-sm">Voice Note / Engine Audio</h3>
              </div>
              {transcript && (
                <button onClick={() => { setTranscript(""); setAudioBlob(null); setAudioUrl(""); }} className="text-[11px] text-muted-foreground hover:text-foreground">
                  clear
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center transition-all shrink-0",
                  recording
                    ? "bg-[oklch(0.68_0.21_25)] text-white mcx-pulse-ring relative"
                    : "bg-emerald/15 text-emerald hover:bg-emerald/25"
                )}
                aria-label={recording ? "Stop recording" : "Start recording"}
              >
                {recording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              <div className="flex-1 min-w-0 w-full">
                {recording ? (
                  <div className="flex items-center gap-1 h-8">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <span
                        key={i}
                        className="flex-1 bg-emerald rounded-full mcx-equalize-bar"
                        style={{ animationDelay: `${i * 0.06}s`, height: "100%" }}
                      />
                    ))}
                    <span className="text-xs text-[oklch(0.68_0.21_25)] font-medium ml-2">REC</span>
                  </div>
                ) : audioUrl ? (
                  <audio src={audioUrl} controls className="w-full h-9" />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Describe the symptoms & sounds you hear (e.g. "clicking when cold, smells like fuel").
                  </p>
                )}
                {transcribing && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Transcribing audio…
                  </div>
                )}
                {transcript && !transcribing && (
                  <div className="mt-2 rounded-lg bg-emerald/5 border border-emerald/20 p-2.5 text-xs">
                    <span className="text-emerald font-medium">Transcript: </span>
                    {transcript}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Symptoms */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="h-4 w-4 text-amber" />
              <h3 className="font-semibold text-sm">Symptoms & Vehicle Context</h3>
            </div>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe symptoms: when they occur, under what conditions, any warning lights, recent repairs…"
              rows={3}
              className="bg-card/60 resize-none mb-2"
            />
            <input
              value={vehicleContext}
              onChange={(e) => setVehicleContext(e.target.value)}
              placeholder="Optional: vehicle make/model/year, mileage, engine"
              className="w-full rounded-lg bg-card/60 border border-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber/40"
            />
          </GlassCard>
        </div>

        {/* Action / result column */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-5 mcx-border-gradient">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber" />
              <h3 className="font-semibold text-sm">Run AI Diagnosis</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              MecaAI will combine your photos, audio transcript, and symptoms into a confidence-ranked report.
            </p>
            <Button
              onClick={runDiagnosis}
              disabled={diagnosing}
              className="w-full rounded-xl bg-gradient-to-r from-amber to-amber/80 text-amber-foreground hover:opacity-90 gap-2 h-11"
            >
              {diagnosing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stethoscope className="h-4 w-4" />}
              {diagnosing ? "Analyzing…" : "Diagnose Now"}
            </Button>
            {diagnosing && stage && (
              <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
                {stage}
              </div>
            )}
            {(photos.length > 0 || transcript || symptoms) && !diagnosing && (
              <button onClick={reset} className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground">
                Reset all inputs
              </button>
            )}
            <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-amber">{photos.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Photos</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald">{transcript ? "1" : "0"}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Audio</div>
              </div>
              <div>
                <div className="text-lg font-bold">{symptoms ? "✓" : "—"}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Symptoms</div>
              </div>
            </div>
          </GlassCard>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <DiagnosisCard result={result} onVisualize={() => setView("workshop")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}

function DiagnosisCard({ result, onVisualize }: { result: DiagnosisResult; onVisualize: () => void }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber" /> Diagnostic Report
        </h3>
        <StatusBadge status={result.severity} label={result.severity === "ok" ? "Normal" : result.severity === "warn" ? "Inspect" : "Critical"} />
      </div>

      {/* Vehicle ID */}
      <div className="rounded-xl bg-card/50 border border-border/60 p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Car className="h-3.5 w-3.5 text-amber" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle Identification</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <Field label="Manufacturer" value={result.vehicleIdentification.manufacturer} />
          <Field label="Model" value={result.vehicleIdentification.model} />
          <Field label="Year" value={result.vehicleIdentification.year} />
          <Field label="Engine" value={result.vehicleIdentification.engineType} />
          <Field label="Displacement" value={result.vehicleIdentification.displacement} />
          <Field label="Fuel System" value={result.vehicleIdentification.fuelSystem} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">ID confidence</span>
          <Progress value={result.vehicleIdentification.confidence} className="h-1.5 flex-1" />
          <span className="text-[10px] font-medium">{result.vehicleIdentification.confidence}%</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{result.summary}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall confidence</span>
        <Progress value={result.overallConfidence} className="h-1.5 flex-1" />
        <span className="text-xs font-semibold text-amber">{result.overallConfidence}%</span>
      </div>

      {/* Findings */}
      <div className="space-y-2 mb-3 max-h-72 overflow-y-auto mcx-scroll pr-1">
        {result.findings.map((f, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <StatusBadge status={f.status} />
                {f.component}
              </span>
              <span className="text-[10px] text-muted-foreground">{f.confidence}%</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{f.explanation}</p>
          </div>
        ))}
      </div>

      {/* Recommended actions */}
      {result.recommendedActions?.length > 0 && (
        <div className="rounded-lg bg-amber/5 border border-amber/20 p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber">Recommended Actions</span>
          </div>
          <ul className="space-y-1">
            {result.recommendedActions.map((a, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                <span className="text-amber">→</span> {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={onVisualize} variant="outline" className="w-full gap-2 border-emerald/30 text-emerald hover:bg-emerald/10">
        <Wrench className="h-4 w-4" />
        Visualize in 3D Workshop
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </GlassCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
      <div className="text-xs font-medium">{value || "—"}</div>
    </div>
  );
}

// Helpers
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = r.result as string;
      resolve(dataUrl.includes(",") ? dataUrl.split(",")[1]! : dataUrl);
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
