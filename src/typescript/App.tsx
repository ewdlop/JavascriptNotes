import * as THREE from "three";
import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import Text from "./text";
import Effects from "./effects";
import Sparks from "./sparks";
import Particles from "./particles";
import "./styles.css";

interface Mouse {
  hover: Dispatch<SetStateAction<boolean>>;
}

const Number = ({ hover }: Mouse) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = THREE.MathUtils.lerp(
        ref.current.position.x,
        state.mouse.x * 2,
        0.1
      );
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        state.mouse.y / 2,
        0.1
      );
      ref.current.rotation.y = 0.8;
    }
  });
  return (
    <Suspense fallback={null}>
      <group ref={ref}>
        <Text
          size={10}
          onClick={(e) =>
            window.open(
              "https://github.com/react-spring/react-three-fiber/blob/master/whatsnew.md",
              "_blank"
            )
          }
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}
        >
          4
        </Text>
      </group>
    </Suspense>
  );
};

const App = () => {
  const [hovered, hover] = useState(false);
  const mouse = useRef([0, 0]);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    document.body.style.cursor = hovered
      ? "pointer"
      : "url('https://raw.githubusercontent.com/chenglou/react-motion/master/demos/demo8-draggable-list/cursor.png') 39 39, auto";
  }, [hovered]);

  return (
    <Canvas
      linear
      dpr={[1, 2]}
      camera={{ fov: 100, position: [0, 0, 30] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.Uncharted2ToneMapping;
        gl.setClearColor(new THREE.Color("#020207"));
      }}
    >
      <fog attach="fog" args={["white", 50, 190]} />
      <pointLight distance={100} intensity={4} color="white" />
      <Number mouse={mouse} hover={hover} />
      <Particles count={isMobile ? 5000 : 10000} mouse={mouse} />
      <Sparks
        count={20}
        mouse={mouse}
        colors={[
          "#A2CCB6",
          "#FCEEB5",
          "#EE786E",
          "#e0feff",
          "lightpink",
          "lightblue"
        ]}
      />
      <Effects />
    </Canvas>
  );
};

export { App };
