import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { useMemo, Suspense, useRef, useEffect } from "react";
import tree1Model from "../assets/tree1.glb";
import tree2Model from "../assets/tree2.glb";
import tree3Model from "../assets/tree3.glb";

// Component to ensure Canvas renders continuously until models load
function RenderEnsurer() {
  const { invalidate, gl } = useThree();
  
  useFrame(() => {
    // Continuously invalidate to ensure rendering happens
    invalidate();
  });

  return null;
}

// Component to load and render a single tree model
function TreeModel({ modelPath, position }: { modelPath: string; position: [number, number, number] }) {
  const { scene } = useGLTF(modelPath);
  
  // Clone the scene to avoid sharing geometry between instances
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.visible = true;
    return clone;
  }, [scene]);

  return (
    <primitive object={clonedScene} position={position} scale={0.1} />
  );
}

export function Tree3D() {
  // Preload models immediately (not in useEffect to start loading ASAP)
  useGLTF.preload(tree1Model);
  useGLTF.preload(tree2Model);
  useGLTF.preload(tree3Model);

  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ 
        antialias: false, 
        alpha: true,
        powerPreference: "high-performance"
      }}
      dpr={[1, 1.5]}
      onCreated={({ gl, scene, camera }) => {
        // Force initial render
        gl.render(scene, camera);
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />

      {/* Ensure continuous rendering */}
      <RenderEnsurer />

      {/* Camera Controls - OrbitControls automatically invalidates on interaction */}
      <OrbitControls
        enableZoom={true}
        enableRotate={true}
        enablePan={true}
        minDistance={1.5}
        maxDistance={10}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />

      {/* All three trees positioned in a row with Suspense for loading */}
      <Suspense 
        fallback={
          <Html center>
            <div style={{ color: 'white', textAlign: 'center', fontSize: '1rem' }}>
              Loading trees...
            </div>
          </Html>
        }
      >
        <TreeModel modelPath={tree1Model} position={[-1.5, 0, 0]} />
        <TreeModel modelPath={tree2Model} position={[0, 0, 0]} />
        <TreeModel modelPath={tree3Model} position={[1.5, 0, 0]} />
      </Suspense>
    </Canvas>
  );
}
