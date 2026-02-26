// File: frontend/src/components/data/DataStage.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useDemoStore } from "@/lib/demo/store";
import type { Connector, FunnelStep, MetricSource } from "@/lib/demo/types";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function DataStage() {
  const connectors = useDemoStore((s) => s.connectors);
  const metrics = useDemoStore((s) => s.metrics);
  const goal = useDemoStore((s) => s.goal);

  const updateConnectorStatus = useDemoStore((s) => s.updateConnectorStatus);
  const syncMetrics = useDemoStore((s) => s.syncMetrics);

  const [busyKey, setBusyKey] = useState<MetricSource | null>(null);

  const connected = useMemo(
    () => connectors.filter((c) => c.status === "connected"),
    [connectors]
  );

  async function onSync() {
    setBusyKey((connected[0]?.key ?? "firebase") as MetricSource);
    try {
      await syncMetrics();
    } finally {
      setBusyKey(null);
    }
  }

  function toggleConnect(c: Connector) {
    const next = c.status === "connected" ? "disconnected" : "connected";
    updateConnectorStatus(c.key, next);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Connectors */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs tracking-wider text-white/60">
              METRICS ADAPTERS
            </div>
            <div className="mt-1 text-lg font-semibold">Connect + sync</div>
            <p className="mt-1 text-sm text-white/70">
              Demo connectors simulate pulling funnels and normalizing events.
            </p>
          </div>

          <button
            onClick={onSync}
            disabled={connected.length === 0 || !!busyKey}
            className={cx(
              "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
              connected.length === 0 || !!busyKey
                ? "cursor-not-allowed bg-white/10 text-white/40"
                : "bg-gradient-to-r from-violet-500/70 via-fuchsia-500/60 to-indigo-500/70 hover:brightness-110"
            )}
          >
            {busyKey ? "Syncing…" : "Sync metrics"}
          </button>
        </div>

        {/* Goal hint */}
        <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
          <div className="text-xs font-semibold text-white/80">
            Normalization target
          </div>
          <div className="mt-1 text-xs text-white/65">
            {goal
              ? `Goal metric: "${goal.metricName}" · baseline ${goal.baselineValue}${goal.unit === "percent" ? "%" : ""}`
              : "No goal saved yet — you can still sync demo data."}
          </div>
        </div>

        {/* Connector grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {connectors.map((c) => (
            <div
              key={c.key}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="mt-1 text-xs text-white/60">
                    {statusLabel(c)}
                    {c.tokenHint ? ` · ${c.tokenHint}` : ""}
                  </div>
                  {c.lastSyncAt && (
                    <div className="mt-1 text-[11px] text-white/45">
                      Last sync: {prettyTime(c.lastSyncAt)}
                    </div>
                  )}
                </div>

                <span
                  className={cx(
                    "mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]",
                    badgeClass(c.status)
                  )}
                >
                  {c.status}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toggleConnect(c)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  {c.status === "connected" ? "Disconnect" : "Connect"}
                </button>

                <button
                  onClick={() => updateConnectorStatus(c.key, "expired")}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  Simulate expiry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel + dictionary */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Latest snapshot</div>
          <span className="text-xs text-white/60">
            {metrics ? metrics.source : "—"}
          </span>
        </div>

        {!metrics ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4 text-sm text-white/70">
            No metrics yet. Connect at least one source and hit{" "}
            <span className="font-semibold">Sync metrics</span>.
          </div>
        ) : (
          <>
            <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">
                  Funnel (normalized)
                </div>
                <div className="text-[11px] text-white/45">
                  Synced: {prettyTime(metrics.syncedAt)}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {metrics.funnel.map((s, idx) => (
                  <FunnelRow
                    key={s.name}
                    step={s}
                    max={metrics.funnel[0]?.users ?? 1}
                    idx={idx}
                  />
                ))}
              </div>

              {metrics.notes && (
                <div className="mt-3 text-[11px] text-white/45">
                  Note: {metrics.notes}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0a1b] p-4">
              <div className="text-xs font-semibold text-white/80">
                Event dictionary
              </div>
              <div className="mt-2 space-y-2">
                {metrics.eventDictionary.map((e) => (
                  <div
                    key={e.event}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="text-xs text-white/75">{e.event}</span>
                    <span className="text-xs font-semibold text-white/85">
                      {formatNum(e.count7d)}
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

function FunnelRow({
  step,
  max,
  idx,
}: {
  step: FunnelStep;
  max: number;
  idx: number;
}) {
  const pct = Math.max(3, Math.round((step.users / max) * 100));
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/85">
              {idx + 1}. {step.name}
            </span>
            {typeof step.dropoffPct === "number" && (
              <span className="rounded-full bg-rose-400/10 px-2 py-0.5 text-[11px] text-rose-200">
                -{step.dropoffPct}%
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[11px] text-white/50">
            {formatNum(step.users)} users
          </div>
        </div>

        <div className="w-[120px]">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function badgeClass(status: Connector["status"]) {
  switch (status) {
    case "connected":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    case "syncing":
      return "border-violet-400/20 bg-violet-400/10 text-violet-100";
    case "expired":
      return "border-amber-400/20 bg-amber-400/10 text-amber-100";
    default:
      return "border-white/10 bg-white/5 text-white/70";
  }
}

function statusLabel(c: Connector) {
  if (c.status === "connected") return "Connected";
  if (c.status === "disconnected") return "Not connected";
  if (c.status === "expired") return "Token expired";
  if (c.status === "syncing") return "Syncing";
  return c.status;
}

function prettyTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatNum(n: number) {
  return new Intl.NumberFormat().format(n);
}