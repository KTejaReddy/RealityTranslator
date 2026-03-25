export type ScenarioId = 'climate' | 'traffic' | 'city' | 'ocean' | 'energy' | 'pandemic' | 'economy' | 'agriculture' | 'space' | 'wildlife' | 'cyber' | 'education' | 'weather';

export interface SliderConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  color: 'cyan' | 'purple' | 'green' | 'amber';
}

export interface MetricConfig {
  id: string;
  label: string;
  unit: string;
  compute: (sliders: Record<string, number>) => number;
  color: 'cyan' | 'purple' | 'green' | 'amber';
  higherIsBetter?: boolean;
}

export type ScenePrimitiveType = 'particles' | 'ambientDust' | 'building' | 'tree' | 'water' | 'movingObject' | 'human' | 'vehicle' | 'furniture' | 'decoration' | 'plant' | 'nature' | 'dome' | 'road' | 'tower';

export interface Custom3DPrimitive {
  type: ScenePrimitiveType;
  color?: string;
  emissive?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: number; // Serves as scale, spread, radius etc.
  count?: number; 
  height?: number;
  width?: number;
  speed?: number;
  path?: [number, number, number][];
  linkedSlider?: string;
}

export interface Custom3DConfig {
  groundColor?: string;
  objects: Custom3DPrimitive[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  sliders: SliderConfig[];
  metrics: MetricConfig[];
  visualTheme?: ScenarioId | 'custom';
  custom3D?: Custom3DConfig;
}

export const scenarios: Scenario[] = [
  {
    id: 'climate',
    title: 'Climate',
    description: 'Energy, emissions & global warming',
    icon: '🌍',
    sliders: [
      { id: 'renewable', label: 'Renewable Energy', min: 0, max: 100, step: 1, defaultValue: 30, unit: '%', color: 'green' },
      { id: 'industry', label: 'Industrial Output', min: 0, max: 100, step: 1, defaultValue: 60, unit: '%', color: 'amber' },
      { id: 'deforestation', label: 'Deforestation', min: 0, max: 100, step: 1, defaultValue: 40, unit: '%', color: 'purple' },
      { id: 'population', label: 'Population', min: 4, max: 12, step: 0.1, defaultValue: 8, unit: 'B', color: 'cyan' },
    ],
    metrics: [
      { id: 'co2', label: 'CO₂ Emissions', unit: 'GT/yr', compute: (s) => Math.max(0, +( ((100 - s.renewable) * 0.3 + s.industry * 0.4 + s.deforestation * 0.15) * (s.population / 8) ).toFixed(1)), color: 'amber' },
      { id: 'temp', label: 'Temp Rise', unit: '°C', compute: (s) => { const co2 = ((100 - s.renewable) * 0.3 + s.industry * 0.4 + s.deforestation * 0.15) * (s.population / 8); return +(1.1 + co2 * 0.04).toFixed(1); }, color: 'purple' },
      { id: 'air', label: 'Air Quality', unit: 'AQI', compute: (s) => Math.round(Math.max(20, 150 - s.renewable * 0.8 + s.industry * 0.5)), color: 'green', higherIsBetter: false },
      { id: 'biodiversity', label: 'Biodiversity', unit: '%', compute: (s) => Math.round(Math.max(10, 100 - s.deforestation * 0.6 - s.industry * 0.15 + s.renewable * 0.1)), color: 'cyan', higherIsBetter: true },
    ],
    custom3D: {
      groundColor: "#2d3748",
      objects: [
        { type: "building", color: "#4a5568", position: [-5, 0, -2], height: 8, width: 3 },
        { type: "building", color: "#553c30", position: [4, 0, -5], height: 6, width: 4 }, // Factory
        { type: "tree", position: [2, 0, 3], size: 1.2 },
        { type: "tree", position: [1, 0, 4], size: 0.8 },
        { type: "tree", position: [-2, 0, 5], size: 1.5 },
        { type: "nature", color: "#2f855a", position: [-6, 0, 4], size: 2 },
        { type: "ambientDust", color: "#e2e8f0", size: 15, count: 400 },
        { type: "vehicle", color: "#e53e3e", position: [0, 0.5, 0], size: 1, speed: 0.1, path: [[-8, 0.5, 0], [8, 0.5, 0]] }
      ]
    }
  },
  {
    id: 'traffic',
    title: 'Traffic',
    description: 'Vehicles, transit & congestion',
    icon: '🚗',
    sliders: [
      { id: 'cars', label: 'Private Cars', min: 0, max: 100, step: 1, defaultValue: 70, unit: 'K', color: 'amber' },
      { id: 'public', label: 'Public Transit', min: 0, max: 100, step: 1, defaultValue: 30, unit: '%', color: 'green' },
      { id: 'bikes', label: 'Bike Lanes', min: 0, max: 100, step: 1, defaultValue: 15, unit: '%', color: 'cyan' },
      { id: 'remote', label: 'Remote Work', min: 0, max: 100, step: 1, defaultValue: 20, unit: '%', color: 'purple' },
    ],
    metrics: [
      { id: 'congestion', label: 'Congestion', unit: '%', compute: (s) => Math.round(Math.min(100, Math.max(5, s.cars * 0.8 - s.public * 0.3 - s.bikes * 0.15 - s.remote * 0.25))), color: 'amber', higherIsBetter: false },
      { id: 'pollution', label: 'Pollution', unit: 'AQI', compute: (s) => Math.round(Math.max(15, s.cars * 1.2 - s.public * 0.4 - s.bikes * 0.2)), color: 'purple', higherIsBetter: false },
      { id: 'commute', label: 'Avg Commute', unit: 'min', compute: (s) => Math.round(Math.max(10, 15 + s.cars * 0.4 - s.public * 0.2 - s.remote * 0.15)), color: 'cyan', higherIsBetter: false },
      { id: 'satisfaction', label: 'Satisfaction', unit: '%', compute: (s) => Math.round(Math.min(100, Math.max(10, 50 - s.cars * 0.3 + s.public * 0.4 + s.bikes * 0.3 + s.remote * 0.2))), color: 'green', higherIsBetter: true },
    ],
    custom3D: {
      groundColor: "#1a202c",
      objects: [
        { type: "building", color: "#2d3748", position: [-5, 0, -4], height: 10, width: 2 },
        { type: "building", color: "#4a5568", position: [4, 0, -3], height: 8, width: 3 },
        { type: "building", color: "#2d3748", position: [0, 0, 5], height: 15, width: 2 },
        { type: "nature", color: "#718096", position: [0, 0.05, 0], size: 1.5 }, // Road center
        { type: "vehicle", color: "#f56565", position: [-3, 0.5, -2], size: 0.8, speed: 0.15, path: [[-10, 0.5, -2], [10, 0.5, -2]] },
        { type: "vehicle", color: "#4299e1", position: [2, 0.5, 1], size: 1.0, speed: 0.08, path: [[10, 0.5, 1], [-10, 0.5, 1]] },
        { type: "vehicle", color: "#ecc94b", position: [5, 0.5, -1], size: 0.9, speed: 0.12, path: [[10, 0.5, -1], [-10, 0.5, -1]] },
        { type: "human", position: [-3, 0.5, 3], color: "#e2e8f0", size: 0.6 },
        { type: "human", position: [3, 0.5, -4], color: "#e2e8f0", size: 0.7 }
      ]
    }
  },
  {
    id: 'city',
    title: 'City',
    description: 'Urban planning & livability',
    icon: '🏙️',
    sliders: [
      { id: 'density', label: 'Pop Density', min: 0, max: 100, step: 1, defaultValue: 50, unit: '%', color: 'cyan' },
      { id: 'green_space', label: 'Green Space', min: 0, max: 100, step: 1, defaultValue: 25, unit: '%', color: 'green' },
      { id: 'commercial', label: 'Commercial', min: 0, max: 100, step: 1, defaultValue: 40, unit: '%', color: 'amber' },
      { id: 'infrastructure', label: 'Infrastructure', min: 0, max: 100, step: 1, defaultValue: 50, unit: '%', color: 'purple' },
    ],
    metrics: [
      { id: 'livability', label: 'Livability', unit: '/100', compute: (s) => Math.round(Math.min(100, Math.max(10, s.green_space * 0.4 + s.infrastructure * 0.3 - s.density * 0.15 + 30))), color: 'green', higherIsBetter: true },
      { id: 'economy', label: 'Economy', unit: '$B', compute: (s) => +((s.commercial * 0.3 + s.density * 0.2 + s.infrastructure * 0.25) * 0.5).toFixed(1), color: 'amber', higherIsBetter: true },
      { id: 'emissions', label: 'Emissions', unit: 'MT', compute: (s) => +((s.density * 0.3 + s.commercial * 0.4 - s.green_space * 0.2) * 0.4).toFixed(1), color: 'purple', higherIsBetter: false },
      { id: 'happiness', label: 'Happiness', unit: '%', compute: (s) => Math.round(Math.min(100, Math.max(10, s.green_space * 0.35 - s.density * 0.1 + s.infrastructure * 0.2 + 40))), color: 'cyan', higherIsBetter: true },
    ],
    custom3D: {
      groundColor: "#e2e8f0",
      objects: [
        { type: "building", color: "#1a365d", position: [0, 0, 0], height: 20, width: 4 },
        { type: "building", color: "#2b6cb0", position: [-5, 0, -5], height: 12, width: 3 },
        { type: "building", color: "#2c5282", position: [5, 0, 5], height: 16, width: 3.5 },
        { type: "building", color: "#2a4365", position: [6, 0, -4], height: 14, width: 3 },
        { type: "building", color: "#bee3f8", position: [-6, 0, 6], height: 10, width: 2.5 },
        { type: "tree", position: [-2, 0, 3], size: 1.2 },
        { type: "tree", position: [-3, 0, 2], size: 0.9 },
        { type: "tree", position: [3, 0, -2], size: 1.1 },
        { type: "human", position: [-1, 0.5, 4], color: "#1a202c", size: 0.5 },
        { type: "human", position: [2, 0.5, 3], color: "#e53e3e", size: 0.4 },
        { type: "ambientDust", color: "#ebf8ff", count: 200, size: 15 }
      ]
    }
  },
  {
    id: 'ocean',
    title: 'Ocean',
    description: 'Marine life & ocean health',
    icon: '🌊',
    sliders: [
      { id: 'fishing', label: 'Fishing Rate', min: 0, max: 100, step: 1, defaultValue: 50, unit: '%', color: 'amber' },
      { id: 'plastic', label: 'Plastic Waste', min: 0, max: 100, step: 1, defaultValue: 60, unit: 'MT', color: 'purple' },
      { id: 'temperature', label: 'Ocean Temp', min: 0, max: 100, step: 1, defaultValue: 35, unit: '%', color: 'cyan' },
      { id: 'protection', label: 'Marine Reserves', min: 0, max: 100, step: 1, defaultValue: 10, unit: '%', color: 'green' },
    ],
    metrics: [
      { id: 'fish_pop', label: 'Fish Population', unit: '%', compute: (s) => Math.round(Math.max(5, 100 - s.fishing * 0.5 - s.plastic * 0.2 - s.temperature * 0.15 + s.protection * 0.4)), color: 'cyan', higherIsBetter: true },
      { id: 'coral', label: 'Coral Health', unit: '%', compute: (s) => Math.round(Math.max(5, 100 - s.temperature * 0.5 - s.plastic * 0.3 + s.protection * 0.35)), color: 'green', higherIsBetter: true },
      { id: 'oxygen', label: 'O₂ Production', unit: '%', compute: (s) => Math.round(Math.max(20, 90 - s.plastic * 0.3 - s.temperature * 0.2 + s.protection * 0.2)), color: 'amber', higherIsBetter: true },
      { id: 'acidity', label: 'Acidity', unit: 'pH↓', compute: (s) => +(s.temperature * 0.03 + s.plastic * 0.01).toFixed(1), color: 'purple', higherIsBetter: false },
    ],
    custom3D: {
      groundColor: "#2b6cb0",
      objects: [
        { type: "water", color: "#2b6cb0", size: 25 },
        { type: "nature", color: "#ecc94b", position: [-3, 0, 2], size: 2 }, // Sand reef
        { type: "nature", color: "#ed8936", position: [4, 0, -4], size: 1.5 }, // Coral rock
        { type: "plant", color: "#4fd1c5", position: [-3.5, 0.5, 1.5], size: 1.2 }, // Seaweed
        { type: "plant", color: "#68d391", position: [-2.5, 0.5, 2.5], size: 0.8 },
        { type: "vehicle", color: "#ffffff", position: [0, 2, 0], size: 1.5, speed: 0.05, path: [[-15, 2, -15], [15, 2, 15]] } // Ship
      ]
    }
  },
  {
    id: 'energy',
    title: 'Energy',
    description: 'Power grid & energy mix',
    icon: '⚡',
    sliders: [
      { id: 'solar', label: 'Solar Power', min: 0, max: 100, step: 1, defaultValue: 20, unit: '%', color: 'amber' },
      { id: 'wind', label: 'Wind Power', min: 0, max: 100, step: 1, defaultValue: 15, unit: '%', color: 'cyan' },
      { id: 'nuclear', label: 'Nuclear', min: 0, max: 100, step: 1, defaultValue: 10, unit: '%', color: 'purple' },
      { id: 'fossil', label: 'Fossil Fuels', min: 0, max: 100, step: 1, defaultValue: 55, unit: '%', color: 'green' },
    ],
    metrics: [
      { id: 'output', label: 'Total Output', unit: 'GW', compute: (s) => Math.round(s.solar * 0.8 + s.wind * 0.7 + s.nuclear * 1.5 + s.fossil * 1.2), color: 'amber', higherIsBetter: true },
      { id: 'carbon', label: 'Carbon', unit: 'MT', compute: (s) => +(s.fossil * 0.8 - s.solar * 0.05 - s.wind * 0.05).toFixed(1), color: 'purple', higherIsBetter: false },
      { id: 'reliability', label: 'Reliability', unit: '%', compute: (s) => Math.round(Math.min(99, 40 + s.nuclear * 0.3 + s.fossil * 0.25 + s.solar * 0.1 + s.wind * 0.08)), color: 'green', higherIsBetter: true },
      { id: 'cost', label: 'Cost', unit: '$/MW', compute: (s) => Math.round(80 + s.nuclear * 0.5 - s.solar * 0.2 - s.wind * 0.15 + s.fossil * 0.3), color: 'cyan', higherIsBetter: false },
    ],
    custom3D: {
      groundColor: "#4a5568",
      objects: [
        { type: "building", color: "#cbd5e0", position: [-5, 0, -3], height: 12, width: 3 }, // Nuclear tower
        { type: "building", color: "#718096", position: [4, 0, -5], height: 8, width: 5 }, // Coal plant
        { type: "particles", color: "#a0aec0", count: 300, size: 5, speed: 3 }, // Emissions
        { type: "tree", position: [-7, 0, 3], size: 1.5 },
        { type: "tree", position: [7, 0, 5], size: 1.2 }, // Windmills/Trees
        { type: "nature", color: "#3182ce", position: [5, 0, 5], size: 2.5 }, // Solar arrays abstract
        { type: "human", position: [-3, 0.5, 0], color: "#e2e8f0", size: 0.5 }
      ]
    }
  },
  {
    id: 'pandemic',
    title: 'Pandemic',
    description: 'Disease spread & public health',
    icon: '🦠',
    sliders: [
      { id: 'vaccination', label: 'Vaccination', min: 0, max: 100, step: 1, defaultValue: 40, unit: '%', color: 'green' },
      { id: 'lockdown', label: 'Lockdown Level', min: 0, max: 100, step: 1, defaultValue: 20, unit: '%', color: 'purple' },
      { id: 'testing', label: 'Testing Rate', min: 0, max: 100, step: 1, defaultValue: 30, unit: '%', color: 'cyan' },
      { id: 'density_p', label: 'Pop Density', min: 0, max: 100, step: 1, defaultValue: 60, unit: '%', color: 'amber' },
    ],
    metrics: [
      { id: 'infected', label: 'Infection Rate', unit: '%', compute: (s) => Math.round(Math.max(1, Math.min(80, s.density_p * 0.6 - s.vaccination * 0.4 - s.lockdown * 0.25 - s.testing * 0.1 + 20))), color: 'amber', higherIsBetter: false },
      { id: 'hospital', label: 'Hospital Load', unit: '%', compute: (s) => Math.round(Math.max(5, Math.min(100, s.density_p * 0.5 - s.vaccination * 0.35 - s.lockdown * 0.2 + 15))), color: 'purple', higherIsBetter: false },
      { id: 'gdp_hit', label: 'GDP Impact', unit: '%', compute: (s) => +(-(s.lockdown * 0.3 + s.density_p * 0.05 - s.vaccination * 0.1)).toFixed(1), color: 'cyan', higherIsBetter: true },
      { id: 'recovery', label: 'Recovery', unit: '%', compute: (s) => Math.round(Math.min(95, s.vaccination * 0.5 + s.testing * 0.25 + 20)), color: 'green', higherIsBetter: true },
    ],
    custom3D: {
      groundColor: "#1a202c",
      objects: [
        { type: "building", color: "#e2e8f0", position: [0, 0, 0], height: 8, width: 4 }, // Hospital
        { type: "building", color: "#4a5568", position: [-5, 0, 5], height: 10, width: 2 },
        { type: "building", color: "#4a5568", position: [5, 0, -5], height: 12, width: 2.5 },
        { type: "vehicle", color: "#e53e3e", position: [-2, 0.5, 2], size: 1.2, speed: 0.2, path: [[-10, 0.5, 2], [10, 0.5, 2]] }, // Ambulance
        { type: "human", position: [2, 0.5, 3], color: "#e53e3e", size: 0.5 }, // Infected
        { type: "human", position: [3, 0.5, 4], color: "#e53e3e", size: 0.5 },
        { type: "human", position: [-3, 0.5, -2], color: "#48bb78", size: 0.6 }, // Healthy/Vaxxed
        { type: "particles", color: "#9f7aea", count: 200, size: 12, speed: 1 } // Virus particles ambient
      ]
    }
  },
  {
    id: 'economy',
    title: 'Economy',
    description: 'Markets, trade & growth',
    icon: '📈',
    sliders: [
      { id: 'interest', label: 'Interest Rate', min: 0, max: 20, step: 0.25, defaultValue: 5, unit: '%', color: 'amber' },
      { id: 'trade', label: 'Trade Openness', min: 0, max: 100, step: 1, defaultValue: 60, unit: '%', color: 'green' },
      { id: 'spending', label: 'Gov Spending', min: 0, max: 100, step: 1, defaultValue: 35, unit: '%', color: 'purple' },
      { id: 'tech', label: 'Tech Investment', min: 0, max: 100, step: 1, defaultValue: 25, unit: '%', color: 'cyan' },
    ],
    metrics: [
      { id: 'gdp', label: 'GDP Growth', unit: '%', compute: (s) => +(Math.max(-5, 3 - s.interest * 0.2 + s.trade * 0.03 + s.tech * 0.04 + s.spending * 0.01)).toFixed(1), color: 'green', higherIsBetter: true },
      { id: 'inflation', label: 'Inflation', unit: '%', compute: (s) => +(Math.max(0, 5 - s.interest * 0.3 + s.spending * 0.05 + s.trade * 0.01)).toFixed(1), color: 'amber', higherIsBetter: false },
      { id: 'employment', label: 'Employment', unit: '%', compute: (s) => Math.round(Math.min(99, Math.max(70, 85 - s.interest * 0.5 + s.trade * 0.1 + s.tech * 0.08 + s.spending * 0.05))), color: 'cyan', higherIsBetter: true },
      { id: 'debt', label: 'Debt/GDP', unit: '%', compute: (s) => Math.round(Math.max(10, 60 + s.spending * 0.5 - s.trade * 0.1 - s.tech * 0.05)), color: 'purple', higherIsBetter: false },
    ],
    custom3D: {
      groundColor: "#2d3748",
      objects: [
        { type: "building", color: "#3182ce", position: [0, 0, 0], height: 18, width: 3 }, // Bank/HQ
        { type: "building", color: "#2b6cb0", position: [-4, 0, -3], height: 14, width: 2.5 },
        { type: "building", color: "#2c5282", position: [5, 0, -4], height: 16, width: 3 },
        { type: "vehicle", color: "#ecc94b", position: [-3, 0.5, 4], size: 1.5, speed: 0.1, path: [[-12, 0.5, 4], [12, 0.5, 4]] }, // Commercial truck
        { type: "vehicle", color: "#e2e8f0", position: [2, 0.5, 3], size: 0.8, speed: 0.2, path: [[12, 0.5, 3], [-12, 0.5, 3]] },
        { type: "human", position: [1, 0.5, 1], color: "#e2e8f0", size: 0.5 },
        { type: "human", position: [-2, 0.5, 2], color: "#ecc94b", size: 0.5 }
      ]
    }
  },
  {
    id: 'agriculture',
    title: 'Agriculture',
    description: 'Farming, food & sustainability',
    icon: '🌾',
    sliders: [
      { id: 'irrigation', label: 'Irrigation', min: 0, max: 100, step: 1, defaultValue: 50, unit: '%', color: 'cyan' },
      { id: 'fertilizer', label: 'Fertilizers', min: 0, max: 100, step: 1, defaultValue: 40, unit: '%', color: 'amber' },
      { id: 'organic', label: 'Organic %', min: 0, max: 100, step: 1, defaultValue: 15, unit: '%', color: 'green' },
      { id: 'tech_ag', label: 'AgriTech', min: 0, max: 100, step: 1, defaultValue: 20, unit: '%', color: 'purple' },
    ],
    metrics: [
      { id: 'yield', label: 'Crop Yield', unit: 'T/ha', compute: (s) => +(2 + s.irrigation * 0.04 + s.fertilizer * 0.05 + s.tech_ag * 0.03).toFixed(1), color: 'amber', higherIsBetter: true },
      { id: 'soil', label: 'Soil Health', unit: '%', compute: (s) => Math.round(Math.max(10, 60 + s.organic * 0.4 - s.fertilizer * 0.3 + s.tech_ag * 0.1)), color: 'green', higherIsBetter: true },
      { id: 'water', label: 'Water Use', unit: 'ML', compute: (s) => Math.round(Math.max(10, s.irrigation * 0.8 + s.fertilizer * 0.1 - s.tech_ag * 0.2)), color: 'cyan', higherIsBetter: false },
      { id: 'profit', label: 'Profit', unit: '$K', compute: (s) => Math.round(Math.max(0, 20 + s.irrigation * 0.2 + s.fertilizer * 0.15 + s.tech_ag * 0.3 - s.organic * 0.1)), color: 'purple', higherIsBetter: true },
    ],
    custom3D: {
      groundColor: "#553c30",
      objects: [
        { type: "nature", color: "#ed8936", position: [-6, 0.2, -6], size: 1.5 }, // Barn abstract
        { type: "plant", color: "#48bb78", position: [-2, 0, -2], size: 0.5 },
        { type: "plant", color: "#48bb78", position: [0, 0, -2], size: 0.5 },
        { type: "plant", color: "#48bb78", position: [2, 0, -2], size: 0.5 },
        { type: "plant", color: "#48bb78", position: [-2, 0, 0], size: 0.5 },
        { type: "plant", color: "#48bb78", position: [0, 0, 0], size: 0.5 },
        { type: "plant", color: "#48bb78", position: [2, 0, 0], size: 0.5 },
        { type: "tree", position: [5, 0, 3], size: 1.2 },
        { type: "vehicle", color: "#4299e1", position: [-4, 0.5, 3], size: 1.5, speed: 0.02, path: [[-8, 0.5, 3], [8, 0.5, 3]] } // Tractor
      ]
    }
  },
  // NEW SCENARIOS
  {
    id: 'space',
    title: 'Space Colony',
    description: 'Mars colonization & survival',
    icon: '🚀',
    sliders: [
      { id: 'oxygen_gen', label: 'O₂ Generation', min: 0, max: 100, step: 1, defaultValue: 60, unit: '%', color: 'cyan' },
      { id: 'food_prod', label: 'Food Production', min: 0, max: 100, step: 1, defaultValue: 40, unit: '%', color: 'green' },
      { id: 'energy_solar', label: 'Solar Arrays', min: 0, max: 100, step: 1, defaultValue: 50, unit: '%', color: 'amber' },
      { id: 'crew_size', label: 'Crew Size', min: 4, max: 200, step: 1, defaultValue: 30, unit: '', color: 'purple' },
    ],
    metrics: [
      { id: 'survival', label: 'Survival Rate', unit: '%', compute: (s) => Math.round(Math.min(99, Math.max(10, s.oxygen_gen * 0.4 + s.food_prod * 0.3 + s.energy_solar * 0.2 - (s.crew_size - 30) * 0.3 + 20))), color: 'green', higherIsBetter: true },
      { id: 'morale', label: 'Crew Morale', unit: '%', compute: (s) => Math.round(Math.min(100, Math.max(5, 70 - s.crew_size * 0.15 + s.food_prod * 0.2 + s.energy_solar * 0.1))), color: 'cyan', higherIsBetter: true },
      { id: 'power_balance', label: 'Power Balance', unit: 'MW', compute: (s) => +(s.energy_solar * 0.5 - s.oxygen_gen * 0.15 - s.food_prod * 0.1 - s.crew_size * 0.08).toFixed(1), color: 'amber' },
      { id: 'expansion', label: 'Expansion Rate', unit: '%/yr', compute: (s) => +(Math.max(0, s.energy_solar * 0.03 + s.food_prod * 0.02 - s.crew_size * 0.01 + 1)).toFixed(1), color: 'purple', higherIsBetter: true },
    ],
    custom3D: {
      groundColor: "#9c4221", // Mars red
      objects: [
        { type: "building", color: "#e2e8f0", position: [0, 0, 0], height: 5, width: 6 }, // Habitat dome
        { type: "building", color: "#a0aec0", position: [-6, 0, 2], height: 3, width: 3 }, // Generator
        { type: "nature", color: "#7b341e", position: [5, 0, -4], size: 4 }, // Martian Rock
        { type: "nature", color: "#7b341e", position: [8, 0, 3], size: 3 }, // Martian Rock
        { type: "vehicle", color: "#edf2f7", position: [-3, 0.5, -4], size: 1.2, speed: 0.05, path: [[-10, 0.5, -4], [10, 0.5, 4]] }, // Rover
        { type: "human", position: [2, 0.5, 2], color: "#ecc94b", size: 0.5 }, // Astronaut
        { type: "human", position: [2.5, 0.5, 2.5], color: "#ecc94b", size: 0.5 },
        { type: "ambientDust", color: "#dd6b20", count: 300, size: 25, speed: 4 } // Martian dust storm
      ]
    }
  },
  {
    id: 'wildlife',
    title: 'Wildlife',
    description: 'Ecosystems & conservation',
    icon: '🦁',
    sliders: [
      { id: 'habitat', label: 'Habitat Size', min: 0, max: 100, step: 1, defaultValue: 60, unit: '%', color: 'green' },
      { id: 'poaching', label: 'Poaching Level', min: 0, max: 100, step: 1, defaultValue: 30, unit: '%', color: 'amber' },
      { id: 'tourism', label: 'Eco Tourism', min: 0, max: 100, step: 1, defaultValue: 25, unit: '%', color: 'cyan' },
      { id: 'rangers', label: 'Rangers', min: 0, max: 100, step: 1, defaultValue: 20, unit: '%', color: 'purple' },
    ],
    metrics: [
      { id: 'species', label: 'Species Count', unit: '', compute: (s) => Math.round(Math.max(10, s.habitat * 0.6 - s.poaching * 0.4 + s.rangers * 0.3 + 20)), color: 'green', higherIsBetter: true },
      { id: 'pop_health', label: 'Pop Health', unit: '%', compute: (s) => Math.round(Math.min(100, Math.max(5, s.habitat * 0.4 - s.poaching * 0.35 + s.rangers * 0.25 + 30))), color: 'cyan', higherIsBetter: true },
      { id: 'revenue', label: 'Revenue', unit: '$M', compute: (s) => +(s.tourism * 0.4 + s.rangers * 0.05 - s.poaching * 0.1 + 5).toFixed(1), color: 'amber', higherIsBetter: true },
      { id: 'threat_level', label: 'Threat Level', unit: '/10', compute: (s) => +(Math.max(0, Math.min(10, s.poaching * 0.06 - s.rangers * 0.04 - s.habitat * 0.02 + 3))).toFixed(1), color: 'purple', higherIsBetter: false },
    ],
  },
  {
    id: 'cyber',
    title: 'Cyber',
    description: 'Network security & threats',
    icon: '🛡️',
    sliders: [
      { id: 'firewall', label: 'Firewall Level', min: 0, max: 100, step: 1, defaultValue: 60, unit: '%', color: 'cyan' },
      { id: 'encryption', label: 'Encryption', min: 0, max: 100, step: 1, defaultValue: 50, unit: '%', color: 'purple' },
      { id: 'threat_vol', label: 'Threat Volume', min: 0, max: 100, step: 1, defaultValue: 45, unit: 'K', color: 'amber' },
      { id: 'staff', label: 'Security Staff', min: 0, max: 100, step: 1, defaultValue: 30, unit: '%', color: 'green' },
    ],
    metrics: [
      { id: 'breaches', label: 'Breaches', unit: '/mo', compute: (s) => Math.round(Math.max(0, s.threat_vol * 0.3 - s.firewall * 0.2 - s.encryption * 0.15 - s.staff * 0.1 + 5)), color: 'amber', higherIsBetter: false },
      { id: 'uptime', label: 'Uptime', unit: '%', compute: (s) => +(Math.min(99.99, 95 + s.firewall * 0.03 + s.staff * 0.02 - s.threat_vol * 0.02)).toFixed(2), color: 'green', higherIsBetter: true },
      { id: 'data_loss', label: 'Data Loss Risk', unit: '%', compute: (s) => +(Math.max(0, 30 - s.encryption * 0.25 - s.firewall * 0.1 + s.threat_vol * 0.15)).toFixed(1), color: 'purple', higherIsBetter: false },
      { id: 'response_time', label: 'Response Time', unit: 'min', compute: (s) => Math.round(Math.max(1, 45 - s.staff * 0.35 - s.firewall * 0.1 + s.threat_vol * 0.1)), color: 'cyan', higherIsBetter: false },
    ],
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Learning systems & outcomes',
    icon: '🎓',
    sliders: [
      { id: 'funding', label: 'Funding', min: 0, max: 100, step: 1, defaultValue: 45, unit: '%', color: 'amber' },
      { id: 'tech_ed', label: 'EdTech', min: 0, max: 100, step: 1, defaultValue: 30, unit: '%', color: 'cyan' },
      { id: 'class_size', label: 'Class Size', min: 5, max: 60, step: 1, defaultValue: 30, unit: '', color: 'purple' },
      { id: 'teacher_quality', label: 'Teacher Training', min: 0, max: 100, step: 1, defaultValue: 50, unit: '%', color: 'green' },
    ],
    metrics: [
      { id: 'grad_rate', label: 'Graduation Rate', unit: '%', compute: (s) => Math.round(Math.min(99, Math.max(30, 50 + s.funding * 0.2 + s.teacher_quality * 0.25 + s.tech_ed * 0.1 - (s.class_size - 20) * 0.3))), color: 'green', higherIsBetter: true },
      { id: 'literacy', label: 'Literacy Score', unit: '/100', compute: (s) => Math.round(Math.min(100, Math.max(20, 40 + s.teacher_quality * 0.3 + s.funding * 0.15 + s.tech_ed * 0.15 - (s.class_size - 20) * 0.2))), color: 'cyan', higherIsBetter: true },
      { id: 'engagement', label: 'Engagement', unit: '%', compute: (s) => Math.round(Math.min(100, Math.max(10, 60 + s.tech_ed * 0.25 - (s.class_size - 20) * 0.4 + s.teacher_quality * 0.15))), color: 'amber', higherIsBetter: true },
      { id: 'cost_per', label: 'Cost/Student', unit: '$K', compute: (s) => +(s.funding * 0.2 + s.tech_ed * 0.15 + s.teacher_quality * 0.1 + 5).toFixed(1), color: 'purple', higherIsBetter: false },
    ],
  },
  {
    id: 'weather',
    title: 'Weather',
    description: 'Atmospheric conditions & forecast',
    icon: '⛈️',
    sliders: [
      { id: 'temp_w', label: 'Temperature', min: -20, max: 50, step: 1, defaultValue: 22, unit: '°C', color: 'amber' },
      { id: 'humidity', label: 'Humidity', min: 0, max: 100, step: 1, defaultValue: 55, unit: '%', color: 'cyan' },
      { id: 'wind_speed', label: 'Wind Speed', min: 0, max: 150, step: 1, defaultValue: 15, unit: 'km/h', color: 'green' },
      { id: 'pressure', label: 'Pressure', min: 960, max: 1060, step: 1, defaultValue: 1013, unit: 'hPa', color: 'purple' },
    ],
    metrics: [
      { id: 'rain_prob', label: 'Rain Chance', unit: '%', compute: (s) => Math.round(Math.min(100, Math.max(0, s.humidity * 0.7 - (s.pressure - 1000) * 0.5 + (s.temp_w > 30 ? 15 : 0)))), color: 'cyan', higherIsBetter: false },
      { id: 'feels_like', label: 'Feels Like', unit: '°C', compute: (s) => Math.round(s.temp_w - s.wind_speed * 0.1 + (s.humidity > 60 ? s.humidity * 0.05 : 0)), color: 'amber' },
      { id: 'storm_risk', label: 'Storm Risk', unit: '%', compute: (s) => Math.round(Math.min(100, Math.max(0, s.wind_speed * 0.4 + s.humidity * 0.2 - (s.pressure - 990) * 0.3))), color: 'purple', higherIsBetter: false },
      { id: 'uv_index', label: 'UV Index', unit: '/11', compute: (s) => +(Math.max(0, Math.min(11, s.temp_w * 0.15 - s.humidity * 0.03 + (100 - s.wind_speed) * 0.02))).toFixed(1), color: 'green' },
    ],
  },
];
