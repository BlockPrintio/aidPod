import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const DNASimulation = ({ height = '500px' }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const dnaRef = useRef(null);
  const holderRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 35;

    // Colors
    const cylinderColor = 0x346dcc; // Primary blue
    const ballColor = 0x1f7d70;    // Secondary teal

    // Geometries
    const tubeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 10, 32);
    const ballGeometry = new THREE.SphereGeometry(1.1, 32, 32);

    // Materials
    const cylinderMaterial = new THREE.MeshStandardMaterial({
      color: cylinderColor,
      metalness: 0.6,
      roughness: 0.3,
      emissive: cylinderColor,
      emissiveIntensity: 0.3,
    });

    const ballMaterial = new THREE.MeshStandardMaterial({
      color: ballColor,
      metalness: 0.6,
      roughness: 0.3,
      emissive: ballColor,
      emissiveIntensity: 0.3,
    });

    // DNA structure
    const dna = new THREE.Object3D();
    const holder = new THREE.Object3D();

    for (let i = 0; i <= 20; i++) {
      const cylinder = new THREE.Mesh(tubeGeometry, cylinderMaterial);
      cylinder.rotation.z = (90 * Math.PI) / 180;
      cylinder.position.x = 0;

      const ballRight = new THREE.Mesh(ballGeometry, ballMaterial);
      ballRight.position.x = 6;

      const ballLeft = new THREE.Mesh(ballGeometry, ballMaterial);
      ballLeft.position.x = -5;

      const row = new THREE.Object3D();
      row.add(cylinder);
      row.add(ballRight);
      row.add(ballLeft);

      row.position.y = i * 2;
      row.rotation.y = ((30 * i * Math.PI) / 180);

      dna.add(row);
    }

    dna.position.y = -20;
    dnaRef.current = dna;
    holder.add(dna);
    holderRef.current = holder;
    scene.add(holder);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x346dcc, 0.8, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x1f7d70, 0.6, 100);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (holderRef.current) {
        holderRef.current.rotation.x += 0.001;
        holderRef.current.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      tubeGeometry.dispose();
      ballGeometry.dispose();
      cylinderMaterial.dispose();
      ballMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: height,
        borderRadius: '1rem',
        overflow: 'hidden',
      }}
    />
  );
};

export default DNASimulation;

