"use client";

import { AppShell } from "@/components/mecatrix/app-shell";
import { ViewRouter } from "@/components/mecatrix/view-router";

export default function Home() {
  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  );
}
