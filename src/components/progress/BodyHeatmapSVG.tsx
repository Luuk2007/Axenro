import React from 'react';
import { HeatmapMuscle, getVolumeColor } from '@/utils/muscleMapping';

interface BodyHeatmapSVGProps {
  view: 'front' | 'back';
  muscleVolumes: Record<HeatmapMuscle, number>;
  onMuscleClick: (muscle: HeatmapMuscle) => void;
  selectedMuscle: HeatmapMuscle | null;
}

const BodyHeatmapSVG: React.FC<BodyHeatmapSVGProps> = ({ view, muscleVolumes, onMuscleClick, selectedMuscle }) => {
  const c = (m: HeatmapMuscle) => getVolumeColor(muscleVolumes[m] || 0);
  const sel = (m: HeatmapMuscle) => selectedMuscle === m;
  const ms = (m: HeatmapMuscle): React.CSSProperties => ({
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    filter: sel(m) ? 'brightness(1.15) drop-shadow(0 0 8px rgba(255,255,255,0.5))' : undefined,
  });
  const ss = (m: HeatmapMuscle) => sel(m) ? '#fff' : 'rgba(255,255,255,0.6)';
  const sw = (m: HeatmapMuscle) => sel(m) ? 2.5 : 1.5;

  // Body base colors
  const B = '#d1d1d1';
  const BD = '#c4c4c4';
  const BL = '#d8d8d8';

  if (view === 'front') {
    return (
      <svg viewBox="0 0 340 680" className="w-full max-w-[280px] mx-auto select-none" xmlns="http://www.w3.org/2000/svg">
        {/* === HEAD === */}
        <path d="M170,8 Q148,8 140,22 Q132,36 134,52 Q136,68 144,76 Q152,84 170,86 Q188,84 196,76 Q204,68 206,52 Q208,36 200,22 Q192,8 170,8 Z" fill={B} stroke={BD} strokeWidth="0.8"/>
        
        {/* === NECK === */}
        <path d="M155,86 L155,106 Q162,110 170,111 Q178,110 185,106 L185,86 Q178,90 170,91 Q162,90 155,86 Z" fill={B} stroke={BD} strokeWidth="0.5"/>

        {/* === TRAPEZIUS (grey base behind shoulders) === */}
        <path d="M140,100 L155,106 L170,111 L185,106 L200,100 Q210,96 218,100 L218,118 Q200,112 185,115 L170,116 L155,115 Q140,112 122,118 L122,100 Q130,96 140,100 Z" fill={BD} stroke={BD} strokeWidth="0.5"/>

        {/* === SHOULDERS (deltoids) === */}
        {/* Left shoulder */}
        <path d="M122,108 Q108,106 98,114 Q88,124 84,138 Q82,150 84,162 L90,168 Q94,158 100,148 L106,138 L112,126 L122,118 Z"
          fill={c('shoulders')} stroke={ss('shoulders')} strokeWidth={sw('shoulders')} style={ms('shoulders')} onClick={() => onMuscleClick('shoulders')}/>
        {/* Right shoulder */}
        <path d="M218,108 Q232,106 242,114 Q252,124 256,138 Q258,150 256,162 L250,168 Q246,158 240,148 L234,138 L228,126 L218,118 Z"
          fill={c('shoulders')} stroke={ss('shoulders')} strokeWidth={sw('shoulders')} style={ms('shoulders')} onClick={() => onMuscleClick('shoulders')}/>

        {/* === CHEST (pectorals) === */}
        {/* Left pec */}
        <path d="M122,118 L112,126 Q106,138 104,148 L108,158 Q116,170 128,176 Q140,180 155,178 L170,174 L170,118 L155,115 Q140,112 122,118 Z"
          fill={c('chest')} stroke={ss('chest')} strokeWidth={sw('chest')} style={ms('chest')} onClick={() => onMuscleClick('chest')}/>
        {/* Right pec */}
        <path d="M218,118 L228,126 Q234,138 236,148 L232,158 Q224,170 212,176 Q200,180 185,178 L170,174 L170,118 L185,115 Q200,112 218,118 Z"
          fill={c('chest')} stroke={ss('chest')} strokeWidth={sw('chest')} style={ms('chest')} onClick={() => onMuscleClick('chest')}/>

        {/* === BICEPS === */}
        {/* Left bicep */}
        <path d="M84,164 Q80,178 76,198 Q74,218 76,238 Q78,252 82,260 L90,264 Q92,248 94,232 L96,212 L98,192 Q96,176 90,168 Z"
          fill={c('biceps')} stroke={ss('biceps')} strokeWidth={sw('biceps')} style={ms('biceps')} onClick={() => onMuscleClick('biceps')}/>
        {/* Right bicep */}
        <path d="M256,164 Q260,178 264,198 Q266,218 264,238 Q262,252 258,260 L250,264 Q248,248 246,232 L244,212 L242,192 Q244,176 250,168 Z"
          fill={c('biceps')} stroke={ss('biceps')} strokeWidth={sw('biceps')} style={ms('biceps')} onClick={() => onMuscleClick('biceps')}/>

        {/* === FOREARMS (body grey) === */}
        <path d="M82,264 Q78,284 74,310 Q70,336 68,360 L64,380 L72,386 Q76,366 80,340 Q84,314 88,290 L90,268 Z" fill={BD} stroke={BD} strokeWidth="0.5"/>
        <path d="M258,264 Q262,284 266,310 Q270,336 272,360 L276,380 L268,386 Q264,366 260,340 Q256,314 252,290 L250,268 Z" fill={BD} stroke={BD} strokeWidth="0.5"/>
        
        {/* Hands */}
        <path d="M60,380 Q56,390 54,400 Q52,410 56,416 Q60,420 66,418 Q70,414 72,406 L76,390 L72,386 Z" fill={BL} stroke={BD} strokeWidth="0.5"/>
        <path d="M280,380 Q284,390 286,400 Q288,410 284,416 Q280,420 274,418 Q270,414 268,406 L264,390 L268,386 Z" fill={BL} stroke={BD} strokeWidth="0.5"/>

        {/* === ABS === */}
        {/* Upper abs row */}
        <path d="M141,182 Q155,176 170,178 L170,210 Q155,208 141,212 Z" fill={c('abs')} stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" style={ms('abs')} onClick={() => onMuscleClick('abs')}/>
        <path d="M199,182 Q185,176 170,178 L170,210 Q185,208 199,212 Z" fill={c('abs')} stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" style={ms('abs')} onClick={() => onMuscleClick('abs')}/>
        {/* Mid abs row */}
        <path d="M140,216 Q155,212 170,214 L170,248 Q155,246 140,250 Z" fill={c('abs')} stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" style={ms('abs')} onClick={() => onMuscleClick('abs')}/>
        <path d="M200,216 Q185,212 170,214 L170,248 Q185,246 200,250 Z" fill={c('abs')} stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" style={ms('abs')} onClick={() => onMuscleClick('abs')}/>
        {/* Lower abs row */}
        <path d="M139,254 Q155,250 170,252 L170,286 Q155,290 139,286 Z" fill={c('abs')} stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" style={ms('abs')} onClick={() => onMuscleClick('abs')}/>
        <path d="M201,254 Q185,250 170,252 L170,286 Q185,290 201,286 Z" fill={c('abs')} stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" style={ms('abs')} onClick={() => onMuscleClick('abs')}/>

        {/* Obliques (grey) */}
        <path d="M108,162 Q104,182 102,210 L100,250 Q98,270 100,290 L104,300 Q108,280 110,250 L112,210 Q114,182 112,162 Z" fill={BD} stroke={BD} strokeWidth="0.3"/>
        <path d="M232,162 Q236,182 238,210 L240,250 Q242,270 240,290 L236,300 Q232,280 230,250 L228,210 Q226,182 228,162 Z" fill={BD} stroke={BD} strokeWidth="0.3"/>

        {/* === HIP / WAIST connector === */}
        <path d="M104,295 Q120,302 142,308 L170,312 L198,308 Q220,302 236,295 L240,330 Q230,350 210,358 L170,364 L130,358 Q110,350 100,330 Z" fill={B} stroke={BD} strokeWidth="0.5"/>

        {/* === QUADS === */}
        {/* Left quad - outer */}
        <path d="M100,335 Q108,326 124,334 L138,342 L170,350 L166,460 Q158,485 150,500 L140,504 Q128,480 120,448 Q112,416 106,384 Z"
          fill={c('quads')} stroke={ss('quads')} strokeWidth={sw('quads')} style={ms('quads')} onClick={() => onMuscleClick('quads')}/>
        {/* Right quad - outer */}
        <path d="M240,335 Q232,326 216,334 L202,342 L170,350 L174,460 Q182,485 190,500 L200,504 Q212,480 220,448 Q228,416 234,384 Z"
          fill={c('quads')} stroke={ss('quads')} strokeWidth={sw('quads')} style={ms('quads')} onClick={() => onMuscleClick('quads')}/>
        {/* Inner quad detail line */}
        <line x1="170" y1="352" x2="170" y2="456" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" pointerEvents="none"/>

        {/* === KNEES (grey) === */}
        <ellipse cx="146" cy="518" rx="18" ry="20" fill={B} stroke={BD} strokeWidth="0.5"/>
        <ellipse cx="194" cy="518" rx="18" ry="20" fill={B} stroke={BD} strokeWidth="0.5"/>
        {/* Kneecap detail */}
        <ellipse cx="146" cy="516" rx="10" ry="12" fill={BL} stroke={BD} strokeWidth="0.3"/>
        <ellipse cx="194" cy="516" rx="10" ry="12" fill={BL} stroke={BD} strokeWidth="0.3"/>

        {/* === CALVES (front shin - tibialis, as body grey) === */}
        {/* Left lower leg */}
        <path d="M130,536 Q140,530 152,534 L156,540 L154,610 Q150,632 146,645 L138,648 Q130,625 128,595 Q126,565 130,536 Z" fill={BD} stroke={BD} strokeWidth="0.4"/>
        {/* Right lower leg */}
        <path d="M210,536 Q200,530 188,534 L184,540 L186,610 Q190,632 194,645 L202,648 Q210,625 212,595 Q214,565 210,536 Z" fill={BD} stroke={BD} strokeWidth="0.4"/>

        {/* === FEET === */}
        <path d="M126,646 Q130,656 128,666 L152,668 Q156,658 154,646 Z" fill={BL} stroke={BD} strokeWidth="0.4"/>
        <path d="M214,646 Q210,656 212,666 L188,668 Q184,658 186,646 Z" fill={BL} stroke={BD} strokeWidth="0.4"/>
      </svg>
    );
  }

  // ===== BACK VIEW =====
  return (
    <svg viewBox="0 0 340 680" className="w-full max-w-[280px] mx-auto select-none" xmlns="http://www.w3.org/2000/svg">
      {/* === HEAD === */}
      <path d="M170,8 Q148,8 140,22 Q132,36 134,52 Q136,68 144,76 Q152,84 170,86 Q188,84 196,76 Q204,68 206,52 Q208,36 200,22 Q192,8 170,8 Z" fill={B} stroke={BD} strokeWidth="0.8"/>
      
      {/* === NECK === */}
      <path d="M155,86 L155,106 Q162,110 170,111 Q178,110 185,106 L185,86 Q178,90 170,91 Q162,90 155,86 Z" fill={B} stroke={BD} strokeWidth="0.5"/>

      {/* === SHOULDERS (deltoids) === */}
      <path d="M122,108 Q108,106 98,114 Q88,124 84,138 Q82,150 84,162 L90,168 Q94,158 100,148 L106,138 L112,126 L122,118 Z"
        fill={c('shoulders')} stroke={ss('shoulders')} strokeWidth={sw('shoulders')} style={ms('shoulders')} onClick={() => onMuscleClick('shoulders')}/>
      <path d="M218,108 Q232,106 242,114 Q252,124 256,138 Q258,150 256,162 L250,168 Q246,158 240,148 L234,138 L228,126 L218,118 Z"
        fill={c('shoulders')} stroke={ss('shoulders')} strokeWidth={sw('shoulders')} style={ms('shoulders')} onClick={() => onMuscleClick('shoulders')}/>

      {/* === BACK (traps + lats + lower back) === */}
      {/* Upper back / traps */}
      <path d="M122,108 Q140,100 170,98 Q200,100 218,108 L218,118 Q200,112 185,115 L170,116 L155,115 Q140,112 122,118 Z" fill={c('back')} stroke={ss('back')} strokeWidth={sw('back')} style={ms('back')} onClick={() => onMuscleClick('back')}/>
      
      {/* Main back - lats */}
      <path d="M122,118 L112,126 Q104,140 102,160 L100,190 Q98,220 100,250 L104,280 Q108,295 118,305 Q132,314 155,318 L170,320 L185,318 Q208,314 222,305 Q232,295 236,280 L240,250 Q242,220 240,190 L238,160 Q236,140 228,126 L218,118 Q200,112 185,115 L170,116 L155,115 Q140,112 122,118 Z"
        fill={c('back')} stroke={ss('back')} strokeWidth={sw('back')} style={ms('back')} onClick={() => onMuscleClick('back')}/>
      
      {/* Spine line */}
      <line x1="170" y1="100" x2="170" y2="318" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" pointerEvents="none"/>
      {/* Shoulder blade outlines */}
      <path d="M128,140 Q138,160 142,180 Q146,195 150,205" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" fill="none" pointerEvents="none"/>
      <path d="M212,140 Q202,160 198,180 Q194,195 190,205" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" fill="none" pointerEvents="none"/>
      {/* Lower back line */}
      <path d="M140,270 Q155,278 170,280 Q185,278 200,270" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" fill="none" pointerEvents="none"/>

      {/* === TRICEPS === */}
      <path d="M84,164 Q80,178 76,198 Q74,218 76,238 Q78,252 82,260 L90,264 Q92,248 94,232 L96,212 L98,192 Q96,176 90,168 Z"
        fill={c('triceps')} stroke={ss('triceps')} strokeWidth={sw('triceps')} style={ms('triceps')} onClick={() => onMuscleClick('triceps')}/>
      <path d="M256,164 Q260,178 264,198 Q266,218 264,238 Q262,252 258,260 L250,264 Q248,248 246,232 L244,212 L242,192 Q244,176 250,168 Z"
        fill={c('triceps')} stroke={ss('triceps')} strokeWidth={sw('triceps')} style={ms('triceps')} onClick={() => onMuscleClick('triceps')}/>

      {/* Forearms */}
      <path d="M82,264 Q78,284 74,310 Q70,336 68,360 L64,380 L72,386 Q76,366 80,340 Q84,314 88,290 L90,268 Z" fill={BD} stroke={BD} strokeWidth="0.5"/>
      <path d="M258,264 Q262,284 266,310 Q270,336 272,360 L276,380 L268,386 Q264,366 260,340 Q256,314 252,290 L250,268 Z" fill={BD} stroke={BD} strokeWidth="0.5"/>
      {/* Hands */}
      <path d="M60,380 Q56,390 54,400 Q52,410 56,416 Q60,420 66,418 Q70,414 72,406 L76,390 L72,386 Z" fill={BL} stroke={BD} strokeWidth="0.5"/>
      <path d="M280,380 Q284,390 286,400 Q288,410 284,416 Q280,420 274,418 Q270,414 268,406 L264,390 L268,386 Z" fill={BL} stroke={BD} strokeWidth="0.5"/>

      {/* === GLUTES === */}
      <path d="M110,312 Q125,306 148,310 L168,316 L168,368 Q155,380 138,374 Q122,366 114,348 Q108,332 110,312 Z"
        fill={c('glutes')} stroke={ss('glutes')} strokeWidth={sw('glutes')} style={ms('glutes')} onClick={() => onMuscleClick('glutes')}/>
      <path d="M230,312 Q215,306 192,310 L172,316 L172,368 Q185,380 202,374 Q218,366 226,348 Q232,332 230,312 Z"
        fill={c('glutes')} stroke={ss('glutes')} strokeWidth={sw('glutes')} style={ms('glutes')} onClick={() => onMuscleClick('glutes')}/>

      {/* === HAMSTRINGS === */}
      <path d="M112,355 Q124,345 140,354 L162,365 L166,370 L162,476 Q154,500 148,512 L136,516 Q124,488 118,450 Q112,412 112,380 Z"
        fill={c('hamstrings')} stroke={ss('hamstrings')} strokeWidth={sw('hamstrings')} style={ms('hamstrings')} onClick={() => onMuscleClick('hamstrings')}/>
      <path d="M228,355 Q216,345 200,354 L178,365 L174,370 L178,476 Q186,500 192,512 L204,516 Q216,488 222,450 Q228,412 228,380 Z"
        fill={c('hamstrings')} stroke={ss('hamstrings')} strokeWidth={sw('hamstrings')} style={ms('hamstrings')} onClick={() => onMuscleClick('hamstrings')}/>
      {/* Inner hamstring line */}
      <line x1="170" y1="370" x2="170" y2="472" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" pointerEvents="none"/>

      {/* Knees */}
      <ellipse cx="146" cy="526" rx="18" ry="20" fill={B} stroke={BD} strokeWidth="0.5"/>
      <ellipse cx="194" cy="526" rx="18" ry="20" fill={B} stroke={BD} strokeWidth="0.5"/>

      {/* === CALVES === */}
      <path d="M128,544 Q140,536 154,542 L156,548 L154,620 Q150,642 146,656 L134,660 Q126,635 124,600 Q122,570 128,544 Z"
        fill={c('calves')} stroke={ss('calves')} strokeWidth={sw('calves')} style={ms('calves')} onClick={() => onMuscleClick('calves')}/>
      <path d="M212,544 Q200,536 186,542 L184,548 L186,620 Q190,642 194,656 L206,660 Q214,635 216,600 Q218,570 212,544 Z"
        fill={c('calves')} stroke={ss('calves')} strokeWidth={sw('calves')} style={ms('calves')} onClick={() => onMuscleClick('calves')}/>

      {/* Feet */}
      <path d="M126,658 Q130,668 128,676 L152,678 Q156,668 154,656 Z" fill={BL} stroke={BD} strokeWidth="0.4"/>
      <path d="M214,658 Q210,668 212,676 L188,678 Q184,668 186,656 Z" fill={BL} stroke={BD} strokeWidth="0.4"/>
    </svg>
  );
};

export default BodyHeatmapSVG;
