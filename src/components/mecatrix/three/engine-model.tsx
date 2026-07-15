"use client";

import * as React from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { EngineModel, EngineComponent, Status } from "@/data/catalog";

interface Props {
  engine: EngineModel;
  exploded: number;        // 0..1
  transparent: boolean;
  animate: boolean;
  selectedId: string | null;
  diagnosticMode: boolean;
  diagnosticMap: Record<string, Status>;
  onSelect: (id: string | null) => void;
}

const STATUS_COLOR: Record<Status, string> = {
  ok: "#3ee08a",
  warn: "#ffc23d",
  crit: "#ff5a4a",
};

function ComponentMesh({
  comp, exploded, transparent, animate, selected, status, onSelect,
}: {
  comp: EngineComponent;
  exploded: number;
  transparent: boolean;
  animate: boolean;
  selected: boolean;
  status: Status | null;
  onSelect: (id: string | null) => void;
}) {
  const ref = React.useRef<THREE.Mesh>(null);
  const basePos = React.useMemo(() => new THREE.Vector3(...comp.pos), [comp.pos]);
  const dir = React.useMemo(() => basePos.clone().normalize().multiplyScalar(0.001).add(new THREE.Vector3(0, basePos.y * 0.4, 0)), [basePos]);

  useFrame((state) => {
    if (!ref.current) return;
    // Exploded offset
    const target = basePos.clone().add(dir.multiplyScalar(exploded * 1.8));
    ref.current.position.lerp(target, 0.15);
    // Selected hover float
    if (selected && animate) {
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.012;
    }
  });

  const color = status ? STATUS_COLOR[status] : comp.color;
  const opacity = transparent ? (selected ? 0.95 : 0.42) : 1;

  const geometry = React.useMemo(() => {
    const [w, h, d] = comp.scale;
    switch (comp.shape) {
      case "cyl":
        return <cylinderGeometry args={[w / 2, w / 2, h, 32]} />;
      case "sphere":
        return <sphereGeometry args={[w / 2, 32, 32]} />;
      case "torus":
        return <torusGeometry args={[w / 2, 0.12, 16, 48]} />;
      case "cone":
        return <coneGeometry args={[w / 2, h, 32]} />;
      case "panel":
        return <boxGeometry args={[w, h, d]} />;
      default:
        return <boxGeometry args={[w, h, d]} />;
    }
  }, [comp.shape, comp.scale]);

  return (
    <group>
      <mesh
        ref={ref}
        position={comp.pos}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(selected ? null : comp.id);
        }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        {geometry}
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.35}
          transparent={transparent || selected}
          opacity={opacity}
          emissive={selected ? color : "#000000"}
          emissiveIntensity={selected ? 0.35 : 0}
        />
      </mesh>
      {/* Selection ring */}
      {selected && (
        <mesh position={[comp.pos[0], comp.pos[1] - comp.scale[1] / 2 - 0.15, comp.pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.5, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export function EngineModel3D({
  engine, exploded, transparent, animate, selectedId, diagnosticMode, diagnosticMap, onSelect,
}: Props) {
  const group = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    if (animate && !selectedId) {
      group.current.rotation.y = state.clock.elapsedTime * 0.18;
    }
  });

  return (
    <group ref={group} dispose={null}>
      {engine.components.map((c) => {
        const status = diagnosticMode ? (diagnosticMap[c.id] ?? "ok") : null;
        return (
          <ComponentMesh
            key={c.id}
            comp={c}
            exploded={exploded}
            transparent={transparent}
            animate={animate}
            selected={selectedId === c.id}
            status={status}
            onSelect={onSelect}
          />
        );
      })}
      {/* Engine label */}
      <Html position={[0, -1.8, 0]} center distanceFactor={9}>
        <div className="select-none pointer-events-none px-3 py-1 rounded-full bg-background/80 backdrop-blur border border-border/60 text-[10px] font-semibold tracking-wider uppercase text-amber whitespace-nowrap">
          {engine.name}
        </div>
      </Html>
    </group>
  );
}
