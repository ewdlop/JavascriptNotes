import * as THREE from "three";
import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";

const baubleMaterial = new THREE.MeshLambertMaterial({
  color: "#c0a090",
  emissive: "red"
});

export const App = () => (
  <Canvas
    shadows
    dpr={1.5}
    gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
    camera={{ position: [0, 0, 20], fov: 35, near: 10, far: 40 }}
    onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
  >
    <ambientLight intensity={0.75} />
    <spotLight
      position={[20, 20, 25]}
      penumbra={1}
      angle={0.2}
      color="white"
      castShadow
      shadow-mapSize={[512, 512]}
    />
    <directionalLight position={[0, 5, -4]} intensity={4} />
    <directionalLight position={[0, -15, -0]} intensity={4} color="red" />
  </Canvas>
);
