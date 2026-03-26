import { supabase } from "@/integrations/supabase/client";
import type { GovernmentDataset, GovernmentRequest, GovernmentSimulationModel } from "./governmentTypes";

export async function loadDatasets(): Promise<GovernmentDataset[]> {
  const { data, error } = await supabase.from('datasets').select('*').order('uploaded_at', { ascending: false });
  if (error) {
    console.error("Error loading datasets:", error);
    return [];
  }
  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    type: d.type as any,
    region: d.region,
    source: d.source,
    format: d.format as any,
    uploadedBy: d.uploaded_by,
    uploadedAt: Number(d.uploaded_at),
  }));
}

export async function saveDataset(item: GovernmentDataset): Promise<void> {
  const { error } = await supabase.from('datasets').upsert({
    id: item.id,
    name: item.name,
    type: item.type,
    region: item.region,
    source: item.source,
    format: item.format,
    uploaded_by: item.uploadedBy,
    uploaded_at: item.uploadedAt,
  } as any);
  if (error) console.error("Error saving dataset:", error);
}

export async function loadModels(): Promise<GovernmentSimulationModel[]> {
  const { data, error } = await supabase.from('simulations').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error("Error loading models:", error);
    return [];
  }
  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    type: d.type as any,
    region: d.region,
    data: d.data,
    createdBy: d.created_by,
    createdAt: Number(d.created_at),
  }));
}

export async function saveModel(item: GovernmentSimulationModel): Promise<void> {
  const { error } = await supabase.from('simulations').upsert({
    id: item.id,
    name: item.name,
    type: item.type,
    region: item.region,
    data: item.data as any,
    created_by: item.createdBy,
    created_at: item.createdAt,
  } as any);
  if (error) console.error("Error saving model:", error);
}

export async function loadRequests(): Promise<GovernmentRequest[]> {
  const { data, error } = await supabase.from('government_requests').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error("Error loading requests:", error);
    return [];
  }
  return data.map((d: any) => ({
    id: d.id,
    type: d.type as any,
    region: d.region,
    parameters: d.parameters,
    status: d.status as any,
    createdAt: Number(d.created_at),
  }));
}

export async function saveRequest(item: GovernmentRequest): Promise<void> {
  const { error } = await supabase.from('government_requests').upsert({
    id: item.id,
    type: item.type,
    region: item.region,
    parameters: item.parameters as any,
    status: item.status,
    created_at: item.createdAt,
  } as any);
  if (error) console.error("Error saving request:", error);
}

