"use client";

import { cn } from "@/lib/utils";

export function MecatrixLogo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative h-9 w-9 shrink-0">
        {/* Hexagonal engine node */}
        <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
          <defs>
            <linearGradient id="mcx-logo-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--amber)" />
              <stop offset="100%" stopColor="var(--emerald)" />
            </linearGradient>
          </defs>
          <path
            d="M24 3 41.2 13v22L24 45 6.8 35V13z"
            fill="none"
            stroke="url(#mcx-logo-g)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M24 13 33 18v12l-9 5-9-5V18z"
            fill="url(#mcx-logo-g)"
            opacity="0.18"
          />
          {/* Gear teeth */}
          <g stroke="var(--amber)" strokeWidth="2" strokeLinecap="round">
            <line x1="24" y1="17" x2="24" y2="21" />
            <line x1="24" y1="27" x2="24" y2="31" />
            <line x1="17" y1="24" x2="21" y2="24" />
            <line x1="27" y1="24" x2="31" y2="24" />
          </g>
          <circle cx="24" cy="24" r="3" fill="var(--amber)" />
        </svg>
        <div className="pointer-events-none absolute inset-0 rounded-full blur-md opacity-40 bg-amber" />
      </div>
      {withText && (
        <div className="leading-none">
          <div className="font-semibold tracking-tight text-[15px]">
            Meca<span className="text-amber">trix</span>
          </div>
          <div className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase">
            AI Automotive
          </div>
        </div>
      )}
    </div>
  );
}
