import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import boardUrl from "../../meshes/board.gltf";

const GameScene: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a scene
    const scene = new THREE.Scene();
    // Add a light
    const light = new THREE.HemisphereLight();
    scene.add(light);

    // Create a camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 30;
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, sceneRef.current!);
    controls.update();

    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.current?.appendChild(renderer.domElement);

    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load(boardUrl, (gltf) => {
      scene.add(gltf.scene);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      sceneRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={sceneRef} />;
};

export default GameScene;
