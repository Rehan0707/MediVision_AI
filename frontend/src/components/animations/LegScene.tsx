"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, ContactShadows, Environment, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function BoneMaterial({ color = "#e8e6d1" }: { color?: string }) {
    return (
        <meshPhysicalMaterial
            color={color}
            roughness={0.6}
            metalness={0.1}
            clearcoat={0.1}
            reflectivity={0.2}
            side={THREE.DoubleSide}
        />
    );
}

function OrganicBone({
    pathPoints,
    radius = 0.3,
    color,
    position = [0, 0, 0],
    scale = [1, 1, 1]
}: {
    pathPoints: THREE.Vector3[],
    radius?: number,
    color?: string,
    position?: [number, number, number],
    scale?: [number, number, number]
}) {
    const geometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(pathPoints);
        // tubularSegments=64, radius=radius, radialSegments=32 (smoother), closed=false
        return new THREE.TubeGeometry(curve, 64, radius, 32, false);
    }, [pathPoints, radius]);

    return (
        <mesh position={position} scale={scale} castShadow receiveShadow geometry={geometry}>
            <BoneMaterial color={color} />
        </mesh>
    );
}

function TibiaModel({ hasIssue }: { hasIssue: boolean }) {
    // Tibia: Shinbone. S-shaped curve, thick top, thick bottom.
    const tibiaPoints = useMemo(() => [
        new THREE.Vector3(0, 2.8, 0),      // Proximal (Knee)
        new THREE.Vector3(0.1, 1.5, 0.05), // Upper shaft
        new THREE.Vector3(0, 0, 0),        // Mid shaft
        new THREE.Vector3(-0.05, -1.5, -0.05), // Lower shaft
        new THREE.Vector3(-0.1, -2.8, 0)   // Distal (Ankle)
    ], []);

    return (
        <group>
            {/* Main Shaft (Organic) */}
            <OrganicBone pathPoints={tibiaPoints} radius={0.38} />

            {/* Proximal Epiphysis (Knee Joint) - Sculpted looks */}
            <mesh position={[0, 2.7, 0]} scale={[1.8, 0.7, 1.4]} castShadow>
                <sphereGeometry args={[0.5, 32, 32]} />
                <BoneMaterial />
            </mesh>
            {/* Tibial Tuberosity (Bump below knee) */}
            <mesh position={[0, 2.2, 0.4]} scale={[0.5, 0.8, 0.3]} rotation={[0.2, 0, 0]}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <BoneMaterial />
            </mesh>

            {/* Distal Epiphysis (Ankle Joint) */}
            <mesh position={[-0.1, -2.8, 0]} scale={[1.5, 0.8, 1.3]} castShadow>
                <boxGeometry args={[0.6, 0.6, 0.8]} />
                {/* Rounding the box via material/geometry choice isn't easy without subsurf, but sphere blend helps */}
                <BoneMaterial />
            </mesh>
            <mesh position={[-0.1, -2.8, 0]} scale={[1.5, 0.8, 1.3]}>
                <sphereGeometry args={[0.45, 32, 32]} />
                <BoneMaterial />
            </mesh>

            {/* Medial Malleolus (Inner ankle bump) */}
            <mesh position={[-0.4, -3.1, 0]} rotation={[0, 0, -0.5]}>
                <coneGeometry args={[0.25, 0.6, 32]} />
                <BoneMaterial />
            </mesh>
        </group>
    );
}

function FibulaModel({ hasIssue }: { hasIssue: boolean }) {
    // Fibula: Thin, lateral, posterolateral to tibia.
    const fibulaPoints = useMemo(() => [
        new THREE.Vector3(0.9, 2.4, -0.3),  // Head
        new THREE.Vector3(0.85, 0, -0.2),   // Mid
        new THREE.Vector3(0.8, -2.9, -0.3)  // Lateral Malleolus
    ], []);

    return (
        <group>
            <OrganicBone pathPoints={fibulaPoints} radius={0.12} color="#f0efe6" />

            {/* Fibula Head */}
            <mesh position={[0.9, 2.4, -0.3]} scale={[1, 1.3, 1]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <BoneMaterial color="#f0efe6" />
            </mesh>

            {/* Lateral Malleolus (Outer ankle bump) */}
            <mesh position={[0.8, -2.9, -0.3]} scale={[1, 1.6, 1]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <BoneMaterial color="#f0efe6" />
            </mesh>
        </group>
    );
}

function FractureVisualization({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.4, 32, 32]} />
                <MeshDistortMaterial
                    color="#ff3333"
                    emissive="#990000"
                    emissiveIntensity={2}
                    distort={0.4}
                    speed={2}
                    transparent
                    opacity={0.5}
                />
            </mesh>
            <pointLight color="red" intensity={5} distance={3} />
            {/* Fracture line ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.5, 0.05, 16, 100]} />
                <meshBasicMaterial color="red" />
            </mesh>
        </group>
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
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial
                    color={isActive ? "#00D1FF" : "#ff3e3e"}
                    emissive={isActive ? "#00D1FF" : "#ff3e3e"}
                    emissiveIntensity={isActive ? 10 : 3}
                />
            </mesh>
        </group>
    );
}

export default function LegScene({ hasIssue = false, hotspots = [] }: { hasIssue?: boolean, hotspots?: { id: string, position: [number, number, number], label: string }[] }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-[2rem] flex items-center justify-center">
            <div className="text-[#00D1FF] text-[8px] font-black uppercase tracking-[0.4em] animate-pulse">Loading 3D...</div>
        </div>
    );

    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <div className="text-cyan-400 text-[10px] font-black tracking-[0.2em] uppercase mb-1">
                    Anatomical Reconstruction
                </div>
                <div className="text-white text-xl font-bold tracking-tight">
                    Tibia & Fibula (Right)
                </div>
            </div>

            <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
                <OrbitControls
                    enableDamping
                    autoRotate={!hasIssue && hotspots.length === 0}
                    autoRotateSpeed={0.5}
                    minDistance={5}
                    maxDistance={20}
                />

                {/* Dramatic Lighting */}
                <ambientLight intensity={0.3} />
                <spotLight position={[10, 10, 15]} angle={0.3} penumbra={1} intensity={2} castShadow color="#ffffff" />
                <pointLight position={[-10, 0, -5]} color="#3b82f6" intensity={1.5} distance={20} />
                <pointLight position={[0, -10, 5]} color="#a855f7" intensity={0.8} distance={20} />

                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                    <group rotation={[0, 0.1, 0]}>
                        <TibiaModel hasIssue={hasIssue} />
                        <FibulaModel hasIssue={hasIssue} />
                        {hasIssue && hotspots.length === 0 && <FractureVisualization position={[0.2, -0.5, 0.2]} />}
                        {hotspots.map((hs) => (
                            <InjuryHotspot key={hs.id} position={hs.position} label={hs.label} isActive={true} />
                        ))}
                    </group>
                </Float>

                <ContactShadows position={[0, -4.5, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" />
                <Environment preset="night" />
            </Canvas>
        </div>
    );
}
