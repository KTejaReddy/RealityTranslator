import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MetricConfig } from '@/lib/scenarios';

interface MetricsDisplayProps {
  metrics: MetricConfig[];
  values: Record<string, number>;
}

const colorBg = {
  cyan: 'from-glow-cyan/8 to-transparent border-glow-cyan/15',
  purple: 'from-glow-purple/8 to-transparent border-glow-purple/15',
  green: 'from-glow-green/8 to-transparent border-glow-green/15',
  amber: 'from-glow-amber/8 to-transparent border-glow-amber/15',
};

const colorText = {
  cyan: 'text-glow-cyan',
  purple: 'text-glow-purple',
  green: 'text-glow-green',
  amber: 'text-glow-amber',
};

const colorDot = {
  cyan: 'bg-glow-cyan',
  purple: 'bg-glow-purple',
  green: 'bg-glow-green',
  amber: 'bg-glow-amber',
};

const MetricsDisplay = ({ metrics, values }: MetricsDisplayProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <AnimatePresence>
        {metrics.map((metric, i) => {
          const val = values[metric.id];
          const isGood = metric.higherIsBetter === undefined ? null : metric.higherIsBetter ? val > 50 : val < 50;
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border bg-gradient-to-br p-5 relative overflow-hidden ${colorBg[metric.color]}`}
            >
              {/* Subtle glow dot */}
              <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${colorDot[metric.color]} animate-pulse-glow`} />
              
              <div className="flex items-center gap-1.5">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{metric.label}</div>
              </div>
              <div className={`font-mono text-4xl font-bold mt-2 tracking-tight ${colorText[metric.color]}`}>
                {val !== undefined ? (Number.isInteger(val) ? val : val.toFixed(1)) : '—'}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-muted-foreground">{metric.unit}</span>
                {isGood !== null && (
                  <span className={`text-xs flex items-center gap-0.5 ${isGood ? 'text-glow-green' : 'text-destructive'}`}>
                    {isGood ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default MetricsDisplay;
