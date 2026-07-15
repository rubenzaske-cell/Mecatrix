"use client";

import * as React from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { EngineModel, EngineComponent } from "@/data/catalog";
import type { BoltDef, BoltState, CompState } from "@/lib/mecatrix/workshop-data";

export interface EngineAssemblyProps {
  engine: EngineModel;
  bolts: BoltDef[];
  boltStates: Record<string, BoltState>;
  componentStates: Record<string, CompState>;
  hiddenComponents: string[];
  exploded: number;
  transparent: boolean;
  animate: boolean;
  highlightBolts: string[];
  highlightComponents: string[];
  targetBoltId: string | null;
  targetComponentId: string | null;
  onBoltClick: (id: string) => void;
  onComponentClick: (id: string) => void;
}

export function EngineAssembly(props: EngineAssemblyProps) {
  const group = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    if (props.animate) {
      group.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <group ref={group} dispose={null}>
      {props.engine.components.map((c) => {
        const compState = props.componentStates[c.id] ?? "installed";
        const hidden = props.hiddenComponents.includes(c.id);
        if (hidden || compState === "removed") return null;
        const compBolts = props.bolts.filter((b) => b.componentId === c.id);
        return (
          <ComponentGroup
            key={c.id}
            comp={c}
            compState={compState}
            exploded={props.exploded}
            transparent={props.transparent}
            highlighted={props.highlightComponents.includes(c.id)}
            targeted={props.targetComponentId === c.id}
            bolts={compBolts}
            boltStates={props.boltStates}
            highlightBolts={props.highlightBolts}
            targetBoltId={props.targetBoltId}
            onBoltClick={props.onBoltClick}
            onComponentClick={props.onComponentClick}
          />
        );
      })}
      <Html position={[0, -2.0, 0]} center distanceFactor={10}>
        <div className="select-none pointer-events-none px-3 py-1 rounded-full bg-background/80 backdrop-blur border border-border/60 text-[10px] font-semibold tracking-wider uppercase text-amber whitespace-nowrap">
          {props.engine.name}
        </div>
      </Html>
    </group>
  );
}

