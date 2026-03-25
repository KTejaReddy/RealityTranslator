import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader2, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Scenario, MetricConfig } from '@/lib/scenarios';
import { toast } from 'sonner';

interface AIScenarioGeneratorProps {
  onScenarioCreated: (scenario: Scenario) => void;
}

const examplePrompts = [
  "Simulate a Mars colonization mission",
  "Model a startup's growth trajectory",
  "Simulate a wildfire spreading in a forest",
  "Model the effects of social media on mental health",
  "Simulate a space station life support system",
  "Model water scarcity in a desert city",
];

function buildMetricCompute(formula: string, sliderIds: string[]): MetricConfig['compute'] {
  // Build a simple compute function based on the formula description
  // Parse the formula to understand relationships
  return (vals: Record<string, number>) => {
    const sliderValues = sliderIds.map(id => vals[id] ?? 50);
    const avg = sliderValues.reduce((a, b) => a + b, 0) / sliderValues.length;
    
    // Use formula keywords to determine behavior
    const lowerFormula = formula.toLowerCase();
    let result = 50;
    
    for (const id of sliderIds) {
      const val = vals[id] ?? 50;
      if (lowerFormula.includes(id) && lowerFormula.includes('increase')) {
        result += (val - 50) * 0.3;
      } else if (lowerFormula.includes(id) && lowerFormula.includes('decrease')) {
        result -= (val - 50) * 0.3;
      } else {
        // Default: slight positive correlation with first two, negative with rest
        const idx = sliderIds.indexOf(id);
        result += (val - 50) * (idx < 2 ? 0.2 : -0.15);
      }
    }
    
    return Math.round(Math.max(0, Math.min(100, result)) * 10) / 10;
  };
}

