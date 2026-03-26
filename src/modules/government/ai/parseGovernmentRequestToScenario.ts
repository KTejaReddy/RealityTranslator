import type { Scenario } from "@/lib/scenarios";
import { convertGeneratedScenarioToScenario } from "./convertGeneratedScenario";

export type GovernmentRequestInputs = {
  requestType: string;
  region: string;
  datasetOrParameters: string;
};

export async function parseGovernmentRequestToScenario(
  inputs: GovernmentRequestInputs,
): Promise<Scenario> {
  const { scenario } = await parseGovernmentRequestToScenarioWithRaw(inputs);
  return scenario;
}

type ScenarioWithRaw = {
  scenario: Scenario;
  raw: unknown;
};

export async function parseGovernmentRequestToScenarioWithRaw(
  inputs: GovernmentRequestInputs,
): Promise<ScenarioWithRaw> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const prompt = `Government request:
Type: ${inputs.requestType}
Region: ${inputs.region}
Dataset/Parameters: ${inputs.datasetOrParameters}

Convert this request into a realistic 3D simulation configuration compatible with the existing Reality Translator viewer.

IMPORTANT: Return strictly JSON in this structure:
{
  "title": "short",
  "description": "short explanation",
  "icon": "single emoji",
  "visualTheme": "custom",
  "custom3D": { "groundColor": "#HEX", "objects": [ ... ] },
  "sliders": [ { "id": "snake_case_id", "label":"...", "min":0, "max":100, "step":1, "defaultValue":50, "unit":"%", "color":"cyan|purple|green|amber" } ],
  "metrics": [ { "id":"snake_case_id","label":"...","unit":"%","color":"...","higherIsBetter": true/false, "formula":"increase/decrease using slider ids" } ]
}
`;

  // Try server-side generation first; fall back if the backend isn't configured.
  if (supabaseUrl) {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = (await res.json()) as { scenario?: unknown };
        if (data.scenario) {
          const raw = data.scenario as Parameters<typeof convertGeneratedScenarioToScenario>[0];
          const scenario = convertGeneratedScenarioToScenario(raw);
          return { scenario, raw };
        }
      }
    } catch {
      // Fall through to fallback scenario below.
    }
  }

  // Simple local fallback: treat request type keywords as a theme.
  const typeLower = inputs.requestType.toLowerCase();
  const theme = typeLower.includes("traffic")
    ? "traffic"
    : typeLower.includes("disaster")
      ? "disaster"
      : "planning";

  // Minimal 4-slider scenario compatible with CustomScene rendering.
  const base = {
    title: `${inputs.requestType} Simulation`,
    description: "Fallback simulation generated without backend AI.",
    icon: theme === "traffic" ? "🚦" : theme === "disaster" ? "⚠️" : "🗺️",
    visualTheme: "custom" as const,
    custom3D: {
      groundColor: "#1a202c",
      objects: [
        { type: "road", color: "#2d3748", position: [0, 0, 0], width: 9, height: 3 },
        { type: "tower", color: "#4a5568", position: [-3, 0, -1], height: 6, width: 1.2 },
        { type: "tower", color: "#4a5568", position: [3, 0, 1], height: 6, width: 1.2 },
        { type: "particles", color: "#a855f7", count: 250, size: 10, speed: 2 },
        { type: "ambientDust", color: "#e2e8f0", count: 200, size: 15 },
      ],
    },
    sliders: [
      { id: "a", label: "Primary Variable", min: 0, max: 100, step: 1, defaultValue: 60, unit: "%", color: "cyan" },
      { id: "b", label: "Secondary Variable", min: 0, max: 100, step: 1, defaultValue: 40, unit: "%", color: "purple" },
      { id: "c", label: "Control Level", min: 0, max: 100, step: 1, defaultValue: 50, unit: "%", color: "green" },
      { id: "d", label: "External Factors", min: 0, max: 100, step: 1, defaultValue: 30, unit: "%", color: "amber" },
    ],
    metrics: [
      {
        id: "m1",
        label: "Impact Score",
        unit: "/100",
        color: "amber",
        higherIsBetter: false,
        formula: "increases with a and d, decreases with c",
      },
      {
        id: "m2",
        label: "Stability",
        unit: "%",
        color: "green",
        higherIsBetter: true,
        formula: "increases with c, decreases with a",
      },
      {
        id: "m3",
        label: "Response Effectiveness",
        unit: "%",
        color: "cyan",
        higherIsBetter: true,
        formula: "increases with b and c, decreases with d",
      },
      {
        id: "m4",
        label: "Coordination",
        unit: "%",
        color: "purple",
        higherIsBetter: true,
        formula: "increases with b, decreases with a",
      },
    ],
  };

  return { scenario: convertGeneratedScenarioToScenario(base as Parameters<typeof convertGeneratedScenarioToScenario>[0]), raw: base };
}

