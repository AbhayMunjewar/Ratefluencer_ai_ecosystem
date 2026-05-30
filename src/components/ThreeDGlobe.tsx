"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeDGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050816, 0.0015);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 250;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x7b61ff, 2, 300);
    pointLight1.position.set(100, 100, 100);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00d4ff, 1.5, 300);
    pointLight2.position.set(-100, -100, 50);
    scene.add(pointLight2);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Globe Sphere Geometry
    const radius = 65;
    const segments = 40;
    const globeGeometry = new THREE.SphereGeometry(radius, segments, segments);

    // Material with transparent wireframe
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0x7b61ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    // Inner glowing sphere
    const innerGeometry = new THREE.SphereGeometry(radius - 1, segments, segments);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x0b1020,
      transparent: true,
      opacity: 0.4,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    globeGroup.add(innerMesh);

    // Outer glow ring
    const ringGeo = new THREE.RingGeometry(radius + 2, radius + 2.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    globeGroup.add(ringMesh);

    // Starfield (Particle system)
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 600;
    const starPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      // Position particles in a spherical shell around the globe
      const r = radius + 30 + Math.random() * 120;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      starPositions[i] = r * Math.sin(theta) * Math.cos(phi);
      starPositions[i + 1] = r * Math.sin(theta) * Math.sin(phi);
      starPositions[i + 2] = r * Math.cos(theta);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });

    const starParticles = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starParticles);

    // Influencer Nodes (Spheres with custom attributes)
    const categories = [
      { name: "Fitness", color: 0x00ffa3, coords: [0.3, 0.8, 0.5] },
      { name: "Tech", color: 0x00d4ff, coords: [-0.6, 0.4, 0.7] },
      { name: "Lifestyle", color: 0x8b5cf6, coords: [0.7, -0.3, 0.6] },
      { name: "Gaming", color: 0xff5e5e, coords: [-0.2, -0.8, 0.5] },
      { name: "Fashion", color: 0xffb800, coords: [0.5, 0.2, -0.85] },
    ];

    const nodeGroup = new THREE.Group();
    globeGroup.add(nodeGroup);

    const nodes: THREE.Mesh[] = [];

    categories.forEach((cat) => {
      // Calculate 3D sphere coordinate
      const nodeGeo = new THREE.SphereGeometry(3, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: cat.color,
        transparent: true,
        opacity: 0.9,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);

      // Spherical positioning
      const [x, y, z] = cat.coords;
      const vec = new THREE.Vector3(x, y, z).normalize().multiplyScalar(radius);
      nodeMesh.position.copy(vec);
      nodeGroup.add(nodeMesh);
      nodes.push(nodeMesh);

      // Create orbital glow
      const glowGeo = new THREE.SphereGeometry(6, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: cat.color,
        transparent: true,
        opacity: 0.25,
        wireframe: true,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.copy(vec);
      nodeGroup.add(glowMesh);
    });

    // Create lines connecting nodes
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x7b61ff,
      transparent: true,
      opacity: 0.35,
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const points = [];
        const p1 = nodes[i].position;
        const p2 = nodes[j].position;

        // Draw an arc between nodes instead of straight line
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        midPoint.normalize().multiplyScalar(radius + 15); // Push arc outwards

        // Generate quadratic bezier path
        const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
        const curvePoints = curve.getPoints(20);

        const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const line = new THREE.Line(lineGeo, lineMat);
        nodeGroup.add(line);
      }
    }

    // Interactive mouse controls (Simple mouse follow)
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mouseX = (x / width) * 2 - 1;
      mouseY = -(y / height) * 2 + 1;

      targetRotationX = mouseX * 0.3;
      targetRotationY = mouseY * 0.3;
    };

    container.addEventListener("mousemove", onMouseMove);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate globe slowly
      globeGroup.rotation.y += 0.003;
      globeGroup.rotation.x += 0.001;

      // Mouse interactive tilt
      globeGroup.rotation.y += (targetRotationX - globeGroup.rotation.y) * 0.05;
      globeGroup.rotation.x += (targetRotationY - globeGroup.rotation.x) * 0.05;

      // Pulse node scales slightly
      const time = Date.now() * 0.003;
      nodeGroup.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
          const scale = 1 + Math.sin(time + index) * 0.08;
          child.scale.set(scale, scale, scale);
        }
      });

      // Rotate star particles
      starParticles.rotation.y -= 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px]">
      {/* 3D WebGL Canvas Target */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Categories Glowing Overlays */}
      <div className="absolute top-[10%] left-[25%] pointer-events-none animate-float" style={{ animationDelay: "0.2s" }}>
        <div className="px-3 py-1.5 rounded-full glass-panel border-secondary-green/20 text-xs font-medium text-secondary-green flex items-center gap-1.5 shadow-lg shadow-secondary-green/5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-green animate-pulse" />
          Fitness
        </div>
      </div>
      <div className="absolute top-[35%] left-[10%] pointer-events-none animate-float" style={{ animationDelay: "1.2s" }}>
        <div className="px-3 py-1.5 rounded-full glass-panel border-primary-indigo/20 text-xs font-medium text-primary-indigo flex items-center gap-1.5 shadow-lg shadow-primary-indigo/5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-indigo animate-pulse" />
          Gaming
        </div>
      </div>
      <div className="absolute top-[20%] right-[15%] pointer-events-none animate-float" style={{ animationDelay: "0.8s" }}>
        <div className="px-3 py-1.5 rounded-full glass-panel border-secondary-cyan/20 text-xs font-medium text-secondary-cyan flex items-center gap-1.5 shadow-lg shadow-secondary-cyan/5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-cyan animate-pulse" />
          Tech
        </div>
      </div>
      <div className="absolute bottom-[25%] right-[20%] pointer-events-none animate-float" style={{ animationDelay: "1.5s" }}>
        <div className="px-3 py-1.5 rounded-full glass-panel border-primary-violet/20 text-xs font-medium text-primary-violet flex items-center gap-1.5 shadow-lg shadow-primary-violet/5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-violet animate-pulse" />
          Lifestyle
        </div>
      </div>
      <div className="absolute bottom-[20%] left-[20%] pointer-events-none animate-float" style={{ animationDelay: "2.1s" }}>
        <div className="px-3 py-1.5 rounded-full glass-panel border-accent-gold/20 text-xs font-medium text-accent-gold flex items-center gap-1.5 shadow-lg shadow-accent-gold/5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
          Fashion
        </div>
      </div>
    </div>
  );
}
