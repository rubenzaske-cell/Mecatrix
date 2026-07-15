"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer, GlassCard, PageHeading } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  History, Plus, Trash2, Calendar, Wrench, User, Gauge, DollarSign,
  Loader2, ClipboardList, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Vehicle { id: string; nickname: string; manufacturer: string; model: string; year: number; }
interface Record {
  id: string; title: string; description: string | null; date: string; mileage: number | null;
  cost: number | null; technician: string | null; status: string; vehicle: Vehicle;
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald/15 text-emerald border-emerald/30",
  scheduled: "bg-amber/15 text-amber border-amber/30",
  in_progress: "bg-[oklch(0.78_0.17_75)]/15 text-[oklch(0.78_0.17_75)] border-[oklch(0.78_0.17_75)]/30",
};

export function HistoryView() {
  const [records, setRecords] = React.useState<Record[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const [r, v] = await Promise.all([
        fetch("/api/maintenance").then((r) => r.json()),
        fetch("/api/vehicles").then((r) => r.json()),
      ]);
      setRecords(r.records || []);
      setVehicles(v.vehicles || []);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function addRecord(form: FormData) {
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success("Maintenance record added");
      setOpen(false);
      load();
    } catch {
      toast.error("Failed to add record");
    }
  }

  async function remove(id: string) {
    try {
      await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
      setRecords((r) => r.filter((x) => x.id !== id));
      toast.success("Record deleted");
    } catch {
      toast.error("Failed to delete record");
    }
  }

  const totalCost = records.reduce((s, r) => s + (r.cost ?? 0), 0);

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Service Log"
        title="Maintenance History"
        description="A digital service record for every vehicle. Track repairs, costs and compare over time."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full bg-gradient-to-r from-amber to-amber/80 text-amber-foreground hover:opacity-90">
                <Plus className="h-4 w-4" /> Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add Maintenance Record</DialogTitle></DialogHeader>
              {vehicles.length === 0 ? (
                <div className="rounded-lg bg-amber/5 border border-amber/20 p-4 text-sm text-center">
                  Register a vehicle first in the Vehicle Library.
                </div>
              ) : (
                <form action={addRecord} className="space-y-3">
                  <Field label="Vehicle">
                    <Select name="vehicleId" required>
                      <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.nickname} ({v.manufacturer} {v.model})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Title"><Input name="title" required placeholder="Oil change & filter" /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Date"><Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
                    <Field label="Mileage"><Input name="mileage" type="number" placeholder="45000" /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Cost"><Input name="cost" type="number" step="0.01" placeholder="120.00" /></Field>
                    <Field label="Status">
                      <Select name="status" defaultValue="completed">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Technician"><Input name="technician" placeholder="Self / Shop name" /></Field>
                  <Field label="Notes"><Textarea name="description" rows={2} placeholder="What was done…" /></Field>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-amber text-amber-foreground hover:bg-amber/90">Save Record</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading history…
        </div>
      ) : records.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-amber/10 flex items-center justify-center text-amber mx-auto mb-3">
            <History className="h-7 w-7" />
          </div>
          <div className="font-semibold">No maintenance records yet</div>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Start logging oil changes, repairs and inspections to build a complete service history for your vehicles.
          </p>
        </GlassCard>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <StatBox icon={ClipboardList} label="Total Records" value={String(records.length)} accent="text-amber" />
            <StatBox icon={Wrench} label="Vehicles Serviced" value={String(new Set(records.map((r) => r.vehicleId)).size)} accent="text-emerald" />
            <StatBox icon={DollarSign} label="Total Spent" value={`$${totalCost.toFixed(0)}`} accent="text-amber" />
          </div>

          {/* Timeline */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber" /> Service Timeline
              </h3>
            </div>
            <ScrollArea className="max-h-[600px] pr-2 mcx-scroll">
              <div className="relative pl-6">
                {/* vertical line */}
                <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                <AnimatePresence>
                  {records.map((r, i) => (
                    <motion.div key={r.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="relative mb-4 group">
                      <span className="absolute -left-[18px] top-3 h-3 w-3 rounded-full border-2 border-background bg-amber" />
                      <GlassCard className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{r.title}</span>
                              <Badge variant="outline" className={cn("text-[10px] capitalize", STATUS_STYLES[r.status])}>{r.status.replace("_", " ")}</Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {r.vehicle.nickname} · {r.vehicle.manufacturer} {r.vehicle.model} {r.vehicle.year}
                            </div>
                            {r.description && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.description}</p>}
                            <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(r.date).toLocaleDateString()}</span>
                              {r.mileage != null && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{r.mileage.toLocaleString()} km</span>}
                              {r.technician && <span className="flex items-center gap-1"><User className="h-3 w-3" />{r.technician}</span>}
                              {r.cost != null && <span className="flex items-center gap-1 text-amber"><DollarSign className="h-3 w-3" />{r.cost.toFixed(2)}</span>}
                            </div>
                          </div>
                          <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-[oklch(0.68_0.21_25)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </GlassCard>
        </>
      )}
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-3.5">
      <Icon className={cn("h-4 w-4 mb-2", accent)} />
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
