import React from 'react';
import { HeatmapMuscle, getVolumeColor } from '@/utils/muscleMapping';

interface BodyHeatmapSVGProps {
  view: 'front' | 'back';
  muscleVolumes: Record<HeatmapMuscle, number>;
  onMuscleClick: (muscle: HeatmapMuscle) => void;
  selectedMuscle: HeatmapMuscle | null;
}

interface MusclePathProps {
  muscle: HeatmapMuscle;
  paths: string[];
  sets: number;
  selected: boolean;
  onClick: () => void;
}

const MusclePath: React.FC<MusclePathProps> = ({ muscle, paths, sets, selected, onClick }) => {
  const color = getVolumeColor(sets);
  return (
    <>
      {paths.map((d, i) => (
        <path
          key={`${muscle}-${i}`}
          d={d}
          fill={color}
          stroke={selected ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.12)'}
          strokeWidth={selected ? 2 : 0.7}
          opacity={0.88}
          className="cursor-pointer transition-all duration-300 hover:opacity-100 hover:brightness-110"
          style={{ filter: selected ? 'brightness(1.15)' : undefined }}
          onClick={onClick}
          data-muscle={muscle}
        />
      ))}
    </>
  );
};

// Much more anatomically detailed body - viewBox 0 0 200 450
const frontPaths: Record<string, string[]> = {
  // Chest - pectoral muscles with more shape
  chest: [
    // Left pec
    'M78,108 Q82,100 95,98 Q100,97 100,102 L100,128 Q92,133 82,130 Q75,126 74,118 Z',
    // Right pec
    'M122,108 Q118,100 105,98 Q100,97 100,102 L100,128 Q108,133 118,130 Q125,126 126,118 Z',
  ],
  // Shoulders / deltoids
  shoulders: [
    // Left shoulder
    'M58,92 Q62,82 72,84 Q78,86 80,92 L78,108 Q74,112 68,112 L62,108 Q54,102 58,92 Z',
    // Right shoulder
    'M142,92 Q138,82 128,84 Q122,86 120,92 L122,108 Q126,112 132,112 L138,108 Q146,102 142,92 Z',
  ],
  // Biceps
  biceps: [
    // Left bicep
    'M55,114 Q58,110 62,108 L68,112 L66,148 Q60,152 54,148 L52,126 Z',
    // Right bicep
    'M145,114 Q142,110 138,108 L132,112 L134,148 Q140,152 146,148 L148,126 Z',
  ],
  // Abs - segmented
  abs: [
    // Upper abs
    'M84,132 Q92,130 100,132 Q108,130 116,132 L116,152 Q108,150 100,152 Q92,150 84,152 Z',
    // Mid abs
    'M84,154 Q92,152 100,154 Q108,152 116,154 L116,176 Q108,174 100,176 Q92,174 84,176 Z',
    // Lower abs
    'M84,178 Q92,176 100,178 Q108,176 116,178 L116,200 Q108,204 100,206 Q92,204 84,200 Z',
  ],
  // Quads
  quads: [
    // Left quad
    'M78,210 Q84,206 92,208 L100,210 L100,300 Q94,304 88,300 L78,250 Z',
    // Right quad
    'M122,210 Q116,206 108,208 L100,210 L100,300 Q106,304 112,300 L122,250 Z',
  ],
};

