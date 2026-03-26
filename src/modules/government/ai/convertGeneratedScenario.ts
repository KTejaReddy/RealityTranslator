import type { Custom3DConfig, MetricConfig, Scenario } from "@/lib/scenarios";
import { buildMetricCompute } from "../simulations/metricCompute";

type GeneratedMetric = {
  id: string;
  label: string;
  unit: string;
  color: "cyan" | "purple" | "green" | "amber";
  higherIsBetter?: boolean;
  formula?: string;
};

type GeneratedSlider = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  color: "cyan" | "purple" | "green" | "amber";
};

type GeneratedCustom3D = Custom3DConfig;

type GeneratedScenario = {
  title: string;
  description: string;
  icon: string;
  visualTheme?: string;
  custom3D?: GeneratedCustom3D;
  sliders: GeneratedSlider[];
  metrics: GeneratedMetric[];
};

export function convertGeneratedScenarioToScenario(raw: GeneratedScenario): Scenario {
  const sliderIds = raw.sliders.map((s) => s.id);

  const metrics: MetricConfig[] = raw.metrics.slice(0, 4).map((m) => ({
    id: m.id,
    label: m.label,
    unit: m.unit,
    color: m.color ?? "cyan",
    higherIsBetter: m.higherIsBetter,
    compute: buildMetricCompute(m.formula || "", sliderIds),
  }));

  return {
    id: `generated_${Date.now()}`,
    title: raw.title || "Generated Scenario",
    description: raw.description || "",
    icon: raw.icon || "🌐",
    visualTheme: "custom",
    custom3D: raw.custom3D,
    sliders: raw.sliders.slice(0, 4).map((s, i) => ({
      id: s.id,
      label: s.label,
      min: s.min,
      max: s.max,
      step: s.step,
      defaultValue: s.defaultValue,
      unit: s.unit,
      color: s.color ?? (["cyan", "purple", "green", "amber"] as const)[i % 4],
    })),
    metrics,
  };
}

