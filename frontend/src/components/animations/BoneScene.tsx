"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

export interface HotspotData {
    id: string;
    position: [number, number, number];
    label: string;
}

function Scanline() {
    const planeRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (planeRef.current) {
            planeRef.current.position.y = Math.sin(state.clock.elapsedTime) * 1.8;
        }
    });

    return (
        <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 2]} />
            <meshStandardMaterial
                color="#00D1FF"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
                emissive="#00D1FF"
                emissiveIntensity={4}
            />
        </mesh>
    );
}

function InjuryHotspot({ position, label, isActive }: { position: [number, number, number], label: string, isActive?: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const speed = isActive ? 8 : 4;
            const amp = isActive ? 0.4 : 0.2;
            const scale = 1 + Math.sin(state.clock.elapsedTime * speed) * amp;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial
                    color={isActive ? "#00D1FF" : "#ff3e3e"}
                    emissive={isActive ? "#00D1FF" : "#ff3e3e"}
                    emissiveIntensity={isActive ? 10 : 3}
                />
            </mesh>
        </group>
    );
}

function StylizedBone({ hotspots = [], activeHotspotId }: { hotspots?: HotspotData[], activeHotspotId?: string | null }) {
    return (
        <group rotation={[0, 0, Math.PI / 6]}>
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.35, 0.35, 3.5, 32]} />
                <meshStandardMaterial
                    color="#f1f5f9"
                    roughness={0.2}
                    metalness={0.1}
                />
            </mesh>

            <Scanline />

            <mesh position={[0, 1.75, 0]} castShadow>
                <sphereGeometry args={[0.55, 32, 32]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
            </mesh>
            <group position={[0, -1.75, 0]}>
                <mesh castShadow>
                    <sphereGeometry args={[0.55, 32, 32]} />
                    <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
                </mesh>
            </group>

            {hotspots.map((hs) => (
                <InjuryHotspot
                    key={hs.id}
                    position={hs.position}
                    label={hs.label}
                    isActive={activeHotspotId === hs.id}
                />
            ))}

            {hotspots.length === 0 && (
                <>
                    <InjuryHotspot position={[0, 0.8, 0.4]} label="FRACTURE: PROXIMAL" />
                    <InjuryHotspot position={[0, -0.5, -0.4]} label="DENSITY ANOMALY" />
                </>
            )}
        </group>
    );
}

export default function BoneScene({ hotspots = [], activeHotspotId = null }: { hotspots?: HotspotData[], activeHotspotId?: string | null }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="w-full h-full bg-[#020617]/50 rounded-[2rem] flex items-center justify-center">
            <div className="text-[#00D1FF] text-[8px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Neural Render...</div>
        </div>
    );

    return (
        <div className="w-full h-full bg-[#020617]/50 rounded-[2rem] overflow-hidden">
            <Canvas shadows gl={{ preserveDrawingBuffer: true, antialias: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={35} />
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={3}
                    maxDistance={12}
                    autoRotate={!activeHotspotId}
                    autoRotateSpeed={0.8}
                />

                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />
                <pointLight position={[-10, -10, -10]} color="#7000FF" intensity={2} />
                <pointLight position={[0, 5, 5]} color="#00D1FF" intensity={1} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <StylizedBone hotspots={hotspots} activeHotspotId={activeHotspotId} />
                </Float>

                <ContactShadows
                    position={[0, -3, 0]}
                    opacity={0.6}
                    scale={12}
                    blur={3}
                    far={5}
                    color="#000000"
                />

                <Environment preset="night" />
            </Canvas>
        </div>
    );
}