const backPaths: Record<string, string[]> = {
  // Back - upper and lower
  back: [
    // Upper back / lats left
    'M74,92 Q80,88 92,86 L100,86 L100,140 Q88,144 78,138 Q72,130 72,118 Z',
    // Upper back / lats right
    'M126,92 Q120,88 108,86 L100,86 L100,140 Q112,144 122,138 Q128,130 128,118 Z',
    // Lower back
    'M82,142 Q92,138 100,140 Q108,138 118,142 L118,175 Q108,180 100,182 Q92,180 82,175 Z',
  ],
  // Triceps
  triceps: [
    // Left tricep
    'M54,114 Q58,108 64,110 L68,114 L66,150 Q60,154 52,148 Z',
    // Right tricep
    'M146,114 Q142,108 136,110 L132,114 L134,150 Q140,154 148,148 Z',
  ],
  // Glutes
  glutes: [
    // Left glute
    'M80,195 Q88,190 100,192 L100,225 Q90,230 82,226 L78,210 Z',
    // Right glute
    'M120,195 Q112,190 100,192 L100,225 Q110,230 118,226 L122,210 Z',
  ],
  // Hamstrings
  hamstrings: [
    // Left hamstring
    'M80,228 Q88,224 94,228 L100,230 L100,310 Q94,314 88,310 L80,268 Z',
    // Right hamstring
    'M120,228 Q112,224 106,228 L100,230 L100,310 Q106,314 112,310 L120,268 Z',
  ],
  // Calves
  calves: [
    // Left calf
    'M84,315 Q90,310 96,314 L96,368 Q92,374 86,370 L82,340 Z',
    // Right calf
    'M116,315 Q110,310 104,314 L104,368 Q108,374 114,370 L118,340 Z',
  ],
};

// Body silhouette outline - more detailed and realistic
const bodyOutline = `
  M100,18 
  Q116,18 119,34 L119,50 Q120,62 115,72 Q112,78 108,82
  L126,86 Q140,90 146,98 Q152,108 152,120 L150,155 Q150,162 145,166 L140,164 L138,155 L134,148
  L130,140 L128,175 L126,200 L124,215 L124,250 L120,295 L120,315
  L122,345 L122,370 Q122,388 114,392 L108,394 Q104,394 100,394
  Q96,394 92,394 L86,392 Q78,388 78,370 L78,345 L80,315 L80,295
  L76,250 L76,215 L72,200 L70,175 L66,148 L62,155 L60,164 L55,166
  Q50,162 50,155 L48,120 Q48,108 54,98 Q60,90 74,86 L92,82
  Q88,78 85,72 Q80,62 81,50 L81,34 Q84,18 100,18 Z`;

const BodyHeatmapSVG: React.FC<BodyHeatmapSVGProps> = ({ view, muscleVolumes, onMuscleClick, selectedMuscle }) => {
  const paths = view === 'front' ? frontPaths : backPaths;

  return (
    <svg
      viewBox="0 0 200 420"
      className="w-full max-w-[260px] mx-auto select-none"
      style={{ filter: 'drop-shadow(0 4px 16px hsl(var(--foreground) / 0.06))' }}
    >
      {/* Subtle glow behind body */}
      <defs>
        <radialGradient id="bodyGlow" cx="50%" cy="45%" r="40%">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.06)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="skinGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--muted-foreground) / 0.12)" />
          <stop offset="100%" stopColor="hsl(var(--muted-foreground) / 0.06)" />
        </linearGradient>
      </defs>

      {/* Background glow */}
      <ellipse cx="100" cy="200" rx="90" ry="180" fill="url(#bodyGlow)" />

      {/* Body silhouette */}
      <path
        d={bodyOutline}
        fill="hsl(var(--muted) / 0.8)"
        stroke="hsl(var(--border))"
        strokeWidth={1}
        opacity={0.6}
      />

      {/* Head */}
      <ellipse cx="100" cy="34" rx="17" ry="19" fill="hsl(var(--muted) / 0.8)" stroke="hsl(var(--border))" strokeWidth={1} opacity={0.6} />

      {/* Muscle regions */}
      {Object.entries(paths).map(([muscle, musclePaths]) => (
        <MusclePath
          key={muscle}
          muscle={muscle as HeatmapMuscle}
          paths={musclePaths}
          sets={muscleVolumes[muscle as HeatmapMuscle] || 0}
          selected={selectedMuscle === muscle}
          onClick={() => onMuscleClick(muscle as HeatmapMuscle)}
        />
      ))}
    </svg>
  );
};

export default BodyHeatmapSVG;
