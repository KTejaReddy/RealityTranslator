import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ScenarioSelector from "@/components/ScenarioSelector";
import ControlPanel from "@/components/ControlPanel";
import MetricsDisplay from "@/components/MetricsDisplay";
import SimulationCanvas from "@/components/SimulationCanvas";
import { scenarios as builtInScenarios, type Scenario } from "@/lib/scenarios";
import { parseCSVToScenario } from "@/lib/csvToScenario";
import { Checkbox } from "@/components/ui/checkbox";
import { loadModels } from "@/modules/government/storage";
import { buildAreaTrafficScenario } from "@/modules/government/simulations/buildAreaTrafficScenario";
import { buildDisasterScenario } from "@/modules/government/simulations/buildDisasterScenario";
import { convertGeneratedScenarioToScenario } from "@/modules/government/ai/convertGeneratedScenario";
import type { GovernmentSimulationModel } from "@/modules/government/governmentTypes";
import { useEffect } from "react";
import type { AreaTrafficInputs } from "@/modules/government/simulations/buildAreaTrafficScenario";
import type { DisasterInputs } from "@/modules/government/simulations/buildDisasterScenario";

const exampleIds = ["traffic", "climate", "city"] as const;
const exampleScenarios = builtInScenarios.filter((s) => (exampleIds as readonly string[]).includes(s.id)) as Scenario[];

function buildVisualScenarioId(scenario: Scenario): string {
  const visualTheme = scenario.visualTheme;
  if (visualTheme) return visualTheme === "custom" ? "custom" : visualTheme;
  if (scenario.id.startsWith("custom_")) {
    if (scenario.custom3D) return "custom";
    return "climate";
  }
  return scenario.id;
}

