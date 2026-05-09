"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Torus } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Lock() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.4;
    }
  });
  return (
    <group ref={groupRef}>
      {/* Shackle */}
      <Torus args={[0.35, 0.08, 16, 32, Math.PI]} position={[0, 0.55, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#4f8ef7" metalness={0.8} roughness={0.2} />
      </Torus>
      {/* Body */}
      <RoundedBox args={[0.9, 0.7, 0.25]} radius={0.1} position={[0, 0, 0]}>
        <meshStandardMaterial color="#162035" metalness={0.6} roughness={0.3} emissive="#4f8ef7" emissiveIntensity={0.1} />
      </RoundedBox>
    </group>
  );
}

export default function LogoLock() {
  return (
    <div style={{ width: 36, height: 36 }}>
      <Canvas camera={{ position: [0, 0, 2.5], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#4f8ef7" />
        <Lock />
      </Canvas>
    </div>
  );
}
