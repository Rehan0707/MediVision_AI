"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float, ContactShadows, Environment, PerspectiveCamera, OrbitControls, Points, PointMaterial, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

// Helper to generate a procedural "brain fold" noise texture
function useBrainTexture() {
    return useMemo(() => {
        if (typeof window === "undefined") return null;
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d")!;

        // Fill base with mid-gray (neutral displacement)
        ctx.fillStyle = "#777777";
        ctx.fillRect(0, 0, 1024, 1024);

        // Draw sulci (dark deep folds)
        ctx.strokeStyle = "#111111"; // Deep dark for valleys
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 0; i < 1500; i++) {
            ctx.lineWidth = 15 + Math.random() * 20;
            ctx.beginPath();
            let x = Math.random() * 1024;
            let y = Math.random() * 1024;
            ctx.moveTo(x, y);

            // Draw squiggly "worm" paths
            const segments = 5 + Math.floor(Math.random() * 10);
            for (let j = 0; j < segments; j++) {
                x += (Math.random() - 0.5) * 100;
                y += (Math.random() - 0.5) * 100;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Blur a bit for organic softness
        ctx.filter = "blur(8px)";
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }, []);
}

const fallbackTexture = typeof window !== 'undefined' ? new THREE.Texture() : null;

function BrainHemisphere({ side = 1, texture }: { side: number, texture: THREE.Texture }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Very subtle organic breathing
            const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
            meshRef.current.scale.set(0.6 * s, 0.7 * s, 1.1 * s);
        }
    });

    return (
        <group position={[side * 0.48, 0.2, 0]}>
            <Sphere ref={meshRef} args={[1, 128, 128]} scale={[0.6, 0.7, 1.1]}>
                <meshStandardMaterial
                    color="#e2b4bd"
                    roughness={0.5}
                    metalness={0.0}
                    bumpMap={texture}
                    bumpScale={0.25}
                    displacementMap={texture}
                    displacementScale={0.12}
                    emissive="#d4a373"
                    emissiveIntensity={0.05}
                />
            </Sphere>

            {/* Parietal/Occipital detail */}
            <Sphere args={[0.6, 64, 64]} position={[0, -0.3, -0.2]} scale={[0.8, 1.0, 1.2]}>
                <meshStandardMaterial color="#e2b4bd" bumpMap={texture} bumpScale={0.2} />
            </Sphere>

            {/* Temporal lobe detail */}
            <Sphere args={[0.5, 64, 64]} position={[0.2 * side, 0.1, -0.5]} scale={[0.7, 0.8, 0.9]}>
                <meshStandardMaterial color="#e2b4bd" bumpMap={texture} bumpScale={0.15} />
            </Sphere>
        </group>
    );
}

function NeuralActivity() {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 1500;

    const positions = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Constraint within brain-ish shape
            const x = (Math.random() - 0.5) * 1.8;
            const y = (Math.random() - 0.5) * 1.5;
            const z = (Math.random() - 0.5) * 2;
            p[i * 3] = x;
            p[i * 3 + 1] = y;
            p[i * 3 + 2] = z;
        }
        return p;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
            // Pulsing synapse brightness
            (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
        }
    });

    return (
        <Points ref={pointsRef} positions={positions}>
            <PointMaterial
                transparent
                color="#00D1FF"
                size={0.015}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

function BrainCore({ hasIssue }: { hasIssue?: boolean }) {
    const texture = useBrainTexture() || (fallbackTexture as THREE.Texture);
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <BrainHemisphere side={-1} texture={texture} />
            <BrainHemisphere side={1} texture={texture} />

            {/* Cerebellum */}
            <group position={[0, -0.5, -0.8]}>
                <Sphere args={[0.4, 64, 64]} position={[-0.3, 0, 0]} scale={[1, 0.7, 0.7]}>
                    <meshStandardMaterial color="#d8e2dc" bumpMap={texture} bumpScale={0.05} />
                </Sphere>
                <Sphere args={[0.4, 64, 64]} position={[0.3, 0, 0]} scale={[1, 0.7, 0.7]}>
                    <meshStandardMaterial color="#d8e2dc" bumpMap={texture} bumpScale={0.05} />
                </Sphere>
            </group>

            {/* Brainstem */}
            <mesh position={[0, -1.1, -0.3]} rotation={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.1, 1.2, 32]} />
                <meshStandardMaterial color="#f0efeb" roughness={0.6} />
            </mesh>

            {/* Inner Glowing Heatmap */}
            <NeuralActivity />

            {/* Pathological Hotspot */}
            {hasIssue && (
                <group position={[0.6, 0.6, -0.2]}>
                    <Sphere args={[0.4, 32, 32]} scale={[0.8, 0.8, 0.8]}>
                        <meshBasicMaterial color="#ff0000" transparent opacity={0.6} />
                    </Sphere>
                    <pointLight color="#ff0000" intensity={15} distance={3} />
                    <MeshWobbleMaterial
                        attach="material"
                        color="#ff1a1a"
                        factor={0.4}
                        speed={3}
                        transparent
                        opacity={0.3}
                    />
                </group>
            )}

            {/* Global SSS Glow Effect */}
            <Sphere args={[1.5, 32, 32]} scale={[0.8, 0.8, 1]}>
                <meshBasicMaterial color="#ffb5a7" transparent opacity={0.03} side={THREE.BackSide} />
            </Sphere>
        </group>
    );
}

export default function BrainScene({ hasIssue = false }: { hasIssue?: boolean }) {
    return (
        <div className="w-full h-full bg-[#020617]/80 rounded-[2rem] overflow-hidden">
            <Canvas shadows gl={{ antialias: true, logarithmicDepthBuffer: true }}>
                <PerspectiveCamera makeDefault position={[0, 1.5, 6]} fov={30} />
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />

                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />
                <pointLight position={[-8, 5, -5]} color="#ffb5a7" intensity={1} />
                <pointLight position={[5, -5, 5]} color="#00D1FF" intensity={0.5} />

                {/* Cinema Rim Lighting */}
                <pointLight position={[0, 0, -5]} color="#7000FF" intensity={1.5} />
                <pointLight position={[0, 5, 0]} color="#ffffff" intensity={0.5} />

                <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
                    <BrainCore hasIssue={hasIssue} />
                </Float>

                <ContactShadows position={[0, -2.2, 0]} opacity={0.3} scale={10} blur={3} far={4} color="#000000" />
                <Environment preset="night" />
            </Canvas>
        </div>
    );
}
