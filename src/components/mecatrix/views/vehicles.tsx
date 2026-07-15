"use client";

import * as React from "react";
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
import { Car, Plus, Trash2, Wrench, Cpu, Calendar, Fuel, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNav } from "@/lib/mecatrix/nav-store";
import { motion, AnimatePresence } from "framer-motion";

interface Vehicle {
  id: string; nickname: string; manufacturer: string; model: string; year: number;
  engineType: string; displacement: string | null; fuelSystem: string | null;
  vin: string | null; photoUrl: string | null; notes: string | null;
  createdAt: string;
}

export function VehiclesView() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const { setView } = useNav();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function addVehicle(form: FormData) {
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success("Vehicle added to your garage");
      setOpen(false);
      load();
    } catch {
      toast.error("Failed to add vehicle");
    }
  }

  async function remove(id: string) {
    try {
      await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      setVehicles((v) => v.filter((x) => x.id !== id));
      toast.success("Vehicle removed");
    } catch {
      toast.error("Failed to remove vehicle");
    }
  }

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Your Garage"
        title="Vehicle Library"
        description="Register and manage your vehicles. Each vehicle keeps its own diagnosis & maintenance history."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full bg-gradient-to-r from-amber to-amber/80 text-amber-foreground hover:opacity-90">
                <Plus className="h-4 w-4" /> Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Register a Vehicle</DialogTitle>
              </DialogHeader>
              <form action={addVehicle} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nickname"><Input name="nickname" required placeholder="Daily Driver" /></Field>
                  <Field label="Year"><Input name="year" type="number" defaultValue={new Date().getFullYear()} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Manufacturer"><Input name="manufacturer" required placeholder="Toyota" /></Field>
                  <Field label="Model"><Input name="model" required placeholder="Corolla" /></Field>
                </div>
                <Field label="Engine Type">
                  <Select name="engineType" defaultValue="Gasoline">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gasoline">Gasoline</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Displacement"><Input name="displacement" placeholder="2.0L" /></Field>
                  <Field label="Fuel System"><Input name="fuelSystem" placeholder="GDI" /></Field>
                </div>
                <Field label="VIN (optional)"><Input name="vin" placeholder="1HGCM82633A123456" /></Field>
                <Field label="Notes (optional)"><Textarea name="notes" rows={2} placeholder="Anything notable…" /></Field>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-amber text-amber-foreground hover:bg-amber/90">Save Vehicle</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading your garage…
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState onAdd={() => setOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {vehicles.map((v) => (
              <motion.div key={v.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <GlassCard className="p-5 group hover:border-amber/40 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-11 w-11 rounded-xl bg-amber/10 flex items-center justify-center text-amber">
                      <Car className="h-5 w-5" />
                    </div>
                    <button onClick={() => remove(v.id)} className="text-muted-foreground hover:text-[oklch(0.68_0.21_25)] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="font-semibold text-sm">{v.nickname}</div>
                  <div className="text-xs text-muted-foreground">{v.manufacturer} {v.model} · {v.year}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="outline" className="text-[10px] gap-1"><Cpu className="h-2.5 w-2.5" />{v.engineType}</Badge>
                    {v.displacement && <Badge variant="outline" className="text-[10px]">{v.displacement}</Badge>}
                    {v.fuelSystem && <Badge variant="outline" className="text-[10px]"><Fuel className="h-2.5 w-2.5" />{v.fuelSystem}</Badge>}
                  </div>
                  {v.notes && <p className="text-[11px] text-muted-foreground mt-3 line-clamp-2">{v.notes}</p>}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-border/60">
                    <Button size="sm" variant="ghost" onClick={() => setView("diagnose")} className="gap-1 text-amber hover:text-amber hover:bg-amber/10 h-8 text-xs">
                      <Wrench className="h-3.5 w-3.5" /> Diagnose
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setView("history")} className="gap-1 text-muted-foreground hover:text-foreground h-8 text-xs">
                      <Calendar className="h-3.5 w-3.5" /> History
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <GlassCard className="p-12 text-center">
      <div className="h-14 w-14 rounded-2xl bg-amber/10 flex items-center justify-center text-amber mx-auto mb-3">
        <Car className="h-7 w-7" />
      </div>
      <div className="font-semibold">Your garage is empty</div>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Register your first vehicle to start tracking diagnoses, maintenance and repair history.
      </p>
      <Button onClick={onAdd} className="mt-4 gap-2 bg-amber text-amber-foreground hover:bg-amber/90">
        <Plus className="h-4 w-4" /> Add your first vehicle
      </Button>
    </GlassCard>
  );
}
