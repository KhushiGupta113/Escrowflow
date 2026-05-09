"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Float, 
  PerspectiveCamera, 
  OrbitControls,
  Html,
  Environment,
  ContactShadows,
  useGLTF
} from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, CheckCircle, ArrowRight, User, DollarSign, CreditCard, Landmark, Zap } from "lucide-react";
import Link from "next/link";

// --- Lock Face Component ---
const LockFace = ({ isUnlocked, hovered, position, rotation }: any) => {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z -= isUnlocked ? 5 * delta : 1 * delta;
    }
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.5, 0.04, 32, 100]} />
        <meshStandardMaterial color={isUnlocked ? "#10b981" : "#4f8ef7"} emissive={isUnlocked ? "#10b981" : "#4f8ef7"} emissiveIntensity={hovered ? 4 : 2} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color={isUnlocked ? "#10b981" : "#4f8ef7"} transparent opacity={isUnlocked ? 0.6 : 0.15} toneMapped={false} />
      </mesh>
      <Html center transform distanceFactor={2} position={[0, 0, 0.05]} pointerEvents="none">
         <motion.div animate={{ scale: isUnlocked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.4 }}>
           {isUnlocked ? <CheckCircle size={40} className="text-[#10b981] drop-shadow-[0_0_20px_#10b981]" /> : <Lock size={40} className="text-[#4f8ef7] drop-shadow-[0_0_20px_#4f8ef7]" />}
         </motion.div>
      </Html>
    </group>
  );
};

