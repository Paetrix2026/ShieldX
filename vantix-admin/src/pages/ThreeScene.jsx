import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/*
  ThreeScene — pixel-matched to reference image:

  Reference analysis:
  - Background: neutral concrete gray, lighter center-top
  - Cubes: dark charcoal #2a2d38, face-shaded via HemisphereLight
  - Top faces: visibly lighter (~#35383f)
  - Side faces: dark (~#151820)
  - Floating: torus ring, 4 diamonds, 2 cones, 5 small cubes
  - Glass panels: below cluster, subtle blue-steel
  - Camera: upper-right 3/4 view, ~30° elevation
*/
const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    let W = mount.clientWidth;
    let H = mount.clientHeight;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    /* ── Camera: 3/4 view, upper-right, matching reference ── */
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
    camera.position.set(11, 8, 13);
    camera.lookAt(1.0, 1.5, 0.5);

    /* ════════════════════════════════════════════
       LIGHTING — HemisphereLight simulates the
       studio HDRI environment from the reference.
       Sky = light gray-blue (reference bg color)
       Ground = dark (shadow areas below cubes)
       + one directional for face differentiation
    ════════════════════════════════════════════ */

    // Sky: neutral gray matching reference bright bg
    // Ground: dark for deep shadow on bottom faces
    const hemi = new THREE.HemisphereLight(0x8890a8, 0x141820, 2.2);
    scene.add(hemi);

    // Key: top-left directional — lights top faces bright
    const keyLight = new THREE.DirectionalLight(0xc8d0e0, 2.8);
    keyLight.position.set(-5, 12, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -12;
    scene.add(keyLight);

    // Subtle front fill — slightly reveals front faces
    const fillLight = new THREE.DirectionalLight(0x7080a0, 0.7);
    fillLight.position.set(8, 2, 14);
    scene.add(fillLight);

    /* ════════════════════════════════════════════
       MATERIALS
    ════════════════════════════════════════════ */

    // Reference cube color: dark charcoal with blue-gray tint
    // Not black — needs to be dark enough to look "almost black"
    // but bright enough for HemisphereLight to show face shading
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x252830,      // dark charcoal
      roughness: 0.65,
      metalness: 0.40,
    });

    // Slightly lighter for variety on upper cubes
    const cubeMatB = new THREE.MeshStandardMaterial({
      color: 0x2c3040,
      roughness: 0.60,
      metalness: 0.45,
    });

    // Glass panels below cluster
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x4060a0,
      roughness: 0.04,
      metalness: 0.95,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    });

    // Floating objects — darker than main cubes
    const floatMat = new THREE.MeshStandardMaterial({
      color: 0x161820,
      roughness: 0.55,
      metalness: 0.50,
    });

    /* ════════════════════════════════════════════
       CUBE CLUSTER — matching reference arrangement
       ~4×4×4 Rubik's-style with organic variations
    ════════════════════════════════════════════ */
    const clusterGroup = new THREE.Group();
    const GAP = 1.06; // small gap between cubes

    // [x, y, z] — hand-crafted from reference visual
    const layout = [
      // y=0 (bottom layer — widest)
      [0,0,0],[1,0,0],[2,0,0],[3,0,0],
      [0,0,1],[1,0,1],[2,0,1],[3,0,1],
      [0,0,2],[1,0,2],[2,0,2],[3,0,2],
      [0,0,3],[1,0,3],[2,0,3],
      [-1,0,0],[-1,0,1],
      [4,0,0],[4,0,1],
      // y=1 (mid layer)
      [0,1,0],[1,1,0],[2,1,0],[3,1,0],
      [0,1,1],[1,1,1],[2,1,1],
      [0,1,2],[1,1,2],[2,1,2],
      [0,1,3],[1,1,3],
      [-1,1,0],
      [3,1,1],
      // y=2
      [0,2,0],[1,2,0],[2,2,0],
      [0,2,1],[1,2,1],[2,2,1],
      [0,2,2],[1,2,2],
      [1,2,3],
      [3,2,0],
      [-1,2,0],
      // y=3 (top — fewest cubes)
      [0,3,0],[1,3,0],[2,3,0],
      [0,3,1],[1,3,1],
      [0,3,2],
      [1,3,0],
    ];

    layout.forEach(([x, y, z]) => {
      const mat  = (y + x + z) % 3 === 0 ? cubeMatB : cubeMat;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
      mesh.position.set(x * GAP, y * GAP, z * GAP);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      clusterGroup.add(mesh);
    });

    // Position cluster: center of screen right-half
    clusterGroup.position.set(-1.5, -1.8, -1.5);
    scene.add(clusterGroup);

    /* ════════════════════════════════════════════
       GLASS BASE PANELS
       (visible in reference as reflective slabs below cluster)
    ════════════════════════════════════════════ */
    const panel1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.06, 2.8), glassMat);
    panel1.position.set(-0.4, -2.3, 0.2);
    panel1.rotation.y = 0.15;
    panel1.receiveShadow = true;
    scene.add(panel1);

    const panel2 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 2.2), glassMat);
    panel2.position.set(1.5, -2.55, 2.0);
    panel2.rotation.y = -0.12;
    panel2.receiveShadow = true;
    scene.add(panel2);

    /* ════════════════════════════════════════════
       FLOATING OBJECTS — exactly matching reference
    ════════════════════════════════════════════ */

    // Torus ring — small, upper-center area of reference
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.085, 16, 48),
      floatMat
    );
    torus.position.set(0.5, 7.0, 2.0);
    torus.rotation.set(0.5, 0.2, 0.1);
    scene.add(torus);

    // Diamond octahedrons — 4 scattered, matching reference
    const diamondPositions = [
      { p: [ 6.5,  3.2, -1.0], r: 0.26 },
      { p: [ 5.2,  6.0,  3.5], r: 0.20 },
      { p: [-2.8,  5.5,  4.0], r: 0.18 },
      { p: [ 7.8,  1.5,  3.0], r: 0.22 },
    ];
    const dGroup = new THREE.Group();
    diamondPositions.forEach(({ p, r }) => {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(r, 0), floatMat);
      m.position.set(...p);
      m.rotation.set(0.3, 0.7, 0.2);
      m.castShadow = true;
      dGroup.add(m);
    });
    scene.add(dGroup);

    // Cones — 2 (the pyramid shapes visible in reference)
    const conePositions = [
      { p: [ 7.0,  2.5, -2.5], r: 0.24, h: 0.55 },
      { p: [-1.8, -0.8,  6.5], r: 0.19, h: 0.44 },
    ];
    const cGroup = new THREE.Group();
    conePositions.forEach(({ p, r, h }) => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 4), floatMat);
      m.position.set(...p);
      m.rotation.set(Math.PI, 0.6, 0.1);
      m.castShadow = true;
      cGroup.add(m);
    });
    scene.add(cGroup);

    // Small scattered cubes — 5
    const smallPositions = [
      { p: [ 6.2,  5.0, -2.0], s: 0.28 },
      { p: [-3.2,  4.5,  1.8], s: 0.22 },
      { p: [ 7.5,  3.0,  4.0], s: 0.26 },
      { p: [ 4.0,  7.5, -1.0], s: 0.20 },
      { p: [-2.5, -1.5,  5.5], s: 0.24 },
    ];
    const sGroup = new THREE.Group();
    smallPositions.forEach(({ p, s }, i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), floatMat);
      m.position.set(...p);
      m.rotation.set(i * 0.7, i * 1.1, i * 0.5);
      m.castShadow = true;
      sGroup.add(m);
    });
    scene.add(sGroup);

    /* ── Mouse parallax ── */
    let mX = 0, mY = 0, tX = 0, tY = 0;
    const onMouse = (e) => {
      mX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    /* ── Resize ── */
    const onResize = () => {
      W = mount.clientWidth; H = mount.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    /* ── Animation loop ── */
    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth mouse
      tX += (mX - tX) * 0.035;
      tY += (mY - tY) * 0.035;

      // Cluster: very gentle rotation + float
      clusterGroup.rotation.y = tX * 0.12 + Math.sin(t * 0.10) * 0.05;
      clusterGroup.rotation.x = tY * 0.08 + Math.cos(t * 0.12) * 0.03;
      clusterGroup.position.y = -1.8 + Math.sin(t * 0.40) * 0.14;

      // Glass panels shadow cluster
      panel1.rotation.y = 0.15 + clusterGroup.rotation.y * 0.3;
      panel1.position.y  = -2.3  + Math.sin(t * 0.40) * 0.07;
      panel2.position.y  = -2.55 + Math.sin(t * 0.40) * 0.07;

      // Torus spin
      torus.rotation.x += 0.005;
      torus.rotation.z += 0.003;
      torus.position.y = 7.0 + Math.sin(t * 0.6) * 0.25;

      // Diamonds float + tumble
      dGroup.children.forEach((m, i) => {
        m.rotation.x += 0.007;
        m.rotation.y += 0.005;
        m.position.y += Math.sin(t * 0.8 + i * 1.5) * 0.007;
      });

      // Cones spin
      cGroup.children.forEach((m, i) => {
        m.rotation.y += 0.009;
        m.position.y += Math.sin(t * 0.65 + i * 2.0) * 0.007;
      });

      // Small cubes tumble
      sGroup.children.forEach((m, i) => {
        m.rotation.x += 0.005 + i * 0.001;
        m.rotation.y += 0.007 + i * 0.0008;
        m.position.y += Math.sin(t * 0.9 + i * 1.8) * 0.006;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}
    />
  );
};

export default ThreeScene;
