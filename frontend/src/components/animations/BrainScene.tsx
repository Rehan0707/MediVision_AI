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
        canvas.width = 2048; // Higher res for perfection
        canvas.height = 2048;
        const ctx = canvas.getContext("2d")!;

        // Fill base with mid-gray
        ctx.fillStyle = "#888888";
        ctx.fillRect(0, 0, 2048, 2048);

        // Draw deep sulci
        ctx.strokeStyle = "#222222";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 0; i < 2000; i++) {
            ctx.lineWidth = 10 + Math.random() * 25;
            ctx.beginPath();
            let x = Math.random() * 2048;
            let y = Math.random() * 2048;
            ctx.moveTo(x, y);

            const segments = 8 + Math.floor(Math.random() * 15);
            for (let j = 0; j < segments; j++) {
                x += (Math.random() - 0.5) * 150;
                y += (Math.random() - 0.5) * 150;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Add highlights for gyri tops
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 800; i++) {
            ctx.lineWidth = 5 + Math.random() * 15;
            ctx.beginPath();
            let x = Math.random() * 2048;
            let y = Math.random() * 2048;
            ctx.moveTo(x, y);
            ctx.lineTo(x + 20, y + 20);
            ctx.stroke();
        }

        ctx.filter = "blur(12px)";
        ctx.drawImage(canvas, 0, 0);

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
            const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
            meshRef.current.scale.set(0.62 * s, 0.75 * s, 1.15 * s);
        }
    });

    return (
        <group position={[side * 0.52, 0.2, 0]}>
            <Sphere ref={meshRef} args={[1, 128, 128]} scale={[0.62, 0.75, 1.15]}>
                <meshPhysicalMaterial
                    color="#f8d7da"
                    roughness={0.4}
                    metalness={0.15}
                    clearcoat={0.3}
                    clearcoatRoughness={0.2}
                    transmission={0.1}
                    thickness={0.5}
                    ior={1.45}
                    bumpMap={texture}
                    bumpScale={0.3}
                    displacementMap={texture}
                    displacementScale={0.15}
                    reflectivity={0.5}
                />
            </Sphere>

            {/* Parietal/Occipital detail */}
            <Sphere args={[0.65, 64, 64]} position={[side * -0.05, -0.35, -0.25]} scale={[0.85, 1.1, 1.3]}>
                <meshPhysicalMaterial color="#f8d7da" roughness={0.4} bumpMap={texture} bumpScale={0.25} transmission={0.05} />
            </Sphere>
        </group>
    );
}

function NeuralTracts() {
    const tractsRef = useRef<THREE.Group>(null);
    const tracts = useMemo(() => {
        const t = [];
        for (let i = 0; i < 40; i++) {
            const points = [];
            const startX = (Math.random() - 0.5) * 0.5;
            const startY = (Math.random() - 0.5) * 0.5;
            const startZ = (Math.random() - 0.5) * 0.5;

            for (let j = 0; j < 10; j++) {
                points.push(new THREE.Vector3(
                    startX + Math.sin(j * 0.5 + i) * 0.8,
                    startY + (j - 5) * 0.3,
                    startZ + Math.cos(j * 0.5 + i) * 0.8
                ));
            }
            t.push(new THREE.CatmullRomCurve3(points));
        }
        return t;
    }, []);

    useFrame((state) => {
        if (tractsRef.current) {
            tractsRef.current.children.forEach((tract, i) => {
                const material = (tract as THREE.Mesh).material as THREE.MeshStandardMaterial;
                material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.5;
            });
        }
    });

    return (
        <group ref={tractsRef}>
            {tracts.map((curve, i) => (
                <mesh key={i}>
                    <tubeGeometry args={[curve, 20, 0.005, 8, false]} />
                    <meshStandardMaterial
                        color="#00D1FF"
                        transparent
                        opacity={0.3}
                        emissive="#00D1FF"
                        emissiveIntensity={1}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
}

function NeuralActivity() {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 3000; // More points for a "cloud" look

    const positions = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 2;
            const y = (Math.random() - 0.5) * 1.8;
            const z = (Math.random() - 0.5) * 2.2;
            p[i * 3] = x;
            p[i * 3 + 1] = y;
            p[i * 3 + 2] = z;
        }
        return p;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.08;
            (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
        }
    });

    return (
        <group>
            <NeuralTracts />
            <Points ref={pointsRef} positions={positions}>
                <PointMaterial
                    transparent
                    color="#00D1FF"
                    size={0.012}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
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
