/**
 * Universal Elevators - Authentic 3D Moving Elevator Engine
 * Recreates the exact clean, modern glass cabin design from the original website
 */
(function() {
  'use strict';

  function initElevator3D() {
    const container = document.querySelector('.elevator-wrapper');
    if (!container) return;

    if (typeof THREE === 'undefined') {
      setTimeout(initElevator3D, 100);
      return;
    }

    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.background = 'transparent';

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

    // Scene Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;

    // Lighting (from original bundle)
    const topLight = new THREE.DirectionalLight(0xffffff, 2.5);
    topLight.position.set(0, 10, 2);
    scene.add(topLight);

    const blueFillLight = new THREE.DirectionalLight(0x1a6fc4, 1.5);
    blueFillLight.position.set(5, 0, 5);
    scene.add(blueFillLight);

    const softFillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    softFillLight.position.set(-5, 0, 5);
    scene.add(softFillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Constants matching the original bundle
    const At = 1.6;  // cabin width
    const on = 2.2;  // cabin height
    const ln = 1.6;  // cabin depth
    const $t = 1.2;  // travel distance
    const Ka = 8.0;  // cycle time in seconds

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xd0d5dd,
      metalness: 0.75,
      roughness: 0.2
    });

    // Dark Blue base matching the brand and uploaded image
    const blueBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0d3b66,
      metalness: 0.65,
      roughness: 0.35
    });

    // Translucent glass with specular reflection
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transmission: 0.9,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      thickness: 0.1,
      side: THREE.DoubleSide
    });

    // The Cabin Group
    const cabinGroup = new THREE.Group();

    // Ceiling & Roof
    const capGeo = new THREE.BoxGeometry(At, 0.1, ln);
    const roofMesh = new THREE.Mesh(capGeo, metalMat);
    roofMesh.position.y = on / 2 + 0.05;
    cabinGroup.add(roofMesh);

    // Floor Base (Dark Royal Blue)
    const floorMesh = new THREE.Mesh(capGeo, blueBaseMat);
    floorMesh.position.y = -on / 2 - 0.05;
    cabinGroup.add(floorMesh);

    // Rear Wall
    const rearWallGeo = new THREE.BoxGeometry(At, on, 0.05);
    const rearWall = new THREE.Mesh(rearWallGeo, metalMat);
    rearWall.position.set(0, 0, -ln / 2 + 0.025);
    cabinGroup.add(rearWall);

    // Side Glass Walls
    const sideWallGeo = new THREE.BoxGeometry(0.05, on, ln - 0.05);
    const leftGlass = new THREE.Mesh(sideWallGeo, glassMat);
    leftGlass.position.set(-At / 2 + 0.025, 0, 0.025);
    cabinGroup.add(leftGlass);

    const rightGlass = new THREE.Mesh(sideWallGeo, glassMat);
    rightGlass.position.set(At / 2 - 0.025, 0, 0.025);
    cabinGroup.add(rightGlass);

    // Front Sliding Glass Doors
    const doorGeo = new THREE.BoxGeometry(At / 2 - 0.02, on, 0.05);
    const leftDoor = new THREE.Mesh(doorGeo, glassMat);
    leftDoor.position.set(-At / 4, 0, ln / 2 - 0.025);
    cabinGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(doorGeo, glassMat);
    rightDoor.position.set(At / 4, 0, ln / 2 - 0.025);
    cabinGroup.add(rightDoor);

    // Front Side Framing Pillars
    const pillarGeo = new THREE.BoxGeometry(0.04, on, 0.06);
    const leftPillar = new THREE.Mesh(pillarGeo, metalMat);
    leftPillar.position.set(-At / 2 + 0.02, 0, ln / 2 - 0.025);
    cabinGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, metalMat);
    rightPillar.position.set(At / 2 - 0.02, 0, ln / 2 - 0.025);
    cabinGroup.add(rightPillar);

    // Interior Ceiling Downlight
    const interiorLight = new THREE.PointLight(0xffffff, 0.8, 4);
    interiorLight.position.set(0, on / 2 - 0.2, 0);
    cabinGroup.add(interiorLight);

    scene.add(cabinGroup);

    // Ground Plane Shadow
    const shadowGeo = new THREE.PlaneGeometry(At * 1.5, ln * 1.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -$t - on / 2 - 0.1;
    scene.add(shadowPlane);

    // Initial 3D Rotation Angle
    let targetRotY = 0.3;
    let targetRotX = 0.0;
    cabinGroup.rotation.y = 0.3;
    shadowPlane.rotation.z = -0.3;

    // Interactive Mouse Orbit & Parallax
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
          targetRotY = 0.3 + normX * 0.25;
          targetRotX = -normY * 0.15;
        }
      }
    });

    // Touch support
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

    // Handle Resize
    function handleResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    // Clock
    const clock = new THREE.Clock();

    // Render Animation Loop matching the exact formula
    function animate() {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const progress = (elapsed % Ka) / Ka;

      let posY = 0;
      let doorOpenRatio = 0;

      if (progress < 0.35) {
        // Move upwards from bottom to top
        const ratio = progress / 0.35;
        posY = -$t + ((Math.sin(ratio * Math.PI - Math.PI / 2) + 1) / 2) * ($t * 2);
        doorOpenRatio = 0;
      } else if (progress < 0.5) {
        // Top floor: doors open and close
        posY = $t;
        const ratio = (progress - 0.35) / 0.15;
        doorOpenRatio = Math.sin(ratio * Math.PI);
      } else if (progress < 0.85) {
        // Move downwards from top to bottom
        const ratio = (progress - 0.5) / 0.35;
        posY = $t - ((Math.sin(ratio * Math.PI - Math.PI / 2) + 1) / 2) * ($t * 2);
        doorOpenRatio = 0;
      } else {
        // Bottom floor: doors open and close
        posY = -$t;
        const ratio = (progress - 0.85) / 0.15;
        doorOpenRatio = Math.sin(ratio * Math.PI);
      }

      // Smooth camera and rotation damping
      cabinGroup.rotation.y += (targetRotY - cabinGroup.rotation.y) * 0.08;
      cabinGroup.rotation.x += (targetRotX - cabinGroup.rotation.x) * 0.08;
      shadowPlane.rotation.z = -cabinGroup.rotation.y;

      // Vertical position with subtle gentle hover
      cabinGroup.position.y = posY + Math.sin(elapsed * 2) * 0.02;

      // Sliding doors animation
      const doorSlide = doorOpenRatio * (At / 2.2);
      leftDoor.position.x = -At / 4 - doorSlide;
      rightDoor.position.x = At / 4 + doorSlide;

      // Dynamic ground shadow scaling & opacity based on elevator height
      const heightNorm = Math.max(0, Math.min(1, (cabinGroup.position.y - (-$t)) / ($t * 2)));
      shadowPlane.scale.setScalar(1 + heightNorm * 0.2);
      shadowMat.opacity = 0.15 - heightNorm * 0.08;

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
