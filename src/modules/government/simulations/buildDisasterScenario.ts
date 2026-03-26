import type { Scenario } from "@/lib/scenarios";
import type { MetricConfig, SliderConfig } from "@/lib/scenarios";

export type DisasterInputs = {
  disasterType: "fire" | "flood" | "earthquake" | "storm" | "other";
  region: string;
  intensity: number; // 0-100
};

function clamp100(v: number) {
  return Math.max(0, Math.min(100, v));
}

export function buildDisasterScenario(inputs: DisasterInputs): Scenario {
  const type = inputs.disasterType;

  const palette = (() => {
    switch (type) {
      case "fire":
        return { ground: "#1a202c", spread: "#f97316", debris: "#e2e8f0", danger: "#ef4444", shelter: "#22c55e", icon: "🔥" };
      case "flood":
        return { ground: "#0b1220", spread: "#38bdf8", debris: "#e2e8f0", danger: "#3b82f6", shelter: "#22c55e", icon: "🌊" };
      case "earthquake":
        return { ground: "#14110f", spread: "#a78bfa", debris: "#f59e0b", danger: "#f97316", shelter: "#22c55e", icon: "🧱" };
      case "storm":
        return { ground: "#0b1220", spread: "#60a5fa", debris: "#e2e8f0", danger: "#94a3b8", shelter: "#22c55e", icon: "⛈️" };
      default:
        return { ground: "#1a202c", spread: "#a855f7", debris: "#e2e8f0", danger: "#ef4444", shelter: "#22c55e", icon: "⚠️" };
    }
  })();

  const intensity = clamp100(inputs.intensity);

  // Derive other sliders from intensity to keep the UI simple (requirement inputs: type+region+intensity).
  const preparedness = clamp100(40 + (100 - intensity) * 0.25);
  const infrastructure = clamp100(45 + intensity * 0.15);
  const response = clamp100(35 + (preparedness * 0.4 + infrastructure * 0.3) * 0.6 - intensity * 0.1);

  const sliders: SliderConfig[] = [
    { id: "intensity", label: "Intensity", min: 0, max: 100, step: 1, defaultValue: intensity, unit: "%", color: "amber" },
    { id: "preparedness", label: "Preparedness", min: 0, max: 100, step: 1, defaultValue: preparedness, unit: "%", color: "green" },
    { id: "infrastructure", label: "Infrastructure", min: 0, max: 100, step: 1, defaultValue: infrastructure, unit: "%", color: "cyan" },
    { id: "response", label: "Response Capacity", min: 0, max: 100, step: 1, defaultValue: response, unit: "%", color: "purple" },
  ];

  const metrics: MetricConfig[] = [
    {
      id: "spread",
      label: "Spread / Impact Zone",
      unit: "/100",
      color: "amber",
      higherIsBetter: false,
      compute: (s) => clamp100(s.intensity * 0.65 + s.infrastructure * 0.1 - s.preparedness * 0.3 - s.response * 0.25),
    },
    {
      id: "damage",
      label: "Damage Level",
      unit: "/100",
      color: "purple",
      higherIsBetter: false,
      compute: (s) => clamp100(s.intensity * 0.55 + (100 - s.preparedness) * 0.25 + (100 - s.response) * 0.2),
    },
    {
      id: "safety",
      label: "Safety Index",
      unit: "%",
      color: "green",
      higherIsBetter: true,
      compute: (s) => clamp100(s.preparedness * 0.35 + s.response * 0.4 + s.infrastructure * 0.25 - s.intensity * 0.2),
    },
    {
      id: "recovery",
      label: "Recovery Potential",
      unit: "/100",
      color: "cyan",
      higherIsBetter: true,
      compute: (s) => clamp100(s.response * 0.3 + s.infrastructure * 0.3 + s.preparedness * 0.2 + (100 - s.intensity) * 0.2),
    },
  ];

  const linked = {
    intensity: { ls: "intensity" as const },
    preparedness: { ls: "preparedness" as const },
    response: { ls: "response" as const },
  };

  return {
    id: `gov_disaster_${Date.now()}`,
    title: `${type[0].toUpperCase() + type.slice(1)} Disaster (${inputs.region})`,
    description: "Disaster response simulation: visualize spread, impact zones, and decision insights as sliders are adjusted.",
    icon: palette.icon,
    visualTheme: "custom",
    sliders,
    metrics,
    custom3D: {
      groundColor: palette.ground,
      objects: [
        // Spread particles around the center.
        { type: "particles", color: palette.spread, count: 260, size: 12, speed: 3, linkedSlider: linked.intensity.ls },

        // Debris clouds.
        { type: "ambientDust", color: palette.debris, count: 220, size: 15, linkedSlider: linked.intensity.ls },

        // Damaged buildings (height scales down with preparedness/response).
        { type: "building", color: palette.danger, position: [-4, 0, -2], height: 10, width: 2, rotation: [0, 0, 0], linkedSlider: linked.intensity.ls },
        { type: "building", color: palette.danger, position: [4, 0, 2], height: 12, width: 2.3, rotation: [0, 0, 0], linkedSlider: linked.intensity.ls },

        // Shelters (scale with response).
        { type: "tower", color: palette.shelter, position: [-2, 0, 4], height: 4, width: 0.9, linkedSlider: linked.response.ls },
        { type: "tower", color: palette.shelter, position: [2, 0, -4], height: 4, width: 0.9, linkedSlider: linked.response.ls },

        // Ground indicator.
        { type: "nature", color: palette.danger, position: [0, 0.05, 0], size: 2.2, linkedSlider: linked.intensity.ls },
      ],
    },
  };
}