// --- Vault Model Component ---
const VaultModel = ({ isUnlocked, onVaultClick }: { isUnlocked: boolean; onVaultClick: () => void }) => {
  const vaultRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Responsive positioning
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;
  const targetScale = isMobile ? 0.6 : 0.85;
  const targetX = isMobile ? 0 : viewport.width > 12 ? 3.2 : 2.4;

  const targetY = isMobile ? -2 : -0.5;

  useFrame((state, delta) => {
    if (!vaultRef.current) return;
    
    // Smooth position/scale transitions
    vaultRef.current.position.x = THREE.MathUtils.lerp(vaultRef.current.position.x, targetX, 4 * delta);
    vaultRef.current.position.y = THREE.MathUtils.lerp(vaultRef.current.position.y, targetY, 4 * delta);
    vaultRef.current.scale.setScalar(THREE.MathUtils.lerp(vaultRef.current.scale.x, targetScale, 4 * delta));

    
    // Orbiting Nodes
    if (orbitRef.current) {
      orbitRef.current.rotation.y += 0.4 * delta;
    }

    // Anti-clockwise Rotation
    const rotationSpeed = hovered ? 0.1 : 0.2;
    if (!isUnlocked) {
      vaultRef.current.rotation.y -= 0.5 * delta * rotationSpeed;
    } else {
      vaultRef.current.rotation.y -= 2 * delta; // Faster spin when unlocked
    }

    // Mouse parallax (only on desktop)
    if (!isMobile) {
      const targetRotX = (state.mouse.y * Math.PI) / 15;
      vaultRef.current.rotation.x = THREE.MathUtils.lerp(vaultRef.current.rotation.x, -targetRotX, 4 * delta);
    }
  });

  // Cursor handling
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  return (
    <group 
      ref={vaultRef} 
      onClick={(e) => { e.stopPropagation(); onVaultClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      rotation={[0, -0.4, 0]}
    >
      {/* Vault Body - Titanium Matte Black */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 2, 1.8]} />
        <meshStandardMaterial color="#0c0e14" roughness={0.9} metalness={0.2} />
      </mesh>

      {/* Vault Door Insets for 4 sides */}
      <mesh position={[0, 0, 0.91]}>
        <boxGeometry args={[1.8, 1.8, 0.1]} />
        <meshStandardMaterial color="#040508" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0, -0.91]}>
        <boxGeometry args={[1.8, 1.8, 0.1]} />
        <meshStandardMaterial color="#040508" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[1.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.6, 1.8, 0.1]} />
        <meshStandardMaterial color="#040508" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[-1.01, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1.6, 1.8, 0.1]} />
        <meshStandardMaterial color="#040508" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Lock Faces on 4 Sides */}
      <LockFace isUnlocked={isUnlocked} hovered={hovered} position={[0, 0, 1]} rotation={[0, 0, 0]} />
      <LockFace isUnlocked={isUnlocked} hovered={hovered} position={[0, 0, -1]} rotation={[0, Math.PI, 0]} />
      <LockFace isUnlocked={isUnlocked} hovered={hovered} position={[1.1, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <LockFace isUnlocked={isUnlocked} hovered={hovered} position={[-1.1, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* 4 Neon Vertical Corner Pillars (Borders for all faces) */}
      <mesh position={[1.01, 0, 0.91]}>
        <boxGeometry args={[0.04, 1.95, 0.04]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh position={[-1.01, 0, 0.91]}>
        <boxGeometry args={[0.04, 1.95, 0.04]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh position={[1.01, 0, -0.91]}>
        <boxGeometry args={[0.04, 1.95, 0.04]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh position={[-1.01, 0, -0.91]}>
        <boxGeometry args={[0.04, 1.95, 0.04]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* Holographic Base Ring */}
      <group position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[1.5, 1.55, 64]} />
          <meshBasicMaterial color="#4f8ef7" transparent opacity={0.3} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <ringGeometry args={[1.7, 1.72, 64]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.15} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>

      {/* Floating Payment Icons (on unlock) */}
      <AnimatePresence>
        {isUnlocked && (
          <group position={[0, 0, 1.5]}>
             {[
               { icon: DollarSign, pos: [-1.8, 1.8, 0], color: "#10b981" },
               { icon: CreditCard, pos: [1.8, 1.8, 0], color: "#4f8ef7" },
               { icon: Landmark, pos: [0, 2.8, -1], color: "#7c3aed" }
             ].map((item, i) => (
               <Float key={i} speed={4} floatIntensity={3} position={item.pos as any}>
                  <Html center pointerEvents="none">
                    <motion.div 
                      initial={{ scale: 0, opacity: 0, y: 30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0, y: -30 }}
                      transition={{ type: "spring", delay: i * 0.1, bounce: 0.5 }}
                      className="w-14 h-14 rounded-full flex items-center justify-center bg-[#060b14]/80 border backdrop-blur-md shadow-2xl"
                      style={{ borderColor: `${item.color}66`, boxShadow: `0 0 30px ${item.color}33` }}
                    >
                       <item.icon size={26} style={{ color: item.color }} />
                    </motion.div>
                  </Html>
               </Float>
             ))}
          </group>
        )}
      </AnimatePresence>

      {/* Holographic UI Nodes Orbiting */}
      <group ref={orbitRef}>
        <FloatingNode position={[-4.0, 0.8, 0]} label="Client Network" icon={User} color="#7c3aed" delay={1.2} />
        <FloatingNode position={[1.8, 1.5, 3.2]} label="Milestone Verified" icon={CheckCircle} color="#06b6d4" delay={1.4} />
        <FloatingNode position={[1.8, -1.5, -3.2]} label="Funds Released" icon={Shield} color="#4f8ef7" delay={1.6} />
      </group>

    </group>
  );
};

// --- Particles Component ---
const Particles = ({ count = 150 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += 0.05 * delta;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} args={[points, 3]} />

      </bufferGeometry>
      <pointsMaterial size={0.05} color="#4f8ef7" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

// --- Floating Node Component ---
const FloatingNode = ({ position, label, icon: Icon, color, delay = 0 }: { position: [number, number, number]; label: string; icon: any; color: string; delay?: number }) => {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} position={position}>
      <Html center distanceFactor={12} pointerEvents="none" zIndexRange={[100, 0]}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-2 pointer-events-none"
        >
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] border backdrop-blur-xl"
            style={{ background: `rgba(6, 11, 20, 0.8)`, borderColor: `${color}44` }}
          >
            <Icon size={20} style={{ color: color }} />
          </div>
          <div className="px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/80 whitespace-nowrap">
              {label}
            </span>
          </div>
        </motion.div>
      </Html>
    </Float>
  );
};

// --- Main Hero Scene Component ---
export function VaultHero() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <section className="relative w-full min-h-screen flex items-center bg-[#04060a] overflow-hidden pt-20 pb-10">
      
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Canvas shadows gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
          <color attach="background" args={['#04060a']} />
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
          
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} intensity={2} color="#4f8ef7" castShadow />
          <pointLight position={[-10, -10, -10]} intensity={2} color="#7c3aed" />
          <directionalLight position={[0, 0, 10]} intensity={0.8} color="#06b6d4" />
          <Environment preset="city" environmentIntensity={0.4} />
          
          <VaultModel isUnlocked={isUnlocked} onVaultClick={() => setIsUnlocked(!isUnlocked)} />
          <Particles />
          
          <ContactShadows position={[0, -3.5, 0]} opacity={0.8} scale={30} blur={2.5} far={10} color="#000" />

          <EffectComposer enableNormalPass={false} multisampling={4}>

            <Bloom intensity={0.8} luminanceThreshold={0.9} luminanceSmoothing={0.1} mipmapBlur />
            <Vignette darkness={0.6} offset={0.1} />
            <Noise opacity={0.025} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Atmospheric Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#4f8ef7]/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#7c3aed]/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Grid Floor */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] pointer-events-none z-10 bg-gradient-to-t from-[#04060a] to-transparent" />
      <div 
        className="absolute bottom-[-20vh] left-[-50vw] w-[200vw] h-[60vh] pointer-events-none opacity-[0.07] z-0"
        style={{ 
          backgroundImage: `linear-gradient(#4f8ef7 1px, transparent 1px), linear-gradient(90deg, #4f8ef7 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: 'perspective(600px) rotateX(70deg)',
        }}
      />

      {/* Foreground Content */}
      <div className="max-w-7xl relative z-20 mx-auto px-6 lg:px-8 pointer-events-none w-full">

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8 max-w-xl">
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 w-fit backdrop-blur-md -ml-1"
             >
               <Shield className="w-3.5 h-3.5 text-[#4f8ef7]" />
               <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/80">Autonomous Escrow Protocol</span>
             </motion.div>

             
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight"
             >
               Funds released <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f8ef7] to-[#7c3aed]">only when</span> <br />
               work is done.
             </motion.h1>

             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="text-lg sm:text-xl text-[var(--text-secondary)] font-medium leading-relaxed max-w-md"
             >
               The smart escrow layer for the modern freelancer. Secure your budget, verify deliverables, and automate payouts in one seamless flow.
             </motion.p>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4 pt-2 pointer-events-auto"
             >
               <Link href="/signup?role=client" className="w-full sm:w-auto">
                 <button className="w-full sm:w-auto px-8 h-12 rounded-xl bg-[var(--accent-primary)] text-white font-semibold text-sm shadow-[0_0_20px_rgba(79,142,247,0.3)] hover:bg-[#3b7de6] transition-all flex items-center justify-center gap-2 group">
                   Start as Client <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
               </Link>
               <Link href="/signup?role=freelancer" className="w-full sm:w-auto">
                 <button className="w-full sm:w-auto px-8 h-12 rounded-xl bg-white/[0.05] border border-white/10 text-white font-semibold text-sm hover:bg-white/[0.1] backdrop-blur-md transition-all flex items-center justify-center">
                   Join as Freelancer
                 </button>
               </Link>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.5 }}
               className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/[0.05]"
             >
                {[
                  { icon: Lock, label: "Non-Custodial", sub: "End-to-end security" },
                  { icon: Zap, label: "Hyper-Speed", sub: "Instant settlement" },
                  { icon: Shield, label: "Built-in Trust", sub: "Dispute mediation" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center sm:flex-col sm:items-start gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#4f8ef7] group-hover:bg-[#4f8ef7]/10 transition-colors">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white tracking-wide mb-0.5">{item.label}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">{item.sub}</p>
                    </div>
                  </div>
                ))}
             </motion.div>
          </div>
          
          {/* Empty column to force text to the left and allow 3D canvas to be visible on the right */}
          <div className="hidden lg:block pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
