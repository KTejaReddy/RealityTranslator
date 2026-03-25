import Papa from 'papaparse';
import type { SliderConfig, MetricConfig, Scenario } from './scenarios';

const colors: Array<'cyan' | 'purple' | 'green' | 'amber'> = ['cyan', 'green', 'amber', 'purple'];

interface ColumnStats {
  name: string;
  min: number;
  max: number;
  mean: number;
  median: number;
  values: number[];
}

function analyzeColumn(name: string, rawValues: unknown[]): ColumnStats | null {
  const values = rawValues
    .map(v => (typeof v === 'string' ? parseFloat(v) : Number(v)))
    .filter(v => !isNaN(v) && isFinite(v));
  if (values.length < 2) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (min === max) return null; // no variance
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  return { name, min, max, mean, median, values };
}

function computeCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 3) return 0;
  const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

function smartStep(range: number): number {
  if (range <= 1) return 0.01;
  if (range <= 10) return 0.1;
  if (range <= 100) return 1;
  if (range <= 1000) return 5;
  return Math.pow(10, Math.floor(Math.log10(range)) - 2);
}

function smartUnit(name: string, max: number): string {
  const lower = name.toLowerCase();
  if (lower.includes('percent') || lower.includes('%') || (max <= 100 && max > 0)) return '%';
  if (lower.includes('temp') || lower.includes('celsius') || lower.includes('°')) return '°C';
  if (lower.includes('dollar') || lower.includes('cost') || lower.includes('price') || lower.includes('revenue')) return '$';
  if (lower.includes('year') || lower.includes('age')) return 'yr';
  if (lower.includes('population') || lower.includes('count')) return '';
  if (lower.includes('rate')) return '/yr';
  return '';
}

function formatLabel(name: string): string {
  return name
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .slice(0, 20);
}

