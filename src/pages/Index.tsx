import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScenarioSelector from "../components/ScenarioSelector";
import ControlPanel from "../components/ControlPanel";
import MetricsDisplay from "../components/MetricsDisplay";
import SimulationCanvas from "../components/SimulationCanvas";
import AIScenarioGenerator from "../components/AIScenarioGenerator";
import { scenarios as builtInScenarios, type Scenario } from '@/lib/scenarios';

const Index = () => {
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const allScenarios = useMemo(() => [...builtInScenarios, ...customScenarios], [customScenarios]);

  const [selectedId, setSelectedId] = useState<string>('climate');
  const scenario = useMemo(() => allScenarios.find(s => s.id === selectedId) ?? allScenarios[0], [allScenarios, selectedId]);

  const [allValues, setAllValues] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    builtInScenarios.forEach(s => {
      init[s.id] = {};
      s.sliders.forEach(sl => { init[s.id][sl.id] = sl.defaultValue; });
    });
    return init;
  });

  const sliderValues = allValues[selectedId] ?? {};

  const handleSliderChange = useCallback((id: string, value: number) => {
    setAllValues(prev => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], [id]: value },
    }));
  }, [selectedId]);

  const handleScenarioCreated = useCallback((newScenario: Scenario) => {
    setCustomScenarios(prev => [...prev, newScenario]);
    const init: Record<string, number> = {};
    newScenario.sliders.forEach(sl => { init[sl.id] = sl.defaultValue; });
    setAllValues(prev => ({ ...prev, [newScenario.id]: init }));
    setSelectedId(newScenario.id);
  }, []);

  const handleRemoveCustom = useCallback((id: string) => {
    setCustomScenarios(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId('climate');
    setAllValues(prev => { const next = { ...prev }; delete next[id]; return next; });
  }, [selectedId]);

  const metricValues = useMemo(() => {
    const result: Record<string, number> = {};
    scenario.metrics.forEach(m => { result[m.id] = m.compute(sliderValues); });
    return result;
  }, [scenario, sliderValues]);

  const visualScenario = scenario.visualTheme || (scenario.id.startsWith('custom_') && scenario.custom3D ? 'custom' : (scenario.id.startsWith('custom_') ? 'climate' : scenario.id));

  const mappedSliderValues = useMemo(() => {
    if (!scenario.id.startsWith('custom_')) return sliderValues;
    const baseScenario = builtInScenarios.find(s => s.id === visualScenario);
    if (!baseScenario) return sliderValues;

    const mapped: Record<string, number> = { ...sliderValues };
    const aiIds = scenario.sliders.map(s => s.id);
    const baseIds = baseScenario.sliders.map(s => s.id);

    // Map AI sliders to exactly what the 3D scene expects structurally
    for (let i = 0; i < baseIds.length; i++) {
        const aiId = aiIds[i];
        const baseId = baseIds[i];
        if (aiId && baseId) {
            mapped[baseId] = sliderValues[aiId] ?? 50;
        }
    }
    return mapped;
  }, [scenario, sliderValues, visualScenario]);

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col font-body selection:bg-primary/30">
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex-none p-4 w-full flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-3 glass-panel px-5 py-3 rounded-2xl border-white/10 shadow-lg shadow-black/20">
          <span className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,255,255,0.2)]">🌐</span>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight leading-none text-white">
              Reality <span className="text-primary glow-text-cyan font-light">Translator</span>
            </h1>
            <p className="text-white/50 text-[10px] uppercase font-semibold tracking-wider mt-1">AI Powered Sandbox</p>
          </div>
        </div>

        <ScenarioSelector
          scenarios={allScenarios}
          selected={selectedId}
          onSelect={setSelectedId}
          onRemoveCustom={handleRemoveCustom}
        />
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1800px] mx-auto px-4 pb-4 flex flex-col lg:flex-row gap-4 overflow-hidden">
        
        {/* Left Column: Variables & Explanation */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto no-scrollbar pr-1 flex-none">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-5 rounded-3xl border-white/10 shadow-xl bg-black/40"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{scenario.icon}</span>
              <h2 className="font-display font-bold text-lg text-white truncate">{scenario.title}</h2>
            </div>
            <ControlPanel sliders={scenario.sliders} values={sliderValues} onChange={handleSliderChange} />
          </motion.div>

        </div>

        {/* Center Column: AI Prompt & 3D Simulation */}
        <div className="flex-1 flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative min-h-[400px]">
          {/* AI Generator Box at Top Center */}
          <div className="flex-none p-3 pt-4 w-full flex justify-center bg-black/50 border-b border-white/5 backdrop-blur-md z-20">
            <AIScenarioGenerator onScenarioCreated={handleScenarioCreated} />
          </div>
          
          {/* 3D Canvas boxed inside this div */}
          <div className="flex-1 relative bg-black">
            <SimulationCanvas scenario={visualScenario} sliderValues={mappedSliderValues} custom3D={scenario.custom3D} />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />
          </div>
        </div>

        {/* Right Column: Metrics & Explanation */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto no-scrollbar pl-1 flex-none">
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-5 rounded-3xl border-white/10 shadow-xl bg-black/40"
          >
            <MetricsDisplay metrics={scenario.metrics} values={metricValues} />
          </motion.div>

          {scenario.description && (
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-6 rounded-3xl border-white/10 shadow-xl bg-black/40 flex-1"
            >
              <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> AI Explanation
              </h3>
              <p className="text-base md:text-lg text-white/90 leading-relaxed font-light tracking-wide">{scenario.description}</p>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Index;
