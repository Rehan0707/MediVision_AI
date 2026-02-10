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

function StylizedBone({ hotspots = [], activeHotspotId, hasIssue }: { hotspots?: HotspotData[], activeHotspotId?: string | null, hasIssue?: boolean }) {
    const pulseRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (pulseRef.current) {
            const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
            pulseRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
                    child.material.emissiveIntensity = pulse * 0.2;
                }
            });
        }
    });

    return (
        <group ref={pulseRef} rotation={[0, 0, Math.PI / 8]}>
            {/* Main Shaft - Using Capsule for organic taper */}
            <mesh position={[0, 0, 0]} castShadow>
                <capsuleGeometry args={[0.3, 2.8, 8, 32]} />
                <meshPhysicalMaterial
                    color="#fdfcf0"
                    roughness={0.15}
                    metalness={0.05}
                    clearcoat={0.5}
                    clearcoatRoughness={0.1}
                    transmission={0.1}
                    thickness={1}
                    ior={1.5}
                    emissive="#ffffff"
                    emissiveIntensity={0}
                />
            </mesh>

            <Scanline />

            {/* Proximal Epiphysis (Head) */}
            <mesh position={[0, 1.6, 0]} rotation={[0, 0.2, 0.4]} scale={[1.2, 0.8, 1]} castShadow>
                <sphereGeometry args={[0.55, 32, 24]} />
                <meshPhysicalMaterial color="#fdfcf0" roughness={0.2} transmission={0.05} ior={1.45} />
            </mesh>

            {/* Distal Epiphysis (Joint base) */}
            <group position={[0, -1.6, 0]} rotation={[0, -0.2, -0.4]}>
                <mesh scale={[1.3, 0.7, 1.1]} castShadow>
                    <sphereGeometry args={[0.55, 32, 24]} />
                    <meshPhysicalMaterial color="#fdfcf0" roughness={0.2} transmission={0.05} ior={1.45} />
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

            {(hasIssue || hotspots.length === 0) && (
                <>
                    <InjuryHotspot position={[0, 0.5, 0.35]} label="ANATOMICAL NODE: PROXIMAL SHAFT" isActive={hasIssue} />
                    <InjuryHotspot position={[0, -0.8, -0.35]} label="ANATOMICAL NODE: DISTAL METAPHYSIS" isActive={hasIssue} />
                </>
            )}
        </group>
    );
}

export default function BoneScene({ hotspots = [], activeHotspotId = null, hasIssue = false }: { hotspots?: HotspotData[], activeHotspotId?: string | null, hasIssue?: boolean }) {
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
                    <StylizedBone hotspots={hotspots} activeHotspotId={activeHotspotId} hasIssue={hasIssue} />
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
