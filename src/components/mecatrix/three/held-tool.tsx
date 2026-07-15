"use client";

import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { WorkshopTool } from "@/lib/mecatrix/workshop-data";

// A 3D representation of the currently equipped tool that follows the pointer
// over the canvas, giving the feeling of "holding" the tool.
export function HeldTool({ tool }: { tool: WorkshopTool | null }) {
  const { pointer, viewport } = useThree();
  const group = React.useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    // Project pointer onto a plane near the camera (z = 4).
    const targetX = pointer.x * (viewport.width / 2) * 0.9;
    const targetY = pointer.y * (viewport.height / 2) * 0.9;
    group.current.position.x += (targetX - group.current.position.x) * 0.2;
    group.current.position.y += (targetY - group.current.position.y) * 0.2;
    // Slight idle rotation
    group.current.rotation.z = Math.sin(performance.now() / 600) * 0.1;
  });

  if (!tool) return null;

  return (
    <group ref={group} position={[0, 0, 4.2]} scale={0.5}>
      <ToolGeometry tool={tool} />
    </group>
  );
}

function ToolGeometry({ tool }: { tool: WorkshopTool }) {
  const metal = { metalness: 0.85, roughness: 0.25 };
  const handle = { metalness: 0.3, roughness: 0.6 };
  switch (tool.shape) {
    case "wrench":
      return (
        <group rotation={[0, 0, Math.PI / 6]}>
          {/* handle */}
          <mesh castShadow>
            <boxGeometry args={[0.18, 1.4, 0.12]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
          {/* open end */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <torusGeometry args={[0.18, 0.06, 12, 16, Math.PI]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
          {/* box end */}
          <mesh position={[0, -0.85, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 6]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
        </group>
      );
    case "socket":
      return (
        <group rotation={[0, 0, 0]}>
          {/* socket */}
          <mesh position={[0, -0.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.5, 12]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
          {/* ratchet handle */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.14, 1.2, 0.1]} />
            <meshStandardMaterial color="#2a2f3a" {...handle} />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
        </group>
      );
    case "allen":
      return (
        <group rotation={[0, 0, Math.PI / 4]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
          <mesh position={[0.4, 0.4, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
        </group>
      );
    case "torx":
      return (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.0, 12]} />
            <meshStandardMaterial color={tool.color} {...handle} />
          </mesh>
          {/* star tip */}
          <group position={[0, -0.55, 0]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} rotation={[0, (i / 6) * Math.PI * 2, 0]}>
                <boxGeometry args={[0.05, 0.12, 0.18]} />
                <meshStandardMaterial color={tool.color} {...metal} />
              </mesh>
            ))}
          </group>
        </group>
      );
    case "screwdriver":
      return (
        <group>
          {/* handle */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.5, 16]} />
            <meshStandardMaterial color={tool.color} {...handle} />
          </mesh>
          {/* shaft */}
          <mesh position={[0, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
            <meshStandardMaterial color="#9aa3b3" {...metal} />
          </mesh>
          {/* tip */}
          <mesh position={[0, -0.55, 0]} castShadow>
            <coneGeometry args={[0.06, 0.1, 8]} />
            <meshStandardMaterial color="#9aa3b3" {...metal} />
          </mesh>
        </group>
      );
    case "pliers":
      return (
        <group rotation={[0, 0, Math.PI / 8]}>
          <mesh position={[-0.08, 0.2, 0]} rotation={[0, 0, 0.2]} castShadow>
            <boxGeometry args={[0.08, 1.0, 0.06]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
          <mesh position={[0.08, 0.2, 0]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[0.08, 1.0, 0.06]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
          <mesh position={[-0.1, -0.4, 0]} rotation={[0, 0, 0.2]} castShadow>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshStandardMaterial color="#2a2f3a" {...handle} />
          </mesh>
          <mesh position={[0.1, -0.4, 0]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshStandardMaterial color="#2a2f3a" {...handle} />
          </mesh>
        </group>
      );
    case "hammer":
      return (
        <group rotation={[0, 0, Math.PI / 6]}>
          {/* handle */}
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.08, 1.2, 12]} />
            <meshStandardMaterial color="#8a5a2a" {...handle} />
          </mesh>
          {/* rubber head */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.5, 0.22, 0.22]} />
            <meshStandardMaterial color={tool.color} roughness={0.9} />
          </mesh>
        </group>
      );
    case "torque":
      return (
        <group rotation={[0, 0, Math.PI / 6]}>
          {/* long handle */}
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 1.8, 12]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
          {/* head */}
          <mesh position={[0, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.2, 8]} />
            <meshStandardMaterial color="#2a2f3a" {...metal} />
          </mesh>
          {/* dial */}
          <mesh position={[0, 0.2, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.05, 16]} />
            <meshStandardMaterial color="#e07a2f" emissive="#e07a2f" emissiveIntensity={0.3} />
          </mesh>
        </group>
      );
    case "impact":
      return (
        <group>
          {/* body */}
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.9, 0.3]} />
            <meshStandardMaterial color={tool.color} {...handle} />
          </mesh>
          {/* nozzle */}
          <mesh position={[0, -0.6, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
            <meshStandardMaterial color="#2a2f3a" {...metal} />
          </mesh>
          {/* handle grip */}
          <mesh position={[0, 0.2, 0.2]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.12]} />
            <meshStandardMaterial color="#1a1d26" {...handle} />
          </mesh>
        </group>
      );
    case "multimeter":
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.7, 1.0, 0.2]} />
            <meshStandardMaterial color={tool.color} {...handle} />
          </mesh>
          {/* screen */}
          <mesh position={[0, 0.25, 0.11]}>
            <boxGeometry args={[0.5, 0.3, 0.02]} />
            <meshStandardMaterial color="#0a0b12" emissive="#4aa8e0" emissiveIntensity={0.4} />
          </mesh>
          {/* probes */}
          <mesh position={[-0.3, -0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
            <meshStandardMaterial color="#c8443a" {...handle} />
          </mesh>
          <mesh position={[0.3, -0.5, 0]} rotation={[0, 0, -0.3]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
            <meshStandardMaterial color="#1a1d26" {...handle} />
          </mesh>
        </group>
      );
    case "scanner":
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.8, 1.1, 0.18]} />
            <meshStandardMaterial color={tool.color} {...handle} />
          </mesh>
          <mesh position={[0, 0.25, 0.1]}>
            <boxGeometry args={[0.6, 0.4, 0.02]} />
            <meshStandardMaterial color="#0a0b12" emissive="#4aa8e0" emissiveIntensity={0.4} />
          </mesh>
          {/* cable */}
          <mesh position={[0, -0.7, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
            <meshStandardMaterial color="#1a1d26" />
          </mesh>
        </group>
      );
    case "jack":
      return (
        <group>
          {/* base */}
          <mesh position={[0, -0.4, 0]} castShadow>
            <boxGeometry args={[1.0, 0.2, 0.6]} />
            <meshStandardMaterial color="#c8443a" {...metal} />
          </mesh>
          {/* piston */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.9, 12]} />
            <meshStandardMaterial color="#c89045" {...metal} />
          </mesh>
          {/* saddle */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.4, 0.08, 0.3]} />
            <meshStandardMaterial color="#2a2f3a" {...metal} />
          </mesh>
          {/* handle */}
          <mesh position={[0.5, 0.1, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
            <meshStandardMaterial color="#2a2f3a" {...metal} />
          </mesh>
        </group>
      );
    case "puller":
      return (
        <group>
          {/* cross bar */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.0, 12]} />
            <meshStandardMaterial color={tool.color} {...metal} />
          </mesh>
          {/* center screw */}
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.8, 12]} />
            <meshStandardMaterial color="#2a2f3a" {...metal} />
          </mesh>
          {/* jaws */}
          {[-0.45, 0.45].map((x, i) => (
            <mesh key={i} position={[x, -0.3, 0]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]} castShadow>
              <boxGeometry args={[0.06, 0.7, 0.06]} />
              <meshStandardMaterial color={tool.color} {...metal} />
            </mesh>
          ))}
        </group>
      );
    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.8, 0.2]} />
          <meshStandardMaterial color={tool.color} />
        </mesh>
      );
  }
}
