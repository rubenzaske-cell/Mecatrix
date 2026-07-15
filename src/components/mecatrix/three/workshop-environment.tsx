"use client";

import * as React from "react";
import { Grid, Environment } from "@react-three/drei";

// A spacious, modern automotive workshop environment rendered around the engine.
// Floor with grid, two side workbenches with tool-cabinet silhouettes, back wall,
// overhead industrial lights, and a central engine stand/palette.
export function WorkshopEnvironment() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#15171f" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Floor grid (industrial tiles) */}
      <Grid
        position={[0, -2.19, 0]}
        args={[40, 40]}
        cellSize={1.2} cellThickness={0.7} cellColor="#2a2f3a"
        sectionSize={6} sectionThickness={1.2} sectionColor="#3a4150"
        fadeDistance={32} fadeStrength={1.5} infiniteGrid={false}
      />

      {/* Back wall */}
      <mesh position={[0, 3, -10]} receiveShadow>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial color="#1a1d26" roughness={1} />
      </mesh>

      {/* Side walls (partial, for depth) */}
      <mesh position={[-12, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial color="#161922" roughness={1} />
      </mesh>
      <mesh position={[12, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial color="#161922" roughness={1} />
      </mesh>

      {/* Central engine stand / palette */}
      <mesh position={[0, -1.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 2.0, 1.3, 8]} />
        <meshStandardMaterial color="#2a2f3a" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.85, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.2, 16]} />
        <meshStandardMaterial color="#1a1d26" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Left workbench */}
      <Workbench position={[-7, -1.0, -3]} rotation={[0, 0.4, 0]} />
      {/* Right workbench with pegboard */}
      <Workbench position={[7, -1.0, -3]} rotation={[0, -0.4, 0]} pegboard />

      {/* Tool cabinets (left back) */}
      <ToolCabinet position={[-9, -1.2, -6]} rotation={[0, 0.3, 0]} />
      <ToolCabinet position={[-7.2, -1.2, -6.4]} rotation={[0, 0.3, 0]} color="#c8443a" />

      {/* Hydraulic lift in the far back */}
      <mesh position={[0, -1.6, -7]} castShadow>
        <boxGeometry args={[3, 1.2, 1.6]} />
        <meshStandardMaterial color="#1f242e" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.7, -7]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.0, 12]} />
        <meshStandardMaterial color="#c89045" metalness={0.8} roughness={0.3} emissive="#c89045" emissiveIntensity={0.1} />
      </mesh>

      {/* Overhead industrial lights (glowing bars) */}
      <IndustrialLight position={[-3, 5.5, -2]} />
      <IndustrialLight position={[3, 5.5, 1]} />
      <IndustrialLight position={[0, 6, -5]} />

      {/* Warm rim accent lights */}
      <pointLight position={[-6, 1, 4]} intensity={0.6} color="#e07a2f" distance={14} />
      <pointLight position={[6, 1, 4]} intensity={0.5} color="#4aa876" distance={14} />

      <Environment preset="warehouse" />
    </group>
  );
}

function Workbench({
  position, rotation, pegboard,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  pegboard?: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Top */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.12, 1.1]} />
        <meshStandardMaterial color="#3a3f4a" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-1.3, -0.55], [1.3, -0.55], [-1.3, 0.45], [1.3, 0.45]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.1, z]} castShadow>
          <boxGeometry args={[0.12, 1.1, 0.12]} />
          <meshStandardMaterial color="#22262f" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Lower shelf */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[2.6, 0.06, 0.9]} />
        <meshStandardMaterial color="#2a2f3a" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Pegboard back */}
      {pegboard && (
        <mesh position={[0, 1.1, -0.55]} castShadow>
          <boxGeometry args={[3, 1.4, 0.06]} />
          <meshStandardMaterial color="#1a1d26" metalness={0.3} roughness={0.8} />
          {/* holes implied by texture; keep flat for perf */}
        </mesh>
      )}
      {/* A few silhouette tools on pegboard */}
      {pegboard && (
        <group position={[0, 1.1, -0.5]}>
          {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
            <mesh key={i} position={[x, 0.2, 0.02]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.08, 0.7, 0.04]} />
              <meshStandardMaterial color={i % 2 ? "#c89045" : "#9aa3b3"} metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function ToolCabinet({
  position, rotation, color = "#c89045",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 2.4, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Drawers */}
      {[-0.9, -0.4, 0.1, 0.6, 1.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0.42]}>
          <boxGeometry args={[1.3, 0.42, 0.06]} />
          <meshStandardMaterial color="#1a1d26" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
      {/* Handles */}
      {[-0.9, -0.4, 0.1, 0.6, 1.0].map((y, i) => (
        <mesh key={`h${i}`} position={[0, y, 0.46]}>
          <boxGeometry args={[0.5, 0.06, 0.04]} />
          <meshStandardMaterial color="#d8d8d8" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function IndustrialLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Fixture */}
      <mesh>
        <boxGeometry args={[2.2, 0.12, 0.3]} />
        <meshStandardMaterial color="#2a2f3a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Glowing tube */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[2.0, 0.04, 0.16]} />
        <meshStandardMaterial
          color="#fff4e0" emissive="#fff4e0" emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <pointLight intensity={0.7} distance={10} color="#fff4e0" position={[0, -0.3, 0]} />
    </group>
  );
}