export function parseCSVToScenario(file: File): Promise<Scenario> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as Record<string, unknown>[];
          if (data.length < 2) {
            reject(new Error('CSV must have at least 2 data rows'));
            return;
          }

          const columnNames = Object.keys(data[0] || {});
          const stats: ColumnStats[] = [];

          for (const col of columnNames) {
            const colStats = analyzeColumn(col, data.map(row => row[col]));
            if (colStats) stats.push(colStats);
          }

          if (stats.length < 2) {
            reject(new Error('CSV needs at least 2 numeric columns'));
            return;
          }

          // Pick up to 4 columns with highest variance as sliders
          const byVariance = [...stats].sort((a, b) => (b.max - b.min) - (a.max - a.min));
          const sliderCols = byVariance.slice(0, Math.min(4, stats.length));
          const metricCols = byVariance.slice(Math.min(4, stats.length), Math.min(8, stats.length));

          // If we don't have enough metric columns, derive some
          if (metricCols.length === 0 && sliderCols.length >= 2) {
            // Create synthetic metrics from slider correlations
            metricCols.push(sliderCols[0]);
          }

          const sliders: SliderConfig[] = sliderCols.map((col, i) => ({
            id: col.name.replace(/\W/g, '_').toLowerCase(),
            label: formatLabel(col.name),
            min: Math.floor(col.min * 100) / 100,
            max: Math.ceil(col.max * 100) / 100,
            step: smartStep(col.max - col.min),
            defaultValue: Math.round(col.median * 100) / 100,
            unit: smartUnit(col.name, col.max),
            color: colors[i % colors.length],
          }));

          // Compute correlation matrix between slider cols and all other numeric cols
          const allMetricCandidates = stats.filter(s => !sliderCols.includes(s));
          
          const metrics: MetricConfig[] = [];
          const usedCols = new Set<string>();

          // Take top correlated columns as metrics
          for (const slider of sliderCols) {
            for (const candidate of allMetricCandidates) {
              if (usedCols.has(candidate.name) || metrics.length >= 4) continue;
              const corr = Math.abs(computeCorrelation(slider.values, candidate.values));
              if (corr > 0.1) {
                usedCols.add(candidate.name);
                const cStats = candidate;
                
                // Build a linear regression model for this metric
                const correlations: { sliderId: string; weight: number; sliderMean: number; sliderStd: number }[] = [];
                for (const sl of sliderCols) {
                  const c = computeCorrelation(sl.values, candidate.values);
                  const std = Math.sqrt(sl.values.reduce((s, v) => s + (v - sl.mean) ** 2, 0) / sl.values.length);
                  const metricStd = Math.sqrt(candidate.values.reduce((s, v) => s + (v - candidate.mean) ** 2, 0) / candidate.values.length);
                  correlations.push({
                    sliderId: sl.name.replace(/\W/g, '_').toLowerCase(),
                    weight: std > 0 ? (c * metricStd / std) : 0,
                    sliderMean: sl.mean,
                    sliderStd: std,
                  });
                }
                const metricMean = cStats.mean;
                
                metrics.push({
                  id: candidate.name.replace(/\W/g, '_').toLowerCase(),
                  label: formatLabel(candidate.name),
                  unit: smartUnit(candidate.name, candidate.max),
                  color: colors[metrics.length % colors.length],
                  compute: ((corrs, mean, mn, mx) => (sliderVals: Record<string, number>) => {
                    let result = mean;
                    for (const c of corrs) {
                      const sliderVal = sliderVals[c.sliderId] ?? c.sliderMean;
                      result += c.weight * (sliderVal - c.sliderMean);
                    }
                    return Math.round(Math.max(mn, Math.min(mx, result)) * 100) / 100;
                  })(correlations, metricMean, cStats.min, cStats.max),
                });
              }
            }
          }

          // If we still don't have metrics, create aggregate metrics from sliders
          if (metrics.length === 0) {
            const sliderIds = sliders.map(s => s.id);
            metrics.push({
              id: 'composite_index',
              label: 'Composite Index',
              unit: '',
              color: 'cyan',
              compute: (vals) => {
                const sum = sliderIds.reduce((s, id) => s + (vals[id] ?? 0), 0);
                return Math.round((sum / sliderIds.length) * 100) / 100;
              },
            });
            if (sliders.length >= 2) {
              metrics.push({
                id: 'balance_ratio',
                label: 'Balance Ratio',
                unit: '',
                color: 'green',
                compute: (vals) => {
                  const v = sliderIds.map(id => vals[id] ?? 0);
                  const max = Math.max(...v);
                  const min = Math.min(...v);
                  return max > 0 ? Math.round((min / max) * 100) : 0;
                },
              });
            }
          }

          // Ensure at least 2 metrics, at most 4
          while (metrics.length < 2 && sliders.length >= 2) {
            metrics.push({
              id: `derived_${metrics.length}`,
              label: metrics.length === 0 ? 'Total' : 'Spread',
              unit: '',
              color: colors[metrics.length % colors.length],
              compute: metrics.length === 0
                ? (vals) => Math.round(Object.values(vals).reduce((s, v) => s + v, 0) * 10) / 10
                : (vals) => {
                    const v = Object.values(vals);
                    return Math.round((Math.max(...v) - Math.min(...v)) * 10) / 10;
                  },
            });
          }

          const fileName = file.name.replace(/\.csv$/i, '').replace(/[_-]/g, ' ');
          const scenario: Scenario = {
            id: `custom_${Date.now()}` as any,
            title: formatLabel(fileName),
            description: `Custom scenario from ${file.name} (${data.length} rows, ${stats.length} variables)`,
            icon: '📊',
            sliders,
            metrics: metrics.slice(0, 4),
          };

          resolve(scenario);
        } catch (err) {
          reject(new Error('Failed to analyze CSV: ' + (err instanceof Error ? err.message : 'unknown error')));
        }
      },
      error: (err) => reject(new Error('Failed to parse CSV: ' + err.message)),
    });
  });
}