function ComponentGroup({
  comp, compState, exploded, transparent, highlighted, targeted,
  bolts, boltStates, highlightBolts, targetBoltId, onBoltClick, onComponentClick,
}: {
  comp: EngineComponent;
  compState: CompState;
  exploded: number;
  transparent: boolean;
  highlighted: boolean;
  targeted: boolean;
  bolts: BoltDef[];
  boltStates: Record<string, BoltState>;
  highlightBolts: string[];
  targetBoltId: string | null;
  onBoltClick: (id: string) => void;
  onComponentClick: (id: string) => void;
}) {
  const ref = React.useRef<THREE.Group>(null);
  const startRef = React.useRef<number | null>(null);
  const basePos = React.useMemo(() => new THREE.Vector3(...comp.pos), [comp.pos]);
  const dir = React.useMemo(() => {
    const v = basePos.clone().normalize().multiplyScalar(0.001);
    v.y += basePos.y * 0.5;
    return v;
  }, [basePos]);

  useFrame((state) => {
    if (!ref.current) return;
    // Exploded offset
    const target = basePos.clone().add(dir.clone().multiplyScalar(exploded * 1.8));
    // Removing animation: lift up + fade
    if (compState === "removing") {
      if (startRef.current === null) startRef.current = state.clock.elapsedTime;
      const t = Math.min(1, (state.clock.elapsedTime - startRef.current) / 1.1);
      target.y += t * 2.2;
      ref.current.position.lerp(target, 0.4);
      ref.current.scale.setScalar(1 - t * 0.15);
    } else {
      startRef.current = null;
      ref.current.position.lerp(target, 0.15);
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
    }
  });

  const geometry = React.useMemo(() => {
    const [w, h, d] = comp.scale;
    switch (comp.shape) {
      case "cyl": return <cylinderGeometry args={[w / 2, w / 2, h, 32]} />;
      case "sphere": return <sphereGeometry args={[w / 2, 32, 32]} />;
      case "torus": return <torusGeometry args={[w / 2, 0.12, 16, 48]} />;
      case "cone": return <coneGeometry args={[w / 2, h, 32]} />;
      case "panel": return <boxGeometry args={[w, h, d]} />;
      default: return <boxGeometry args={[w, h, d]} />;
    }
  }, [comp.shape, comp.scale]);

  const opacity = transparent ? (highlighted || targeted ? 0.9 : 0.4) : 1;

  return (
    <group ref={ref} position={comp.pos}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onComponentClick(comp.id); }}
        onPointerOver={(e) => { e.stopPropagation(); if (highlighted) document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
        castShadow
      >
        {geometry}
        <meshStandardMaterial
          color={comp.color}
          metalness={0.6}
          roughness={0.35}
          transparent={transparent || highlighted || targeted}
          opacity={opacity}
          emissive={highlighted ? "#e07a2f" : targeted ? "#4aa876" : "#000000"}
          emissiveIntensity={highlighted ? 0.28 : targeted ? 0.35 : 0}
        />
      </mesh>

      {/* Target ring under component */}
      {targeted && (
        <mesh position={[0, -comp.scale[1] / 2 - 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.66, 48]} />
          <meshBasicMaterial color="#4aa876" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Bolts */}
      {bolts.map((bolt) => (
        <BoltMeshLocal
          key={bolt.id}
          bolt={bolt}
          localPos={localBoltPos(bolt, comp)}
          state={boltStates[bolt.id] ?? "tight"}
          highlighted={highlightBolts.includes(bolt.id)}
          targeted={targetBoltId === bolt.id}
          onClick={() => onBoltClick(bolt.id)}
        />
      ))}
    </group>
  );
}

// Bolt rendered with explicit local position relative to its parent component.
function BoltMeshLocal({
  bolt, localPos, state, highlighted, targeted, onClick,
}: {
  bolt: BoltDef;
  localPos: [number, number, number];
  state: BoltState;
  highlighted: boolean;
  targeted: boolean;
  onClick: () => void;
}) {
  const spinRef = React.useRef<THREE.Group>(null);
  const startRef = React.useRef<number | null>(null);

  useFrame((s) => {
    if (state === "loosening" && spinRef.current) {
      if (startRef.current === null) startRef.current = s.clock.elapsedTime;
      const t = Math.min(1, (s.clock.elapsedTime - startRef.current) / 1.3);
      spinRef.current.rotation.y = -t * Math.PI * 2.5;
      spinRef.current.position.y = t * 0.7;
      const mesh = spinRef.current.children[0] as THREE.Mesh | undefined;
      const mat = mesh?.material as THREE.MeshStandardMaterial | undefined;
      if (mat) { mat.transparent = true; mat.opacity = Math.max(0, 1 - t); }
    } else if (state === "tight") {
      startRef.current = null;
      if (spinRef.current) {
        spinRef.current.rotation.y *= 0.8;
        spinRef.current.position.y *= 0.8;
      }
    }
  });

  if (state === "removed") return null;

  const headColor = bolt.type === "torx" ? "#9aa3b3" : bolt.type === "allen" ? "#8a93a3" : "#c89045";
  const glow = highlighted || targeted;

  return (
    <group position={localPos}>
      <group ref={spinRef}>
        <mesh
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}
          onPointerOver={(e) => { e.stopPropagation(); if (glow) document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
          castShadow
        >
          <cylinderGeometry args={[0.11, 0.11, 0.1, 6]} />
          <meshStandardMaterial
            color={headColor}
            metalness={0.85}
            roughness={0.25}
            emissive={targeted ? "#4aa876" : highlighted ? "#e07a2f" : "#000000"}
            emissiveIntensity={targeted ? 0.6 : highlighted ? 0.5 : 0}
            transparent
            opacity={1}
          />
        </mesh>
        {/* Bolt shaft */}
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
          <meshStandardMaterial color="#6a727f" metalness={0.9} roughness={0.2} transparent opacity={1} />
        </mesh>
      </group>
      {/* Target pulse ring */}
      {targeted && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.24, 32]} />
          <meshBasicMaterial color="#4aa876" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// Helper to compute local bolt position relative to its parent component.
export function localBoltPos(bolt: BoltDef, comp: EngineComponent): [number, number, number] {
  return [
    bolt.pos[0] - comp.pos[0],
    bolt.pos[1] - comp.pos[1],
    bolt.pos[2] - comp.pos[2],
  ];
}
