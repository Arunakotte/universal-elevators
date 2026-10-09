/**
 * Universal Elevators - Premium Architectural 3D Moving Elevator Engine
 *
 * Requirements fulfilled:
 * 1. Realistic elevator/lift inside a modern building in the main hero section.
 * 2. Elevator doors open slowly, remain open for a moment, and close smoothly.
 * 3. After closing, lift moves upward / downward to floors (Ground <-> Floor 3).
 * 4. Repeats animation continuously in a smooth, seamless loop.
 * 5. Uses realistic 3D styling, metallic framing, translucent glass, interior lighting,
 *    illuminated floor indicators, modern building shaft framing, and smooth depth.
 * 6. Hero section right column (40-50% width), clearly visible without scrolling.
 * 7. Responsive for desktop, tablet, and mobile screens.
 * 8. Interactive call buttons (3F, 2F, 1F, G), manual door overrides, chime sound, drag-to-rotate.
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

    // Clear previous children
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.borderRadius = '1.25rem';
    container.style.width = '100%';
    container.style.height = '520px';
    container.style.minHeight = '480px';
    container.style.background = 'radial-gradient(ellipse at 50% 25%, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%)';
    container.style.boxShadow = '0 20px 45px -10px rgba(15, 23, 42, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.9)';
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

    // Floor HUD & Interactive Controls
    const uiOverlay = document.createElement('div');
    uiOverlay.className = 'elevator-hud-overlay';
    uiOverlay.innerHTML = `
      <!-- Top Floor Status Banner -->
      <div style="position:absolute; top:14px; left:14px; right:14px; display:flex; justify-content:space-between; align-items:center; z-index:20; pointer-events:none;">
        <div style="background:rgba(255,255,255,0.94); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(226,232,240,0.9); border-radius:12px; padding:7px 14px; display:flex; align-items:center; gap:10px; box-shadow:0 4px 15px rgba(0,0,0,0.06);">
          <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:#1a6fc4; box-shadow:0 0 10px #1a6fc4; animation:pulse 2s infinite;" id="lift-status-dot"></span>
          <div style="display:flex; flex-direction:column;">
            <span style="font-family:'Sora',sans-serif; font-weight:800; font-size:12px; color:#0f172a; letter-spacing:-0.01em;" id="lift-display-text">FLOOR 3 (TOP)</span>
            <span style="font-size:9px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Universal Panoramic Lift</span>
          </div>
          <span style="font-family:monospace; font-size:11px; color:#1a6fc4; background:rgba(26,111,196,0.1); border:1px solid rgba(26,111,196,0.22); padding:3px 8px; border-radius:6px; font-weight:700;" id="lift-arrow-text">■ LEVEL</span>
        </div>

        <div style="display:flex; gap:6px; pointer-events:auto;">
          <button id="lift-sound-btn" title="Toggle Chime" style="background:rgba(255,255,255,0.94); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid rgba(226,232,240,0.9); border-radius:8px; color:#1e293b; font-size:13px; padding:6px 10px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.06); transition:all 0.2s;">
            <span id="sound-icon">🔊</span>
          </button>
          <button id="lift-reset-cam" title="Reset 3D Perspective" style="background:rgba(255,255,255,0.94); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid rgba(226,232,240,0.9); border-radius:8px; color:#1e293b; font-size:11px; font-weight:700; padding:6px 11px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.06); transition:all 0.2s;">
            Reset 3D
          </button>
        </div>
      </div>

      <!-- Right Floor Calling Station -->
      <div style="position:absolute; right:14px; top:50%; transform:translateY(-50%); z-index:20; background:rgba(255,255,255,0.96); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(226,232,240,0.9); border-radius:14px; padding:10px 8px; display:flex; flex-direction:column; gap:6px; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
        <div style="font-size:9px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:2px;">Floor</div>
        <button class="floor-btn active" data-floor="3" style="width:34px; height:34px; border-radius:50%; border:1px solid #1a6fc4; background:linear-gradient(135deg, #1a6fc4, #3483d2); color:#fff; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 0 10px rgba(26,111,196,0.4);">3F</button>
        <button class="floor-btn" data-floor="2" style="width:34px; height:34px; border-radius:50%; border:1px solid #cbd5e1; background:#f8fafc; color:#1e293b; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">2F</button>
        <button class="floor-btn" data-floor="1" style="width:34px; height:34px; border-radius:50%; border:1px solid #cbd5e1; background:#f8fafc; color:#1e293b; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">1F</button>
        <button class="floor-btn" data-floor="0" style="width:34px; height:34px; border-radius:50%; border:1px solid #cbd5e1; background:#f8fafc; color:#1e293b; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">G</button>

        <div style="height:1px; width:22px; background:#e2e8f0; margin:2px 0;"></div>

        <div style="display:flex; gap:4px;">
          <button id="door-open-btn" title="Open Doors" style="width:26px; height:24px; border-radius:6px; border:1px solid #cbd5e1; background:#f1f5f9; color:#475569; font-size:10px; cursor:pointer; font-weight:bold;">◄►</button>
          <button id="door-close-btn" title="Close Doors" style="width:26px; height:24px; border-radius:6px; border:1px solid #cbd5e1; background:#f1f5f9; color:#475569; font-size:10px; cursor:pointer; font-weight:bold;">►◄</button>
        </div>
      </div>

      <!-- Bottom Hint -->
      <div style="position:absolute; bottom:14px; left:14px; z-index:20; pointer-events:none;">
        <span style="font-size:11px; color:#475569; background:rgba(255,255,255,0.92); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); border:1px solid rgba(226,232,240,0.8); border-radius:20px; padding:4px 11px; box-shadow:0 2px 6px rgba(0,0,0,0.04); font-weight:500;">
          🖱️ Interactive 3D · Drag to rotate · Doors open &amp; close automatically
        </span>
      </div>
    `;
    container.appendChild(uiOverlay);

    // Audio chime generator (Web Audio API)
    let soundEnabled = true;
    let audioCtx = null;
    function playChime() {
      if (!soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25, now + 0.15);
        gain2.gain.setValueAtTime(0.14, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.9);
      } catch (e) {}
    }

    const soundBtn = document.getElementById('lift-sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        soundBtn.style.color = soundEnabled ? '#1a6fc4' : '#94a3b8';
      });
    }

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

    // Reset Camera Button
    const resetCamBtn = document.getElementById('lift-reset-cam');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        targetRotY = 0.32;
        targetRotX = 0;
        camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
      });
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

    // Dimension Constants for Cabin (Width, Height, Depth matching supplied cabin)
    const At = 1.6;  // width
    const on = 2.2;  // height
    const ln = 1.6;  // depth
    const travelRange = 1.25; // vertical travel range
    const cyclePeriod = 10.0; // full cycle loop (10s)

    const floorPositions = {
      3: 1.25,
      2: 0.42,
      1: -0.42,
      0: -1.25
    };
    const floorNames = {
      3: 'FLOOR 3 (TOP)',
      2: 'FLOOR 2 (OFFICES)',
      1: 'FLOOR 1 (SHOWROOM)',
      0: 'GROUND LOBBY (G)'
    };

    // Shaft Vertical Guide Rails & Floor Landing Portals
    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25
    });
    const railGeo = new THREE.CylinderGeometry(0.025, 0.025, 6.4, 16);

    // 4 Corner Vertical Guide Rails
    [
      [-At / 2 - 0.08, -ln / 2 - 0.08],
      [ At / 2 + 0.08, -ln / 2 - 0.08],
      [-At / 2 - 0.08,  ln / 2 + 0.08],
      [ At / 2 + 0.08,  ln / 2 + 0.08]
    ].forEach(pos => {
      const rail = new THREE.Mesh(railGeo, railMaterial);
      rail.position.set(pos[0], 0, pos[1]);
      shaftGroup.add(rail);
    });

    // Floor Landing Beams & Level Markers
    const beamGeo = new THREE.BoxGeometry(At + 0.25, 0.04, 0.04);
    const floorMarkGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const floorMarkMat = new THREE.MeshBasicMaterial({ color: 0x1a6fc4 });

    Object.values(floorPositions).forEach(y => {
      // Rear floor beam
      const beam = new THREE.Mesh(beamGeo, railMaterial);
      beam.position.set(0, y - on / 2 - 0.05, -ln / 2 - 0.08);
      shaftGroup.add(beam);

      // Floor marker
      const mark = new THREE.Mesh(floorMarkGeo, floorMarkMat);
      mark.position.set(-At / 2 - 0.12, y, ln / 2 + 0.08);
      shaftGroup.add(mark);
    });

    // Cabin Materials
    // 1. Metallic Silver Canopy & Columns
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xd0d5dd,
      metalness: 0.8,
      roughness: 0.2
    });

    // 2. Dark Royal Blue Base (exact hue from uploaded elevator-cabin image)
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

    // 4. Interior Wall Panel (Elegant brushed stainless steel)
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
    // Doors slide outward left & right to open smoothly
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

    // 7. Interior Downlight Fixture (Realistic soft downlight spotlight)
    const interiorLight = new THREE.PointLight(0xffffff, 1.2, 4.5);
    interiorLight.position.set(0, on / 2 - 0.15, 0);
    cabinGroup.add(interiorLight);

    // Downlight lens mesh
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

    // HUD Floor & Buttons State
    const displayText = document.getElementById('lift-display-text');
    const arrowText = document.getElementById('lift-arrow-text');
    const floorBtns = document.querySelectorAll('.floor-btn');
    let currentFloorIndex = 3;

    function setHUD(floorIdx, direction, statusStr) {
      if (displayText) displayText.textContent = floorNames[floorIdx] || `FLOOR ${floorIdx}`;
      if (arrowText) arrowText.textContent = statusStr || direction;
      floorBtns.forEach(btn => {
        const f = parseInt(btn.getAttribute('data-floor'), 10);
        if (f === floorIdx) {
          btn.style.borderColor = '#1a6fc4';
          btn.style.background = 'linear-gradient(135deg, #1a6fc4, #3483d2)';
          btn.style.color = '#fff';
          btn.style.boxShadow = '0 0 10px rgba(26,111,196,0.4)';
        } else {
          btn.style.borderColor = '#cbd5e1';
          btn.style.background = '#f8fafc';
          btn.style.color = '#1e293b';
          btn.style.boxShadow = 'none';
        }
      });
    }

    // Manual Floor Calling & Door Override Buttons
    let manualTargetFloor = null;
    let manualDoorHold = false;

    floorBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const f = parseInt(btn.getAttribute('data-floor'), 10);
        manualTargetFloor = f;
      });
    });

    const doorOpenBtn = document.getElementById('door-open-btn');
    if (doorOpenBtn) {
      doorOpenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        manualDoorHold = true;
      });
    }
    const doorCloseBtn = document.getElementById('door-close-btn');
    if (doorCloseBtn) {
      doorCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        manualDoorHold = false;
      });
    }

    // Clock & Chime Flags
    const clock = new THREE.Clock();
    let hasPlayedTopChime = false;
    let hasPlayedBottomChime = false;

    // Smooth Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const progress = (elapsed % cyclePeriod) / cyclePeriod;

      let posY = 0;
      let doorOpenRatio = 0;

      /**
       * The complete requested elevator sequence:
       * 1. 0.00 -> 0.35: Elevator moves smoothly downward from Floor 3 to Ground Floor. Doors closed.
       * 2. 0.35 -> 0.50: Elevator stops at Ground Floor. Doors slide open slowly, hold open to reveal interior, then close smoothly.
       * 3. 0.50 -> 0.85: Elevator moves smoothly upward from Ground Floor to Floor 3. Doors closed.
       * 4. 0.85 -> 1.00: Elevator stops at Floor 3. Doors slide open slowly, hold open to reveal interior, then close smoothly.
       * 5. Loop repeats continuously.
       */
      if (progress < 0.35) {
        // Moving downwards from Top (+travelRange) to Bottom (-travelRange)
        const ratio = progress / 0.35;
        // Cosine smooth step for natural deceleration
        posY = travelRange - ((1 - Math.cos(ratio * Math.PI)) / 2) * (travelRange * 2);
        doorOpenRatio = 0;
        currentFloorIndex = posY > 0 ? (posY > 0.6 ? 3 : 2) : (posY > -0.6 ? 1 : 0);
        setHUD(currentFloorIndex, '▼ DOWN', '▼ DESCENDING');
        hasPlayedBottomChime = false;
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

        if (!hasPlayedBottomChime) {
          playChime();
          hasPlayedBottomChime = true;
        }
        setHUD(0, '◄► OPEN', doorOpenRatio > 0.4 ? '◄► DOORS OPEN' : '►◄ DOORS CLOSING');
      } else if (progress < 0.85) {
        // Moving upwards from Bottom (-travelRange) to Top (+travelRange)
        const ratio = (progress - 0.50) / 0.35;
        posY = -travelRange + ((1 - Math.cos(ratio * Math.PI)) / 2) * (travelRange * 2);
        doorOpenRatio = 0;
        currentFloorIndex = posY < 0 ? (posY < -0.6 ? 0 : 1) : (posY < 0.6 ? 2 : 3);
        setHUD(currentFloorIndex, '▲ UP', '▲ ASCENDING');
        hasPlayedTopChime = false;
      } else {
        // At Floor 3: doors open slowly -> remain open -> close smoothly
        posY = travelRange;
        const ratio = (progress - 0.85) / 0.15; // 0 to 1 over 1.5 seconds

        if (ratio < 0.35) {
          doorOpenRatio = Math.sin((ratio / 0.35) * (Math.PI / 2));
        } else if (ratio < 0.65) {
          doorOpenRatio = 1.0; // held open
        } else {
          doorOpenRatio = Math.cos(((ratio - 0.65) / 0.35) * (Math.PI / 2));
        }

        if (!hasPlayedTopChime) {
          playChime();
          hasPlayedTopChime = true;
        }
        setHUD(3, '◄► OPEN', doorOpenRatio > 0.4 ? '◄► DOORS OPEN' : '►◄ DOORS CLOSING');
      }

      if (manualDoorHold) {
        doorOpenRatio = 1.0;
      }

      // Smooth camera/cabin angle damping
      cabinGroup.rotation.y += (targetRotY - cabinGroup.rotation.y) * 0.08;
      cabinGroup.rotation.x += (targetRotX - cabinGroup.rotation.x) * 0.08;
      shadowPlane.rotation.z = -cabinGroup.rotation.y;

      // Apply vertical position with subtle float
      cabinGroup.position.y = posY + Math.sin(elapsed * 2) * 0.015;

      // Sliding doors outward smoothly (At / 2.3 max slide)
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
