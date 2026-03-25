import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Scenario } from '@/lib/scenarios';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selected: string;
  onSelect: (id: string) => void;
  onRemoveCustom?: (id: string) => void;
}

const ScenarioSelector = ({ scenarios, selected, onSelect, onRemoveCustom }: ScenarioSelectorProps) => {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {scenarios.map((scenario) => {
          const isCustom = scenario.id.startsWith('custom_');
          const isActive = selected === scenario.id;
          return (
            <motion.div
              key={scenario.id}
              onClick={() => onSelect(scenario.id)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-300 cursor-pointer relative border ${
                isActive
                  ? 'bg-primary/10 border-primary/40 shadow-[0_0_15px_hsl(var(--primary)/0.15)]'
                  : 'bg-card/40 border-border/20 hover:bg-card/60 hover:border-border/40'
              }`}
            >
              <span className="text-lg">{scenario.icon}</span>
              <div className="text-left">
                <div className={`font-display font-semibold text-xs ${isActive ? 'text-primary' : 'text-foreground/80'}`}>
                  {scenario.title}
                </div>
                <div className="text-muted-foreground text-[10px] hidden sm:block max-w-[140px] truncate leading-tight">{scenario.description}</div>
              </div>
              {isCustom && onRemoveCustom && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveCustom(scenario.id); }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/80 flex items-center justify-center hover:bg-destructive transition-colors"
                >
                  <X className="w-2.5 h-2.5 text-destructive-foreground" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default ScenarioSelector;
