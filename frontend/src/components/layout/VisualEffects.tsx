"use client";

import dynamic from "next/dynamic";

const StarfieldCanvas = dynamic(() => import("@/components/three/StarfieldCanvas"), { ssr: false });

export function VisualEffects() {
  return <StarfieldCanvas active={true} />;
}
