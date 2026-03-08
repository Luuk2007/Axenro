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
          stroke={selected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)'}
          strokeWidth={selected ? 2.5 : 0.5}
          opacity={sets === 0 ? 0.25 : 0.55}
          className="cursor-pointer transition-all duration-300 hover:opacity-70"
          style={{ 
            mixBlendMode: 'multiply',
            filter: selected ? 'brightness(1.2) saturate(1.3)' : undefined,
          }}
          onClick={onClick}
          data-muscle={muscle}
        />
      ))}
    </>
  );
};

// SVG paths carefully mapped to the generated body images (viewBox matches image aspect 512x1024)
// These paths are positioned to overlay on the realistic mannequin

// Front body muscle overlay paths (mapped to 512x1024 image)
const frontPaths: Record<string, string[]> = {
  chest: [
    // Left pec
    'M175,260 Q195,240 230,235 Q256,233 256,245 L256,310 Q235,325 210,320 Q185,315 175,300 Z',
    // Right pec
    'M337,260 Q317,240 282,235 Q256,233 256,245 L256,310 Q277,325 302,320 Q327,315 337,300 Z',
  ],
  shoulders: [
    // Left deltoid
    'M130,215 Q140,195 165,200 Q180,205 185,215 L180,260 Q170,275 155,275 L140,265 Q125,248 130,215 Z',
    // Right deltoid
    'M382,215 Q372,195 347,200 Q332,205 327,215 L332,260 Q342,275 357,275 L372,265 Q387,248 382,215 Z',
  ],
  biceps: [
    // Left bicep
    'M118,280 Q128,270 140,268 L155,275 L150,370 Q138,378 125,372 L115,320 Z',
    // Right bicep
    'M394,280 Q384,270 372,268 L357,275 L362,370 Q374,378 387,372 L397,320 Z',
  ],
  abs: [
    // Upper abs
    'M218,320 Q237,315 256,318 Q275,315 294,320 L294,370 Q275,365 256,368 Q237,365 218,370 Z',
    // Mid abs
    'M218,374 Q237,370 256,372 Q275,370 294,374 L294,425 Q275,420 256,422 Q237,420 218,425 Z',
    // Lower abs
    'M220,428 Q238,424 256,426 Q274,424 292,428 L290,480 Q274,488 256,490 Q238,488 222,480 Z',
  ],
  quads: [
    // Left quad
    'M190,500 Q205,492 225,495 L256,500 L252,700 Q235,708 220,700 L190,580 Z',
    // Right quad
    'M322,500 Q307,492 287,495 L256,500 L260,700 Q277,708 292,700 L322,580 Z',
  ],
};

// Back body muscle overlay paths
const backPaths: Record<string, string[]> = {
  back: [
    // Left lat/upper back
    'M175,225 Q195,215 230,210 L256,210 L256,345 Q230,355 205,345 Q180,330 175,300 Z',
    // Right lat/upper back
    'M337,225 Q317,215 282,210 L256,210 L256,345 Q282,355 307,345 Q332,330 337,300 Z',
    // Lower back
    'M215,350 Q236,342 256,345 Q276,342 297,350 L295,410 Q276,420 256,422 Q236,420 217,410 Z',
  ],
  triceps: [
    // Left tricep
    'M115,280 Q125,268 140,270 L155,278 L150,375 Q138,382 122,372 Z',
    // Right tricep
    'M397,280 Q387,268 372,270 L357,278 L362,375 Q374,382 390,372 Z',
  ],
  glutes: [
    // Left glute
    'M200,440 Q220,430 256,435 L256,500 Q230,510 210,502 L198,470 Z',
    // Right glute
    'M312,440 Q292,430 256,435 L256,500 Q282,510 302,502 L314,470 Z',
  ],
  hamstrings: [
    // Left hamstring
    'M195,510 Q215,502 235,508 L252,512 L248,710 Q232,718 218,710 L195,600 Z',
    // Right hamstring
    'M317,510 Q297,502 277,508 L260,512 L264,710 Q280,718 294,710 L317,600 Z',
  ],
  calves: [
    // Left calf
    'M210,725 Q225,715 240,720 L242,850 Q230,862 215,855 L205,780 Z',
    // Right calf
    'M302,725 Q287,715 272,720 L270,850 Q282,862 297,855 L307,780 Z',
  ],
};

const BodyHeatmapSVG: React.FC<BodyHeatmapSVGProps> = ({ view, muscleVolumes, onMuscleClick, selectedMuscle }) => {
  const paths = view === 'front' ? frontPaths : backPaths;
  const imageSrc = view === 'front' ? '/images/body-front.png' : '/images/body-back.png';

  return (
    <div className="relative w-full max-w-[280px] mx-auto select-none">
      {/* Realistic body image */}
      <img
        src={imageSrc}
        alt={view === 'front' ? 'Body front view' : 'Body back view'}
        className="w-full h-auto pointer-events-none"
        draggable={false}
      />
      {/* SVG overlay for colored muscle regions */}
      <svg
        viewBox="0 0 512 1024"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
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
    </div>
  );
};

export default BodyHeatmapSVG;
