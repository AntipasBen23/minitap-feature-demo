// File: frontend/src/app/page.tsx
"use client";

import React, { useMemo, useState } from "react";

type StageKey = "goal" | "data" | "variants" | "runs" | "results" | "audit";

const STAGES: { key: StageKey; label: string; desc: string }[] = [
  { key: "goal", label: "Goal", desc: "Define objective + constraints" },
  { key: "data", label: "Data", desc: "Connect + sync analytics" },
  { key: "variants", label: "Variants", desc: "Generate controlled options" },
  { key: "runs", label: "Runs", desc: "Queue device evaluations" },
  { key: "results", label: "Results", desc: "Score + rank outcomes" },
  { key: "audit", label: "Audit Log", desc: "Trace every action" },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function Page() {
  const [stage, setStage] = useState<StageKey>("goal");
  const [progress, setProgress] = useState<Record<StageKey, boolean>>({
    goal: false,
    data: false,
    variants: false,
    runs: false,
    results: false,
    audit: true,
  });

  const stageMeta = useMemo(
    () => STAGES.find((s) => s.key === stage)!,
    [stage]
  );

  return (
    <main className="min-h-screen bg-[#070615] text-white">
      {/* Background (minitap-ish: violet/indigo glow + glass) */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[420px] w-[520px] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-[420px] w-[520px] rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl gap-5 px-4 py-6 md:px-6 md:py-8">
        {/* Sidebar */}
        <aside className="hidden w-[320px] shrink-0 md:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs tracking-wider text-white/60">
                  MINITAP · INTENT LAYER
                </div>
                <div className="mt-1 text-lg font-semibold">
                  Outcome-Aware Mode
                </div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Demo
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {STAGES.map((s) => {
                const active = s.key === stage;
                const done = progress[s.key];
                return (
                  <button
                    key={s.key}
                    onClick={() => setStage(s.key)}
                    className={cx(
                      "group w-full rounded-xl border px-3 py-3 text-left transition",
                      active
                        ? "border-violet-400/40 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-indigo-500/15"
                        : "border-white/10 bg-white/5 hover:bg-white/7"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cx(
                              "text-sm font-semibold",
                              active ? "text-white" : "text-white/90"
                            )}
                          >
                            {s.label}
                          </span>
                          {done && (
                            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] text-emerald-200">
                              Done
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-white/60">
                          {s.desc}
                        </div>
                      </div>

                      <div
                        className={cx(
                          "mt-0.5 h-2 w-2 rounded-full",
                          active
                            ? "bg-violet-300"
                            : done
                            ? "bg-emerald-300/80"
                            : "bg-white/20"
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/60">Quick Actions</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    setProgress((p) => ({
                      ...p,
                      goal: true,
                      data: false,
                      variants: false,
                      runs: false,
                      results: false,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  Reset Flow
                </button>
                <button
                  onClick={() =>
                    setProgress((p) => ({
                      ...p,
                      goal: true,
                      data: true,
                      variants: true,
                      runs: true,
                      results: true,
                    }))
                  }
                  className="rounded-lg bg-gradient-to-r from-violet-500/70 via-fuchsia-500/60 to-indigo-500/70 px-3 py-2 text-xs font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:brightness-110"
                >
                  Auto-Fill Demo
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main panel */}
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Top card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-wider text-white/60">
                  PIPELINE STAGE
                </div>
                <h1 className="mt-1 text-2xl font-semibold">
                  {stageMeta.label}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-white/70">
                  {stageMeta.desc}. This demo simulates async workflows, device
                  runs, and scoring — without a backend.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setProgress((p) => ({ ...p, [stage]: true }))
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
                >
                  Mark Done
                </button>
                <button
                  onClick={() => {
                    const idx = STAGES.findIndex((s) => s.key === stage);
                    const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
                    setStage(next.key);
                  }}
                  className="rounded-xl bg-gradient-to-r from-violet-500/70 via-fuchsia-500/60 to-indigo-500/70 px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Progress strip */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-white/55">
                <span>Workflow completion</span>
                <span>
                  {
                    Object.values(progress).filter(Boolean).length
                  }/{Object.keys(progress).length} stages
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400"
                  style={{
                    width: `${
                      (Object.values(progress).filter(Boolean).length /
                        Object.keys(progress).length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stage content (placeholder – we’ll implement per-stage in next files) */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Workspace</div>
                <span className="text-xs text-white/60">
                  Simulated · Deterministic
                </span>
              </div>
              <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
                <p className="text-sm text-white/75">
                  Next file: we’ll build the <span className="font-semibold">Goal</span>{" "}
                  stage UI (schema form + JSON preview) and a tiny in-memory
                  “simulation engine” to power async states.
                </p>
                <div className="mt-3 grid gap-2 text-xs text-white/60">
                  <div>• Goal schema (metric, baseline, target, constraints)</div>
                  <div>• Inline validation + “Goal Spec” JSON preview</div>
                  <div>• Action log entries written on every event</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="text-sm font-semibold">System Status</div>
              <div className="mt-3 space-y-2">
                <StatusRow label="Connectors" value="Simulated" />
                <StatusRow label="Queue" value="Idle" />
                <StatusRow label="Device Grid" value="4 devices" />
                <StatusRow label="Scoring" value="Ready" />
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Design tokens</div>
                <div className="mt-2 space-y-1 text-xs text-white/70">
                  <div>• Gradient: violet → fuchsia → indigo</div>
                  <div>• Glass: bg-white/5 + border-white/10</div>
                  <div>• Surface: #0b0a1b</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile stage selector (small screens) */}
          <div className="md:hidden">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
              <div className="mb-2 text-xs text-white/60">Stages</div>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStage(s.key)}
                    className={cx(
                      "rounded-full border px-3 py-1.5 text-xs",
                      stage === s.key
                        ? "border-violet-400/40 bg-violet-500/15 text-white"
                        : "border-white/10 bg-white/5 text-white/75"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-xs text-white/65">{label}</span>
      <span className="text-xs font-semibold text-white/85">{value}</span>
    </div>
  );
}