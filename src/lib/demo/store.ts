// File: frontend/src/lib/demo/store.ts
"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  AuditEvent,
  Connector,
  ConnectorStatus,
  DeviceTarget,
  GoalSpec,
  MetricsSnapshot,
  Result,
  Run,
  RunStatus,
  Variant,
} from "./types";

/**
 * Deterministic pseudo-random generator (so demo feels stable, not chaotic)
 */
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function nowISO() {
  return new Date().toISOString();
}

/**
 * Fake devices (static for demo)
 */
const DEVICES: DeviceTarget[] = [
  { id: "pixel7", label: "Pixel 7", os: "Android 14" },
  { id: "s22", label: "Samsung S22", os: "Android 13" },
  { id: "iphone14", label: "iPhone 14", os: "iOS 17" },
  { id: "iphonese", label: "iPhone SE", os: "iOS 16" },
];

type DemoState = {
  goal: GoalSpec | null;
  connectors: Connector[];
  metrics: MetricsSnapshot | null;
  variants: Variant[];
  runs: Run[];
  results: Result[];
  auditLog: AuditEvent[];

  // actions
  createGoal: (goal: Omit<GoalSpec, "id" | "createdAt">) => void;
  updateConnectorStatus: (key: Connector["key"], status: ConnectorStatus) => void;
  syncMetrics: () => Promise<void>;
  generateVariants: () => void;
  queueRuns: () => void;
  simulateRunProgress: () => void;
  scoreResults: () => void;
  resetFlow: () => void;
};