function generateMockScenario(prompt: string): Scenario {
  const p = prompt.toLowerCase();
  
  let title = "Complex System";
  let description = `A simulated environmental model of ${prompt.trim()}`;
  let icon = "🌐";
  let visualTheme: any = "climate";
  let custom3D: any = null;
  let sliders = [
    { id: "v1", label: "Resource Allocation", min: 0, max: 100, step: 1, defaultValue: 50, unit: "%", color: "cyan" },
    { id: "v2", label: "System Load", min: 0, max: 100, step: 1, defaultValue: 50, unit: "%", color: "purple" },
    { id: "v3", label: "Efficiency", min: 0, max: 100, step: 1, defaultValue: 75, unit: "%", color: "green" },
    { id: "v4", label: "External Factors", min: 0, max: 100, step: 1, defaultValue: 40, unit: "%", color: "amber" }
  ];
  let metrics = [
    { id: "m1", label: "Overall Output", unit: "U", color: "cyan", higherIsBetter: true, formula: "increases with v1 and v3, decreases with v4" },
    { id: "m2", label: "System Stability", unit: "%", color: "green", higherIsBetter: true, formula: "increases with v3, decreases with v2" },
    { id: "m3", label: "Risk Factor", unit: "%", color: "amber", higherIsBetter: false, formula: "increases with v2 and v4" },
    { id: "m4", label: "Growth Potential", unit: "Idx", color: "purple", higherIsBetter: true, formula: "increases with v1, decreases with v4" }
  ];

  if (p.includes("mars") || p.includes("space") || p.includes("orbit")) {
    title = "Space Colony";
    icon = "🪐";
    visualTheme = "space";
    sliders = [
      { id: "oxygen", label: "O2 Production", min: 0, max: 100, step: 1, defaultValue: 80, unit: "%", color: "cyan" },
      { id: "power", label: "Power Yield", min: 0, max: 100, step: 1, defaultValue: 75, unit: "%", color: "amber" },
      { id: "population", label: "Population", min: 10, max: 1000, step: 10, defaultValue: 150, unit: " ppl", color: "purple" },
      { id: "temp", label: "Habitat Temp", min: 10, max: 30, step: 0.5, defaultValue: 21, unit: " °C", color: "green" }
    ];
    metrics = [
      { id: "surv", label: "Survivability", unit: "%", color: "green", higherIsBetter: true, formula: "increases with oxygen and power, decreases with population" },
      { id: "morale", label: "Crew Morale", unit: "Idx", color: "purple", higherIsBetter: true, formula: "increases with temp, decreases with population" },
      { id: "energy", label: "Energy Drain", unit: " kW", color: "amber", higherIsBetter: false, formula: "increases with population and temp, decreases with power" },
      { id: "reserves", label: "Reserves", unit: " T", color: "cyan", higherIsBetter: true, formula: "increases with oxygen, decreases with population" }
    ];
  } else if (p.includes("startup") || p.includes("business") || p.includes("market") || p.includes("economy")) {
    title = "Startup Growth";
    icon = "📈";
    visualTheme = "economy";
    sliders = [
      { id: "funding", label: "Funding", min: 0, max: 100, step: 1, defaultValue: 25, unit: " M$", color: "green" },
      { id: "marketing", label: "Marketing", min: 0, max: 100, step: 1, defaultValue: 30, unit: " k$", color: "purple" },
      { id: "team", label: "Team Size", min: 1, max: 100, step: 1, defaultValue: 12, unit: " p", color: "cyan" },
      { id: "burn", label: "Burn Rate", min: 10, max: 500, step: 10, defaultValue: 50, unit: " k$/mo", color: "amber" }
    ];
    metrics = [
      { id: "runway", label: "Runway", unit: " mo", color: "cyan", higherIsBetter: true, formula: "increases with funding, decreases with burn" },
      { id: "revenue", label: "MRR", unit: " k$", color: "green", higherIsBetter: true, formula: "increases with marketing and team" },
      { id: "cac", label: "CAC", unit: " $", color: "amber", higherIsBetter: false, formula: "increases with marketing, decreases with team" },
      { id: "val", label: "Valuation", unit: " M$", color: "purple", higherIsBetter: true, formula: "increases with funding and revenue, decreases with burn" }
    ];
  } else if (p.includes("wildfire") || p.includes("forest") || p.includes("climate") || p.includes("environment")) {
    title = "Forest Wildfire";
    icon = "🔥";
    visualTheme = "wildlife";
    sliders = [
      { id: "wind", label: "Wind Speed", min: 0, max: 120, step: 1, defaultValue: 45, unit: " km/h", color: "cyan" },
      { id: "dryness", label: "Dryness", min: 0, max: 100, step: 1, defaultValue: 82, unit: "%", color: "amber" },
      { id: "temp", label: "Temperature", min: 10, max: 50, step: 0.5, defaultValue: 34, unit: " °C", color: "purple" },
      { id: "resp", label: "Response", min: 0, max: 100, step: 1, defaultValue: 60, unit: "%", color: "green" }
    ];
    metrics = [
      { id: "spread", label: "Spread Rate", unit: " m/s", color: "amber", higherIsBetter: false, formula: "increases with wind and dryness, decreases with resp" },
      { id: "destroyed", label: "Destroyed", unit: " ha", color: "purple", higherIsBetter: false, formula: "increases with wind and temp, decreases with resp" },
      { id: "cont", label: "Containment", unit: "%", color: "green", higherIsBetter: true, formula: "increases with resp, decreases with wind and dryness" },
      { id: "risk", label: "Town Risk", unit: "Idx", color: "cyan", higherIsBetter: false, formula: "increases with wind and dryness, decreases with cont" }
    ];
  } else if (p.includes("water") || p.includes("desert") || p.includes("city") || p.includes("flood")) {
    title = p.includes("flood") ? "Urban Flood Crisis" : "City Water Mgmt";
    icon = "🌊";
    visualTheme = "custom";
    custom3D = {
      groundColor: "#1a1e2e",
      objects: [
        { type: "building", color: "#1a2a4a", position: [-2, 0, -2], height: 8, width: 2 },
        { type: "building", color: "#1a2a4a", position: [3, 0, -1], height: 12, width: 2.5 },
        { type: "building", color: "#2a3a5a", position: [1, 0, 3], height: 6, width: 3 },
        { type: "building", color: "#1a2a4a", position: [-4, 0, 2], height: 10, width: 2 },
        { type: "water", color: "#0066aa", position: [0, 0, 0], size: 20 },
        { type: "tree", position: [-1, 0, 1], size: 1 },
        { type: "tree", position: [2, 0, 2], size: 1.2 },
        { type: "tree", position: [-3, 0, -1], size: 0.8 },
        { type: "human", position: [0, 0.5, 2], color: "#ffcccc", size: 0.5 },
        { type: "vehicle", position: [-2, 0.5, 3], color: "#ff3333", size: 0.8 },
        { type: "particles", color: "#aaaaaa", count: 800, size: 20, speed: 2 } // Rain
      ]
    };
    sliders = [
      { id: "rain", label: "Rainfall Intensity", min: 0, max: 200, step: 1, defaultValue: 80, unit: " mm", color: "cyan" },
      { id: "drainage", label: "Drainage Config", min: 0, max: 100, step: 1, defaultValue: 40, unit: "%", color: "purple" },
      { id: "barrier", label: "Flood Barriers", min: 0, max: 100, step: 1, defaultValue: 30, unit: "%", color: "green" },
      { id: "pop", label: "Vulnerable Pop.", min: 0, max: 50, step: 1, defaultValue: 25, unit: " K", color: "amber" }
    ];
    metrics = [
      { id: "flood_level", label: "Flood Level", unit: " m", color: "cyan", higherIsBetter: false, formula: "increases with rain, decreases with drainage and barrier" },
      { id: "damage", label: "M$ Damage", unit: " M", color: "amber", higherIsBetter: false, formula: "increases with rain and pop, decreases with barrier" },
      { id: "evac", label: "Evacuated", unit: "%", color: "purple", higherIsBetter: true, formula: "increases with pop and rain" },
      { id: "safety", label: "Safety Index", unit: "Idx", color: "green", higherIsBetter: true, formula: "increases with drainage and barrier, decreases with rain" }
    ];
  } else if (p.includes("social") || p.includes("media") || p.includes("health")) {
    title = "Social Dynamics";
    icon = "📱";
    visualTheme = "cyber";
    sliders = [
      { id: "usage", label: "Screen Time", min: 0, max: 100, step: 1, defaultValue: 60, unit: " m", color: "purple" },
      { id: "alg", label: "Algorithm Aggressiveness", min: 0, max: 100, step: 1, defaultValue: 80, unit: "%", color: "amber" },
      { id: "mod", label: "Content Moderation", min: 0, max: 100, step: 1, defaultValue: 40, unit: "%", color: "green" },
      { id: "conn", label: "Real Connections", min: 0, max: 100, step: 1, defaultValue: 50, unit: "%", color: "cyan" }
    ];
    metrics = [
      { id: "eng", label: "Engagement", unit: "Idx", color: "purple", higherIsBetter: true, formula: "increases with usage and alg, decreases with mod" },
      { id: "well", label: "Wellbeing", unit: "%", color: "green", higherIsBetter: true, formula: "increases with conn and mod, decreases with usage and alg" },
      { id: "tox", label: "Toxicity", unit: "%", color: "amber", higherIsBetter: false, formula: "increases with alg, decreases with mod and conn" },
      { id: "reten", label: "Retention", unit: "%", color: "cyan", higherIsBetter: true, formula: "increases with conn and usage, decreases with tox" }
    ];
  }

  const sliderIds = sliders.map(s => s.id);
  const finalMetrics: MetricConfig[] = metrics.map((m: any) => ({
    id: m.id,
    label: m.label,
    unit: m.unit,
    color: m.color,
    higherIsBetter: m.higherIsBetter,
    compute: buildMetricCompute(m.formula, sliderIds)
  }));

  return {
    id: `custom_${Date.now()}`,
    title,
    description: description,
    icon,
    visualTheme,
    custom3D,
    sliders: sliders as any,
    metrics: finalMetrics
  };
}

