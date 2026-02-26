// File: frontend/src/components/variants/VariantsStage.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useDemoStore } from "@/lib/demo/store";
import type { Variant } from "@/lib/demo/types";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function VariantsStage() {
  const goal = useDemoStore((s) => s.goal);
  const metrics = useDemoStore((s) => s.metrics);
  const variants = useDemoStore((s) => s.variants);

  const generateVariants = useDemoStore((s) => s.generateVariants);

  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(() => {
    const id = activeId ?? variants[0]?.id ?? null;
    return variants.find((v) => v.id === id) ?? null;
  }, [variants, activeId]);

  function onGenerate() {
    generateVariants();
    // select second variant by default (often “winner” later)
    setTimeout(() => {
      const v = useDemoStore.getState().variants;
      setActiveId(v[1]?.id ?? v[0]?.id ?? null);
    }, 0);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Variant list */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs tracking-wider text-white/60">
              CONTROLLED DIFF GENERATION
            </div>
            <div className="mt-1 text-lg font-semibold">Generate variants</div>
            <p className="mt-1 text-sm text-white/70">
              The agent proposes small, shippable changes with hypotheses and
              patch summaries.
            </p>
          </div>

          <button
            onClick={onGenerate}
            className="rounded-xl bg-gradient-to-r from-violet-500/70 via-fuchsia-500/60 to-indigo-500/70 px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            Generate variants
          </button>
        </div>

        {/* Context panel */}
        <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
          <div className="text-xs font-semibold text-white/80">Context</div>
          <div className="mt-1 text-xs text-white/65">
            {goal
              ? `Goal: ${goal.metricName} · ${goal.baselineValue}${
                  goal.unit === "percent" ? "%" : ""
                } → ${goal.targetValue}${goal.unit === "percent" ? "%" : ""}`
              : "No goal saved yet — variants will still generate for the demo."}
          </div>
          <div className="mt-1 text-xs text-white/65">
            {metrics
              ? `Metrics source: ${metrics.source} · funnel steps: ${metrics.funnel.length}`
              : "No metrics snapshot yet — sync data to make this feel extra real."}
          </div>
        </div>

        {/* Variants grid */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {variants.length === 0 ? (
            <EmptyState />
          ) : (
            variants.map((v) => {
              const active = v.id === (activeId ?? variants[0].id);
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveId(v.id)}
                  className={cx(
                    "rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-violet-400/40 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-indigo-500/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{v.title}</div>
                      <div className="mt-1 text-xs text-white/60">
                        Hypothesis: {v.hypothesis}
                      </div>
                    </div>
                    <span
                      className={cx(
                        "mt-0.5 rounded-full border px-2 py-0.5 text-[11px]",
                        riskBadge(v.risk)
                      )}
                    >
                      {v.risk} risk
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <MiniStat label="Files" value={String(v.patchSummary.filesChanged)} />
                    <MiniStat label="+LOC" value={String(v.patchSummary.additions)} />
                    <MiniStat label="-LOC" value={String(v.patchSummary.deletions)} />
                  </div>

                  <div className="mt-3 text-[11px] text-white/45">
                    Generated: {new Date(v.createdAt).toLocaleString()}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active variant detail */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="text-sm font-semibold">Variant detail</div>
        <div className="mt-1 text-xs text-white/60">
          Patch diff + UI preview labels (demo).
        </div>

        {!active ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4 text-sm text-white/70">
            Generate variants to view details.
          </div>
        ) : (
          <>
            <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{active.title}</div>
                  <div className="mt-1 text-xs text-white/60">
                    {active.hypothesis}
                  </div>
                </div>
                <span
                  className={cx(
                    "rounded-full border px-2 py-0.5 text-[11px]",
                    riskBadge(active.risk)
                  )}
                >
                  {active.risk} risk
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-[11px] text-white/55">UI before</div>
                  <div className="mt-0.5 text-xs font-semibold text-white/85">
                    {active.uiPreview.beforeLabel}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-[11px] text-white/55">UI after</div>
                  <div className="mt-0.5 text-xs font-semibold text-white/85">
                    {active.uiPreview.afterLabel}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
              <div className="text-xs font-semibold text-white/80">
                Unified diff (simulated)
              </div>
              <pre className="mt-2 max-h-[330px] overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 text-[11px] leading-relaxed text-white/80">
{active.diffText}
              </pre>
              <div className="mt-2 text-[11px] text-white/45">
                In a real system this would be a controlled patch against the
                repo + lint/test gates.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0a1b] p-6 md:col-span-2">
      <div className="text-sm font-semibold">No variants yet</div>
      <div className="mt-1 text-sm text-white/70">
        Click <span className="font-semibold">Generate variants</span> to create
        3 controlled, shippable options with diffs and hypotheses.
      </div>
      <div className="mt-3 grid gap-2 text-xs text-white/60">
        <div>• Variant titles + risk labels</div>
        <div>• Patch summaries (+/- LOC, files changed)</div>
        <div>• Diff artifacts for engineering review</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[11px] text-white/55">{label}</div>
      <div className="mt-0.5 text-xs font-semibold text-white/85">{value}</div>
    </div>
  );
}

function riskBadge(risk: Variant["risk"]) {
  switch (risk) {
    case "low":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    case "high":
      return "border-rose-400/20 bg-rose-400/10 text-rose-100";
    default:
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }
}