import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { GovernmentDataset, GovernmentSimulationModel, GovernmentRequest } from "./governmentTypes";
import { loadDatasets, loadModels, loadRequests, saveDataset, saveModel, saveRequest } from "./storage";
import { DashboardNav } from "@/modules/auth/DashboardNav";
import { ProtectedRoute } from "@/modules/auth/ProtectedRoute";
import SimulationCanvas from "@/components/SimulationCanvas";
import ControlPanel from "@/components/ControlPanel";
import MetricsDisplay from "@/components/MetricsDisplay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import AILiveInsights from "@/components/AILiveInsights";
import type { Scenario } from "@/lib/scenarios";
import { buildAreaTrafficScenario } from "./simulations/buildAreaTrafficScenario";
import { buildDisasterScenario } from "./simulations/buildDisasterScenario";
import { parseGovernmentRequestToScenarioWithRaw } from "./ai/parseGovernmentRequestToScenario";
import { convertGeneratedScenarioToScenario } from "./ai/convertGeneratedScenario";
import { parseCSVToScenario } from "@/lib/csvToScenario";
import type { AreaTrafficInputs } from "./simulations/buildAreaTrafficScenario";
import type { DisasterInputs } from "./simulations/buildDisasterScenario";

type ScenarioSourceKind = "traffic_area" | "disaster" | "government_model" | "live_mapping" | null;

function initSliderValues(scenario: Scenario): Record<string, number> {
  const init: Record<string, number> = {};
  scenario.sliders.forEach((sl) => {
    init[sl.id] = sl.defaultValue;
  });
  return init;
}

function getVisualScenarioId(scenario: Scenario): string {
  // For generated/built custom simulations we always use the `custom` viewer path.
  if (scenario.visualTheme && scenario.visualTheme !== "custom") return scenario.visualTheme;
  if (scenario.visualTheme === "custom" || scenario.custom3D) return "custom";
  if (scenario.id.startsWith("custom_")) return "climate";
  return scenario.id;
}

