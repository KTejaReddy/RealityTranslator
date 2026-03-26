import type { Scenario } from "@/lib/scenarios";

export type GovernmentDatasetFormat = "csv" | "json" | "api";

export type GovernmentDataset = {
  id: string;
  name: string;
  type: "traffic" | "disaster" | "planning" | "live_mapping" | "other";
  region: string;
  source: string;
  format: GovernmentDatasetFormat;
  uploadedBy: string;
  uploadedAt: number;
};

export type GovernmentSimulationModel = {
  id: string;
  name: string;
  type: "traffic_area" | "disaster" | "government_model" | "live_mapping";
  region: string;
  data: unknown; // stored scenario config JSON (sliders/custom3D/metrics)
  createdBy: string;
  createdAt: number;
};

export type GovernmentRequest = {
  id: string;
  type: "traffic" | "disaster" | "planning" | "other";
  region: string;
  parameters: unknown;
  status: "queued" | "completed" | "failed";
  createdAt: number;
};

export type GovernmentScenarioResult = {
  scenario: Scenario;
  region: string;
  generatedFrom: GovernmentRequest | null;
};

