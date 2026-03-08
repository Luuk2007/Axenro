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

  const muscleStyle = (muscle: HeatmapMuscle): React.CSSProperties => ({
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    filter: isSelected(muscle) ? 'brightness(1.15) drop-shadow(0 0 6px rgba(255,255,255,0.4))' : undefined,
  });

  const muscleStroke = (muscle: HeatmapMuscle) => isSelected(muscle) ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)';
  const muscleSW = (muscle: HeatmapMuscle) => isSelected(muscle) ? 2 : 0.8;

  // Base body (non-muscle areas)
  const B = '#c2c2c2'; // base body fill
  const BS = '#b0b0b0'; // base body stroke
  const J = '#b8b8b8'; // joint color (slightly darker)

  if (view === 'front') {
    return (
      <svg viewBox="0 0 260 600" className="w-full max-w-[260px] mx-auto select-none" xmlns="http://www.w3.org/2000/svg">
        {/* ===== BASE BODY (non-muscle grey) ===== */}
        
        {/* Head */}
        <ellipse cx="130" cy="38" rx="22" ry="28" fill={B} stroke={BS} strokeWidth="0.8"/>
        {/* Neck */}
        <rect x="120" y="64" width="20" height="18" rx="4" fill={B} stroke={BS} strokeWidth="0.5"/>

        {/* Core torso outline (behind muscles) */}
        <path d="M90,82 Q95,78 115,76 L130,75 L145,76 Q165,78 170,82 L176,110 L180,155 L178,210 L175,245 Q168,268 155,278 L130,285 L105,278 Q92,268 85,245 L82,210 L80,155 L84,110 Z" fill={B} stroke={BS} strokeWidth="0.8"/>

        {/* Obliques / side torso */}
        <path d="M84,140 L80,155 L82,210 L85,245 Q88,255 92,262 L95,248 L92,200 L90,155 Z" fill={B} stroke={BS} strokeWidth="0.3"/>
        <path d="M176,140 L180,155 L178,210 L175,245 Q172,255 168,262 L165,248 L168,200 L170,155 Z" fill={B} stroke={BS} strokeWidth="0.3"/>

        {/* Hip area */}
        <path d="M100,255 Q115,265 130,268 Q145,265 160,255 L162,295 Q150,308 130,310 Q110,308 98,295 Z" fill={B} stroke={BS} strokeWidth="0.5"/>

        {/* ===== MUSCLES ===== */}

        {/* -- SHOULDERS (deltoids) -- */}
        <path
          d="M90,82 Q78,84 72,94 Q67,105 68,118 L72,130 Q76,124 82,118 L84,110 L90,92 Z"
          fill={getColor('shoulders')} stroke={muscleStroke('shoulders')} strokeWidth={muscleSW('shoulders')}
          style={muscleStyle('shoulders')} onClick={() => onMuscleClick('shoulders')}
        />
        <path
          d="M170,82 Q182,84 188,94 Q193,105 192,118 L188,130 Q184,124 178,118 L176,110 L170,92 Z"
          fill={getColor('shoulders')} stroke={muscleStroke('shoulders')} strokeWidth={muscleSW('shoulders')}
          style={muscleStyle('shoulders')} onClick={() => onMuscleClick('shoulders')}
        />

        {/* -- CHEST (pectorals) -- */}
        <path
          d="M94,95 Q108,88 125,86 L130,85 L130,140 Q116,146 104,140 Q95,132 92,118 Z"
          fill={getColor('chest')} stroke={muscleStroke('chest')} strokeWidth={muscleSW('chest')}
          style={muscleStyle('chest')} onClick={() => onMuscleClick('chest')}
        />
        <path
          d="M166,95 Q152,88 135,86 L130,85 L130,140 Q144,146 156,140 Q165,132 168,118 Z"
          fill={getColor('chest')} stroke={muscleStroke('chest')} strokeWidth={muscleSW('chest')}
          style={muscleStyle('chest')} onClick={() => onMuscleClick('chest')}
        />

        {/* -- BICEPS -- */}
        <path
          d="M68,120 Q64,134 62,155 Q61,175 63,195 L68,202 Q74,194 76,178 L78,158 L80,135 Q78,126 74,120 Z"
          fill={getColor('biceps')} stroke={muscleStroke('biceps')} strokeWidth={muscleSW('biceps')}
          style={muscleStyle('biceps')} onClick={() => onMuscleClick('biceps')}
        />
        <path
          d="M192,120 Q196,134 198,155 Q199,175 197,195 L192,202 Q186,194 184,178 L182,158 L180,135 Q182,126 186,120 Z"
          fill={getColor('biceps')} stroke={muscleStroke('biceps')} strokeWidth={muscleSW('biceps')}
          style={muscleStyle('biceps')} onClick={() => onMuscleClick('biceps')}
        />

        {/* -- ABS -- */}
        {/* Upper abs */}
        <path d="M112,148 Q121,143 130,145 Q139,143 148,148 L149,175 Q139,172 130,173 Q121,172 111,175 Z"
          fill={getColor('abs')} stroke="rgba(255,255,255,0.35)" strokeWidth="0.6"
          style={muscleStyle('abs')} onClick={() => onMuscleClick('abs')}/>
        {/* Mid abs */}
        <path d="M111,178 Q121,175 130,176 Q139,175 149,178 L150,208 Q139,205 130,206 Q121,205 110,208 Z"
          fill={getColor('abs')} stroke="rgba(255,255,255,0.35)" strokeWidth="0.6"
          style={muscleStyle('abs')} onClick={() => onMuscleClick('abs')}/>
        {/* Lower abs */}
        <path d="M110,211 Q121,208 130,209 Q139,208 150,211 L151,242 Q140,248 130,250 Q120,248 109,242 Z"
          fill={getColor('abs')} stroke="rgba(255,255,255,0.35)" strokeWidth="0.6"
          style={muscleStyle('abs')} onClick={() => onMuscleClick('abs')}/>
        {/* Ab center line */}
        <line x1="130" y1="145" x2="130" y2="250" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" pointerEvents="none"/>

        {/* -- Forearms (body color) -- */}
        <path d="M63,202 Q60,222 58,245 Q56,268 55,288 L60,292 Q62,275 64,255 Q67,235 70,215 Z" fill={B} stroke={BS} strokeWidth="0.4"/>
        <path d="M197,202 Q200,222 202,245 Q204,268 205,288 L200,292 Q198,275 196,255 Q193,235 190,215 Z" fill={B} stroke={BS} strokeWidth="0.4"/>
        {/* Hands */}
        <ellipse cx="56" cy="300" rx="8" ry="14" fill={B} stroke={BS} strokeWidth="0.4"/>
        <ellipse cx="204" cy="300" rx="8" ry="14" fill={B} stroke={BS} strokeWidth="0.4"/>

        {/* -- QUADS -- */}
        <path
          d="M100,295 Q108,290 120,296 L130,300 L128,388 Q121,408 116,420 L108,422 Q100,392 98,355 Z"
          fill={getColor('quads')} stroke={muscleStroke('quads')} strokeWidth={muscleSW('quads')}
          style={muscleStyle('quads')} onClick={() => onMuscleClick('quads')}
        />
        <path
          d="M160,295 Q152,290 140,296 L130,300 L132,388 Q139,408 144,420 L152,422 Q160,392 162,355 Z"
          fill={getColor('quads')} stroke={muscleStroke('quads')} strokeWidth={muscleSW('quads')}
          style={muscleStyle('quads')} onClick={() => onMuscleClick('quads')}
        />

        {/* Knees */}
        <ellipse cx="113" cy="434" rx="13" ry="16" fill={J} stroke={BS} strokeWidth="0.4"/>
        <ellipse cx="147" cy="434" rx="13" ry="16" fill={J} stroke={BS} strokeWidth="0.4"/>

        {/* -- Front calves (tibialis - shown as body grey since calves are back) -- */}
        <path d="M102,448 Q110,442 118,446 L120,515 Q116,535 113,545 L106,547 Q100,520 100,485 Z" fill={B} stroke={BS} strokeWidth="0.4"/>
        <path d="M158,448 Q150,442 142,446 L140,515 Q144,535 147,545 L154,547 Q160,520 160,485 Z" fill={B} stroke={BS} strokeWidth="0.4"/>

        {/* Feet */}
        <path d="M100,547 Q103,558 100,568 L118,570 Q122,560 120,548 Z" fill={B} stroke={BS} strokeWidth="0.4"/>
        <path d="M160,547 Q157,558 160,568 L142,570 Q138,560 140,548 Z" fill={B} stroke={BS} strokeWidth="0.4"/>
      </svg>
    );
  }

  // ===== BACK VIEW =====
  return (
    <svg viewBox="0 0 260 600" className="w-full max-w-[260px] mx-auto select-none" xmlns="http://www.w3.org/2000/svg">
      {/* ===== BASE BODY ===== */}
      
      {/* Head */}
      <ellipse cx="130" cy="38" rx="22" ry="28" fill={B} stroke={BS} strokeWidth="0.8"/>
      {/* Neck */}
      <rect x="120" y="64" width="20" height="18" rx="4" fill={B} stroke={BS} strokeWidth="0.5"/>

      {/* Core torso */}
      <path d="M90,82 Q95,78 115,76 L130,75 L145,76 Q165,78 170,82 L176,110 L180,155 L178,210 L175,245 Q168,268 155,278 L130,285 L105,278 Q92,268 85,245 L82,210 L80,155 L84,110 Z" fill={B} stroke={BS} strokeWidth="0.8"/>

      {/* ===== MUSCLES ===== */}

      {/* -- SHOULDERS -- */}
      <path d="M90,82 Q78,84 72,94 Q67,105 68,118 L72,130 Q76,124 82,118 L84,110 L90,92 Z"
        fill={getColor('shoulders')} stroke={muscleStroke('shoulders')} strokeWidth={muscleSW('shoulders')}
        style={muscleStyle('shoulders')} onClick={() => onMuscleClick('shoulders')}/>
      <path d="M170,82 Q182,84 188,94 Q193,105 192,118 L188,130 Q184,124 178,118 L176,110 L170,92 Z"
        fill={getColor('shoulders')} stroke={muscleStroke('shoulders')} strokeWidth={muscleSW('shoulders')}
        style={muscleStyle('shoulders')} onClick={() => onMuscleClick('shoulders')}/>

      {/* -- BACK (traps + lats + lower back as one group) -- */}
      <path
        d="M96,86 Q112,80 130,78 Q148,80 164,86 L170,110 L174,155 Q172,190 168,215 L162,232 Q150,240 130,242 Q110,240 98,232 L92,215 Q88,190 86,155 L90,110 Z"
        fill={getColor('back')} stroke={muscleStroke('back')} strokeWidth={muscleSW('back')}
        style={muscleStyle('back')} onClick={() => onMuscleClick('back')}
      />
      {/* Spine line */}
      <line x1="130" y1="82" x2="130" y2="240" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" pointerEvents="none"/>
      {/* Shoulder blade lines */}
      <path d="M105,110 Q115,130 120,145 Q125,155 130,158" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" fill="none" pointerEvents="none"/>
      <path d="M155,110 Q145,130 140,145 Q135,155 130,158" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" fill="none" pointerEvents="none"/>

      {/* -- TRICEPS -- */}
      <path d="M68,120 Q64,134 62,155 Q61,175 63,195 L68,202 Q74,194 76,178 L78,158 L80,135 Q78,126 74,120 Z"
        fill={getColor('triceps')} stroke={muscleStroke('triceps')} strokeWidth={muscleSW('triceps')}
        style={muscleStyle('triceps')} onClick={() => onMuscleClick('triceps')}/>
      <path d="M192,120 Q196,134 198,155 Q199,175 197,195 L192,202 Q186,194 184,178 L182,158 L180,135 Q182,126 186,120 Z"
        fill={getColor('triceps')} stroke={muscleStroke('triceps')} strokeWidth={muscleSW('triceps')}
        style={muscleStyle('triceps')} onClick={() => onMuscleClick('triceps')}/>

      {/* Forearms */}
      <path d="M63,202 Q60,222 58,245 Q56,268 55,288 L60,292 Q62,275 64,255 Q67,235 70,215 Z" fill={B} stroke={BS} strokeWidth="0.4"/>
      <path d="M197,202 Q200,222 202,245 Q204,268 205,288 L200,292 Q198,275 196,255 Q193,235 190,215 Z" fill={B} stroke={BS} strokeWidth="0.4"/>
      {/* Hands */}
      <ellipse cx="56" cy="300" rx="8" ry="14" fill={B} stroke={BS} strokeWidth="0.4"/>
      <ellipse cx="204" cy="300" rx="8" ry="14" fill={B} stroke={BS} strokeWidth="0.4"/>

      {/* -- GLUTES -- */}
      <path d="M102,255 Q115,248 129,252 L129,295 Q118,303 107,298 Q100,290 98,272 Z"
        fill={getColor('glutes')} stroke={muscleStroke('glutes')} strokeWidth={muscleSW('glutes')}
        style={muscleStyle('glutes')} onClick={() => onMuscleClick('glutes')}/>
      <path d="M158,255 Q145,248 131,252 L131,295 Q142,303 153,298 Q160,290 162,272 Z"
        fill={getColor('glutes')} stroke={muscleStroke('glutes')} strokeWidth={muscleSW('glutes')}
        style={muscleStyle('glutes')} onClick={() => onMuscleClick('glutes')}/>

      {/* -- HAMSTRINGS -- */}
      <path d="M98,300 Q108,294 120,300 L128,305 L126,395 Q120,415 116,425 L106,427 Q99,400 97,360 Z"
        fill={getColor('hamstrings')} stroke={muscleStroke('hamstrings')} strokeWidth={muscleSW('hamstrings')}
        style={muscleStyle('hamstrings')} onClick={() => onMuscleClick('hamstrings')}/>
      <path d="M162,300 Q152,294 140,300 L132,305 L134,395 Q140,415 144,425 L154,427 Q161,400 163,360 Z"
        fill={getColor('hamstrings')} stroke={muscleStroke('hamstrings')} strokeWidth={muscleSW('hamstrings')}
        style={muscleStyle('hamstrings')} onClick={() => onMuscleClick('hamstrings')}/>

      {/* Knees */}
      <ellipse cx="113" cy="438" rx="13" ry="16" fill={J} stroke={BS} strokeWidth="0.4"/>
      <ellipse cx="147" cy="438" rx="13" ry="16" fill={J} stroke={BS} strokeWidth="0.4"/>

      {/* -- CALVES -- */}
      <path d="M100,452 Q110,445 120,450 L122,522 Q118,542 114,552 L104,554 Q98,525 98,490 Z"
        fill={getColor('calves')} stroke={muscleStroke('calves')} strokeWidth={muscleSW('calves')}
        style={muscleStyle('calves')} onClick={() => onMuscleClick('calves')}/>
      <path d="M160,452 Q150,445 140,450 L138,522 Q142,542 146,552 L156,554 Q162,525 162,490 Z"
        fill={getColor('calves')} stroke={muscleStroke('calves')} strokeWidth={muscleSW('calves')}
        style={muscleStyle('calves')} onClick={() => onMuscleClick('calves')}/>

      {/* Feet */}
      <path d="M100,552 Q103,562 100,572 L118,574 Q122,564 120,552 Z" fill={B} stroke={BS} strokeWidth="0.4"/>
      <path d="M160,552 Q157,562 160,572 L142,574 Q138,564 140,552 Z" fill={B} stroke={BS} strokeWidth="0.4"/>
    </svg>
  );
};

export default BodyHeatmapSVG;
