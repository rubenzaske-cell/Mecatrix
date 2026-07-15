"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// MecaAI — the Mecatrix mascot.
// A low-poly blocky cartoon robot built procedurally from primitives.
// Based on the uploaded "Very Simple Cartoon Robot" reference: warm light-brown
// body, slanted boxy head, tall antenna, red LED eyes in square recesses,
// small black mouth, segmented arms with paddle hands, straight legs.
// Idle animations: gentle bobbing, antenna light pulse, eye glow, subtle tilt.

const BODY = "#C4A57C";      // warm light brown
const BODY_DARK = "#A0845C"; // crevice shadow
const BODY_LIGHT = "#E0C8A0";// highlight
const EYE = "#FF3A3A";       // red LED
const MOUTH = "#1a1a1a";     // black
const ACCENT = "#e07a2f";    // Mecatrix amber for antenna tip

function Box({
  size, position, rotation, color, metalness = 0.3, roughness = 0.6, emissive, emissiveIntensity,
}: {
  size: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissiveIntensity ?? 0}
      />
    </mesh>
  );
}

function Cylinder({
  args, position, rotation, color, metalness = 0.4, roughness = 0.5,
}: {
  args: [number, number, number, number?];
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={args as [number, number, number, number]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

export function MecaAIMascot({
  scale = 1,
  position = [0, 0, 0],
  thinking = false,
}: {
  scale?: number;
  position?: [number, number, number];
  thinking?: boolean;
}) {
  const root = React.useRef<THREE.Group>(null);
  const head = React.useRef<THREE.Group>(null);
  const antennaTip = React.useRef<THREE.MeshStandardMaterial>(null);
  const eyeL = React.useRef<THREE.MeshStandardMaterial>(null);
  const eyeR = React.useRef<THREE.MeshStandardMaterial>(null);
  const armL = React.useRef<THREE.Group>(null);
  const armR = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (root.current) {
      // Gentle idle bob
      root.current.position.y = position[1] + Math.sin(t * 1.4) * 0.06;
      // Subtle sway
      root.current.rotation.z = Math.sin(t * 0.7) * 0.025;
    }
    if (head.current) {
      // Head tilt + look-around
      head.current.rotation.z = Math.sin(t * 0.5) * 0.06;
      head.current.rotation.y = Math.sin(t * 0.35) * 0.12;
      head.current.rotation.x = Math.sin(t * 0.9) * 0.03;
    }
    // Antenna light pulse
    if (antennaTip.current) {
      const pulse = thinking
        ? 0.6 + Math.sin(t * 8) * 0.4   // fast blink when thinking
        : 0.35 + Math.sin(t * 2.2) * 0.25;
      antennaTip.current.emissiveIntensity = pulse;
    }
    // Eye glow pulse
    const eyeGlow = thinking ? 0.8 + Math.sin(t * 6) * 0.3 : 0.5 + Math.sin(t * 1.8) * 0.15;
    if (eyeL.current) eyeL.current.emissiveIntensity = eyeGlow;
    if (eyeR.current) eyeR.current.emissiveIntensity = eyeGlow;
    // Arms subtle sway
    if (armL.current) armL.current.rotation.x = Math.sin(t * 1.1) * 0.08 - 0.05;
    if (armR.current) armR.current.rotation.x = Math.sin(t * 1.1 + 0.4) * 0.08 - 0.05;
  });

  return (
    <group ref={root} position={position} scale={scale} dispose={null}>
      {/* ===== HEAD (truncated box — slanted top) ===== */}
      <group ref={head} position={[0, 1.35, 0]}>
        {/* main head box */}
        <Box size={[0.95, 0.85, 0.8]} position={[0, 0, 0]} color={BODY} metalness={0.35} roughness={0.55} />
        {/* slanted top (bevel) */}
        <Box size={[0.95, 0.18, 0.8]} position={[0, 0.5, 0]} rotation={[0.18, 0, 0]} color={BODY_LIGHT} metalness={0.35} roughness={0.5} />
        {/* side shading */}
        <Box size={[0.1, 0.85, 0.8]} position={[-0.48, 0, 0]} color={BODY_DARK} metalness={0.35} roughness={0.6} />

        {/* Eye recesses (dark squares) */}
        <Box size={[0.28, 0.28, 0.04]} position={[-0.22, 0.05, 0.41]} color="#1a1a1a" metalness={0.1} roughness={0.9} />
        <Box size={[0.28, 0.28, 0.04]} position={[0.22, 0.05, 0.41]} color="#1a1a1a" metalness={0.1} roughness={0.9} />
        {/* Red LED eyes (recessed cubes) */}
        <mesh position={[-0.22, 0.05, 0.43]}>
          <boxGeometry args={[0.18, 0.18, 0.06]} />
          <meshStandardMaterial
            ref={eyeL}
            color={EYE}
            emissive={EYE}
            emissiveIntensity={0.5}
            metalness={0.2}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0.22, 0.05, 0.43]}>
          <boxGeometry args={[0.18, 0.18, 0.06]} />
          <meshStandardMaterial
            ref={eyeR}
            color={EYE}
            emissive={EYE}
            emissiveIntensity={0.5}
            metalness={0.2}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>

        {/* Mouth (small black square) */}
        <Box size={[0.16, 0.16, 0.03]} position={[0, -0.25, 0.41]} color={MOUTH} metalness={0.1} roughness={0.9} />

        {/* ===== ANTENNA ===== */}
        <Cylinder args={[0.035, 0.035, 0.7, 8]} position={[0, 0.92, 0]} color={BODY_DARK} metalness={0.7} roughness={0.3} />
        {/* glowing tip */}
        <mesh position={[0, 1.32, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            ref={antennaTip}
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={0.4}
            metalness={0.3}
            roughness={0.2}
            toneMapped={false}
          />
        </mesh>
        {/* point light from antenna */}
        <pointLight position={[0, 1.32, 0]} color={ACCENT} intensity={0.3} distance={2.5} />
      </group>

      {/* ===== TORSO (tapered box) ===== */}
      <Box size={[0.9, 1.0, 0.62]} position={[0, 0.4, 0]} color={BODY} metalness={0.35} roughness={0.55} />
      {/* chest panel highlight */}
      <Box size={[0.6, 0.6, 0.04]} position={[0, 0.45, 0.33]} color={BODY_LIGHT} metalness={0.4} roughness={0.4} />
      {/* chest detail line */}
      <Box size={[0.5, 0.04, 0.04]} position={[0, 0.55, 0.34]} color={BODY_DARK} metalness={0.5} roughness={0.5} />
      <Box size={[0.5, 0.04, 0.04]} position={[0, 0.35, 0.34]} color={BODY_DARK} metalness={0.5} roughness={0.5} />
      {/* small status LED on chest */}
      <mesh position={[0, 0.2, 0.34]}>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshStandardMaterial color="#4aa876" emissive="#4aa876" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>

      {/* ===== ARMS (segmented, slightly outstretched) ===== */}
      <group ref={armL} position={[-0.52, 0.7, 0]}>
        {/* shoulder */}
        <Box size={[0.18, 0.22, 0.18]} position={[-0.06, 0.05, 0]} color={BODY_DARK} metalness={0.5} roughness={0.4} />
        {/* upper arm */}
        <Box size={[0.16, 0.32, 0.16]} position={[-0.14, -0.18, 0]} color={BODY} metalness={0.35} roughness={0.55} />
        {/* elbow */}
        <Box size={[0.17, 0.14, 0.17]} position={[-0.14, -0.4, 0]} color={BODY_DARK} metalness={0.5} roughness={0.4} />
        {/* forearm */}
        <Box size={[0.15, 0.3, 0.15]} position={[-0.14, -0.6, 0]} color={BODY} metalness={0.35} roughness={0.55} />
        {/* paddle hand */}
        <Box size={[0.22, 0.14, 0.22]} position={[-0.14, -0.82, 0]} color={BODY_LIGHT} metalness={0.4} roughness={0.5} />
      </group>

      <group ref={armR} position={[0.52, 0.7, 0]}>
        <Box size={[0.18, 0.22, 0.18]} position={[0.06, 0.05, 0]} color={BODY_DARK} metalness={0.5} roughness={0.4} />
        <Box size={[0.16, 0.32, 0.16]} position={[0.14, -0.18, 0]} color={BODY} metalness={0.35} roughness={0.55} />
        <Box size={[0.17, 0.14, 0.17]} position={[0.14, -0.4, 0]} color={BODY_DARK} metalness={0.5} roughness={0.4} />
        <Box size={[0.15, 0.3, 0.15]} position={[0.14, -0.6, 0]} color={BODY} metalness={0.35} roughness={0.55} />
        <Box size={[0.22, 0.14, 0.22]} position={[0.14, -0.82, 0]} color={BODY_LIGHT} metalness={0.4} roughness={0.5} />
      </group>

      {/* ===== LEGS (straight, segmented) ===== */}
      {/* hip block */}
      <Box size={[0.7, 0.16, 0.5]} position={[0, -0.18, 0]} color={BODY_DARK} metalness={0.5} roughness={0.4} />
      {/* left leg */}
      <group position={[-0.2, -0.26, 0]}>
        <Box size={[0.2, 0.34, 0.2]} position={[0, -0.17, 0]} color={BODY} metalness={0.35} roughness={0.55} />
        <Box size={[0.21, 0.12, 0.21]} position={[0, -0.38, 0]} color={BODY_DARK} metalness={0.5} roughness={0.4} />
        <Box size={[0.19, 0.3, 0.19]} position={[0, -0.55, 0]} color={BODY} metalness={0.35} roughness={0.55} />
        {/* foot pad */}
        <Box size={[0.26, 0.12, 0.34]} position={[0, -0.75, 0.06]} color={BODY_DARK} metalness={0.5} roughness={0.4} />
      </group>
      {/* right leg */}
      <group position={[0.2, -0.26, 0]}>
        <Box size={[0.2, 0.34, 0.2]} position={[0, -0.17, 0]} color={BODY} metalness={0.35} roughness={0.55} />
        <Box size={[0.21, 0.12, 0.21]} position={[0, -0.38, 0]} color={BODY_DARK} metalness={0.5} roughness={0.4} />
        <Box size={[0.19, 0.3, 0.19]} position={[0, -0.55, 0]} color={BODY} metalness={0.35} roughness={0.55} />
        <Box size={[0.26, 0.12, 0.34]} position={[0, -0.75, 0.06]} color={BODY_DARK} metalness={0.5} roughness={0.4} />
      </group>
    </group>
  );
}

// A self-contained canvas-ready mascot with its own lighting rig.
export { MecaAIMascot as default };
