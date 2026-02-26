// File: frontend/src/app/page.tsx
"use client";

import React, { useMemo, useState } from "react";

import GoalStage from "@/components/goal/GoalStage";
import DataStage from "@/components/data/DataStage";
import VariantsStage from "@/components/variants/VariantsStage";
import RunsStage from "@/components/runs/RunsStage";
import ResultsStage from "@/components/results/ResultsStage";
import AuditStage from "@/components/audit/AuditStage";

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

  const stageMeta = useMemo(
    () => STAGES.find((s) => s.key === stage)!,
    [stage]
  );

  return (
    <main className="min-h-screen bg-[#070615] text-white">
      {/* Background (purple/indigo glass) */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[420px] w-[520px] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-[420px] w-[520px] rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

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
                        <div
                          className={cx(
                            "text-sm font-semibold",
                            active ? "text-white" : "text-white/90"
                          )}
                        >
                          {s.label}
                        </div>
                        <div className="mt-0.5 text-xs text-white/60">
                          {s.desc}
                        </div>
                      </div>

                      <div
                        className={cx(
                          "mt-0.5 h-2 w-2 rounded-full",
                          active ? "bg-violet-300" : "bg-white/20"
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/60">Tip</div>
              <div className="mt-1 text-xs text-white/70">
                Go in order for the full story: Goal → Data → Variants → Runs →
                Results → Audit.
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Stage header */}
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
                  {stageMeta.desc}. Everything below is frontend-only simulation
                  but designed to feel like real infra.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const idx = STAGES.findIndex((s) => s.key === stage);
                    const prev = STAGES[Math.max(idx - 1, 0)];
                    setStage(prev.key);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
                >
                  ← Prev
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
          </div>

          {/* Stage body */}
          {stage === "goal" && <GoalStage />}
          {stage === "data" && <DataStage />}
          {stage === "variants" && <VariantsStage />}
          {stage === "runs" && <RunsStage />}
          {stage === "results" && <ResultsStage />}
          {stage === "audit" && <AuditStage />}

          {/* Mobile stage selector */}
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