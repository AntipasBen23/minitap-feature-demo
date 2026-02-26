// File: frontend/src/components/runs/RunsStage.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useDemoStore, demoDevices } from "@/lib/demo/store";
import type { Run, RunStatus, Variant } from "@/lib/demo/types";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function RunsStage() {
  const variants = useDemoStore((s) => s.variants);
  const runs = useDemoStore((s) => s.runs);

  const queueRuns = useDemoStore((s) => s.queueRuns);
  const simulateRunProgress = useDemoStore((s) => s.simulateRunProgress);

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const summary = useMemo(() => summarizeRuns(runs), [runs]);

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? null,
    [runs, selectedRunId]
  );

  const selectedVariant = useMemo(() => {
    if (!selectedRun) return null;
    return variants.find((v) => v.id === selectedRun.variantId) ?? null;
  }, [selectedRun, variants]);

  function onQueue() {
    queueRuns();
    setSelectedRunId(null);
  }

  function onRun() {
    simulateRunProgress();
    // auto-select first retrying/failed-like, else first run
    const next =
      useDemoStore.getState().runs.find((r) => r.status === "retrying") ??
      useDemoStore.getState().runs[0] ??
      null;
    setSelectedRunId(next?.id ?? null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Queue + matrix */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs tracking-wider text-white/60">
              EVALUATION HARNESS
            </div>
            <div className="mt-1 text-lg font-semibold">Device runs</div>
            <p className="mt-1 text-sm text-white/70">
              Queue variants across a device matrix. Simulate CI-like logs,
              retries, and pixel-perfect scoring.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onQueue}
              disabled={variants.length === 0}
              className={cx(
                "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10",
                variants.length === 0 && "cursor-not-allowed opacity-50"
              )}
            >
              Queue runs
            </button>
            <button
              onClick={onRun}
              disabled={runs.length === 0}
              className={cx(
                "rounded-xl bg-gradient-to-r from-violet-500/70 via-fuchsia-500/60 to-indigo-500/70 px-4 py-2 text-sm font-semibold text-white hover:brightness-110",
                runs.length === 0 && "cursor-not-allowed opacity-50"
              )}
            >
              Run now
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Stat label="Total" value={String(summary.total)} />
          <Stat label="Queued" value={String(summary.queued)} />
          <Stat label="Running" value={String(summary.running)} />
          <Stat label="Passed" value={String(summary.passed)} />
        </div>

        {/* Device matrix */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b0a1b] p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-white/80">
              Device matrix
            </div>
            <div className="text-[11px] text-white/45">
              {demoDevices.length} targets
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {demoDevices.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="text-xs font-semibold text-white/85">
                  {d.label}
                </div>
                <div className="mt-0.5 text-[11px] text-white/55">{d.os}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Runs table */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b0a1b] p-4">
          <div className="text-xs font-semibold text-white/80">
            Run list (latest first)
          </div>

          {runs.length === 0 ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Queue runs after generating variants.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {[...runs].slice(0, 16).map((r) => (
                <RunRow
                  key={r.id}
                  run={r}
                  variant={variants.find((v) => v.id === r.variantId) ?? null}
                  active={r.id === selectedRunId}
                  onClick={() => setSelectedRunId(r.id)}
                />
              ))}
              {runs.length > 16 && (
                <div className="pt-1 text-[11px] text-white/45">
                  Showing 16 of {runs.length}. (That’s enough for a demo.)
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Run detail */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="text-sm font-semibold">Run detail</div>
        <div className="mt-1 text-xs text-white/60">
          Logs + artifacts (simulated).
        </div>

        {!selectedRun ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4 text-sm text-white/70">
            Select a run from the list to view logs and artifacts.
          </div>
        ) : (
          <>
            <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-white/60">Variant</div>
                  <div className="mt-0.5 text-sm font-semibold">
                    {selectedVariant?.title ?? "Unknown"}
                  </div>
                </div>
                <span
                  className={cx(
                    "rounded-full border px-2 py-0.5 text-[11px]",
                    statusBadge(selectedRun.status)
                  )}
                >
                  {selectedRun.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Mini label="Pixel-perfect" value={scoreLabel(selectedRun)} />
                <Mini
                  label="Crash-free"
                  value={
                    typeof selectedRun.crashFree === "boolean"
                      ? selectedRun.crashFree
                        ? "Yes"
                        : "No"
                      : "—"
                  }
                />
                <Mini
                  label="Duration"
                  value={
                    typeof selectedRun.durationSec === "number"
                      ? `${selectedRun.durationSec}s`
                      : "—"
                  }
                />
                <Mini
                  label="Artifacts"
                  value={
                    selectedRun.screenshotLabels.length
                      ? `${selectedRun.screenshotLabels.length} screenshots`
                      : "—"
                  }
                />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
              <div className="text-xs font-semibold text-white/80">Logs</div>
              <div className="mt-2 space-y-2">
                {(selectedRun.logs.length
                  ? selectedRun.logs
                  : ["Queued — waiting for runner…"]
                ).map((line, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75"
                  >
                    <span className="text-white/45">#{i + 1}</span> {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
              <div className="text-xs font-semibold text-white/80">
                Screenshot artifacts
              </div>
              <div className="mt-2 grid gap-2">
                {(selectedRun.screenshotLabels.length
                  ? selectedRun.screenshotLabels
                  : ["—"]
                ).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="text-xs text-white/75">{s}</span>
                    <span className="text-[11px] text-white/45">
                      placeholder
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RunRow({
  run,
  variant,
  active,
  onClick,
}: {
  run: Run;
  variant: Variant | null;
  active: boolean;
  onClick: () => void;
}) {
  const device = demoDevices.find((d) => d.id === run.deviceId);
  return (
    <button
      onClick={onClick}
      className={cx(
        "w-full rounded-xl border px-3 py-3 text-left transition",
        active
          ? "border-violet-400/40 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-indigo-500/15"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-white/85">
            {variant?.title ?? "Variant"} · {device?.label ?? run.deviceId}
          </div>
          <div className="mt-1 text-[11px] text-white/55">
            {device?.os ?? ""}{" "}
            {run.durationSec ? `· ${run.durationSec}s` : ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {typeof run.pixelPerfectScore === "number" && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/75">
              {run.pixelPerfectScore}/100
            </span>
          )}
          <span
            className={cx(
              "rounded-full border px-2 py-0.5 text-[11px]",
              statusBadge(run.status)
            )}
          >
            {run.status}
          </span>
        </div>
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] text-white/55">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
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

function statusBadge(status: RunStatus) {
  switch (status) {
    case "passed":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    case "failed":
      return "border-rose-400/20 bg-rose-400/10 text-rose-100";
    case "retrying":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    case "running":
      return "border-violet-400/20 bg-violet-400/10 text-violet-100";
    default:
      return "border-white/10 bg-white/5 text-white/70";
  }
}

function scoreLabel(run: Run) {
  if (typeof run.pixelPerfectScore !== "number") return "—";
  return `${run.pixelPerfectScore}/100`;
}

function summarizeRuns(runs: Run[]) {
  const total = runs.length;
  const queued = runs.filter((r) => r.status === "queued").length;
  const running = runs.filter((r) => r.status === "running").length;
  const passed = runs.filter((r) => r.status === "passed").length;
  return { total, queued, running, passed };
}