import { useState, useEffect } from 'react';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scenario } from '../lib/scenarios';

interface AILiveInsightsProps {
  scenario: Scenario;
  sliderValues: Record<string, number>;
}

export default function AILiveInsights({ scenario, sliderValues }: AILiveInsightsProps) {
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setInsight("Add your Gemini API key to receive live AI insights.");
        return;
      }
      
      setIsLoading(true);
      try {
        const prompt = `You are an expert AI simulator observing a running mathematical simulation titled "${scenario.title}" (${scenario.description}).
The current active variables are:
${Object.entries(sliderValues).map(([id, val]) => {
  const label = scenario.sliders.find(s => s.id === id)?.label || id;
  return `- ${label}: ${val}`;
}).join('\n')}

Analyze these physical variables. Write EXACTLY ONE short, crisp sentence (maximum 15 words) offering an insight, profound observation, or direct suggestion to the user on what variable to tweak next.
It must sound like an intelligent, hyper-advanced AI system.`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 60 },
          }),
        });
        
        if (!res.ok) throw new Error("API Error");
        const data = await res.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        text = text.trim().replace(/^"/, '').replace(/"$/, '');
        
        setInsight(text);
      } catch (e) {
        console.error("Failed to generate insight", e);
      } finally {
        setIsLoading(false);
      }
    }, 1500); // 1.5s debounce
    
    return () => clearTimeout(timer);
  }, [scenario, sliderValues]);

  return (
    <div className="glass-panel p-5 rounded-3xl border-white/10 shadow-[0_0_30px_rgba(0,255,255,0.05)] backdrop-blur-2xl bg-black/50 mt-2 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex flex-col items-center justify-center border border-accent/40 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)] mt-1">
          <Bot className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
              <Sparkles className="w-3 h-3" /> Live Insight
            </h3>
            {isLoading && <Loader2 className="w-3 h-3 text-white/40 animate-spin" />}
          </div>
          <AnimatePresence mode="wait">
            <motion.p 
              key={insight}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm md:text-[15px] text-white/90 leading-relaxed font-light italic min-h-[44px]"
            >
              "{insight || "Initializing active simulation analysis..."}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
