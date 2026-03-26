import type { Scenario } from "@/lib/scenarios";
import type { MetricConfig, SliderConfig } from "@/lib/scenarios";

export type AreaTrafficInputs = {
  region: string;
  vehicles: number; // 0-100
  roads: number; // 0-100
  signals: number; // 0-100
  demand: number; // 0-100
};

function m0(contrib: number) {
  return Math.max(0, Math.min(100, Math.round(contrib)));
}

export function buildAreaTrafficScenario(inputs: AreaTrafficInputs): Scenario {
  const sliders: SliderConfig[] = [
    { id: "vehicles", label: "Vehicles", min: 0, max: 100, step: 1, defaultValue: inputs.vehicles, unit: "K", color: "amber" },
    { id: "roads", label: "Road Capacity", min: 0, max: 100, step: 1, defaultValue: inputs.roads, unit: "%", color: "green" },
    { id: "signals", label: "Signal Coordination", min: 0, max: 100, step: 1, defaultValue: inputs.signals, unit: "%", color: "cyan" },
    { id: "demand", label: "Travel Demand", min: 0, max: 100, step: 1, defaultValue: inputs.demand, unit: "%", color: "purple" },
  ];

  const metrics: MetricConfig[] = [
    {
      id: "congestion",
      label: "Congestion",
      unit: "%",
      color: "amber",
      higherIsBetter: false,
      compute: (s) => m0(s.vehicles * 0.55 + s.demand * 0.45 - s.roads * 0.35 - s.signals * 0.2),
    },
    {
      id: "avg_travel_time",
      label: "Avg Travel Time",
      unit: "min",
      color: "purple",
      higherIsBetter: false,
      compute: (s) => {
        const congestion = m0(s.vehicles * 0.55 + s.demand * 0.45 - s.roads * 0.35 - s.signals * 0.2);
        return m0(20 + (congestion / 100) * 40 + (s.demand - s.roads) * 0.15);
      },
    },
    {
      id: "throughput",
      label: "Throughput",
      unit: "/100",
      color: "green",
      higherIsBetter: true,
      compute: (s) => m0(s.roads * 0.35 + s.signals * 0.3 + s.demand * 0.1 - s.vehicles * 0.05),
    },
    {
      id: "emissions",
      label: "Emissions",
      unit: "AQI",
      color: "cyan",
      higherIsBetter: false,
      compute: (s) => m0(s.vehicles * 0.45 + s.demand * 0.25 - s.signals * 0.15 - s.roads * 0.1),
    },
  ];

  const center = [0, 0, 0] as [number, number, number];

  return {
    id: `gov_traffic_${Date.now()}`,
    title: `Traffic Simulation (${inputs.region})`,
    description: "Area-based traffic model built for decision support. Adjust capacity, demand, and signal coordination to observe congestion and throughput changes.",
    icon: "🚦",
    visualTheme: "custom",
    custom3D: {
      groundColor: "#1a202c",
      objects: [
        // Roads: scale with capacity.
        { type: "road", color: "#2d3748", position: [0, 0, 0], width: 10, height: 2.5, linkedSlider: "roads", rotation: [0, 0, 0] },
        { type: "road", color: "#2d3748", position: [0, 0, 0], width: 2.5, height: 10, linkedSlider: "roads", rotation: [0, Math.PI / 2, 0] },

        // Signals: adjust tower height/frequency with coordination.
        { type: "tower", color: "#4a5568", position: [-3, 0, -1], height: 4, width: 0.9, linkedSlider: "signals" },
        { type: "tower", color: "#4a5568", position: [3, 0, 1], height: 4, width: 0.9, linkedSlider: "signals" },

        // Vehicles: use moving objects and particles to represent density/flow.
        { type: "movingObject", color: "#f56565", position: center, size: 0.6, speed: 0.12, linkedSlider: "vehicles", path: [[-8, 0.5, 0], [8, 0.5, 0]] },
        { type: "movingObject", color: "#4299e1", position: center, size: 0.6, speed: 0.09, linkedSlider: "vehicles", path: [[0, 0.5, -8], [0, 0.5, 8]] },

        // Congestion particles.
        { type: "particles", color: "#a855f7", count: 220, size: 10, speed: 2.5, linkedSlider: "demand" },
        { type: "ambientDust", color: "#e2e8f0", count: 180, size: 15, linkedSlider: "congestion" },
      ],
    },
    sliders,
    metrics,
  };
}

