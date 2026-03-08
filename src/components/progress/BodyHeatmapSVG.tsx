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
  d: string;
  sets: number;
  selected: boolean;
  onClick: () => void;
  mirror?: string;
}

const MusclePath: React.FC<MusclePathProps> = ({ muscle, d, sets, selected, onClick, mirror }) => {
  const color = getVolumeColor(sets);
  return (
    <>
      <path
        d={d}
        fill={color}
        stroke={selected ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.2)'}
        strokeWidth={selected ? 2.5 : 1}
        opacity={0.85}
        className="cursor-pointer transition-all duration-200 hover:opacity-100 hover:brightness-110"
        onClick={onClick}
        data-muscle={muscle}
      />
      {mirror && (
        <path
          d={mirror}
          fill={color}
          stroke={selected ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.2)'}
          strokeWidth={selected ? 2.5 : 1}
          opacity={0.85}
          className="cursor-pointer transition-all duration-200 hover:opacity-100 hover:brightness-110"
          onClick={onClick}
          data-muscle={muscle}
        />
      )}
    </>
  );
};

// Simplified anatomical SVG paths for a human body silhouette (viewBox 0 0 200 400)
const frontPaths: Record<string, { d: string; mirror?: string }> = {
  chest: {
    d: 'M72,105 Q80,95 100,95 Q120,95 128,105 L130,130 Q115,138 100,140 Q85,138 70,130 Z',
  },
  shoulders: {
    d: 'M55,90 Q60,80 72,85 L72,105 L60,110 Q50,100 55,90 Z',
    mirror: 'M145,90 Q140,80 128,85 L128,105 L140,110 Q150,100 145,90 Z',
  },
  biceps: {
    d: 'M50,112 L60,110 L62,150 Q55,155 48,150 Z',
    mirror: 'M150,112 L140,110 L138,150 Q145,155 152,150 Z',
  },
  abs: {
    d: 'M78,140 Q90,138 100,140 Q110,138 122,140 L120,200 Q110,205 100,207 Q90,205 80,200 Z',
  },
  quads: {
    d: 'M75,207 L82,200 Q90,205 100,207 L100,295 Q92,298 85,295 L75,207 Z',
    mirror: 'M125,207 L118,200 Q110,205 100,207 L100,295 Q108,298 115,295 L125,207 Z',
  },
};

const backPaths: Record<string, { d: string; mirror?: string }> = {
  back: {
    d: 'M72,90 Q85,85 100,85 Q115,85 128,90 L130,155 Q115,162 100,165 Q85,162 70,155 Z',
  },
  triceps: {
    d: 'M50,112 L62,108 L64,150 Q57,155 48,148 Z',
    mirror: 'M150,112 L138,108 L136,150 Q143,155 152,148 Z',
  },
  glutes: {
    d: 'M78,195 Q90,190 100,192 Q110,190 122,195 L122,225 Q110,232 100,234 Q90,232 78,225 Z',
  },
  hamstrings: {
    d: 'M78,228 L85,225 Q90,232 100,234 L100,310 Q92,313 85,310 L78,228 Z',
    mirror: 'M122,228 L115,225 Q110,232 100,234 L100,310 Q108,313 115,310 L122,228 Z',
  },
  calves: {
    d: 'M82,312 L88,310 L90,365 Q85,370 80,365 Z',
    mirror: 'M118,312 L112,310 L110,365 Q115,370 120,365 Z',
  },
};

// Body outline for context
const frontOutline = `M100,20 
  Q115,20 118,35 L118,55 Q118,70 112,75 L128,85 Q150,90 152,112 L155,155 Q155,165 145,165 L135,155 L130,130 
  L130,200 L128,207 L118,295 L118,310 L122,365 Q122,385 112,388 L88,388 Q78,385 78,365 L82,310 L82,295 L72,207 L70,200 L70,130 
  L65,155 Q55,165 45,165 Q45,155 48,112 Q50,90 72,85 L88,75 Q82,70 82,55 L82,35 Q85,20 100,20 Z`;

const backOutline = frontOutline; // same silhouette

const BodyHeatmapSVG: React.FC<BodyHeatmapSVGProps> = ({ view, muscleVolumes, onMuscleClick, selectedMuscle }) => {
  const paths = view === 'front' ? frontPaths : backPaths;

  return (
    <svg
      viewBox="0 0 200 410"
      className="w-full max-w-[220px] mx-auto select-none"
      style={{ filter: 'drop-shadow(0 2px 8px hsl(var(--foreground) / 0.08))' }}
    >
      {/* Body silhouette outline */}
      <path
        d={view === 'front' ? frontOutline : backOutline}
        fill="hsl(var(--muted))"
        stroke="hsl(var(--border))"
        strokeWidth={1.5}
        opacity={0.5}
      />

      {/* Muscle regions */}
      {Object.entries(paths).map(([muscle, { d, mirror }]) => (
        <MusclePath
          key={muscle}
          muscle={muscle as HeatmapMuscle}
          d={d}
          mirror={mirror}
          sets={muscleVolumes[muscle as HeatmapMuscle] || 0}
          selected={selectedMuscle === muscle}
          onClick={() => onMuscleClick(muscle as HeatmapMuscle)}
        />
      ))}

      {/* Head circle */}
      <circle cx="100" cy="35" r="18" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1.5} opacity={0.5} />
    </svg>
  );
};

export default BodyHeatmapSVG;