export function ExampleSimulations() {
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [includeGovModels, setIncludeGovModels] = useState(false);
  const [govScenarios, setGovScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    if (!includeGovModels) {
      setGovScenarios([]);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const models = await loadModels();
        if (!isMounted) return;
        const converted: Scenario[] = [];
        for (const m of models) {
          const data = m.data as any;
          if (data?.kind === "traffic_area") {
            converted.push(buildAreaTrafficScenario(data.inputs as AreaTrafficInputs));
          } else if (data?.kind === "disaster") {
            converted.push(buildDisasterScenario(data.inputs as DisasterInputs));
          } else if (data?.kind === "generated") {
            converted.push(convertGeneratedScenarioToScenario(data.raw));
          }
        }
        setGovScenarios(converted);
      } catch {
        if (isMounted) setGovScenarios([]);
      }
    })();

    return () => { isMounted = false; };
  }, [includeGovModels]);

  const allScenarios = useMemo(() => [...exampleScenarios, ...customScenarios, ...(includeGovModels ? govScenarios : [])], [customScenarios, includeGovModels, govScenarios]);

  const [selectedId, setSelectedId] = useState<string>(exampleScenarios[0]?.id ?? "climate");
  const scenario = useMemo(() => allScenarios.find((s) => s.id === selectedId) ?? allScenarios[0], [allScenarios, selectedId]);

  useEffect(() => {
    if (!scenario) return;
    if (!allScenarios.some((s) => s.id === selectedId)) {
      setSelectedId(allScenarios[0]?.id ?? selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allScenarios]);

  const [allValues, setAllValues] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    exampleScenarios.forEach((s) => {
      init[s.id] = {};
      s.sliders.forEach((sl) => {
        init[s.id][sl.id] = sl.defaultValue;
      });
    });
    return init;
  });

  const sliderValues = allValues[selectedId] ?? {};

  const handleSliderChange = useCallback(
    (id: string, value: number) => {
      setAllValues((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], [id]: value },
      }));
    },
    [selectedId],
  );

  const handleRemoveCustom = useCallback(
    (id: string) => {
      setCustomScenarios((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(exampleScenarios[0]?.id ?? "climate");
      setAllValues((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [selectedId],
  );

  const handleDatasetUpload = useCallback(
    async (file: File | null) => {
      if (!file) return;
      try {
        if (!file.name.toLowerCase().endsWith(".csv")) {
          toast.error("Only CSV datasets are supported in this demo.");
          return;
        }

        const next = await parseCSVToScenario(file);
        setCustomScenarios((prev) => [...prev, next]);

        const init: Record<string, number> = {};
        next.sliders.forEach((sl) => {
          init[sl.id] = sl.defaultValue;
        });

        setAllValues((prev) => ({ ...prev, [next.id]: init }));
        setSelectedId(next.id);
        toast.success(`Loaded dataset as "${next.title}".`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to parse dataset.");
      }
    },
    [],
  );

  const visualScenarioId = useMemo(() => buildVisualScenarioId(scenario), [scenario]);

  const mappedSliderValues = useMemo(() => {
    if (!scenario.id.startsWith("custom_")) return sliderValues;
    const baseScenario = builtInScenarios.find((s) => s.id === visualScenarioId);
    if (!baseScenario) return sliderValues;

    const mapped: Record<string, number> = { ...sliderValues };
    const aiIds = scenario.sliders.map((s) => s.id);
    const baseIds = baseScenario.sliders.map((s) => s.id);

    for (let i = 0; i < baseIds.length; i++) {
      const aiId = aiIds[i];
      const baseId = baseIds[i];
      if (aiId && baseId) {
        mapped[baseId] = sliderValues[aiId] ?? 50;
      }
    }

    return mapped;
  }, [scenario, sliderValues, visualScenarioId]);

  const metricValues = useMemo(() => {
    const result: Record<string, number> = {};
    scenario.metrics.forEach((m) => {
      result[m.id] = m.compute(sliderValues);
    });
    return result;
  }, [scenario, sliderValues]);

  return (
    <div className="flex-1 w-full max-w-[1800px] mx-auto px-4 pb-4 flex flex-col lg:flex-row gap-4 overflow-hidden pt-4">
      <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto no-scrollbar pr-1 flex-none">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-5 rounded-3xl border-white/10 shadow-xl bg-black/40"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧪</span>
              <h2 className="font-display font-bold text-lg text-white truncate">Example Simulations</h2>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Checkbox checked={includeGovModels} onCheckedChange={(v) => setIncludeGovModels(Boolean(v))} />
              <span className="text-xs text-white/70">Show official-created models</span>
            </div>
          </div>

          <ScenarioSelector scenarios={allScenarios} selected={selectedId} onSelect={setSelectedId} onRemoveCustom={handleRemoveCustom} />

          <div className="mt-5 pt-4 border-t border-white/10">
            <label className="text-xs font-bold text-accent uppercase tracking-widest">Optional dataset upload (CSV)</label>
            <div className="mt-2">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleDatasetUpload(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-white/70"
              />
            </div>
          </div>

          <div className="mt-5">
            <ControlPanel sliders={scenario.sliders} values={sliderValues} onChange={handleSliderChange} />
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative min-h-[400px]">
        <div className="flex-none p-3 pt-4 w-full flex justify-between items-start bg-black/50 border-b border-white/5 backdrop-blur-md z-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{scenario.icon}</span>
              <h2 className="font-display font-bold text-lg text-white">{scenario.title}</h2>
            </div>
            <p className="text-white/50 text-xs mt-1">{scenario.description}</p>
          </div>
        </div>

        <div className="flex-1 relative bg-black">
          <SimulationCanvas scenario={visualScenarioId} sliderValues={mappedSliderValues} custom3D={scenario.custom3D} />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />
        </div>
      </div>

      <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto no-scrollbar pl-1 flex-none">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-5 rounded-3xl border-white/10 shadow-xl bg-black/40"
        >
          <MetricsDisplay metrics={scenario.metrics} values={metricValues} />
        </motion.div>
      </div>
    </div>
  );
}

