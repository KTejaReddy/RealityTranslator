import type { MetricConfig } from "@/lib/scenarios";

export function buildMetricCompute(formula: string, sliderIds: string[]): MetricConfig["compute"] {
  // Heuristic compute based on the same idea as the in-UI AI scenario generator:
  // if the formula mentions a slider id and includes "increase"/"decrease", it moves the metric accordingly.
  const lower = (formula || "").toLowerCase();

  return (vals: Record<string, number>) => {
    const sliderValues = sliderIds.map((id) => vals[id] ?? 50);
    const avg = sliderValues.reduce((a, b) => a + b, 0) / Math.max(1, sliderValues.length);

    // Start from a neutral baseline, then bias based on slider relationships.
    let result = avg || 50;

    for (const id of sliderIds) {
      const val = vals[id] ?? 50;
      const idMentioned = lower.includes(id.toLowerCase());
      if (!idMentioned) continue;

      if (lower.includes("increase") || lower.includes("increases")) {
        result += (val - 50) * 0.3;
      } else if (lower.includes("decrease") || lower.includes("decreases")) {
        result -= (val - 50) * 0.3;
      } else {
        // Default: slight positive with first two sliders, negative for others.
        const idx = sliderIds.indexOf(id);
        result += (val - 50) * (idx < 2 ? 0.2 : -0.15);
      }
    }

    // Keep within a display-friendly band.
    return Math.round(Math.max(0, Math.min(100, result)) * 10) / 10;
  };
}

