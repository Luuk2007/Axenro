import React from 'react';
import { HeatmapMuscle, getVolumeColor } from '@/utils/muscleMapping';

interface BodyHeatmapSVGProps {
  view: 'front' | 'back';
  muscleVolumes: Record<HeatmapMuscle, number>;
  onMuscleClick: (muscle: HeatmapMuscle) => void;
  selectedMuscle: HeatmapMuscle | null;
}

const BodyHeatmapSVG: React.FC<BodyHeatmapSVGProps> = ({ view, muscleVolumes, onMuscleClick, selectedMuscle }) => {
  const getColor = (muscle: HeatmapMuscle) => getVolumeColor(muscleVolumes[muscle] || 0);
  const isSelected = (muscle: HeatmapMuscle) => selectedMuscle === muscle;
  const stroke = (muscle: HeatmapMuscle) => isSelected(muscle) ? '#fff' : 'rgba(255,255,255,0.3)';
  const sw = (muscle: HeatmapMuscle) => isSelected(muscle) ? 2.5 : 1;

  const muscleProps = (muscle: HeatmapMuscle) => ({
    fill: getColor(muscle),
    stroke: stroke(muscle),
    strokeWidth: sw(muscle),
    className: 'cursor-pointer transition-all duration-200 hover:brightness-110 hover:opacity-90',
    onClick: () => onMuscleClick(muscle),
    style: { filter: isSelected(muscle) ? 'brightness(1.15) saturate(1.2)' : undefined } as React.CSSProperties,
  });

  // Base body color
  const bodyFill = 'hsl(0 0% 78%)';
  const bodyStroke = 'hsl(0 0% 68%)';

  if (view === 'front') {
    return (
      <svg viewBox="0 0 400 820" className="w-full max-w-[300px] mx-auto select-none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <ellipse cx="200" cy="52" rx="32" ry="40" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />
        {/* Neck */}
        <rect x="186" y="88" width="28" height="28" rx="6" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

        {/* Torso base (grey) */}
        <path d="M138,116 Q145,110 170,108 L200,106 L230,108 Q255,110 262,116 L270,160 L274,220 L270,300 L264,340 Q250,370 230,380 L200,388 L170,380 Q150,370 136,340 L130,300 L126,220 L130,160 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />

        {/* === MUSCLES === */}

        {/* Shoulders (deltoids) */}
        <path d="M138,116 Q125,118 114,130 Q106,142 108,160 L112,178 Q118,172 126,164 L130,160 L138,130 Z" {...muscleProps('shoulders')} />
        <path d="M262,116 Q275,118 286,130 Q294,142 292,160 L288,178 Q282,172 274,164 L270,160 L262,130 Z" {...muscleProps('shoulders')} />

        {/* Chest (pectorals) */}
        <path d="M145,135 Q160,126 185,124 L200,123 L200,190 Q180,198 162,192 Q148,184 142,168 Z" {...muscleProps('chest')} />
        <path d="M255,135 Q240,126 215,124 L200,123 L200,190 Q220,198 238,192 Q252,184 258,168 Z" {...muscleProps('chest')} />

        {/* Biceps */}
        <path d="M108,164 Q104,178 100,210 Q98,240 100,270 L106,280 Q114,272 118,250 L122,220 L126,190 Q124,172 118,164 Z" {...muscleProps('biceps')} />
        <path d="M292,164 Q296,178 300,210 Q302,240 300,270 L294,280 Q286,272 282,250 L278,220 L274,190 Q276,172 282,164 Z" {...muscleProps('biceps')} />

        {/* Abs */}
        <path d="M172,200 Q186,194 200,196 Q214,194 228,200 L230,240 Q214,236 200,238 Q186,236 170,240 Z" fill={getColor('abs')} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" className="cursor-pointer transition-all duration-200 hover:brightness-110" onClick={() => onMuscleClick('abs')} />
        <path d="M170,244 Q186,240 200,242 Q214,240 230,244 L232,286 Q214,282 200,284 Q186,282 168,286 Z" fill={getColor('abs')} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" className="cursor-pointer transition-all duration-200 hover:brightness-110" onClick={() => onMuscleClick('abs')} />
        <path d="M168,290 Q186,286 200,288 Q214,286 232,290 L234,332 Q216,338 200,340 Q184,338 166,332 Z" fill={getColor('abs')} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" className="cursor-pointer transition-all duration-200 hover:brightness-110" onClick={() => onMuscleClick('abs')} />
        {/* Ab center line */}
        <line x1="200" y1="196" x2="200" y2="340" stroke="rgba(255,255,255,0.5)" strokeWidth="1" pointerEvents="none" />

        {/* Forearms (body color) */}
        <path d="M100,280 Q96,310 92,340 Q88,370 86,395 L94,400 Q98,380 102,355 Q106,330 110,300 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
        <path d="M300,280 Q304,310 308,340 Q312,370 314,395 L306,400 Q302,380 298,355 Q294,330 290,300 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

        {/* Hands */}
        <ellipse cx="88" cy="410" rx="12" ry="18" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
        <ellipse cx="312" cy="410" rx="12" ry="18" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

        {/* Hip/waist connector (grey) */}
        <path d="M160,345 Q180,355 200,358 Q220,355 240,345 L244,400 Q230,415 200,418 Q170,415 156,400 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

        {/* Quads */}
        <path d="M156,400 Q162,395 180,405 L198,412 L194,520 Q185,560 178,580 L168,582 Q158,540 154,490 Z" {...muscleProps('quads')} />
        <path d="M244,400 Q238,395 220,405 L202,412 L206,520 Q215,560 222,580 L232,582 Q242,540 246,490 Z" {...muscleProps('quads')} />

        {/* Knees (grey) */}
        <ellipse cx="174" cy="598" rx="18" ry="22" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
        <ellipse cx="226" cy="598" rx="18" ry="22" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

        {/* Calves (front - tibialis, shown as body color or light) */}
        <path d="M158,618 Q166,612 178,616 L180,700 Q174,730 170,745 L162,748 Q156,710 155,670 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
        <path d="M242,618 Q234,612 222,616 L220,700 Q226,730 230,745 L238,748 Q244,710 245,670 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

        {/* Feet */}
        <path d="M154,748 Q158,762 154,775 L176,778 Q182,766 180,750 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
        <path d="M246,748 Q242,762 246,775 L224,778 Q218,766 220,750 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
      </svg>
    );
  }

  // BACK VIEW
  return (
    <svg viewBox="0 0 400 820" className="w-full max-w-[300px] mx-auto select-none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <ellipse cx="200" cy="52" rx="32" ry="40" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />
      {/* Neck */}
      <rect x="186" y="88" width="28" height="28" rx="6" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

      {/* Torso base */}
      <path d="M138,116 Q145,110 170,108 L200,106 L230,108 Q255,110 262,116 L270,160 L274,220 L270,300 L264,340 Q250,370 230,380 L200,388 L170,380 Q150,370 136,340 L130,300 L126,220 L130,160 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="1" />

      {/* Shoulders */}
      <path d="M138,116 Q125,118 114,130 Q106,142 108,160 L112,178 Q118,172 126,164 L130,160 L138,130 Z" {...muscleProps('shoulders')} />
      <path d="M262,116 Q275,118 286,130 Q294,142 292,160 L288,178 Q282,172 274,164 L270,160 L262,130 Z" {...muscleProps('shoulders')} />

      {/* Back (traps + lats + lower back) */}
      <path d="M148,120 Q170,114 200,112 Q230,114 252,120 L260,160 L264,220 Q262,260 256,290 L248,310 Q230,318 200,320 Q170,318 152,310 L144,290 Q138,260 136,220 L140,160 Z" {...muscleProps('back')} />
      {/* Back spine line */}
      <line x1="200" y1="115" x2="200" y2="320" stroke="rgba(255,255,255,0.4)" strokeWidth="1" pointerEvents="none" />

      {/* Triceps */}
      <path d="M108,164 Q104,178 100,210 Q98,240 100,270 L106,280 Q114,272 118,250 L122,220 L126,190 Q124,172 118,164 Z" {...muscleProps('triceps')} />
      <path d="M292,164 Q296,178 300,210 Q302,240 300,270 L294,280 Q286,272 282,250 L278,220 L274,190 Q276,172 282,164 Z" {...muscleProps('triceps')} />

      {/* Forearms */}
      <path d="M100,280 Q96,310 92,340 Q88,370 86,395 L94,400 Q98,380 102,355 Q106,330 110,300 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
      <path d="M300,280 Q304,310 308,340 Q312,370 314,395 L306,400 Q302,380 298,355 Q294,330 290,300 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

      {/* Hands */}
      <ellipse cx="88" cy="410" rx="12" ry="18" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
      <ellipse cx="312" cy="410" rx="12" ry="18" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

      {/* Glutes */}
      <path d="M160,345 Q175,338 198,342 L198,395 Q185,405 168,398 Q158,385 156,365 Z" {...muscleProps('glutes')} />
      <path d="M240,345 Q225,338 202,342 L202,395 Q215,405 232,398 Q242,385 244,365 Z" {...muscleProps('glutes')} />

      {/* Hamstrings */}
      <path d="M156,405 Q165,398 182,408 L196,414 L192,530 Q184,565 178,582 L166,584 Q158,545 154,495 Z" {...muscleProps('hamstrings')} />
      <path d="M244,405 Q235,398 218,408 L204,414 L208,530 Q216,565 222,582 L234,584 Q242,545 246,495 Z" {...muscleProps('hamstrings')} />

      {/* Knees */}
      <ellipse cx="174" cy="598" rx="18" ry="22" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
      <ellipse cx="226" cy="598" rx="18" ry="22" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />

      {/* Calves */}
      <path d="M158,618 Q168,610 180,616 L182,700 Q176,732 172,748 L160,750 Q154,710 155,665 Z" {...muscleProps('calves')} />
      <path d="M242,618 Q232,610 220,616 L218,700 Q224,732 228,748 L240,750 Q246,710 245,665 Z" {...muscleProps('calves')} />

      {/* Feet */}
      <path d="M154,748 Q158,762 154,775 L176,778 Q182,766 180,750 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
      <path d="M246,748 Q242,762 246,775 L224,778 Q218,766 220,750 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.5" />
    </svg>
  );
};

export default BodyHeatmapSVG;
