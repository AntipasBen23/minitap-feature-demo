// File: frontend/src/components/results/ResultsStage.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useDemoStore } from "@/lib/demo/store";
import type { Result, Variant } from "@/lib/demo/types";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function ResultsStage() {
  const variants = useDemoStore((s) => s.variants);
  const runs = useDemoStore((s) => s.runs);
  const results = useDemoStore((s) => s.results);

  const scoreResults = useDemoStore((s) => s.scoreResults);

  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  const ranked = useMemo(() => {
    const byScore = [...results].sort((a, b) => b.score - a.score);
    return byScore;
  }, [results]);

  const activeResult = useMemo(() => {
    const id = activeVariantId ?? ranked[0]?.variantId ?? null;
    return ranked.find((r) => r.variantId === id) ?? null;
  }, [ranked, activeVariantId]);

  const activeVariant = useMemo(() => {
    if (!activeResult) return null;
    return variants.find((v) => v.id === activeResult.variantId) ?? null;
  }, [activeResult, variants]);

  const runCount = useMemo(() => runs.length, [runs]);

  function onScore() {
    scoreResults();
    setTimeout(() => {
      const r = useDemoStore.getState().results;
      const top = [...r].sort((a, b) => b.score - a.score)[0];
      setActiveVariantId(top?.variantId ?? null);
    }, 0);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Ranking */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs tracking-wider text-white/60">
              SCORING ENGINE
            </div>
            <div className="mt-1 text-lg font-semibold">Rank variants</div>
            <p className="mt-1 text-sm text-white/70">
              Scores combine proxy metrics (friction/time/errors) + guardrail
              checks. No “LLM vibes” scoring.
            </p>
          </div>

          <button
            onClick={onScore}
            disabled={variants.length === 0 || runCount === 0}
            className={cx(
              "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
              variants.length === 0 || runCount === 0
                ? "cursor-not-allowed bg-white/10 text-white/40"
                : "bg-gradient-to-r from-violet-500/70 via-fuchsia-500/60 to-indigo-500/70 hover:brightness-110"
            )}
          >
            Score & rank
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
          <div className="text-xs font-semibold text-white/80">Prereqs</div>
          <div className="mt-1 text-xs text-white/65">
            {variants.length === 0
              ? "Generate variants first."
              : "Variants: OK."}
          </div>
          <div className="mt-1 text-xs text-white/65">
            {runCount === 0 ? "Run evaluation harness first." : `Runs: ${runCount} (OK).`}
          </div>
        </div>

        {/* List */}
        <div className="mt-4 space-y-2">
          {ranked.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0b0a1b] p-6">
              <div className="text-sm font-semibold">No results yet</div>
              <div className="mt-1 text-sm text-white/70">
                Queue runs → Run now → then score & rank.
              </div>
              <div className="mt-3 grid gap-2 text-xs text-white/60">
                <div>• Score (0–100)</div>
                <div>• Estimated impact range</div>
                <div>• Confidence + guardrails</div>
              </div>
            </div>
          ) : (
            ranked.map((r) => {
              const v = variants.find((vv) => vv.id === r.variantId) ?? null;
              const active = r.variantId === (activeVariantId ?? ranked[0].variantId);
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveVariantId(r.variantId)}
                  className={cx(
                    "w-full rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-violet-400/40 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-indigo-500/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {v?.title ?? "Variant"}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {r.why}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.recommended && (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-100">
                          Recommended
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/80">
                        {r.score}/100
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <MiniStat
                      label="Impact"
                      value={`${r.breakdown.estimatedImpact.min}-${r.breakdown.estimatedImpact.max}${
                        r.breakdown.estimatedImpact.unit === "percent" ? "%" : ""
                      }`}
                    />
                    <MiniStat
                      label="Confidence"
                      value={`${r.breakdown.confidencePct}%`}
                    />
                    <MiniStat
                      label="Friction"
                      value={`${r.breakdown.frictionDeltaSec.toFixed(1)}s`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="text-sm font-semibold">Recommendation</div>
        <div className="mt-1 text-xs text-white/60">
          Breakdown + guardrails (traceable).
        </div>

        {!activeResult || !activeVariant ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4 text-sm text-white/70">
            Score variants to see a recommended option.
          </div>
        ) : (
          <>
            <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{activeVariant.title}</div>
                  <div className="mt-1 text-xs text-white/60">{activeResult.why}</div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/80">
                  {activeResult.score}/100
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Mini label="Estimated impact" value={`${activeResult.breakdown.estimatedImpact.min}-${activeResult.breakdown.estimatedImpact.max}${activeResult.breakdown.estimatedImpact.unit === "percent" ? "%" : ""}`} />
                <Mini label="Confidence" value={`${activeResult.breakdown.confidencePct}%`} />
                <Mini label="Friction delta" value={`${activeResult.breakdown.frictionDeltaSec.toFixed(1)}s`} />
                <Mini label="Error density" value={`${activeResult.breakdown.errorDensityDelta.toFixed(2)}`} />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
              <div className="text-xs font-semibold text-white/80">Guardrails</div>
              <div className="mt-2 space-y-2">
                {activeResult.breakdown.guardrails.map((g, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="text-xs text-white/75">{g.key}</span>
                    <span
                      className={cx(
                        "rounded-full border px-2 py-0.5 text-[11px]",
                        g.ok
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                          : "border-rose-400/20 bg-rose-400/10 text-rose-100"
                      )}
                    >
                      {g.ok ? "OK" : "FAIL"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-[11px] text-white/45">
                Recommendation is reproducible: goal spec + variants + run logs +
                scoring inputs.
              </div>
            </div>
          </>
        )}
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[11px] text-white/55">{label}</div>
      <div className="mt-0.5 text-xs font-semibold text-white/85">{value}</div>
    </div>
  );
}