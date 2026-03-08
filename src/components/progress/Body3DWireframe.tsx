import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { HeatmapMuscle, getVolumeColor } from '@/utils/muscleMapping';

interface Body3DWireframeProps {
  muscleVolumes: Record<HeatmapMuscle, number>;
  onMuscleClick: (muscle: HeatmapMuscle) => void;
  selectedMuscle: HeatmapMuscle | null;
}

// Parse CSS variable color to THREE.Color
function volumeToColor(sets: number): THREE.Color {
  if (sets === 0) return new THREE.Color(0.35, 0.35, 0.4);
  if (sets <= 3) return new THREE.Color(0.9, 0.25, 0.25);
  if (sets <= 8) return new THREE.Color(0.95, 0.75, 0.15);
  return new THREE.Color(0.2, 0.85, 0.4);
}

function volumeToEmissive(sets: number): number {
  if (sets === 0) return 0;
  if (sets <= 3) return 0.3;
  if (sets <= 8) return 0.4;
  return 0.6;
}

interface MusclePartProps {
  muscle: HeatmapMuscle;
  position: [number, number, number];
  scale: [number, number, number];
  geometry: 'box' | 'sphere' | 'cylinder';
  rotation?: [number, number, number];
  volumes: Record<HeatmapMuscle, number>;
  selected: HeatmapMuscle | null;
  onClick: (m: HeatmapMuscle) => void;
}

function MusclePart({ muscle, position, scale, geometry, rotation, volumes, selected, onClick }: MusclePartProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const sets = volumes[muscle] || 0;
  const color = useMemo(() => volumeToColor(sets), [sets]);
  const emissiveIntensity = volumeToEmissive(sets);
  const isSelected = selected === muscle;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetOpacity = isSelected || hovered ? 0.85 : sets > 0 ? 0.6 : 0.25;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 5);
  });

  const geo = useMemo(() => {
    switch (geometry) {
      case 'sphere': return <sphereGeometry args={[0.5, 16, 16]} />;
      case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 12]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [geometry]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={rotation ? rotation.map(r => r * Math.PI / 180) as [number, number, number] : undefined}
      onClick={(e) => { e.stopPropagation(); onClick(muscle); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {geo}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.4}
        wireframe={sets === 0}
        emissive={color}
        emissiveIntensity={isSelected ? emissiveIntensity + 0.3 : emissiveIntensity}
        roughness={0.3}
        metalness={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Wireframe outline for the body
function BodyOutline() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    }
  });

  return (
    <group ref={ref}>
      {/* Head */}
      <mesh position={[0, 3.6, 0]} scale={[0.55, 0.65, 0.55]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color="#555566" transparent opacity={0.15} wireframe />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 3.15, 0]} scale={[0.2, 0.25, 0.2]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
        <meshStandardMaterial color="#555566" transparent opacity={0.12} wireframe />
      </mesh>
    </group>
  );
}

