import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const getFallbackScenario = (prompt: string) => ({
  title: "Simulated Scenario",
  description: `Generated for: ${prompt}. Add GEMINI_API_KEY for true AI generation.`,
  icon: "🔮",
  sliders: [
    { id: "input_a", label: "Primary Input", min: 0, max: 100, step: 1, defaultValue: 50, unit: "%", color: "cyan" },
    { id: "input_b", label: "Secondary Input", min: 0, max: 100, step: 1, defaultValue: 50, unit: "%", color: "purple" },
    { id: "efficiency", label: "System Efficiency", min: 0, max: 100, step: 1, defaultValue: 75, unit: "%", color: "green" },
    { id: "load", label: "Processing Load", min: 0, max: 100, step: 1, defaultValue: 40, unit: "%", color: "amber" }
  ],
  metrics: [
    { id: "output", label: "Net Output", unit: "U", color: "cyan", higherIsBetter: true, formula: "increases with input_a and efficiency" },
    { id: "stability", label: "Stability", unit: "%", color: "green", higherIsBetter: true, formula: "increases with efficiency, decreases with load" },
    { id: "resource_drain", label: "Resource Drain", unit: "/s", color: "amber", higherIsBetter: false, formula: "increases with load and input_b" },
    { id: "variance", label: "System Variance", unit: "%", color: "purple", higherIsBetter: false, formula: "increases with input_a, decreases with efficiency" }
  ],
  visualTheme: "climate" // Fallback theme
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      console.log("No GEMINI_API_KEY found, returning fallback scenario.");
      return new Response(JSON.stringify({ scenario: getFallbackScenario(prompt) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: `You are an expert scientific, economic, and systemic simulation generator. Your task is to generate a highly realistic, domain-specific JSON scenario configuration based EXACTLY on the user's request. The simulation MUST be deeply related to the user's prompt and not a random or generic scenario.

Avoid generic terms like "Input A" or "System Efficiency" unless strictly relevant. Instead, use precise, real-world parameters, variables, and metrics that match the true mechanics, physics, biology, or economics of the specific topic the user asks for.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "title": "Short, specific title (1-3 words)",
  "description": "Brief description directly addressing the specified topic",
  "icon": "single emoji",
  "visualTheme": "custom",
  "custom3D": {
    "groundColor": "#HEXCOLOR",
    "objects": [
      {
        "type": "human|vehicle|furniture|decoration|plant|nature|building|tree|water|movingObject|particles|ambientDust",
        "color": "#HEXCOLOR",
        "position": [0, 0, 0],
        "size": 1.0,
        "count": 100,
        "height": 5,
        "width": 2,
        "speed": 0.1,
        "path": [[-5,0,0], [5,0,0]]
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
- The scenario MUST accurately reflect the SPECIFIC topic requested by the user. Do NOT hallucinate an unrelated simulation.
- You MUST set "visualTheme" to exactly "custom".
- You MUST construct a deeply rich, intricate \\\`custom3D\\\` array. Generate between 15 to 30 diverse 3D objects positioned carefully in 3D space to form a complete diorama/scene.
- Use the correct 3D types: "human" for people, "vehicle" for cars/trucks, "furniture" for tables/chairs, "decoration" for party-props/balloons, "plant" for shrubs, "nature" for rocks/terrain, "building" for architecture. Space their "position" coordinates out logically!
- Always generate exactly 4 sliders and 4 metrics.
- Colors must be one of: "cyan", "purple", "green", "amber"
- Use diverse colors across sliders and metrics
- Make all slider ranges (min, max, and defaultValue) highly realistic and scientifically/factually accurate for the real-world domain.
- Units can be: %, °C, $, K, M, B, GT, MW, AQI, /100, yr, or domain-specific short units.
- Each metric formula should describe the accurate mathematical/logical relationship with slider IDs according to how the real world works.
- step should be appropriate for the realistic range (e.g., 1 for 0-100, 0.1 for small decimal ranges).`
          }]
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(JSON.stringify({ scenario: getFallbackScenario(prompt) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const textResp = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResp) {
      throw new Error("No text response from Gemini");
    }

    const scenario = JSON.parse(textResp);

    return new Response(JSON.stringify({ scenario }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-scenario error:", e);
    return new Response(JSON.stringify({ scenario: getFallbackScenario("Error Fallback") }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
