import React from 'react';
import { SkillRadarItem } from '../../types';

interface SkillRadarChartProps {
  data: SkillRadarItem[];
  size?: number;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ data, size = 320 }) => {
  const center = size / 2;
  const radius = (size - 60) / 2;
  const count = data.length;

  if (count === 0) return null;

  const angleStep = (Math.PI * 2) / count;

  // Grid polygons (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, ratio: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    return { x, y };
  };

  // Generate data polygon points
  const points = data
    .map((item, index) => {
      const ratio = Math.max(0.05, Math.min(1, item.value / item.fullMark));
      const { x, y } = getCoordinates(index, ratio);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Radial Glow */}
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#6366f1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="polyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <circle cx={center} cy={center} r={radius} fill="url(#radarGlow)" />

        {/* Web circles/polygons */}
        {gridLevels.map((level, lvlIdx) => {
          const polyPoints = Array.from({ length: count })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, level);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={lvlIdx}
              points={polyPoints}
              fill="none"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth="1"
              strokeDasharray={lvlIdx < 3 ? '3 3' : 'none'}
            />
          );
        })}

        {/* Axis rays from center to vertices */}
        {Array.from({ length: count }).map((_, i) => {
          const { x, y } = getCoordinates(i, 1);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={points}
          fill="url(#polyGradient)"
          stroke="#38bdf8"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out filter drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
        />

        {/* Data Vertices Dots */}
        {data.map((item, index) => {
          const ratio = Math.max(0.05, Math.min(1, item.value / item.fullMark));
          const { x, y } = getCoordinates(index, ratio);
          return (
            <g key={index} className="cursor-pointer group">
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="2"
                className="group-hover:r-6 transition-all"
              />
              <title>{`${item.subject}: ${item.value}% (Growth: ${item.growth})`}</title>
            </g>
          );
        })}

        {/* Labels */}
        {data.map((item, index) => {
          const { x, y } = getCoordinates(index, 1.2);
          const isRight = x > center + 10;
          const isLeft = x < center - 10;
          const textAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle';

          return (
            <text
              key={index}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="central"
              className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 select-none"
            >
              {item.subject}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