function HumanBody({ volumes, selected, onClick }: { volumes: Record<HeatmapMuscle, number>; selected: HeatmapMuscle | null; onClick: (m: HeatmapMuscle) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    }
  });

  const mp = (muscle: HeatmapMuscle, pos: [number, number, number], scale: [number, number, number], geo: 'box' | 'sphere' | 'cylinder', rot?: [number, number, number]) => (
    <MusclePart
      key={`${muscle}-${pos.join(',')}`}
      muscle={muscle}
      position={pos}
      scale={scale}
      geometry={geo}
      rotation={rot}
      volumes={volumes}
      selected={selected}
      onClick={onClick}
    />
  );

  return (
    <group ref={groupRef} position={[0, -1.2, 0]}>
      {/* HEAD & NECK (non-interactive) */}
      <mesh position={[0, 3.6, 0]} scale={[0.55, 0.65, 0.55]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color="#555566" transparent opacity={0.15} wireframe />
      </mesh>
      <mesh position={[0, 3.15, 0]} scale={[0.2, 0.25, 0.2]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
        <meshStandardMaterial color="#555566" transparent opacity={0.12} wireframe />
      </mesh>

      {/* SHOULDERS */}
      {mp('shoulders', [-0.85, 2.8, 0], [0.45, 0.35, 0.4], 'sphere')}
      {mp('shoulders', [0.85, 2.8, 0], [0.45, 0.35, 0.4], 'sphere')}

      {/* CHEST */}
      {mp('chest', [-0.3, 2.5, 0.08], [0.55, 0.45, 0.35], 'sphere')}
      {mp('chest', [0.3, 2.5, 0.08], [0.55, 0.45, 0.35], 'sphere')}

      {/* BACK */}
      {mp('back', [0, 2.4, -0.12], [1.1, 0.8, 0.3], 'box')}

      {/* ABS */}
      {mp('abs', [0, 1.85, 0.08], [0.65, 0.7, 0.25], 'box')}

      {/* BICEPS */}
      {mp('biceps', [-1.1, 2.25, 0.05], [0.28, 0.55, 0.28], 'cylinder')}
      {mp('biceps', [1.1, 2.25, 0.05], [0.28, 0.55, 0.28], 'cylinder')}

      {/* TRICEPS */}
      {mp('triceps', [-1.1, 2.25, -0.08], [0.24, 0.5, 0.24], 'cylinder')}
      {mp('triceps', [1.1, 2.25, -0.08], [0.24, 0.5, 0.24], 'cylinder')}

      {/* Forearms (non-interactive) */}
      <mesh position={[-1.15, 1.55, 0]} scale={[0.18, 0.5, 0.18]}>
        <cylinderGeometry args={[0.5, 0.4, 1, 8]} />
        <meshStandardMaterial color="#555566" transparent opacity={0.12} wireframe />
      </mesh>
      <mesh position={[1.15, 1.55, 0]} scale={[0.18, 0.5, 0.18]}>
        <cylinderGeometry args={[0.5, 0.4, 1, 8]} />
        <meshStandardMaterial color="#555566" transparent opacity={0.12} wireframe />
      </mesh>

      {/* GLUTES */}
      {mp('glutes', [-0.25, 1.3, -0.1], [0.38, 0.35, 0.32], 'sphere')}
      {mp('glutes', [0.25, 1.3, -0.1], [0.38, 0.35, 0.32], 'sphere')}

      {/* QUADS */}
      {mp('quads', [-0.35, 0.75, 0.04], [0.35, 0.7, 0.32], 'cylinder')}
      {mp('quads', [0.35, 0.75, 0.04], [0.35, 0.7, 0.32], 'cylinder')}

      {/* HAMSTRINGS */}
      {mp('hamstrings', [-0.35, 0.75, -0.06], [0.3, 0.65, 0.28], 'cylinder')}
      {mp('hamstrings', [0.35, 0.75, -0.06], [0.3, 0.65, 0.28], 'cylinder')}

      {/* CALVES */}
      {mp('calves', [-0.32, -0.1, 0], [0.2, 0.55, 0.22], 'cylinder')}
      {mp('calves', [0.32, -0.1, 0], [0.2, 0.55, 0.22], 'cylinder')}

      {/* Feet (non-interactive) */}
      <mesh position={[-0.32, -0.55, 0.05]} scale={[0.18, 0.08, 0.28]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#555566" transparent opacity={0.1} wireframe />
      </mesh>
      <mesh position={[0.32, -0.55, 0.05]} scale={[0.18, 0.08, 0.28]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#555566" transparent opacity={0.1} wireframe />
      </mesh>
    </group>
  );
}

function Scene({ volumes, selected, onClick }: { volumes: Record<HeatmapMuscle, number>; selected: HeatmapMuscle | null; onClick: (m: HeatmapMuscle) => void }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#8888ff" />
      <pointLight position={[-5, 3, -5]} intensity={0.4} color="#ff8866" />
      <pointLight position={[0, -3, 5]} intensity={0.3} color="#66ffaa" />
      
      <HumanBody volumes={volumes} selected={selected} onClick={onClick} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI * 3 / 4}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      {/* Grid floor */}
      <gridHelper args={[8, 16, '#333344', '#222233']} position={[0, -2.8, 0]} />
    </>
  );
}

const Body3DWireframe: React.FC<Body3DWireframeProps> = ({ muscleVolumes, onMuscleClick, selectedMuscle }) => {
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80 backdrop-blur-sm z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(100,100,255,0.08)_0%,_transparent_70%)]" />
      
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 45 }}
        style={{ position: 'relative', zIndex: 1 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene volumes={muscleVolumes} selected={selectedMuscle} onClick={onMuscleClick} />
      </Canvas>

      {/* Scanline overlay effect */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />
    </div>
  );
};

export default Body3DWireframe;
