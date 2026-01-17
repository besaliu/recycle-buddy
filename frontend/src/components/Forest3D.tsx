import { useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Instances, Instance, useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SeededRandom } from "../services/statsService";
// @ts-ignore
import tree1Model from "../assets/tree1.glb";
// @ts-ignore
import tree2Model from "../assets/tree2.glb";
// @ts-ignore
import tree3Model from "../assets/tree3.glb";

// Ground level constant - easily changeable
const GROUND_LEVEL = 0;

interface Forest3DProps {
    count: number;
    areaSize?: number;
}

interface TreeInstanceData {
    position: [number, number, number];
    scale: number;
    rotation: number;
    type: number;
}

export function Forest3D({ count, areaSize = 30 }: Forest3DProps) {
    return (
        <Canvas
            camera={{ position: [0, 5, 10], fov: 50 }}
            style={{ width: "100%", height: "100%" }}
            dpr={[1, 1.5]}
        >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} />
            <OrbitControls
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={20}
                maxPolarAngle={Math.PI / 2.1} // Prevent going under the ground
            />

            <Suspense fallback={null}>
                <ForestScene count={count} areaSize={areaSize} />
            </Suspense>
        </Canvas>
    );
}

function ForestScene({ count, areaSize = 25 }: Forest3DProps) {
    // Determine types and positions once
    const forestData = useMemo(() => {
        const prng = new SeededRandom("recycle-buddy-forest-v1");
        const data = [];

        for (let i = 0; i < count; i++) {
            // Tighter distribution: Reduce radius by ~25% (was / 2.5, now / 3.3) -> Increased by 10% (now / 3)
            const r = prng.range(0, areaSize / 3);
            const theta = prng.range(0, Math.PI * 2);

            const x = (r * Math.cos(theta)) + prng.range(-0.5, 0.5);
            const z = (r * Math.sin(theta)) + prng.range(-0.5, 0.5);

            const scale = prng.range(0.08, 0.12);
            const rotation = prng.range(0, Math.PI * 2);
            // Randomly select tree type 0, 1, or 2
            // We use range 0-3 and floor, or similar.
            // prng.next() is 0-1. * 3 is 0-2.99. Floor is 0, 1, 2.
            const type = Math.floor(prng.next() * 3);

            data.push({ position: [x, 0, z] as [number, number, number], scale, rotation, type });
        }
        return data;
    }, [count, areaSize]);

    // Separate data by type
    const dataByType = useMemo(() => {
        return [
            forestData.filter(d => d.type === 0),
            forestData.filter(d => d.type === 1),
            forestData.filter(d => d.type === 2)
        ];
    }, [forestData]);

    return (
        <group position={[0, GROUND_LEVEL, 0]}>
            <BakedInstances modelPath={tree1Model} data={dataByType[0]} />
            <BakedInstances modelPath={tree2Model} data={dataByType[1]} />
            <BakedInstances modelPath={tree3Model} data={dataByType[2]} />

            {/* Ground - double-sided so it's visible from below */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <circleGeometry args={[areaSize / 1.5, 32]} />
                <meshStandardMaterial color="#4ade80" transparent opacity={1} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

function BakedInstances({ modelPath, data }: { modelPath: string, data: TreeInstanceData[] }) {
    const { scene } = useGLTF(modelPath);

    // Bake geometry: flatten the scene into a list of meshes with transforms applied to geometry
    const bakedMeshes = useMemo(() => {
        const meshes: { geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[] }[] = [];

        scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                const mesh = obj as THREE.Mesh;
                // Clone geometry so we don't mutate the cached one permanently (if we did, reloading would double-transform)
                const geom = mesh.geometry.clone();
                // Apply the local transform of this mesh to the geometry vertices
                // This assumes the scene is flat or we only care about this node's direct transform relative to 'scene'
                // Ideally we'd use getWorldQuaternion etc relative to root, but simple trees usually just have local offsets.
                mesh.updateMatrix();
                geom.applyMatrix4(mesh.matrix);

                meshes.push({
                    geometry: geom,
                    material: mesh.material
                });
            }
        });
        return meshes;
    }, [scene]);

    if (!data.length) return null;

    return (
        <group>
            {bakedMeshes.map((mesh, i) => (
                <Instances
                    key={i}
                    geometry={mesh.geometry}
                    material={mesh.material}
                >
                    {data.map((d, k) => (
                        <Instance
                            key={k}
                            position={d.position}
                            scale={d.scale}
                            rotation={[0, d.rotation, 0]}
                        />
                    ))}
                </Instances>
            ))}
        </group>
    );
}

// Preload all
useGLTF.preload(tree1Model);
useGLTF.preload(tree2Model);
useGLTF.preload(tree3Model);
