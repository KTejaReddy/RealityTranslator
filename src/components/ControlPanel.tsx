import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import type { SliderConfig } from '@/lib/scenarios';

interface ControlPanelProps {
  sliders: SliderConfig[];
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
}

const colorMap = {
  cyan: 'text-glow-cyan',
  purple: 'text-glow-purple',
  green: 'text-glow-green',
  amber: 'text-glow-amber',
};

const dotColorMap = {
  cyan: 'bg-glow-cyan',
  purple: 'bg-glow-purple',
  green: 'bg-glow-green',
  amber: 'bg-glow-amber',
};

const ControlPanel = ({ sliders, values, onChange }: ControlPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 w-full"
    >
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          <h3 className="font-display font-bold text-xs text-primary tracking-[0.2em] uppercase">Variables</h3>
        </div>
        <div className="mt-2 ml-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <p className="text-[10px] text-accent font-medium tracking-wide">Tip: Scroll to zoom the 3D scene!</p>
        </div>
      </div>
      
      {sliders.map((slider, i) => (
        <motion.div
          key={slider.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className={`w-1 h-1 rounded-full ${dotColorMap[slider.color]}`} />
              <span className="text-xs text-secondary-foreground font-medium">{slider.label}</span>
            </div>
            <span className={`font-mono text-xs font-bold tabular-nums ${colorMap[slider.color]}`}>
              {values[slider.id]?.toFixed(slider.step < 1 ? 1 : 0)}{slider.unit}
            </span>
          </div>
          <Slider
            value={[values[slider.id] ?? slider.defaultValue]}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            onValueChange={([v]) => onChange(slider.id, v)}
            className="cursor-pointer"
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ControlPanel;
