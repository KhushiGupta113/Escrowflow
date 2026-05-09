"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

function AnimatedGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.z = (clock.getElapsedTime() * 0.5) % 2;
    }
  });
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.4, 0, 0]} position={[0, -8, 0]}>
      <planeGeometry args={[100, 100, 40, 40]} />
      <meshBasicMaterial color="#0d1f44" wireframe />
    </mesh>
  );
}

function FloatingOrb({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[10, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} transparent opacity={0.15} />
    </mesh>
  );
}

export default function StarfieldCanvas({ active = true }: { active?: boolean }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-[var(--bg-base)]">
      <Canvas camera={{ position: [0, 0, 30], fov: 60 }} frameloop={active ? "always" : "demand"} dpr={[1, 2]}>
        <Stars radius={100} depth={50} count={isMobile ? 2000 : 5000} factor={4} saturation={0} fade speed={0.5} />
        {!isMobile && <AnimatedGrid />}
        <FloatingOrb position={[-30, 20, -20]} color="#4f8ef7" />
        <FloatingOrb position={[35, -15, -30]} color="#7c3aed" />
        <FloatingOrb position={[10, 30, -40]} color="#10b981" />
      </Canvas>
    </div>
  );
}
