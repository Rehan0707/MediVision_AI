"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows, Environment, PerspectiveCamera, OrbitControls, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Rib({ index, side }: { index: number; side: "left" | "right" }) {
    const curve = useMemo(() => {
        const points = [];
        const isRight = side === "right";
        const factor = isRight ? 1 : -1;

        // Create a realistic rib curve
        points.push(new THREE.Vector3(0, (index - 5) * 0.45, -0.6)); // Spine connection
        points.push(new THREE.Vector3(1.6 * factor, (index - 5) * 0.45 + 0.15, 0.4)); // Side curve
        points.push(new THREE.Vector3(0.4 * factor, (index - 5) * 0.45 - 0.25, 1.4)); // Front connection

        return new THREE.CatmullRomCurve3(points);
    }, [index, side]);

    return (
        <mesh castShadow>
            <tubeGeometry args={[curve, 32, 0.11, 16, false]} />
            <meshPhysicalMaterial
                color="#fdfcf0"
                roughness={0.2}
                metalness={0.1}
                clearcoat={0.4}
                transmission={0.1}
                thickness={0.5}
            />
        </mesh>
    );
}

function Sternum() {
    return (
        <group position={[0, -0.5, 1.4]}>
            {/* Manubrium */}
            <mesh position={[0, 1.3, 0]} castShadow>
                <capsuleGeometry args={[0.25, 0.4, 8, 16]} />
                <meshPhysicalMaterial color="#fdfcf0" roughness={0.2} transmission={0.1} />
            </mesh>
            {/* Body of sternum */}
            <mesh position={[0, -0.1, 0]} castShadow>
                <capsuleGeometry args={[0.18, 1.8, 8, 16]} />
                <meshPhysicalMaterial color="#fdfcf0" roughness={0.2} transmission={0.1} />
            </mesh>
        </group>
    );
}

function RibCage({ hasIssue }: { hasIssue?: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Subtle breathing motion
            const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
            groupRef.current.scale.set(s, s, s);
        }
    });

    return (
        <group ref={groupRef}>
            <Sternum />
            {[...Array(10)].map((_, i) => (
                <group key={i}>
                    <Rib index={i} side="left" />
                    <Rib index={i} side="right" />
                </group>
            ))}

            {/* Spine (Implicit) */}
            <mesh position={[0, -0.5, -0.6]} castShadow>
                <capsuleGeometry args={[0.2, 4.5, 4, 16]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>

            {hasIssue && (
                <group position={[0.8, -0.5, 0.5]}>
                    <mesh>
                        <sphereGeometry args={[0.25, 32, 32]} />
                        <MeshDistortMaterial
                            color="#ff0000"
                            emissive="#ff0000"
                            emissiveIntensity={2}
                            distort={0.4}
                            speed={2}
                        />
                    </mesh>
                    <pointLight color="#ff0000" intensity={5} distance={3} />
                </group>
            )}
        </group>
    );
}

export default function ThoraxScene({ hasIssue = false }: { hasIssue?: boolean }) {
    return (
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden">
            <Canvas shadows gl={{ antialias: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    autoRotate
                    autoRotateSpeed={0.5}
                    minDistance={5}
                    maxDistance={12}
                />

                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 15]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
                <pointLight position={[-10, -5, -10]} color="#7000FF" intensity={1} />
                <pointLight position={[5, 10, 5]} color="#00D1FF" intensity={1.5} />

                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                    <RibCage hasIssue={hasIssue} />
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
