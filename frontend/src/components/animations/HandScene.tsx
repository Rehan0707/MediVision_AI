"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows, Environment, PerspectiveCamera, OrbitControls, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

function AnatomicalBone({ length, width, position, rotation, scale = 1 }: { length: number, width: number, position: [number, number, number], rotation: [number, number, number], scale?: number }) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            <mesh castShadow>
                <capsuleGeometry args={[width, length - width * 2, 8, 16]} />
                <meshPhysicalMaterial
                    color="#fdfcf0"
                    roughness={0.2}
                    metalness={0.05}
                    clearcoat={0.5}
                    transmission={0.1}
                    thickness={0.5}
                    ior={1.5}
                />
            </mesh>
            {/* Pronounced Joints (High-detail Epiphyses) */}
            <Sphere position={[0, length / 2, 0]} args={[width * 1.45, 16, 16]} scale={[1, 0.75, 1]} castShadow>
                <meshPhysicalMaterial
                    color="#fdfcf0"
                    roughness={0.1}
                    transmission={0.2}
                    thickness={0.2}
                    emissive="#00D1FF"
                    emissiveIntensity={0.05}
                />
            </Sphere>
            <Sphere position={[0, -length / 2, 0]} args={[width * 1.45, 16, 16]} scale={[1, 0.75, 1]} castShadow>
                <meshPhysicalMaterial
                    color="#fdfcf0"
                    roughness={0.1}
                    transmission={0.2}
                    thickness={0.2}
                    emissive="#00D1FF"
                    emissiveIntensity={0.05}
                />
            </Sphere>
        </group>
    );
}

function Finger({ position, rotation, scale = 1, isThumb = false }: { position: [number, number, number], rotation: [number, number, number], scale?: number, isThumb?: boolean }) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            <AnatomicalBone length={1.2} width={0.1} position={[0, 0, 0]} rotation={[0, 0, 0]} />

            <group position={[0, 0.7, 0]} rotation={[0.1, 0, 0]}>
                <AnatomicalBone length={0.8} width={0.08} position={[0, 0.4, 0]} rotation={[0, 0, 0]} />

                {!isThumb && (
                    <group position={[0, 0.8, 0]} rotation={[0.15, 0, 0]}>
                        <AnatomicalBone length={0.6} width={0.07} position={[0, 0.3, 0]} rotation={[0, 0, 0]} />
                        <group position={[0, 0.6, 0]} rotation={[0.2, 0, 0]}>
                            <AnatomicalBone length={0.4} width={0.06} position={[0, 0.2, 0]} rotation={[0, 0, 0]} />
                        </group>
                    </group>
                )}

                {isThumb && (
                    <group position={[0, 0.8, 0]} rotation={[0.2, 0, 0]}>
                        <AnatomicalBone length={0.5} width={0.07} position={[0, 0.25, 0]} rotation={[0, 0, 0]} />
                    </group>
                )}
            </group>
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

function HandModel({ hasIssue, hotspots = [] }: { hasIssue?: boolean, hotspots?: { id: string, position: [number, number, number], label: string }[] }) {
    return (
        <group rotation={[-Math.PI / 3, 0, 0]} position={[0, -1, 0]}>
            <group position={[0, -0.8, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[1.2, 0.6, 0.4]} />
                    <meshStandardMaterial color="#fffcf5" roughness={0.5} />
                </mesh>
            </group>

            <Finger position={[-0.45, 0, 0]} rotation={[0, 0, 0.15]} scale={0.85} />
            <Finger position={[-0.15, 0.2, 0]} rotation={[0, 0, 0.05]} scale={1.0} />
            <Finger position={[0.15, 0.2, 0]} rotation={[0, 0, -0.05]} scale={0.95} />
            <Finger position={[0.45, 0, 0]} rotation={[0, 0, -0.15]} scale={0.8} />
            <Finger position={[0.65, -0.4, 0]} rotation={[0, 0.4, -0.8]} scale={0.9} isThumb />

            {hasIssue && hotspots.length === 0 && (
                <group position={[-0.2, 1.8, 0.2]}>
                    <Sphere args={[0.25, 32, 32]}>
                        <MeshDistortMaterial
                            color="#ff0000"
                            emissive="#ff0000"
                            emissiveIntensity={2}
                            distort={0.4}
                            speed={2}
                        />
                    </Sphere>
                    <pointLight color="#ff0000" intensity={5} distance={3} />
                </group>
            )}

            {hotspots.map((hs) => (
                <InjuryHotspot key={hs.id} position={hs.position} label={hs.label} isActive={true} />
            ))}

            <Sphere scale={[1.8, 3, 0.8]} position={[0, 0.5, 0]} args={[1, 64, 64]}>
                <meshStandardMaterial
                    color="#00D1FF"
                    transparent
                    opacity={0.05}
                    roughness={0}
                    metalness={1}
                />
            </Sphere>
        </group>
    );
}

export default function HandScene({ hasIssue = false, hotspots = [] }: { hasIssue?: boolean, hotspots?: { id: string, position: [number, number, number], label: string }[] }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return (
        <div className="w-full h-full bg-[#020617]/50 rounded-[2.5rem] flex items-center justify-center">
            <div className="text-[#00D1FF] text-[8px] font-black uppercase tracking-[0.4em] animate-pulse">Loading 3D...</div>
        </div>
    );

    return (
        <div className="w-full h-full min-h-[400px] rounded-[2.5rem] overflow-hidden bg-[#020617]/50">
            <Canvas shadows gl={{ antialias: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={35} />
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    autoRotate
                    autoRotateSpeed={0.5}
                    minDistance={4}
                    maxDistance={10}
                />

                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 15]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
                <pointLight position={[-10, -5, -10]} color="#7000FF" intensity={1} />
                <pointLight position={[5, 10, 5]} color="#00D1FF" intensity={1.5} />

                <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
                    <HandModel hasIssue={hasIssue} hotspots={hotspots} />
                </Float>

                <ContactShadows
                    position={[0, -3.5, 0]}
                    opacity={0.4}
                    scale={15}
                    blur={3}
                    far={4.5}
                    color="#000000"
                />
                <Environment preset="night" />
            </Canvas>
        </div>
    );
}
