// File: frontend/src/components/goal/GoalStage.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useDemoStore } from "@/lib/demo/store";
import { ConstraintKey, RiskTolerance } from "@/lib/demo/types";

const CONSTRAINTS: { key: ConstraintKey; label: string; hint: string }[] = [
  {
    key: "ui_only",
    label: "UI-only",
    hint: "No backend changes required",
  },
  {
    key: "no_new_backend_calls",
    label: "No new backend calls",
    hint: "Keep network footprint stable",
  },
  {
    key: "no_new_permissions",
    label: "No new permissions",
    hint: "Avoid new OS permission prompts",
  },
  {
    key: "keep_latency_under_200ms",
    label: "Latency < 200ms",
    hint: "Guardrail for UX responsiveness",
  },
  {
    key: "crash_rate_guardrail",
    label: "Crash-rate guardrail",
    hint: "Reject variants increasing crash risk",
  },
  {
    key: "ship_in_24h",
    label: "Ship in 24h",
    hint: "Prefer minimal, safe changes",
  },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function GoalStage() {
  const createGoal = useDemoStore((s) => s.createGoal);
  const savedGoal = useDemoStore((s) => s.goal);

  const [metricName, setMetricName] = useState("onboarding_completed");
  const [baselineValue, setBaselineValue] = useState<number>(42);
  const [targetValue, setTargetValue] = useState<number>(55);
  const [unit, setUnit] = useState<"percent" | "absolute">("percent");
  const [appArea, setAppArea] = useState("Onboarding");
  const [screens, setScreens] = useState("Welcome, Email, Permissions");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("medium");
  const [constraints, setConstraints] = useState<ConstraintKey[]>([
    "ui_only",
    "crash_rate_guardrail",
  ]);
  const [notes, setNotes] = useState(
    "Optimize completion without adding steps. Prefer clarity over novelty."
  );

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!metricName.trim()) e.push("Metric name is required.");
    if (!appArea.trim()) e.push("App area is required.");
    if (Number.isNaN(baselineValue)) e.push("Baseline value must be a number.");
    if (Number.isNaN(targetValue)) e.push("Target value must be a number.");
    if (unit === "percent") {
      if (baselineValue < 0 || baselineValue > 100)
        e.push("Baseline percent must be 0–100.");
      if (targetValue < 0 || targetValue > 100)
        e.push("Target percent must be 0–100.");
    }
    if (targetValue <= baselineValue)
      e.push("Target should be greater than baseline.");
    const scr = screens
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (scr.length === 0) e.push("Add at least one screen in scope.");
    return e;
  }, [metricName, appArea, baselineValue, targetValue, unit, screens]);

  const draftSpec = useMemo(() => {
    const scr = screens
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      metricName: metricName.trim(),
      baselineValue,
      targetValue,
      unit,
      scope: { appArea: appArea.trim(), screens: scr },
      constraints,
      riskTolerance,
      notes: notes.trim() || undefined,
    };
  }, [
    metricName,
    baselineValue,
    targetValue,
    unit,
    appArea,
    screens,
    constraints,
    riskTolerance,
    notes,
  ]);

  function toggleConstraint(key: ConstraintKey) {
    setConstraints((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  }

  function loadDemoGoal() {
    setMetricName("onboarding_completed");
    setBaselineValue(42);
    setTargetValue(55);
    setUnit("percent");
    setAppArea("Onboarding");
    setScreens("Welcome, Email, Permissions");
    setRiskTolerance("medium");
    setConstraints(["ui_only", "no_new_backend_calls", "crash_rate_guardrail"]);
    setNotes("Reduce friction in step 2. Keep flow linear. No extra dialogs.");
  }

  function onCreate() {
    if (errors.length) return;
    createGoal(draftSpec);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Form */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs tracking-wider text-white/60">
              INTENT SPEC
            </div>
            <div className="mt-1 text-lg font-semibold">Define goal</div>
            <p className="mt-1 text-sm text-white/70">
              Typed, structured goal → used to generate variants and score
              outcomes.
            </p>
          </div>
          <button
            onClick={loadDemoGoal}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
          >
            Load demo goal
          </button>
        </div>

        {/* Inputs */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Metric name" hint='e.g. "onboarding_completed"'>
            <input
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              className={inputClass}
              placeholder="onboarding_completed"
            />
          </Field>

          <Field label="Unit" hint="Percent vs absolute count">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className={inputClass}
            >
              <option value="percent">percent</option>
              <option value="absolute">absolute</option>
            </select>
          </Field>

          <Field label="Baseline" hint="Current value">
            <input
              value={baselineValue}
              onChange={(e) => setBaselineValue(Number(e.target.value))}
              className={inputClass}
              type="number"
            />
          </Field>

          <Field label="Target" hint="Desired value">
            <input
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              className={inputClass}
              type="number"
            />
          </Field>

          <Field label="App area" hint='e.g. "Onboarding"'>
            <input
              value={appArea}
              onChange={(e) => setAppArea(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Risk tolerance" hint="How aggressive can the agent be?">
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value as any)}
              className={inputClass}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Screens in scope" hint="Comma-separated">
              <input
                value={screens}
                onChange={(e) => setScreens(e.target.value)}
                className={inputClass}
                placeholder="Welcome, Email, Permissions"
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Constraints" hint="Guardrails the system must obey">
              <div className="grid gap-2 sm:grid-cols-2">
                {CONSTRAINTS.map((c) => {
                  const active = constraints.includes(c.key);
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleConstraint(c.key)}
                      className={cx(
                        "rounded-xl border px-3 py-3 text-left transition",
                        active
                          ? "border-violet-400/40 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-indigo-500/15"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">
                            {c.label}
                          </div>
                          <div className="mt-0.5 text-xs text-white/60">
                            {c.hint}
                          </div>
                        </div>
                        <div
                          className={cx(
                            "mt-1 h-2 w-2 rounded-full",
                            active ? "bg-violet-300" : "bg-white/20"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Notes" hint="Optional context for the agent">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cx(inputClass, "min-h-[88px]")}
                placeholder="Reduce friction, keep flow simple..."
              />
            </Field>
          </div>
        </div>

        {/* Errors + actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-white/60">
            {errors.length ? (
              <span className="text-rose-200">
                {errors[0]}{" "}
                <span className="text-white/50">
                  ({errors.length - 1} more)
                </span>
              </span>
            ) : (
              <span className="text-emerald-200">
                Valid spec · ready to create
              </span>
            )}
          </div>

          <button
            onClick={onCreate}
            disabled={errors.length > 0}
            className={cx(
              "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
              errors.length
                ? "cursor-not-allowed bg-white/10 text-white/40"
                : "bg-gradient-to-r from-violet-500/70 via-fuchsia-500/60 to-indigo-500/70 hover:brightness-110"
            )}
          >
            Create goal
          </button>
        </div>
      </div>

      {/* Spec preview */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="text-sm font-semibold">Goal spec (preview)</div>
        <div className="mt-2 text-xs text-white/60">
          This is what the orchestration layer would consume.
        </div>

        <pre className="mt-3 max-h-[420px] overflow-auto rounded-xl border border-white/10 bg-[#0b0a1b] p-3 text-[11px] leading-relaxed text-white/80">
          {JSON.stringify(draftSpec, null, 2)}
        </pre>

        {savedGoal && (
          <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
            <div className="text-xs font-semibold text-emerald-100">
              Saved goal
            </div>
            <div className="mt-1 text-xs text-emerald-100/80">
              {savedGoal.metricName} · {savedGoal.baselineValue}
              {savedGoal.unit === "percent" ? "%" : ""} → {savedGoal.targetValue}
              {savedGoal.unit === "percent" ? "%" : ""} · {savedGoal.scope.appArea}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/35 outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-white/80">{label}</span>
        {hint && <span className="text-[11px] text-white/45">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}