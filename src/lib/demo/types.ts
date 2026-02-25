// File: frontend/src/lib/demo/types.ts

export type StageKey = "goal" | "data" | "variants" | "runs" | "results" | "audit";

export type RiskTolerance = "low" | "medium" | "high";

export type MetricSource = "firebase" | "amplitude" | "mixpanel" | "segment";

export type ConnectorStatus = "connected" | "disconnected" | "expired" | "syncing";

export type ConstraintKey =
  | "no_new_backend_calls"
  | "ui_only"
  | "no_new_permissions"
  | "keep_latency_under_200ms"
  | "crash_rate_guardrail"
  | "ship_in_24h";

export type GoalSpec = {
  id: string;
  metricName: string; // e.g. "onboarding_completed"
  baselineValue: number; // current value (percent or absolute)
  targetValue: number; // desired value (percent or absolute)
  unit: "percent" | "absolute";
  scope: {
    appArea: string; // e.g. "Onboarding"
    screens: string[]; // e.g. ["Welcome", "Email", "Permissions"]
  };
  constraints: ConstraintKey[];
  riskTolerance: RiskTolerance;
  notes?: string;
  createdAt: string; // ISO
};

export type Connector = {
  key: MetricSource;
  name: string;
  status: ConnectorStatus;
  lastSyncAt?: string; // ISO
  tokenHint?: string; // e.g. "exp in 3 days"
};

export type FunnelStep = {
  name: string; // e.g. "signup_completed"
  users: number;
  dropoffPct?: number; // from previous step
};

export type MetricsSnapshot = {
  source: MetricSource;
  syncedAt: string; // ISO
  funnel: FunnelStep[];
  eventDictionary: Array<{ event: string; count7d: number }>;
  notes?: string; // e.g. "partial week"
};

export type Variant = {
  id: string;
  title: string;
  hypothesis: string;
  risk: "low" | "medium" | "high";
  patchSummary: {
    filesChanged: number;
    additions: number;
    deletions: number;
  };
  diffText: string; // unified diff (fake but plausible)
  uiPreview: {
    beforeLabel: string;
    afterLabel: string;
  };
  createdAt: string; // ISO
};

export type RunStatus = "queued" | "running" | "retrying" | "passed" | "failed";

export type DeviceTarget = {
  id: string;
  label: string; // "Pixel 7"
  os: string; // "Android 14"
};

export type Run = {
  id: string;
  variantId: string;
  deviceId: string;
  status: RunStatus;
  startedAt?: string; // ISO
  finishedAt?: string; // ISO
  durationSec?: number;
  pixelPerfectScore?: number; // 0-100
  crashFree?: boolean;
  logs: string[];
  screenshotLabels: string[]; // placeholders
};

export type ScoringBreakdown = {
  estimatedImpact: { min: number; max: number; unit: "percent" | "absolute" };
  confidencePct: number;
  frictionDeltaSec: number; // - means faster completion
  errorDensityDelta: number; // - means fewer errors
  guardrails: Array<{ key: string; ok: boolean; note?: string }>;
};

export type Result = {
  id: string;
  variantId: string;
  score: number; // 0-100
  recommended: boolean;
  why: string; // short explanation
  breakdown: ScoringBreakdown;
};

export type AuditEvent = {
  id: string;
  ts: string; // ISO
  kind:
    | "goal.created"
    | "data.connector.updated"
    | "data.synced"
    | "variants.generated"
    | "runs.queued"
    | "runs.updated"
    | "results.scored"
    | "flow.reset";
  message: string;
  meta?: Record<string, unknown>;
};