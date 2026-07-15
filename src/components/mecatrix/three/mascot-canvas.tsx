"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Float, Environment } from "@react-three/drei";
import { MecaAIMascot } from "./meca-mascot";
import { cn } from "@/lib/utils";

// A compact, self-contained mascot display suitable for embedding in views.
export function MascotCanvas({
  className,
  thinking = false,
  interactive = false,
  height = 200,
}: {
  className?: string;
  thinking?: boolean;
  interactive?: boolean;
  height?: number;
}) {
  return (
    <div className={cn("relative", className)} style={{ height }}>
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 38 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 3]} intensity={1.1} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#e07a2f" />
        <pointLight position={[0, 1, 2]} intensity={0.3} color="#4aa876" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <MecaAIMascot scale={0.85} position={[0, -0.6, 0]} thinking={thinking} />
        </Float>

        <ContactShadows position={[0, -1.5, 0]} opacity={0.35} scale={4} blur={2.2} far={3} />
        <Environment preset="city" />

        {interactive && (
          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={7}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
            autoRotate
            autoRotateSpeed={0.8}
          />
        )}
      </Canvas>
    </div>
  );
}
