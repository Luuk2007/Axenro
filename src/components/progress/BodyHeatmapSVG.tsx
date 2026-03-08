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

  const muscleStyle = (m: HeatmapMuscle): React.CSSProperties => ({
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    filter: sel(m) ? 'brightness(1.2) drop-shadow(0 0 6px rgba(255,255,255,0.4))' : undefined,
  });

  const stroke = (m: HeatmapMuscle) => sel(m) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)';
  const sw = (m: HeatmapMuscle) => sel(m) ? 2 : 1;

  // Base body color
  const BASE = '#c8c8c8';
  const BASE_DARK = '#b8b8b8';
  const BASE_LIGHT = '#d4d4d4';

  const click = (m: HeatmapMuscle) => () => onMuscleClick(m);

  if (view === 'front') {
    return (
      <svg viewBox="0 0 400 820" className="w-full max-w-[300px] mx-auto select-none" xmlns="http://www.w3.org/2000/svg">
        {/* ========== BASE SILHOUETTE ========== */}
        {/* Head */}
        <ellipse cx="200" cy="52" rx="34" ry="42" fill={BASE} stroke={BASE_DARK} strokeWidth="0.5" />
        {/* Ears */}
        <ellipse cx="164" cy="52" rx="5" ry="10" fill={BASE_DARK} />
        <ellipse cx="236" cy="52" rx="5" ry="10" fill={BASE_DARK} />

        {/* Neck */}
        <rect x="183" y="92" width="34" height="28" rx="4" fill={BASE} />

        {/* Torso base (covers everything behind muscles) */}
        <path d={`
          M115,155 Q115,130 140,120 L183,115 L200,113 L217,115 L260,120 Q285,130 285,155
          L285,210 Q282,260 275,300 L268,340 Q260,365 250,378 L200,390 L150,378
          Q140,365 132,340 L125,300 Q118,260 115,210 Z
        `} fill={BASE} />

        {/* Left arm base */}
        <path d={`
          M82,180 Q65,175 58,195 L48,250 Q42,290 44,320 L48,360 Q52,390 58,420
          L62,440 Q55,460 52,470 L48,478 Q46,485 50,488 L62,486 L68,478
          L72,460 L76,440 Q82,400 86,360 L90,310 Q94,270 92,230 L88,200 Z
        `} fill={BASE} />
        {/* Right arm base */}
        <path d={`
          M318,180 Q335,175 342,195 L352,250 Q358,290 356,320 L352,360 Q348,390 342,420
          L338,440 Q345,460 348,470 L352,478 Q354,485 350,488 L338,486 L332,478
          L328,460 L324,440 Q318,400 314,360 L310,310 Q306,270 308,230 L312,200 Z
        `} fill={BASE} />

        {/* Left leg base */}
        <path d={`
          M140,375 L125,420 Q115,470 112,520 L115,560 Q118,590 125,620
          L130,660 Q134,695 138,720 L135,750 Q132,765 130,775 L138,780
          L165,778 L168,770 L164,750 L158,720 Q152,695 148,660
          L145,610 Q142,560 145,520 L150,470 Q155,430 162,400 L175,380 Z
        `} fill={BASE} />
        {/* Right leg base */}
        <path d={`
          M260,375 L275,420 Q285,470 288,520 L285,560 Q282,590 275,620
          L270,660 Q266,695 262,720 L265,750 Q268,765 270,775 L262,780
          L235,778 L232,770 L236,750 L242,720 Q248,695 252,660
          L255,610 Q258,560 255,520 L250,470 Q245,430 238,400 L225,380 Z
        `} fill={BASE} />

        {/* ========== MUSCLE OVERLAYS ========== */}

        {/* SHOULDERS - Left deltoid */}
        <path d={`
          M140,120 Q120,118 100,128 Q78,142 72,168 L80,182
          Q86,170 94,160 L108,148 L118,140 L130,132 Z
        `}
          fill={c('shoulders')} stroke={stroke('shoulders')} strokeWidth={sw('shoulders')}
          style={muscleStyle('shoulders')} onClick={click('shoulders')} />
        {/* SHOULDERS - Right deltoid */}
        <path d={`
          M260,120 Q280,118 300,128 Q322,142 328,168 L320,182
          Q314,170 306,160 L292,148 L282,140 L270,132 Z
        `}
          fill={c('shoulders')} stroke={stroke('shoulders')} strokeWidth={sw('shoulders')}
          style={muscleStyle('shoulders')} onClick={click('shoulders')} />

        {/* CHEST - Left pec */}
        <path d={`
          M130,140 L118,148 Q108,160 104,172 L106,185 Q112,200 125,210
          Q140,218 158,216 L195,210 L195,148 L175,142 Q155,136 130,140 Z
        `}
          fill={c('chest')} stroke={stroke('chest')} strokeWidth={sw('chest')}
          style={muscleStyle('chest')} onClick={click('chest')} />
        {/* CHEST - Right pec */}
        <path d={`
          M270,140 L282,148 Q292,160 296,172 L294,185 Q288,200 275,210
          Q260,218 242,216 L205,210 L205,148 L225,142 Q245,136 270,140 Z
        `}
          fill={c('chest')} stroke={stroke('chest')} strokeWidth={sw('chest')}
          style={muscleStyle('chest')} onClick={click('chest')} />

        {/* BICEPS - Left */}
        <path d={`
          M80,185 Q74,200 68,225 Q62,255 60,280 Q58,300 62,315
          L70,320 Q74,300 78,275 L82,250 Q86,225 88,205 L86,190 Z
        `}
          fill={c('biceps')} stroke={stroke('biceps')} strokeWidth={sw('biceps')}
          style={muscleStyle('biceps')} onClick={click('biceps')} />
        {/* BICEPS - Right */}
        <path d={`
          M320,185 Q326,200 332,225 Q338,255 340,280 Q342,300 338,315
          L330,320 Q326,300 322,275 L318,250 Q314,225 312,205 L314,190 Z
        `}
          fill={c('biceps')} stroke={stroke('biceps')} strokeWidth={sw('biceps')}
          style={muscleStyle('biceps')} onClick={click('biceps')} />

        {/* ABS - Full abdominal area */}
        <path d={`
          M148,216 Q165,210 200,208 Q235,210 252,216
          L255,260 Q256,300 252,330 L245,355 Q230,372 200,378
          Q170,372 155,355 L148,330 Q144,300 145,260 Z
        `}
          fill={c('abs')} stroke={stroke('abs')} strokeWidth={sw('abs')}
          style={muscleStyle('abs')} onClick={click('abs')} />
        {/* Abs internal lines - 6-pack grid */}
        <line x1="200" y1="216" x2="200" y2="370" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" pointerEvents="none" />
        <line x1="155" y1="248" x2="245" y2="248" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" pointerEvents="none" />
        <line x1="153" y1="280" x2="247" y2="280" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" pointerEvents="none" />
        <line x1="152" y1="312" x2="248" y2="312" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" pointerEvents="none" />
        <line x1="155" y1="342" x2="245" y2="342" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" pointerEvents="none" />

        {/* QUADS - Left */}
        <path d={`
          M150,378 L140,395 Q128,430 122,470 Q118,510 120,540
          L128,548 Q138,555 150,550 L162,540 Q166,510 165,470
          Q162,430 158,400 L165,385 Q175,378 190,382 L200,386
          L200,550 Q192,555 182,555 L170,548 Q160,558 150,555
          L138,555 Q125,558 120,548
          L115,520 Q112,490 115,460 L122,420 Q130,395 140,378 Z
        `}
          fill={c('quads')} stroke={stroke('quads')} strokeWidth={sw('quads')}
          style={muscleStyle('quads')} onClick={click('quads')} />
        {/* QUADS - Right */}
        <path d={`
          M250,378 L260,395 Q272,430 278,470 Q282,510 280,540
          L272,548 Q262,555 250,550 L238,540 Q234,510 235,470
          Q238,430 242,400 L235,385 Q225,378 210,382 L200,386
          L200,550 Q208,555 218,555 L230,548 Q240,558 250,555
          L262,555 Q275,558 280,548
          L285,520 Q288,490 285,460 L278,420 Q270,395 260,378 Z
        `}
          fill={c('quads')} stroke={stroke('quads')} strokeWidth={sw('quads')}
          style={muscleStyle('quads')} onClick={click('quads')} />
        {/* Quad separation line */}
        <line x1="200" y1="386" x2="200" y2="548" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" pointerEvents="none" />

        {/* CALVES - displayed as shin area on front (grey base visible, no muscle overlay) */}
        {/* Front view calves are not prominently visible - the base leg shows through */}

        {/* Kneecaps */}
        <ellipse cx="155" cy="562" rx="16" ry="14" fill={BASE_LIGHT} stroke={BASE_DARK} strokeWidth="0.5" />
        <ellipse cx="245" cy="562" rx="16" ry="14" fill={BASE_LIGHT} stroke={BASE_DARK} strokeWidth="0.5" />
      </svg>
    );
  }

  // =================== BACK VIEW ===================
  return (
    <svg viewBox="0 0 400 820" className="w-full max-w-[300px] mx-auto select-none" xmlns="http://www.w3.org/2000/svg">
      {/* ========== BASE SILHOUETTE ========== */}
      {/* Head */}
      <ellipse cx="200" cy="52" rx="34" ry="42" fill={BASE} stroke={BASE_DARK} strokeWidth="0.5" />
      <ellipse cx="164" cy="52" rx="5" ry="10" fill={BASE_DARK} />
      <ellipse cx="236" cy="52" rx="5" ry="10" fill={BASE_DARK} />

      {/* Neck */}
      <rect x="183" y="92" width="34" height="28" rx="4" fill={BASE} />

      {/* Torso base */}
      <path d={`
        M115,155 Q115,130 140,120 L183,115 L200,113 L217,115 L260,120 Q285,130 285,155
        L285,210 Q282,260 275,300 L268,340 Q260,365 250,378 L200,390 L150,378
        Q140,365 132,340 L125,300 Q118,260 115,210 Z
      `} fill={BASE} />

      {/* Left arm base */}
      <path d={`
        M82,180 Q65,175 58,195 L48,250 Q42,290 44,320 L48,360 Q52,390 58,420
        L62,440 Q55,460 52,470 L48,478 Q46,485 50,488 L62,486 L68,478
        L72,460 L76,440 Q82,400 86,360 L90,310 Q94,270 92,230 L88,200 Z
      `} fill={BASE} />
      {/* Right arm base */}
      <path d={`
        M318,180 Q335,175 342,195 L352,250 Q358,290 356,320 L352,360 Q348,390 342,420
        L338,440 Q345,460 348,470 L352,478 Q354,485 350,488 L338,486 L332,478
        L328,460 L324,440 Q318,400 314,360 L310,310 Q306,270 308,230 L312,200 Z
      `} fill={BASE} />

      {/* Left leg base */}
      <path d={`
        M140,375 L125,420 Q115,470 112,520 L115,560 Q118,590 125,620
        L130,660 Q134,695 138,720 L135,750 Q132,765 130,775 L138,780
        L165,778 L168,770 L164,750 L158,720 Q152,695 148,660
        L145,610 Q142,560 145,520 L150,470 Q155,430 162,400 L175,380 Z
      `} fill={BASE} />
      {/* Right leg base */}
      <path d={`
        M260,375 L275,420 Q285,470 288,520 L285,560 Q282,590 275,620
        L270,660 Q266,695 262,720 L265,750 Q268,765 270,775 L262,780
        L235,778 L232,770 L236,750 L242,720 Q248,695 252,660
        L255,610 Q258,560 255,520 L250,470 Q245,430 238,400 L225,380 Z
      `} fill={BASE} />

      {/* ========== MUSCLE OVERLAYS ========== */}

      {/* SHOULDERS - Left deltoid */}
      <path d={`
        M140,120 Q120,118 100,128 Q78,142 72,168 L80,182
        Q86,170 94,160 L108,148 L118,140 L130,132 Z
      `}
        fill={c('shoulders')} stroke={stroke('shoulders')} strokeWidth={sw('shoulders')}
        style={muscleStyle('shoulders')} onClick={click('shoulders')} />
      {/* SHOULDERS - Right deltoid */}
      <path d={`
        M260,120 Q280,118 300,128 Q322,142 328,168 L320,182
        Q314,170 306,160 L292,148 L282,140 L270,132 Z
      `}
        fill={c('shoulders')} stroke={stroke('shoulders')} strokeWidth={sw('shoulders')}
        style={muscleStyle('shoulders')} onClick={click('shoulders')} />

      {/* BACK - Full back (traps + lats + lower back) */}
      <path d={`
        M130,132 L118,140 Q108,150 104,165 L100,190 Q98,225 100,260
        L105,300 Q110,330 120,350 Q135,368 160,376 L200,382
        L240,376 Q265,368 280,350 Q290,330 295,300 L300,260
        Q302,225 300,190 L296,165 Q292,150 282,140 L270,132
        L255,128 Q230,122 200,120 Q170,122 145,128 Z
      `}
        fill={c('back')} stroke={stroke('back')} strokeWidth={sw('back')}
        style={muscleStyle('back')} onClick={click('back')} />
      {/* Spine */}
      <line x1="200" y1="120" x2="200" y2="378" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" pointerEvents="none" />
      {/* Shoulder blades */}
      <path d="M145,165 Q158,190 162,215 Q165,235 168,250" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" pointerEvents="none" />
      <path d="M255,165 Q242,190 238,215 Q235,235 232,250" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" pointerEvents="none" />
      {/* Lower back curve */}
      <path d="M155,310 Q175,325 200,328 Q225,325 245,310" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" fill="none" pointerEvents="none" />

      {/* TRICEPS - Left */}
      <path d={`
        M80,185 Q74,200 68,225 Q62,255 60,280 Q58,300 62,315
        L70,320 Q74,300 78,275 L82,250 Q86,225 88,205 L86,190 Z
      `}
        fill={c('triceps')} stroke={stroke('triceps')} strokeWidth={sw('triceps')}
        style={muscleStyle('triceps')} onClick={click('triceps')} />
      {/* TRICEPS - Right */}
      <path d={`
        M320,185 Q326,200 332,225 Q338,255 340,280 Q342,300 338,315
        L330,320 Q326,300 322,275 L318,250 Q314,225 312,205 L314,190 Z
      `}
        fill={c('triceps')} stroke={stroke('triceps')} strokeWidth={sw('triceps')}
        style={muscleStyle('triceps')} onClick={click('triceps')} />

      {/* GLUTES - Left */}
      <path d={`
        M155,370 Q140,368 130,378 Q120,392 122,410 Q126,428 138,435
        Q152,440 168,435 L195,420 L195,385 L175,378 Z
      `}
        fill={c('glutes')} stroke={stroke('glutes')} strokeWidth={sw('glutes')}
        style={muscleStyle('glutes')} onClick={click('glutes')} />
      {/* GLUTES - Right */}
      <path d={`
        M245,370 Q260,368 270,378 Q280,392 278,410 Q274,428 262,435
        Q248,440 232,435 L205,420 L205,385 L225,378 Z
      `}
        fill={c('glutes')} stroke={stroke('glutes')} strokeWidth={sw('glutes')}
        style={muscleStyle('glutes')} onClick={click('glutes')} />
      {/* Glute separation */}
      <line x1="200" y1="380" x2="200" y2="438" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" pointerEvents="none" />

      {/* HAMSTRINGS - Left */}
      <path d={`
        M125,420 Q130,435 138,442 L168,438 L185,445 L195,450
        L195,555 L175,560 Q160,558 148,552
        L135,540 Q125,520 120,495 Q115,465 120,438 Z
      `}
        fill={c('hamstrings')} stroke={stroke('hamstrings')} strokeWidth={sw('hamstrings')}
        style={muscleStyle('hamstrings')} onClick={click('hamstrings')} />
      {/* HAMSTRINGS - Right */}
      <path d={`
        M275,420 Q270,435 262,442 L232,438 L215,445 L205,450
        L205,555 L225,560 Q240,558 252,552
        L265,540 Q275,520 280,495 Q285,465 280,438 Z
      `}
        fill={c('hamstrings')} stroke={stroke('hamstrings')} strokeWidth={sw('hamstrings')}
        style={muscleStyle('hamstrings')} onClick={click('hamstrings')} />
      {/* Hamstring separation */}
      <line x1="200" y1="450" x2="200" y2="555" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" pointerEvents="none" />

      {/* Kneecaps (back of knee) */}
      <ellipse cx="155" cy="562" rx="16" ry="12" fill={BASE_DARK} stroke={BASE_DARK} strokeWidth="0.3" />
      <ellipse cx="245" cy="562" rx="16" ry="12" fill={BASE_DARK} stroke={BASE_DARK} strokeWidth="0.3" />

      {/* CALVES - Left */}
      <path d={`
        M125,575 Q135,568 150,572 L162,578 L165,585
        L162,650 Q158,685 154,710 L148,720 L135,718
        Q128,690 125,650 Q122,615 125,575 Z
      `}
        fill={c('calves')} stroke={stroke('calves')} strokeWidth={sw('calves')}
        style={muscleStyle('calves')} onClick={click('calves')} />
      {/* CALVES - Right */}
      <path d={`
        M275,575 Q265,568 250,572 L238,578 L235,585
        L238,650 Q242,685 246,710 L252,720 L265,718
        Q272,690 275,650 Q278,615 275,575 Z
      `}
        fill={c('calves')} stroke={stroke('calves')} strokeWidth={sw('calves')}
        style={muscleStyle('calves')} onClick={click('calves')} />
    </svg>
  );
};

export default BodyHeatmapSVG;