export const useDemoStore = create<DemoState>((set, get) => ({
  goal: null,

  connectors: [
    { key: "firebase", name: "Firebase", status: "connected", tokenHint: "exp in 3 days" },
    { key: "amplitude", name: "Amplitude", status: "disconnected" },
    { key: "mixpanel", name: "Mixpanel", status: "connected" },
    { key: "segment", name: "Segment", status: "connected" },
  ],

  metrics: null,
  variants: [],
  runs: [],
  results: [],
  auditLog: [],

  createGoal: (goalInput) => {
    const goal: GoalSpec = {
      ...goalInput,
      id: nanoid(),
      createdAt: nowISO(),
    };

    set((s) => ({
      goal,
      auditLog: [
        {
          id: nanoid(),
          ts: nowISO(),
          kind: "goal.created",
          message: `Goal created for metric "${goal.metricName}"`,
          meta: { target: goal.targetValue },
        },
        ...s.auditLog,
      ],
    }));
  },

  updateConnectorStatus: (key, status) => {
    set((s) => ({
      connectors: s.connectors.map((c) =>
        c.key === key ? { ...c, status } : c
      ),
      auditLog: [
        {
          id: nanoid(),
          ts: nowISO(),
          kind: "data.connector.updated",
          message: `Connector "${key}" status → ${status}`,
        },
        ...s.auditLog,
      ],
    }));
  },

  syncMetrics: async () => {
    const source =
      get().connectors.find((c) => c.status === "connected")?.key ??
      "firebase";

    set((s) => ({
      connectors: s.connectors.map((c) =>
        c.key === source ? { ...c, status: "syncing" } : c
      ),
    }));

    await new Promise((r) => setTimeout(r, 1200));

    const funnel = [
      { name: "app_open", users: 10000 },
      { name: "signup_completed", users: 7200, dropoffPct: 28 },
      { name: "onboarding_step_1", users: 6100, dropoffPct: 15 },
      { name: "onboarding_completed", users: 4200, dropoffPct: 31 },
    ];

    set((s) => ({
      metrics: {
        source,
        syncedAt: nowISO(),
        funnel,
        eventDictionary: [
          { event: "cta_clicked", count7d: 12400 },
          { event: "permission_denied", count7d: 1800 },
          { event: "form_validation_error", count7d: 960 },
        ],
        notes: "partial week data",
      },
      connectors: s.connectors.map((c) =>
        c.key === source
          ? { ...c, status: "connected", lastSyncAt: nowISO() }
          : c
      ),
      auditLog: [
        {
          id: nanoid(),
          ts: nowISO(),
          kind: "data.synced",
          message: `Metrics synced from ${source}`,
        },
        ...s.auditLog,
      ],
    }));
  },

  generateVariants: () => {
    const seed = 42;
    const variants: Variant[] = [
      {
        id: nanoid(),
        title: "Remove optional field in step 2",
        hypothesis: "Reduce friction by shortening form",
        risk: "low",
        patchSummary: { filesChanged: 3, additions: 42, deletions: 18 },
        diffText: `- <TextField label="Referral Code" />
+ {/* Removed optional referral field for speed */}`,
        uiPreview: {
          beforeLabel: "Full Form",
          afterLabel: "Shortened Form",
        },
        createdAt: nowISO(),
      },
      {
        id: nanoid(),
        title: "Primary CTA emphasis + copy change",
        hypothesis: "Increase clarity of action",
        risk: "medium",
        patchSummary: { filesChanged: 2, additions: 21, deletions: 9 },
        diffText: `- <Button>Continue</Button>
+ <Button variant="primary">Start Now</Button>`,
        uiPreview: {
          beforeLabel: "Continue",
          afterLabel: "Start Now",
        },
        createdAt: nowISO(),
      },
      {
        id: nanoid(),
        title: "Inline permission pre-prompt",
        hypothesis: "Prepare users before system dialog",
        risk: "medium",
        patchSummary: { filesChanged: 4, additions: 63, deletions: 11 },
        diffText: `+ <PermissionExplainer />`,
        uiPreview: {
          beforeLabel: "System Dialog",
          afterLabel: "Explainer + Dialog",
        },
        createdAt: nowISO(),
      },
    ];

    set((s) => ({
      variants,
      auditLog: [
        {
          id: nanoid(),
          ts: nowISO(),
          kind: "variants.generated",
          message: `${variants.length} variants generated`,
        },
        ...s.auditLog,
      ],
    }));
  },

  queueRuns: () => {
    const { variants } = get();
    const runs: Run[] = [];

    variants.forEach((v) => {
      DEVICES.forEach((d) => {
        runs.push({
          id: nanoid(),
          variantId: v.id,
          deviceId: d.id,
          status: "queued",
          logs: [],
          screenshotLabels: [],
        });
      });
    });

    set((s) => ({
      runs,
      auditLog: [
        {
          id: nanoid(),
          ts: nowISO(),
          kind: "runs.queued",
          message: `${runs.length} device runs queued`,
        },
        ...s.auditLog,
      ],
    }));
  },

  simulateRunProgress: () => {
    set((s) => ({
      runs: s.runs.map((run, i) => {
        const rand = seededRandom(i + 1);
        const passed = rand > 0.15;

        return {
          ...run,
          status: passed ? "passed" : "retrying",
          startedAt: nowISO(),
          finishedAt: nowISO(),
          durationSec: Math.round(20 + rand * 40),
          pixelPerfectScore: Math.round(85 + rand * 10),
          crashFree: rand > 0.1,
          logs: ["Build OK", "Installed", "Navigation OK"],
          screenshotLabels: ["before.png", "after.png"],
        };
      }),
      auditLog: [
        {
          id: nanoid(),
          ts: nowISO(),
          kind: "runs.updated",
          message: `Device runs executed`,
        },
        ...s.auditLog,
      ],
    }));
  },

  scoreResults: () => {
    const { variants } = get();

    const results: Result[] = variants.map((v, i) => {
      const base = 70 + i * 6;
      return {
        id: nanoid(),
        variantId: v.id,
        score: base,
        recommended: i === 1,
        why:
          i === 1
            ? "Improved CTA clarity without guardrail violations"
            : "Moderate friction reduction with minor tradeoffs",
        breakdown: {
          estimatedImpact: { min: 6 + i, max: 12 + i, unit: "percent" },
          confidencePct: 78 + i * 5,
          frictionDeltaSec: -0.8 - i * 0.2,
          errorDensityDelta: -0.02,
          guardrails: [
            { key: "crash_rate", ok: true },
            { key: "latency", ok: true },
          ],
        },
      };
    });

    set((s) => ({
      results,
      auditLog: [
        {
          id: nanoid(),
          ts: nowISO(),
          kind: "results.scored",
          message: `Variants scored and ranked`,
        },
        ...s.auditLog,
      ],
    }));
  },

  resetFlow: () => {
    set({
      goal: null,
      metrics: null,
      variants: [],
      runs: [],
      results: [],
      auditLog: [
        {
          id: nanoid(),
          ts: nowISO(),
          kind: "flow.reset",
          message: "Flow reset",
        },
      ],
    });
  },
}));