const AIScenarioGenerator = ({ onScenarioCreated }: AIScenarioGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('Generating AI Simulation...');
  const [currentExample, setCurrentExample] = useState(0);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setStatusText('Building Reality Simulation...');
    
    try {
      let scenario: Scenario | null = null;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (apiKey) {
        try {
          const sysInst = `You are an expert scientific, economic, and systemic simulation generator. Your primary and absolute directive is to generate a highly realistic, deeply custom-tailored JSON scenario configuration based EXACTLY on the user's request. YOU MUST PERFECTLY SIMULATE WHAT THE USER ASKS FOR. DO NOT JUST THROW A DEFAULT OR GENERIC SIMULATION. The simulation MUST be deeply related to the user's prompt. If they ask for a 'medieval bakery', you must create sliders/metrics specific to medieval baking, NOT generic business metrics. 

Avoid generic terms like "Input A". Instead, use precise, real-world parameters, variables, and metrics that match the true mechanics of the specific unique topic the user asks for.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "title": "Short, specific title (1-3 words)",
  "description": "Provide a brief 3 to 4 sentence AI explanation of exactly how this simulation works. You MUST explain the core concepts and mechanisms simply. Avoid all jargon so that a beginner can easily understand the full picture.",
  "icon": "single emoji",
  "visualTheme": "custom",
  "custom3D": {
    "groundColor": "#HEXCOLOR",
    "objects": [
      {
        "type": "human|vehicle|furniture|decoration|plant|nature|building|tree|water|movingObject|particles|ambientDust|dome|road|tower",
        "color": "#HEXCOLOR",
        "position": [0, 0, 0],
        "rotation": [0, 0, 0],
        "size": 1.0,
        "count": 100,
        "height": 5,
        "width": 2,
        "speed": 0.1,
        "path": [[-5,0,0], [5,0,0]],
        "linkedSlider": "snake_case_id_of_the_slider_this_object_should_logically_react_to"
      }
    ]
  },
  "sliders": [
    {
      "id": "snake_case_id",
      "label": "Precise Parameter Name",
      "min": 0,
      "max": 100,
      "step": 1,
      "defaultValue": 50,
      "unit": "%",
      "color": "cyan"
    }
  ],
  "metrics": [
    {
      "id": "snake_case_id",
      "label": "Specific Outcome Metric",
      "unit": "%",
      "color": "cyan",
      "higherIsBetter": true,
      "formula": "description of how sliders affect this metric using keywords 'increase' and 'decrease' and slider IDs"
    }
  ]
}

Rules:
- ACT AS A MASTER 3D SCENE DIRECTOR: For ANY scenario, dynamically design a perfect, thematic 3D world using your deep knowledge of aesthetics and physics.
- **COMPOUND OBJECT ASSEMBLER**: If the user asks for a specific machine or complex object (like a "water turbine", "solar panel", or "reactor"), do NOT just place a single generic building. You MUST physically assemble it out of multiple intersected primitives! For example, build a turbine by placing a 'tower' for the primary body, and then placing several slim 'building' items at the exact same X,Z but higher Y coordinate, heavily using the \`rotation\` [x,y,z in radians] property to angle them as blades! Be highly creative!
- **PROPER PRIMITIVE USAGE**: Do NOT just default to scattering 'building's everywhere! If it's nature, use 'tree', 'plant', 'water'. If it's a disaster, use 'nature' (colored like debris), 'ambientDust', and 'particles'. Use \`rotation\` to tilt ruined buildings!
- **CINEMATIC COLOR & LIGHTING**: Autonomously determine the PERFECT 'color' and 'emissive' hex codes.
- Generate between 20 to 60 3D objects spread wide across the environment.
- **CRITICAL ARCHITECTURAL LAYOUT**: You MUST tightly pack objects on a strict grid! Spread coordinates from completely -5 to +5 on both X and Z axes (e.g. [-4, 0, 4]). Do NOT use large coordinates like 12 or 8! However, for Compound Object Assemblies (like turbines), you must stack the sub-components at the exact same X,Z coordinate but layer their Y positioning and \`rotation\` to build the machine!
- Always generate exactly 4 sliders and 4 metrics.
- **LOGICAL SLIDER PHYSICS**: You MUST bind objects to sliders intelligently using \`linkedSlider\`! If the user moves a "Wind Speed" slider, the particles should have \`"linkedSlider": "wind_speed"\` so their speed changes! If they move a "Construction" slider, the buildings should physically grow so use \`"linkedSlider": "construction"\`. Do not leave it blank if perfectly logical!
- Colors must be one of: "cyan", "purple", "green", "amber"
- Use diverse colors across sliders and metrics
- Make all slider ranges (min, max, and defaultValue) highly realistic and scientifically/factually accurate for the real-world domain.
- Units can be: %, °C, $, K, M, B, GT, MW, AQI, /100, yr, or domain-specific short units.
- Each metric formula should describe the accurate mathematical/logical relationship with slider IDs according to how the real world works.
- Keep ground coordinates near 0 on the Y axis. Space "position" coordinates out logically so objects don't clip!`;

          let attempts = 0;
          let success = false;
          
          while (attempts < 3 && !success) {
            if (attempts > 0) {
               setStatusText(`Rate Limit Reached. Retrying (${attempts}/3)...`);
               await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempts))); // Exponential backoff
            }
            
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: sysInst }] },
                contents: [{ role: "user", parts: [{ text: prompt.trim() }] }],
                generationConfig: { responseMimeType: "application/json" }
              })
            });

            if (res.status === 429) {
               attempts++;
               continue;
            }

            if (res.ok) {
              const geminiData = await res.json();
              const textResp = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textResp) {
                let cleanedResp = textResp;
                try {
                  cleanedResp = textResp.replace(/^```(json)?/, '').replace(/```$/, '').trim();
                  const raw = JSON.parse(cleanedResp);
                const sliderIds = raw.sliders.map((s: any) => s.id);

                scenario = {
                  id: `custom_${Date.now()}`,
                  title: raw.title,
                  description: raw.description,
                  icon: raw.icon,
                  visualTheme: raw.visualTheme || 'custom',
                  custom3D: raw.custom3D,
                  sliders: raw.sliders.slice(0, 4).map((s: any, i: number) => ({
                    ...s,
                    color: s.color || (['cyan', 'purple', 'green', 'amber'] as const)[i % 4],
                  })),
                  metrics: raw.metrics.slice(0, 4).map((m: any, i: number) => ({
                    id: m.id,
                    label: m.label,
                    unit: m.unit,
                    color: m.color || (['cyan', 'purple', 'green', 'amber'] as const)[i % 4],
                    higherIsBetter: m.higherIsBetter ?? true,
                    compute: buildMetricCompute(m.formula || '', sliderIds),
                  })),
                };
                success = true;
                } catch (parseError) {
                  console.error("JSON parse failed. Raw string:", textResp, parseError);
                }
              }
            } else {
               // Break on other errors (like 400 Bad Request)
               break;
            }
          }
        } catch (e) {
          console.error("Direct Gemini API failed", e);
        }
      }

      if (!scenario) {
        // Ultimate local fallback
        scenario = generateMockScenario(prompt);
      }

      onScenarioCreated(scenario);
      setIsOpen(false);
      setPrompt('');
      toast.success(`Created "${scenario.title}" simulation!`);
    } catch (err) {
      console.error('Generation UI error:', err);
      toast.error('Unexpected error, please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isGenerating, onScenarioCreated]);

  return (
    <div className="w-full max-w-4xl mx-auto pointer-events-auto flex flex-col items-center gap-3">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full glass-panel rounded-full p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 border-white/20 shadow-[0_0_40px_rgba(0,255,255,0.15)] bg-black/70 backdrop-blur-3xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
        
        <div className="pl-4 md:pl-6 pr-2 flex items-center justify-center pointer-events-none mb-2 md:mb-0">
          {isGenerating ? (
             <Loader2 className="w-6 h-6 text-accent animate-spin drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          ) : (
             <Wand2 className="w-6 h-6 text-accent drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          )}
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder={isGenerating ? statusText : "Describe a perfect simulation you want to generate (e.g., 'Cyberpunk metropolis traffic') ✨"}
          className="flex-1 bg-transparent border-none text-sm md:text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-0 px-2 py-3 w-full font-body font-medium"
          disabled={isGenerating}
        />

        <div className="pr-2 w-full md:w-auto mt-2 md:mt-0 flex justify-end">
           <button
             onClick={handleGenerate}
             disabled={!prompt.trim() || isGenerating}
             className="w-full md:w-12 h-10 md:h-12 rounded-full bg-accent hover:bg-accent/80 disabled:opacity-50 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(168,85,247,0.6)]"
           >
             <Send className="w-5 h-5 text-white" />
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AIScenarioGenerator;