export function GovernmentDashboard() {
  // This component is protected by the route wrapper; keep it additive.
  const createdBy = "government";

  const [datasets, setDatasets] = useState<GovernmentDataset[]>([]);
  const [models, setModels] = useState<GovernmentSimulationModel[]>([]);
  const [requests, setRequests] = useState<GovernmentRequest[]>([]);

  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [scenarioSourceKind, setScenarioSourceKind] = useState<ScenarioSourceKind>(null);
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [activeRawGeneratedScenario, setActiveRawGeneratedScenario] = useState<unknown | null>(null);

  // Track inputs used to build the current scenario, so we can save models reliably.
  const [trafficInputs, setTrafficInputs] = useState<AreaTrafficInputs | null>(null);
  const [disasterInputs, setDisasterInputs] = useState<DisasterInputs | null>(null);
  const [lastRequestInputs, setLastRequestInputs] = useState<{ requestType: string; region: string; datasetOrParameters: string } | null>(null);

  const [datasetForm, setDatasetForm] = useState({
    name: "",
    type: "live_mapping" as GovernmentDataset["type"],
    region: "",
    source: "",
    format: "csv" as GovernmentDataset["format"],
    file: null as File | null,
  });

  const [liveModelFile, setLiveModelFile] = useState<File | null>(null);

  const [trafficDataForm, setTrafficDataForm] = useState({
    file: null as File | null,
    url: "",
  });

  const [modelLoadId, setModelLoadId] = useState<string>("");

  const [requestForm, setRequestForm] = useState({
    requestType: "traffic",
    region: "",
    datasetOrParameters: "",
  });

  const [disasterForm, setDisasterForm] = useState<{
    disasterType: DisasterInputs["disasterType"];
    region: string;
    intensity: number;
  }>({
    disasterType: "flood",
    region: "",
    intensity: 60,
  });

  const [trafficForm, setTrafficForm] = useState<AreaTrafficInputs>({
    region: "",
    vehicles: 70,
    roads: 45,
    signals: 40,
    demand: 60,
  });

  useEffect(() => {
    loadDatasets().then(setDatasets);
    loadModels().then(setModels);
    loadRequests().then(setRequests);
  }, []);


  const activeVisualScenarioId = activeScenario ? getVisualScenarioId(activeScenario) : "climate";

  const metricValues = useMemo(() => {
    if (!activeScenario) return {};
    const result: Record<string, number> = {};
    activeScenario.metrics.forEach((m) => {
      result[m.id] = m.compute(sliderValues);
    });
    return result;
  }, [activeScenario, sliderValues]);

  const initializeActiveScenario = useCallback(
    (scenario: Scenario, kind: ScenarioSourceKind) => {
      setActiveScenario(scenario);
      setScenarioSourceKind(kind);
      setSliderValues(initSliderValues(scenario));
      setActiveRawGeneratedScenario(null);
    },
    [],
  );

  const handleSaveModel = useCallback(() => {
    if (!activeScenario || !scenarioSourceKind) {
      toast.error("Run a simulation first.");
      return;
    }

    const id = `model_${Date.now()}`;
    const base: GovernmentSimulationModel = {
      id,
      name: activeScenario.title,
      type: scenarioSourceKind === "traffic_area" ? "traffic_area" : scenarioSourceKind === "disaster" ? "disaster" : scenarioSourceKind === "live_mapping" ? "live_mapping" : "government_model",
      region: (() => {
        if (trafficInputs?.region) return trafficInputs.region;
        if (disasterInputs?.region) return disasterInputs.region;
        if (lastRequestInputs?.region) return lastRequestInputs.region;
        return "";
      })(),
      data: {},
      createdBy,
      createdAt: Date.now(),
    };

    if (scenarioSourceKind === "traffic_area" && trafficInputs) {
      base.data = { kind: "traffic_area", inputs: trafficInputs };
    } else if (scenarioSourceKind === "disaster" && disasterInputs) {
      base.data = { kind: "disaster", inputs: disasterInputs };
    } else if (scenarioSourceKind === "government_model" && activeRawGeneratedScenario) {
      base.data = { kind: "generated", raw: activeRawGeneratedScenario };
    } else if (scenarioSourceKind === "live_mapping" && lastRequestInputs) {
      base.data = { kind: "live_mapping_request", inputs: lastRequestInputs };
    } else {
      // Generic fallback: store lightweight data.
      base.data = { kind: "generic", scenario: { id: activeScenario.id, title: activeScenario.title } };
    }

    setModels((prev) => [base, ...prev]);
    saveModel(base).then(() => {
      toast.success("Model saved to Supabase.");
    });
  }, [activeScenario, scenarioSourceKind, trafficInputs, disasterInputs, lastRequestInputs, activeRawGeneratedScenario, createdBy]);

  const handleLoadModel = useCallback(() => {
    const model = models.find((m) => m.id === modelLoadId);
    if (!model) return;

    try {
      const data = model.data as { kind?: string; inputs?: unknown; raw?: unknown };

      if (data.kind === "traffic_area" && data.inputs) {
        const s = buildAreaTrafficScenario(data.inputs as AreaTrafficInputs);
        initializeActiveScenario(s, "traffic_area");
        setTrafficInputs(data.inputs as AreaTrafficInputs);
        return;
      }
      if (data.kind === "disaster" && data.inputs) {
        const s = buildDisasterScenario(data.inputs as DisasterInputs);
        initializeActiveScenario(s, "disaster");
        setDisasterInputs(data.inputs as DisasterInputs);
        return;
      }
      if (data.kind === "generated" && data.raw) {
        const raw = data.raw as unknown as Parameters<typeof convertGeneratedScenarioToScenario>[0];
        const s = convertGeneratedScenarioToScenario(raw);
        initializeActiveScenario(s, "government_model");
        setActiveRawGeneratedScenario(data.raw);
        return;
      }
      toast.error("Unsupported model payload for viewer.");
    } catch {
      toast.error("Failed to load model.");
    }
  }, [models, modelLoadId, initializeActiveScenario]);

  const setSliderValue = useCallback(
    (id: string, value: number) => {
      setSliderValues((prev) => ({
        ...prev,
        [id]: value,
      }));
    },
    [],
  );

  const handleRunRequest = useCallback(async () => {
    if (!requestForm.region.trim()) {
      toast.error("Region is required.");
      return;
    }
    if (!requestForm.datasetOrParameters.trim()) {
      toast.error("Dataset/parameters are required.");
      return;
    }

    const newRequest: GovernmentRequest = {
      id: `req_${Date.now()}`,
      type: (() => {
        const lower = requestForm.requestType.toLowerCase();
        if (lower.includes("disaster")) return "disaster";
        if (lower.includes("traffic")) return "traffic";
        return "planning";
      })(),
      region: requestForm.region.trim(),
      parameters: requestForm.datasetOrParameters,
      status: "queued",
      createdAt: Date.now(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    saveRequest(newRequest).catch(console.error);

    try {
      const { scenario, raw } = await parseGovernmentRequestToScenarioWithRaw({
        requestType: requestForm.requestType,
        region: requestForm.region.trim(),
        datasetOrParameters: requestForm.datasetOrParameters,
      });

      initializeActiveScenario(scenario, "government_model");
      setActiveRawGeneratedScenario(raw);
      setLastRequestInputs({ requestType: requestForm.requestType, region: requestForm.region.trim(), datasetOrParameters: requestForm.datasetOrParameters });
      setTrafficInputs(null);
      setDisasterInputs(null);

      setRequests((prev) => prev.map((r) => (r.id === newRequest.id ? { ...r, status: "completed" } : r)));
      saveRequest({ ...newRequest, status: "completed" }).catch(console.error);
      toast.success("Simulation generated from government request.");
    } catch {
      setRequests((prev) => prev.map((r) => (r.id === newRequest.id ? { ...r, status: "failed" } : r)));
      saveRequest({ ...newRequest, status: "failed" }).catch(console.error);
      toast.error("Failed to generate simulation.");
    }
  }, [requestForm, initializeActiveScenario]);

  const handleRunDisaster = useCallback(() => {
    if (!disasterForm.region.trim()) {
      toast.error("Region is required.");
      return;
    }

    const inputs: DisasterInputs = {
      disasterType: disasterForm.disasterType,
      region: disasterForm.region.trim(),
      intensity: disasterForm.intensity,
    };

    const scenario = buildDisasterScenario(inputs);
    initializeActiveScenario(scenario, "disaster");
    setDisasterInputs(inputs);
    setTrafficInputs(null);
    setActiveRawGeneratedScenario(null);
    setLastRequestInputs(null);
    toast.success("Disaster simulation loaded.");
  }, [disasterForm, initializeActiveScenario]);

  const handleRunTrafficArea = useCallback(() => {
    if (!trafficForm.region.trim()) {
      toast.error("Region is required.");
      return;
    }

    const inputs: AreaTrafficInputs = { ...trafficForm, region: trafficForm.region.trim() };
    const scenario = buildAreaTrafficScenario(inputs);
    const trafficDatasetHint = [trafficDataForm.file?.name, trafficDataForm.url.trim()].filter(Boolean).join(" | ");
    if (trafficDatasetHint) {
      scenario.description = `${scenario.description} (Traffic dataset: ${trafficDatasetHint})`;
    }
    initializeActiveScenario(scenario, "traffic_area");
    setTrafficInputs(inputs);
    setDisasterInputs(null);
    setActiveRawGeneratedScenario(null);
    setLastRequestInputs(null);
    toast.success("Area traffic simulation loaded.");
  }, [trafficForm, trafficDataForm.file, trafficDataForm.url, initializeActiveScenario]);

  const handleRunLiveModel = useCallback(async () => {
    if (!liveModelFile) {
      toast.error("Please upload a CSV model file first.");
      return;
    }

    try {
      const s = await parseCSVToScenario(liveModelFile);
      initializeActiveScenario(s, "live_mapping");
      setTrafficInputs(null);
      setDisasterInputs(null);
      setActiveRawGeneratedScenario(null);
      setLastRequestInputs({ requestType: "live_mapping_direct", region: "Custom Upload", datasetOrParameters: liveModelFile.name });
      toast.success("Live 3D mapping running successfully from real-life model.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load live 3D mapping model.");
    }
  }, [liveModelFile, initializeActiveScenario]);

  const handleUploadDataset = useCallback(async () => {
    const name = datasetForm.name.trim() || `Dataset ${new Date().toLocaleDateString()}`;
    const region = datasetForm.region.trim();
    if (!region) {
      toast.error("Region is required for dataset upload.");
      return;
    }

    const source = datasetForm.file ? datasetForm.file.name : datasetForm.source.trim() || "uploaded";
    const format = datasetForm.file ? "csv" : "api";
    const dataset: GovernmentDataset = {
      id: `ds_${Date.now()}`,
      name,
      type: datasetForm.type,
      region,
      source,
      format,
      uploadedBy: createdBy,
      uploadedAt: Date.now(),
    };

    setDatasets((prev) => [dataset, ...prev]);
    saveDataset(dataset).then(() => {
      toast.success("Dataset uploaded to Supabase.");
    });

    // Optional: if CSV and user chose live_mapping, parse to an on-screen simulation.
    if (datasetForm.file && datasetForm.type === "live_mapping") {
      try {
        const s = await parseCSVToScenario(datasetForm.file);
        initializeActiveScenario(s, "live_mapping");
        setTrafficInputs(null);
        setDisasterInputs(null);
        setActiveRawGeneratedScenario(null);
        setLastRequestInputs({ requestType: "live_mapping", region, datasetOrParameters: datasetForm.file.name });
        toast.success("Live mapping model created from CSV.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to create live mapping model.");
      }
    }
  }, [datasetForm, createdBy, initializeActiveScenario]);

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col font-body selection:bg-primary/30">
      <DashboardNav active="government" />

      <div className="flex-1 w-full max-w-[1800px] mx-auto px-4 pb-4 flex flex-col lg:flex-row gap-4 overflow-hidden pt-4">
        <div className="w-full lg:w-[420px] flex flex-col gap-4 overflow-y-auto no-scrollbar pr-1 flex-none">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-5 rounded-3xl border-white/10 shadow-xl bg-black/40"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🏛️</span>
              <h2 className="font-display font-bold text-lg text-white truncate">Official Dashboard</h2>
            </div>
            
            <Card className="bg-primary/10 border-primary/20 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-base flex items-center gap-2 font-display">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Live 3D Real-Life Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                <p className="text-xs text-white/70 leading-relaxed">
                  Upload structural data (.csv) of real-world environments to immediately generate and explore an interactive 3D simulation using the engine's built-in mapping.
                </p>
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setLiveModelFile(e.target.files?.[0] ?? null)}
                    className="bg-background/50 border-white/20 text-white/80 cursor-pointer border-dashed cursor-pointer"
                  />
                  <Button onClick={handleRunLiveModel} className="w-full bg-primary hover:bg-primary/90 font-semibold shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all">
                    Generate Live 3D Simulation
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-white/10 mb-4">
              <CardHeader>
                <CardTitle className="text-base">Upload Real-life Models & Datasets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-white/50 mb-2 leading-relaxed">
                  Upload models of real life (.csv format) to directly generate accurate live-mapping simulations.
                </p>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Name</label>
                  <Input value={datasetForm.name} onChange={(e) => setDatasetForm((p) => ({ ...p, name: e.target.value }))} className="bg-background/30 border-white/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Type</label>
                  <select
                    value={datasetForm.type}
                    onChange={(e) => setDatasetForm((p) => ({ ...p, type: e.target.value as GovernmentDataset["type"] }))}
                    className="w-full bg-background/30 border border-white/10 text-white/80 rounded-md p-2"
                  >
                    <option value="traffic">traffic</option>
                    <option value="disaster">disaster</option>
                    <option value="planning">planning</option>
                    <option value="live_mapping">live_mapping</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Region</label>
                  <Input value={datasetForm.region} onChange={(e) => setDatasetForm((p) => ({ ...p, region: e.target.value }))} className="bg-background/30 border-white/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Real-Life Model File (CSV)</label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setDatasetForm((p) => ({ ...p, file: e.target.files?.[0] ?? null }))}
                    className="bg-background/30 border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Source URL / API (optional)</label>
                  <Input value={datasetForm.source} onChange={(e) => setDatasetForm((p) => ({ ...p, source: e.target.value }))} className="bg-background/30 border-white/10" />
                </div>
                <Button onClick={handleUploadDataset} className="w-full bg-primary hover:bg-primary/90">
                  Upload Real-Life Model
                </Button>

                {datasets.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-xs text-white/60 font-semibold uppercase tracking-widest mb-2">Uploaded Datasets</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {datasets.slice(0, 8).map((ds) => (
                        <div key={ds.id} className="text-xs text-white/75 flex items-center justify-between gap-2">
                          <div className="truncate">{ds.name}</div>
                          <div className="text-white/40 whitespace-nowrap">{ds.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <details open className="mb-4">
              <summary className="cursor-pointer text-white/90 font-semibold text-sm mb-3">Upload Official Request</summary>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Request Type</label>
                  <Input value={requestForm.requestType} onChange={(e) => setRequestForm((p) => ({ ...p, requestType: e.target.value }))} className="bg-background/30 border-white/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Region</label>
                  <Input value={requestForm.region} onChange={(e) => setRequestForm((p) => ({ ...p, region: e.target.value }))} className="bg-background/30 border-white/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Dataset / Parameters</label>
                  <Textarea
                    value={requestForm.datasetOrParameters}
                    onChange={(e) => setRequestForm((p) => ({ ...p, datasetOrParameters: e.target.value }))}
                    className="bg-background/30 border-white/10 min-h-[90px]"
                  />
                </div>
                <Button onClick={handleRunRequest} className="w-full bg-accent/90 hover:bg-accent">
                  Generate Simulation
                </Button>
              </div>
            </details>

            <details className="mb-4">
              <summary className="cursor-pointer text-white/90 font-semibold text-sm mb-3">Run Disaster Simulation</summary>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Disaster Type</label>
                  <select
                    value={disasterForm.disasterType}
                    onChange={(e) => setDisasterForm((p) => ({ ...p, disasterType: e.target.value as DisasterInputs["disasterType"] }))}
                    className="w-full bg-background/30 border border-white/10 text-white/80 rounded-md p-2"
                  >
                    <option value="fire">fire</option>
                    <option value="flood">flood</option>
                    <option value="earthquake">earthquake</option>
                    <option value="storm">storm</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Region</label>
                  <Input value={disasterForm.region} onChange={(e) => setDisasterForm((p) => ({ ...p, region: e.target.value }))} className="bg-background/30 border-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/70 font-medium">Intensity</label>
                    <span className="text-xs text-white/70 font-mono">{disasterForm.intensity}</span>
                  </div>
                  <Slider value={[disasterForm.intensity]} min={0} max={100} step={1} onValueChange={([v]) => setDisasterForm((p) => ({ ...p, intensity: v }))} />
                </div>
                <Button onClick={handleRunDisaster} className="w-full bg-accent/90 hover:bg-accent">
                  Run Disaster Simulation
                </Button>
              </div>
            </details>

            <details>
              <summary className="cursor-pointer text-white/90 font-semibold text-sm mb-3">Area-Based Traffic Simulation</summary>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Region</label>
                  <Input value={trafficForm.region} onChange={(e) => setTrafficForm((p) => ({ ...p, region: e.target.value }))} className="bg-background/30 border-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/70 font-medium">Vehicles</label>
                    <span className="text-xs text-white/70 font-mono">{trafficForm.vehicles}</span>
                  </div>
                  <Slider value={[trafficForm.vehicles]} min={0} max={100} step={1} onValueChange={([v]) => setTrafficForm((p) => ({ ...p, vehicles: v }))} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/70 font-medium">Roads</label>
                    <span className="text-xs text-white/70 font-mono">{trafficForm.roads}</span>
                  </div>
                  <Slider value={[trafficForm.roads]} min={0} max={100} step={1} onValueChange={([v]) => setTrafficForm((p) => ({ ...p, roads: v }))} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/70 font-medium">Signals</label>
                    <span className="text-xs text-white/70 font-mono">{trafficForm.signals}</span>
                  </div>
                  <Slider value={[trafficForm.signals]} min={0} max={100} step={1} onValueChange={([v]) => setTrafficForm((p) => ({ ...p, signals: v }))} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/70 font-medium">Demand</label>
                    <span className="text-xs text-white/70 font-mono">{trafficForm.demand}</span>
                  </div>
                  <Slider value={[trafficForm.demand]} min={0} max={100} step={1} onValueChange={([v]) => setTrafficForm((p) => ({ ...p, demand: v }))} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Upload traffic dataset (optional, CSV)</label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setTrafficDataForm((p) => ({ ...p, file: e.target.files?.[0] ?? null }))}
                    className="bg-background/30 border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-medium">Or traffic API URL (optional)</label>
                  <Input value={trafficDataForm.url} onChange={(e) => setTrafficDataForm((p) => ({ ...p, url: e.target.value }))} className="bg-background/30 border-white/10" />
                </div>
                <Button onClick={handleRunTrafficArea} className="w-full bg-accent/90 hover:bg-accent">
                  Generate 3D Traffic Simulation
                </Button>
              </div>
            </details>
          </motion.div>

          <Card className="bg-black/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button onClick={handleSaveModel} className="flex-1 bg-primary hover:bg-primary/90">
                  Save Current Model
                </Button>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-medium">Load Saved Model</label>
                <select
                  value={modelLoadId}
                  onChange={(e) => setModelLoadId(e.target.value)}
                  className="w-full bg-background/30 border border-white/10 text-white/80 rounded-md p-2"
                >
                  <option value="">Select…</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.type})
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleLoadModel} disabled={!modelLoadId} className="w-full bg-accent/90 hover:bg-accent disabled:opacity-50">
                Load Model
              </Button>

              {models.length > 0 && (
                <div className="text-xs text-white/50">
                  Models sync with your secure Supabase database and persist across sessions.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative min-h-[400px]">
          <div className="flex-none p-3 pt-4 w-full flex justify-between items-start bg-black/50 border-b border-white/5 backdrop-blur-md z-20">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeScenario?.icon ?? "🧠"}</span>
                <h2 className="font-display font-bold text-lg text-white">{activeScenario?.title ?? "Run a simulation"}</h2>
              </div>
              <p className="text-white/50 text-xs mt-1">
                {activeScenario?.description ??
                  "Official simulations are generated by request parsing, disaster runners, or area traffic models—then rendered with the existing Reality Translator 3D viewer."}
              </p>
            </div>
          </div>

          <div className="flex-1 relative bg-black">
            {activeScenario ? (
              <SimulationCanvas scenario={activeVisualScenarioId} sliderValues={sliderValues} custom3D={activeScenario.custom3D} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                No simulation loaded yet.
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />
          </div>

          {activeScenario && (
            <div className="p-4 border-t border-white/10 bg-black/30">
              <ControlPanel sliders={activeScenario.sliders} values={sliderValues} onChange={setSliderValue} />
            </div>
          )}
        </div>

        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto no-scrollbar pl-1 flex-none">
          {activeScenario ? (
            <>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-5 rounded-3xl border-white/10 shadow-xl bg-black/40"
              >
                <MetricsDisplay metrics={activeScenario.metrics} values={metricValues} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-5 rounded-3xl border-white/10 shadow-xl bg-black/40"
              >
                <AILiveInsights scenario={activeScenario} sliderValues={sliderValues} />
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel p-5 rounded-3xl border-white/10 shadow-xl bg-black/40"
            >
              <div className="text-white/50 text-sm">Metrics and AI insights will appear after a simulation is generated.</div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

