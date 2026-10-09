/**
 * Universal Elevators - Clean Realistic 3D Moving Elevator Engine
 *
 * Requirements:
 * 1. Clean 3D elevator cabin in modern light architectural style.
 * 2. Unwanted visual elements removed:
 *    - No distracting horizontal lines, extra side borders or rails
 *    - No small square boxes along the sides
 *    - No text and instructions at the bottom ("Drag to rotate", "Doors open & close automatically")
 *    - No unnecessary controls, overlays, labels, or distracting overlays
 * 3. Pure, realistic elevator cabin:
 *    - Elevator doors open slowly, remain open for a moment, and close smoothly
 *    - After closing, the lift moves vertically (up/down) between floors smoothly
 *    - Continuous loop with natural easing
 *    - 3D drag-to-rotate and touch interaction preserved on the canvas
 * 4. Responsive for desktop, tablet, and mobile screens.
 */

(function() {
  'use strict';

  function initElevator3D() {
    const container = document.querySelector('.elevator-wrapper');
    if (!container) return;

    if (typeof THREE === 'undefined') {
      setTimeout(initElevator3D, 80);
      return;
    }

    // Clean container - remove any old overlays or elements
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.borderRadius = '1.25rem';
    container.style.width = '100%';
    container.style.height = '520px';
    container.style.minHeight = '480px';
    container.style.background = 'radial-gradient(ellipse at 50% 25%, #ffffff 0%, #f1f5f9 65%, #e2e8f0 100%)';
    container.style.boxShadow = '0 20px 45px -10px rgba(15, 23, 42, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)';
    container.style.border = '1px solid rgba(226, 232, 240, 0.8)';

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.outline = 'none';
    canvas.style.cursor = 'grab';
    container.appendChild(canvas);

    // Three.js Scene Setup
    const scene = new THREE.Scene();

    const w = container.clientWidth || 440;
    const h = container.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    const defaultCamPos = { x: 0, y: 0.1, z: 6.8 };
    camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    if (renderer.toneMapping !== undefined) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping || 3;
      renderer.toneMappingExposure = 1.1;
    }

    // Modern Architectural Lighting Setup
    const topLight = new THREE.DirectionalLight(0xffffff, 2.5);
    topLight.position.set(0, 10, 3);
    scene.add(topLight);

    const blueFill = new THREE.DirectionalLight(0x1a6fc4, 1.8);
    blueFill.position.set(5, 2, 5);
    scene.add(blueFill);

    const softFill = new THREE.DirectionalLight(0xffffff, 1.0);
    softFill.position.set(-5, 0, 4);
    scene.add(softFill);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambLight);

    // Dimension Constants for Cabin (matching the exact supplied image)
    const At = 1.6;  // width
    const on = 2.2;  // height
    const ln = 1.6;  // depth
    const travelRange = 1.25; // vertical travel range
    const cyclePeriod = 10.0; // full cycle loop (10s)

    // Cabin Materials
    // 1. Metallic Silver Canopy Roof & Accent Frame
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xd0d5dd,
      metalness: 0.8,
      roughness: 0.2
    });

    // 2. Dark Royal Blue Base (exact color from supplied elevator cabin)
    const darkBlueBaseMat = new THREE.MeshStandardMaterial({
      color: 0x003366,
      metalness: 0.7,
      roughness: 0.3
    });

    // 3. Clear Translucent Glass Walls & Sliding Doors
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transmission: 0.92,
      opacity: 0.9,
      transparent: true,
      roughness: 0.08,
      metalness: 0.1,
      ior: 1.5,
      thickness: 0.1,
      side: THREE.DoubleSide
    });

    // 4. Interior Wall Panel (Brushed stainless steel)
    const interiorWallMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.6,
      roughness: 0.3
    });

    // Elevator Cabin Group
    const cabinGroup = new THREE.Group();

    // 1. Ceiling Canopy (Silver)
    const capGeo = new THREE.BoxGeometry(At, 0.1, ln);
    const roofMesh = new THREE.Mesh(capGeo, silverMat);
    roofMesh.position.y = on / 2 + 0.05;
    cabinGroup.add(roofMesh);

    // 2. Floor Base (Dark Royal Blue)
    const floorMesh = new THREE.Mesh(capGeo, darkBlueBaseMat);
    floorMesh.position.y = -on / 2 - 0.05;
    cabinGroup.add(floorMesh);

    // 3. Rear Wall (Solid with stainless mirror finish)
    const rearWallGeo = new THREE.BoxGeometry(At, on, 0.05);
    const rearWall = new THREE.Mesh(rearWallGeo, interiorWallMat);
    rearWall.position.set(0, 0, -ln / 2 + 0.025);
    cabinGroup.add(rearWall);

    // 4. Side Glass Panoramic Panels
    const sideWallGeo = new THREE.BoxGeometry(0.05, on, ln - 0.05);
    const leftGlass = new THREE.Mesh(sideWallGeo, glassMat);
    leftGlass.position.set(-At / 2 + 0.025, 0, 0.025);
    cabinGroup.add(leftGlass);

    const rightGlass = new THREE.Mesh(sideWallGeo, glassMat);
    rightGlass.position.set(At / 2 - 0.025, 0, 0.025);
    cabinGroup.add(rightGlass);

    // 5. Front Sliding Glass Doors (Left & Right)
    const doorGeo = new THREE.BoxGeometry(At / 2 - 0.02, on, 0.05);
    const leftDoor = new THREE.Mesh(doorGeo, glassMat);
    leftDoor.position.set(-At / 4, 0, ln / 2 - 0.025);
    cabinGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(doorGeo, glassMat);
    rightDoor.position.set(At / 4, 0, ln / 2 - 0.025);
    cabinGroup.add(rightDoor);

    // Door edge stainless steel frame borders
    const doorEdgeGeo = new THREE.BoxGeometry(0.03, on, 0.055);
    const leftDoorEdge = new THREE.Mesh(doorEdgeGeo, silverMat);
    leftDoorEdge.position.set(At / 4 - 0.02, 0, 0);
    leftDoor.add(leftDoorEdge);

    const rightDoorEdge = new THREE.Mesh(doorEdgeGeo, silverMat);
    rightDoorEdge.position.set(-At / 4 + 0.02, 0, 0);
    rightDoor.add(rightDoorEdge);

    // 6. Corner Framing Columns
    const pillarGeo = new THREE.BoxGeometry(0.04, on, 0.06);
    const leftPillar = new THREE.Mesh(pillarGeo, silverMat);
    leftPillar.position.set(-At / 2 + 0.02, 0, ln / 2 - 0.025);
    cabinGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, silverMat);
    rightPillar.position.set(At / 2 - 0.02, 0, ln / 2 - 0.025);
    cabinGroup.add(rightPillar);

    // 7. Interior Downlight Fixture
    const interiorLight = new THREE.PointLight(0xffffff, 1.2, 4.5);
    interiorLight.position.set(0, on / 2 - 0.15, 0);
    cabinGroup.add(interiorLight);

    const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(0, on / 2 - 0.01, 0);
    cabinGroup.add(lensMesh);

    scene.add(cabinGroup);

    // 8. Ground Shadow Plane with dynamic opacity & scaling
    const shadowGeo = new THREE.PlaneGeometry(At * 1.5, ln * 1.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -travelRange - on / 2 - 0.1;
    scene.add(shadowPlane);

    // Initial 3D Rotation (isometric angle matching user's image)
    let targetRotY = 0.32;
    let targetRotX = 0.0;
    cabinGroup.rotation.y = 0.32;
    shadowPlane.rotation.z = -0.32;

    // Interactive Drag to Rotate & Mouse Parallax
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        targetRotY += deltaX * 0.008;
        targetRotX += deltaY * 0.008;
        targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX));
      } else {
        const rect = container.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          targetRotY = 0.32 + normX * 0.22;
          targetRotX = -normY * 0.12;
        }
      }
    });

    // Touch Interaction
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;

        targetRotY += deltaX * 0.01;
        targetRotX += deltaY * 0.01;
        targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX));
      }
    }, { passive: true });

    // Handle Window Resize & Observer
    function handleResize() {
      if (!container) return;
      const nw = container.clientWidth || 400;
      const nh = container.clientHeight || 500;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', handleResize);
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(handleResize);
      ro.observe(container);
    }

    const clock = new THREE.Clock();

    // Smooth Continuous Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const progress = (elapsed % cyclePeriod) / cyclePeriod;

      let posY = 0;
      let doorOpenRatio = 0;

      /**
       * Realistic Elevator Motion Sequence:
       * 1. 0.00 -> 0.35: Elevator moves smoothly downward from Floor 3 to Ground Floor. Doors closed.
       * 2. 0.35 -> 0.50: Elevator stops at Ground Floor. Doors slide open slowly, hold open to reveal interior, then close smoothly.
       * 3. 0.50 -> 0.85: Elevator moves smoothly upward from Ground Floor to Floor 3. Doors closed.
       * 4. 0.85 -> 1.00: Elevator stops at Floor 3. Doors slide open slowly, hold open to reveal interior, then close smoothly.
       * 5. Continuous repeating loop.
       */
      if (progress < 0.35) {
        // Descending smoothly
        const ratio = progress / 0.35;
        posY = travelRange - ((1 - Math.cos(ratio * Math.PI)) / 2) * (travelRange * 2);
        doorOpenRatio = 0;
      } else if (progress < 0.50) {
        // At Ground Floor: doors open slowly -> remain open -> close smoothly
        posY = -travelRange;
        const ratio = (progress - 0.35) / 0.15; // 0 to 1 over 1.5 seconds

        // Open doors in first 35%, hold for 30%, close in remaining 35%
        if (ratio < 0.35) {
          doorOpenRatio = Math.sin((ratio / 0.35) * (Math.PI / 2));
        } else if (ratio < 0.65) {
          doorOpenRatio = 1.0; // held open
        } else {
          doorOpenRatio = Math.cos(((ratio - 0.65) / 0.35) * (Math.PI / 2));
        }
      } else if (progress < 0.85) {
        // Ascending smoothly
        const ratio = (progress - 0.50) / 0.35;
        posY = -travelRange + ((1 - Math.cos(ratio * Math.PI)) / 2) * (travelRange * 2);
        doorOpenRatio = 0;
      } else {
        // At Top Floor: doors open slowly -> remain open -> close smoothly
        posY = travelRange;
        const ratio = (progress - 0.85) / 0.15; // 0 to 1 over 1.5 seconds

        if (ratio < 0.35) {
          doorOpenRatio = Math.sin((ratio / 0.35) * (Math.PI / 2));
        } else if (ratio < 0.65) {
          doorOpenRatio = 1.0; // held open
        } else {
          doorOpenRatio = Math.cos(((ratio - 0.65) / 0.35) * (Math.PI / 2));
        }
      }

      // Smooth camera/cabin angle damping
      cabinGroup.rotation.y += (targetRotY - cabinGroup.rotation.y) * 0.08;
      cabinGroup.rotation.x += (targetRotX - cabinGroup.rotation.x) * 0.08;
      shadowPlane.rotation.z = -cabinGroup.rotation.y;

      // Apply vertical position with subtle float
      cabinGroup.position.y = posY + Math.sin(elapsed * 2) * 0.015;

      // Sliding doors outward smoothly (At / 2.25 max slide)
      const doorSlide = doorOpenRatio * (At / 2.25);
      leftDoor.position.x = -At / 4 - doorSlide;
      rightDoor.position.x = At / 4 + doorSlide;

      // Dynamic ground shadow scaling & opacity based on cabin elevation
      const heightNorm = Math.max(0, Math.min(1, (cabinGroup.position.y - (-travelRange)) / (travelRange * 2)));
      shadowPlane.scale.setScalar(1 + heightNorm * 0.25);
      shadowMat.opacity = 0.18 - heightNorm * 0.08;

      renderer.render(scene, camera);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElevator3D);
  } else {
    initElevator3D();
  }
})();
