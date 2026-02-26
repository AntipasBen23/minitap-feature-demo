// File: frontend/src/components/audit/AuditStage.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useDemoStore } from "@/lib/demo/store";
import type { AuditEvent } from "@/lib/demo/types";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AuditStage() {
  const auditLog = useDemoStore((s) => s.auditLog);
  const goal = useDemoStore((s) => s.goal);
  const metrics = useDemoStore((s) => s.metrics);
  const variants = useDemoStore((s) => s.variants);
  const runs = useDemoStore((s) => s.runs);
  const results = useDemoStore((s) => s.results);

  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => {
    const top = [...results].sort((a, b) => b.score - a.score)[0] ?? null;
    return {
      goal: goal
        ? `${goal.metricName}: ${goal.baselineValue}${
            goal.unit === "percent" ? "%" : ""
          } → ${goal.targetValue}${goal.unit === "percent" ? "%" : ""}`
        : "—",
      metrics: metrics ? `${metrics.source} @ ${prettyTime(metrics.syncedAt)}` : "—",
      variants: variants.length,
      runs: runs.length,
      recommendation: top
        ? `${top.score}/100 · ${
            variants.find((v) => v.id === top.variantId)?.title ?? "Variant"
          }`
        : "—",
    };
  }, [goal, metrics, variants, runs, results]);

  const exportText = useMemo(() => {
    const lines: string[] = [];
    lines.push("Intent Layer — Experiment Summary");
    lines.push("");
    lines.push(`Goal: ${summary.goal}`);
    lines.push(`Metrics: ${summary.metrics}`);
    lines.push(`Variants: ${summary.variants}`);
    lines.push(`Runs: ${summary.runs}`);
    lines.push(`Recommendation: ${summary.recommendation}`);
    lines.push("");
    lines.push("Audit trail:");
    auditLog.slice(0, 30).forEach((e) => {
      lines.push(`- ${prettyTime(e.ts)} · ${e.kind} · ${e.message}`);
    });
    return lines.join("\n");
  }, [auditLog, summary]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Timeline */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs tracking-wider text-white/60">
              TRACEABILITY
            </div>
            <div className="mt-1 text-lg font-semibold">Audit log</div>
            <p className="mt-1 text-sm text-white/70">
              Every action leaves a record: goal → data → variants → runs → scoring.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copySummary}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
            >
              {copied ? "Copied ✓" : "Copy summary"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b0a1b] p-4">
          <div className="text-xs font-semibold text-white/80">
            Timeline (latest first)
          </div>

          {auditLog.length === 0 ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              No events yet — create a goal, sync metrics, generate variants…
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {auditLog.slice(0, 28).map((e) => (
                <EventRow key={e.id} e={e} />
              ))}
              {auditLog.length > 28 && (
                <div className="pt-1 text-[11px] text-white/45">
                  Showing 28 of {auditLog.length}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="text-sm font-semibold">Experiment pack</div>
        <div className="mt-1 text-xs text-white/60">
          A shareable “one-click” summary a founder can forward.
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
          <div className="text-xs font-semibold text-white/80">Snapshot</div>

          <div className="mt-3 space-y-2">
            <Mini label="Goal" value={summary.goal} />
            <Mini label="Metrics" value={summary.metrics} />
            <Mini label="Variants" value={String(summary.variants)} />
            <Mini label="Runs" value={String(summary.runs)} />
            <Mini label="Recommendation" value={summary.recommendation} />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
          <div className="text-xs font-semibold text-white/80">
            Export text (demo)
          </div>
          <pre className="mt-2 max-h-[360px] overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 text-[11px] leading-relaxed text-white/80">
{exportText}
          </pre>
          <div className="mt-2 text-[11px] text-white/45">
            Next step in a real system: export to Markdown/PDF + attach run artifacts.
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({ e }: { e: AuditEvent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-white/85">
            {e.message}
          </div>
          <div className="mt-1 text-[11px] text-white/50">
            {prettyTime(e.ts)} · {e.kind}
          </div>
        </div>
        <span className={cx("rounded-full border px-2 py-0.5 text-[11px]", kindBadge(e.kind))}>
          {badgeLabel(e.kind)}
        </span>
      </div>
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

function prettyTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function badgeLabel(kind: AuditEvent["kind"]) {
  if (kind.startsWith("goal")) return "Goal";
  if (kind.startsWith("data")) return "Data";
  if (kind.startsWith("variants")) return "Variants";
  if (kind.startsWith("runs")) return "Runs";
  if (kind.startsWith("results")) return "Results";
  return "System";
}

function kindBadge(kind: AuditEvent["kind"]) {
  if (kind.startsWith("goal")) return "border-violet-400/20 bg-violet-400/10 text-violet-100";
  if (kind.startsWith("data")) return "border-indigo-400/20 bg-indigo-400/10 text-indigo-100";
  if (kind.startsWith("variants")) return "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100";
  if (kind.startsWith("runs")) return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  if (kind.startsWith("results")) return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
  return "border-white/10 bg-white/5 text-white/70";
}