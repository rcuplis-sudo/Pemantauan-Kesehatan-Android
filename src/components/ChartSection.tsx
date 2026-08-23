import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Heart, 
  Boxes, 
  Activity, 
  Droplets, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { HealthEntry, ParamKey, ParamGroupKey } from '../types';
import { paramConfig, groupConfigs, cekDiagnosa } from '../utils/healthCalculations';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartSectionProps {
  entries: HealthEntry[];
  activeFilter: 'semua' | ParamGroupKey;
  onFilterChange: (filter: 'semua' | ParamGroupKey) => void;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  entries,
  activeFilter,
  onFilterChange
}) => {
  // Sort entries chronologically (oldest to newest for graphs)
  const sortedEntries = [...entries].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  // Labels for X-axis (formatted dates: DD/MM/YY)
  const labels = sortedEntries.map(e => {
    const d = new Date(e.tanggal);
    return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
  });

  // Find which parameters have at least 1 recorded value
  const paramsWithData = (Object.keys(paramConfig) as ParamKey[]).filter(param => {
    return sortedEntries.some(d => d[param] !== undefined && d[param] !== null && !isNaN(d[param] as number));
  });

  // Groups that have recorded data
  const groupsWithData = new Set<ParamGroupKey>();
  paramsWithData.forEach(p => {
    groupsWithData.add(paramConfig[p].group);
  });

  // Filter params based on active filter
  const paramsToRender = paramsWithData.filter(param => {
    if (activeFilter === 'semua') return true;
    return paramConfig[param].group === activeFilter;
  });

  const getGroupIcon = (groupKey: ParamGroupKey) => {
    switch (groupKey) {
      case 'kardio': return <Heart className="w-3.5 h-3.5" />;
      case 'metabolik': return <Boxes className="w-3.5 h-3.5" />;
      case 'hati': return <Activity className="w-3.5 h-3.5" />;
      case 'ginjal': return <Droplets className="w-3.5 h-3.5" />;
      case 'antropometri': return <Scale className="w-3.5 h-3.5" />;
      default: return <Layers className="w-3.5 h-3.5" />;
    }
  };

  if (paramsWithData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      
      {/* Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Grafik Tren Parameter Kesehatan</h3>
            <p className="text-xs text-slate-500">Visualisasi data dari {sortedEntries.length} catatan waktu</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onFilterChange('semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'semua'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Semua ({paramsWithData.length})
          </button>

          {(Object.keys(groupConfigs) as ParamGroupKey[]).map(groupKey => {
            if (!groupsWithData.has(groupKey)) return null;
            const config = groupConfigs[groupKey];
            const isActive = activeFilter === groupKey;

            return (
              <button
                key={groupKey}
                onClick={() => onFilterChange(groupKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? `${config.badgeBg} font-bold shadow-xs border`
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {getGroupIcon(groupKey)}
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paramsToRender.map(paramKey => {
          const config = paramConfig[paramKey];
          const dataValues = sortedEntries.map(e => {
            const val = e[paramKey];
            return val !== undefined && val !== null ? val : null;
          });

          // Compute latest, min, max, delta
          const nonNullValues = dataValues.filter((v): v is number => v !== null);
          const latestValue = nonNullValues[nonNullValues.length - 1];
          const previousValue = nonNullValues.length > 1 ? nonNullValues[nonNullValues.length - 2] : null;
          const minValue = Math.min(...nonNullValues);
          const maxValue = Math.max(...nonNullValues);

          const delta = previousValue !== null ? latestValue - previousValue : null;
          const diagnosis = cekDiagnosa(latestValue, paramKey);

          const chartData = {
            labels,
            datasets: [
              {
                label: `${config.label} (${config.unit})`,
                data: dataValues,
                borderColor: config.color,
                backgroundColor: config.bgColor,
                borderWidth: 2.5,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: config.color,
                pointBorderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: config.color,
                pointHoverBorderColor: '#ffffff',
                fill: true,
                tension: 0.35,
                spanGaps: true,
              }
            ]
          };

          const options: ChartOptions<'line'> = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleFont: { size: 12, family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
                bodyFont: { size: 13, family: "'Plus Jakarta Sans', sans-serif" },
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                  label: (context) => {
                    const val = context.parsed.y;
                    return `${config.label}: ${val} ${config.unit}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
                  color: '#64748b'
                }
              },
              y: {
                grid: {
                  color: '#f1f5f9'
                },
                ticks: {
                  font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
                  color: '#64748b',
                  padding: 6
                }
              }
            }
          };

          return (
            <div
              key={paramKey}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              {/* Card Header with Stats */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                      {groupConfigs[config.group]?.label}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {config.label}
                    </h4>
                  </div>

                  {/* Latest value & clinical badge */}
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1 font-extrabold text-slate-900 text-lg">
                      {latestValue}
                      <span className="text-xs font-medium text-slate-400">{config.unit}</span>
                    </div>
                    {diagnosis && (
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${diagnosis.kelas}`}>
                        {diagnosis.teks}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub metric bar: Min, Max, Delta, Normal reference */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 mb-3 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span>Min: <strong>{minValue}</strong></span>
                    <span>Maks: <strong>{maxValue}</strong></span>
                  </div>

                  {delta !== null && (
                    <div className="flex items-center gap-1 font-semibold">
                      {delta > 0 ? (
                        <span className="text-rose-600 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-0.5" /> +{delta.toFixed(1)} {config.unit}
                        </span>
                      ) : delta < 0 ? (
                        <span className="text-emerald-600 flex items-center">
                          <TrendingDown className="w-3 h-3 mr-0.5" /> {delta.toFixed(1)} {config.unit}
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center">
                          <Minus className="w-3 h-3 mr-0.5" /> Tetap
                        </span>
                      )}
                    </div>
                  )}

                  {config.description && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 w-full sm:w-auto">
                      <Info className="w-3 h-3 text-slate-400 shrink-0" />
                      {config.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Line Chart Canvas */}
              <div className="h-44 w-full mt-1">
                <Line data={chartData} options={options} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
