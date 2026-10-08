/**
 * Universal Elevators - Realistic 3D Moving Elevator Engine
 * Features:
 * - Real 3D cabin matching the exact supplied image model (blue base, silver top, glass walls, interior downlight)
 * - Shaft guide rails & floor markers
 * - Sequence: Moves top to bottom -> stops smoothly -> doors slide open -> inside visible -> doors close -> moves upward -> repeats
 * - Digital floor indicator & interactive call buttons
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
    container.style.background = 'radial-gradient(ellipse at 50% 35%, #f8fafc 0%, #e2e8f0 70%, #cbd5e1 100%)';
    container.style.borderRadius = '1rem';
    container.style.boxShadow = '0 20px 45px -10px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8)';

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

    // Floor HUD & Control Overlay
    const uiOverlay = document.createElement('div');
    uiOverlay.className = 'elevator-hud-overlay';
    uiOverlay.innerHTML = `
      <div style="position:absolute; top:12px; left:12px; right:12px; display:flex; justify-content:space-between; align-items:center; z-index:20; pointer-events:none;">
        <div style="background:rgba(255,255,255,0.92); backdrop-filter:blur(10px); border:1px solid rgba(226,232,240,0.8); border-radius:12px; padding:6px 14px; display:flex; align-items:center; gap:10px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
          <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:#1a6fc4; box-shadow:0 0 10px #1a6fc4;" id="lift-status-dot"></span>
          <div style="display:flex; flex-direction:column;">
            <span style="font-family:'Sora',sans-serif; font-weight:800; font-size:12px; color:#0f172a;" id="lift-display-text">FLOOR 3 (TOP)</span>
            <span style="font-size:9px; color:#64748b; font-weight:600; text-transform:uppercase;">Universal Lift Series</span>
          </div>
          <span style="font-family:monospace; font-size:11px; color:#1a6fc4; background:rgba(26,111,196,0.1); border:1px solid rgba(26,111,196,0.2); padding:3px 8px; border-radius:6px; font-weight:700;" id="lift-arrow-text">■ LEVEL</span>
        </div>
        
        <div style="display:flex; gap:6px; pointer-events:auto;">
          <button id="lift-sound-btn" title="Toggle Chime" style="background:rgba(255,255,255,0.92); backdrop-filter:blur(8px); border:1px solid rgba(226,232,240,0.8); border-radius:8px; color:#1e293b; font-size:12px; padding:6px 10px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.06); transition:all 0.2s;">
            <span id="sound-icon">🔊</span>
          </button>
          <button id="lift-reset-cam" title="Reset View" style="background:rgba(255,255,255,0.92); backdrop-filter:blur(8px); border:1px solid rgba(226,232,240,0.8); border-radius:8px; color:#1e293b; font-size:11px; font-weight:700; padding:6px 10px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.06); transition:all 0.2s;">
            Reset 3D
          </button>
        </div>
      </div>

      <!-- Right Floor Calling Buttons -->
      <div style="position:absolute; right:12px; top:50%; transform:translateY(-50%); z-index:20; background:rgba(255,255,255,0.95); backdrop-filter:blur(12px); border:1px solid rgba(226,232,240,0.8); border-radius:14px; padding:10px 8px; display:flex; flex-direction:column; gap:6px; align-items:center; box-shadow:0 8px 25px rgba(0,0,0,0.08);">
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
      <div style="position:absolute; bottom:12px; left:14px; z-index:20; pointer-events:none;">
        <span style="font-size:11px; color:#475569; background:rgba(255,255,255,0.9); backdrop-filter:blur(6px); border:1px solid rgba(226,232,240,0.8); border-radius:20px; padding:4px 10px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
          🖱️ Interactive 3D · Drag to rotate · Watch doors open &amp; close
        </span>
      </div>
    `;
    container.appendChild(uiOverlay);

    // Audio chime
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

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 100);
    const defaultCamPos = { x: 0, y: 0.1, z: 5.6 };
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
    renderer.shadowMap.enabled = true;

    // Reset Camera
    const resetCamBtn = document.getElementById('lift-reset-cam');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        targetRotY = 0.3;
        targetRotX = 0;
        camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
      });
    }

    // Directional & Ambient Lighting (matching the original bundle)
    const topLight = new THREE.DirectionalLight(0xffffff, 2.5);
    topLight.position.set(0, 10, 2);
    scene.add(topLight);

    const blueFill = new THREE.DirectionalLight(0x1a6fc4, 1.6);
    blueFill.position.set(5, 0, 5);
    scene.add(blueFill);

    const softFill = new THREE.DirectionalLight(0xffffff, 0.9);
    softFill.position.set(-5, 0, 5);
    scene.add(softFill);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambLight);

    // Constants for Cabin
    const At = 1.6;  // width
    const on = 2.2;  // height
    const ln = 1.6;  // depth
    const travelRange = 1.25; // max vertical travel
    const cyclePeriod = 9.0;  // seconds for full loop

    // Floor heights:
    // Floor 3 (Top): +1.25
    // Floor 2: +0.42
    // Floor 1: -0.42
    // Floor 0 (G): -1.25
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

    // Shaft Vertical Guide Rails & Structural Framing
    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25
    });
    const railGeo = new THREE.CylinderGeometry(0.025, 0.025, 6.2, 12);
    
    // 4 Corner Guide Rails
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

    // Floor Markers on Shaft
    const floorMarkGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const floorMarkMat = new THREE.MeshBasicMaterial({ color: 0x1a6fc4 });
    Object.values(floorPositions).forEach(y => {
      const mark = new THREE.Mesh(floorMarkGeo, floorMarkMat);
      mark.position.set(-At / 2 - 0.12, y, ln / 2 + 0.08);
      shaftGroup.add(mark);
    });

    // Materials (matching original bundle & user uploaded image)
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xd0d5dd,
      metalness: 0.75,
      roughness: 0.2
    });

    // Dark Royal Blue Base (exact color from user image)
    const darkBlueBaseMat = new THREE.MeshStandardMaterial({
      color: 0x003366,
      metalness: 0.7,
      roughness: 0.3
    });

    // Realistic Translucent Glass
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transmission: 0.9,
      opacity: 0.88,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      thickness: 0.1,
      side: THREE.DoubleSide
    });

    // The Elevator Cabin Group
    const cabinGroup = new THREE.Group();

    // 1. Ceiling Canopy (Silver/Metallic)
    const capGeo = new THREE.BoxGeometry(At, 0.1, ln);
    const roofMesh = new THREE.Mesh(capGeo, silverMat);
    roofMesh.position.y = on / 2 + 0.05;
    cabinGroup.add(roofMesh);

    // 2. Floor Base (Dark Royal Blue - matching uploaded screenshot)
    const floorMesh = new THREE.Mesh(capGeo, darkBlueBaseMat);
    floorMesh.position.y = -on / 2 - 0.05;
    cabinGroup.add(floorMesh);

    // 3. Rear Wall
    const rearWallGeo = new THREE.BoxGeometry(At, on, 0.05);
    const rearWall = new THREE.Mesh(rearWallGeo, silverMat);
    rearWall.position.set(0, 0, -ln / 2 + 0.025);
    cabinGroup.add(rearWall);

    // 4. Side Glass Walls
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

    // 6. Front Corner Framing Pillars
    const pillarGeo = new THREE.BoxGeometry(0.04, on, 0.06);
    const leftPillar = new THREE.Mesh(pillarGeo, silverMat);
    leftPillar.position.set(-At / 2 + 0.02, 0, ln / 2 - 0.025);
    cabinGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, silverMat);
    rightPillar.position.set(At / 2 - 0.02, 0, ln / 2 - 0.025);
    cabinGroup.add(rightPillar);

    // 7. Interior Downlight Fixture
    const interiorLight = new THREE.PointLight(0xffffff, 0.9, 4);
    interiorLight.position.set(0, on / 2 - 0.2, 0);
    cabinGroup.add(interiorLight);

    scene.add(cabinGroup);

    // 8. Ground Shadow Plane (matching user screenshot)
    const shadowGeo = new THREE.PlaneGeometry(At * 1.5, ln * 1.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -travelRange - on / 2 - 0.1;
    scene.add(shadowPlane);

    // Initial 3D Rotation Angle
    let targetRotY = 0.3;
    let targetRotX = 0.0;
    cabinGroup.rotation.y = 0.3;
    shadowPlane.rotation.z = -0.3;

    // Interactive Drag to Rotate & Parallax
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
          targetRotY = 0.3 + normX * 0.22;
          targetRotX = -normY * 0.12;
        }
      }
    });

    // Touch Support
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
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', handleResize);

    // Manual Floor Calling & HUD State
    const displayText = document.getElementById('lift-display-text');
    const arrowText = document.getElementById('lift-arrow-text');
    const statusDot = document.getElementById('lift-status-dot');
    const floorBtns = document.querySelectorAll('.floor-btn');

    let manualTargetFloor = null;
    let manualState = null; // 'MOVING', 'OPENING', 'WAITING', 'CLOSING'
    let manualTimer = 0;
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
        } else {
          btn.style.borderColor = '#cbd5e1';
          btn.style.background = '#f8fafc';
          btn.style.color = '#1e293b';
        }
      });
    }

    floorBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const f = parseInt(btn.getAttribute('data-floor'), 10);
        manualTargetFloor = f;
        manualState = 'MOVING';
      });
    });

    const doorOpenBtn = document.getElementById('door-open-btn');
    if (doorOpenBtn) {
      doorOpenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        manualDoorOverride = 1;
      });
    }
    const doorCloseBtn = document.getElementById('door-close-btn');
    if (doorCloseBtn) {
      doorCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        manualDoorOverride = 0;
      });
    }
    let manualDoorOverride = null;

    // Clock
    const clock = new THREE.Clock();
    let hasPlayedTopChime = false;
    let hasPlayedBottomChime = false;

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const progress = (elapsed % cyclePeriod) / cyclePeriod;

      let posY = 0;
      let doorOpenRatio = 0;

      // The requested sequence:
      // 1. Elevator cabin moves vertically from top floor to bottom floor
      // 2. Stops smoothly at bottom floor
      // 3. Doors slide open -> inside becomes visible
      // 4. Doors remain open briefly, then close smoothly
      // 5. Elevator moves upward to top floor
      // 6. Stops smoothly at top floor -> doors slide open -> close -> repeats continuously!
      if (progress < 0.35) {
        // Moving downwards from Top (+travelRange) to Bottom (-travelRange)
        const ratio = progress / 0.35;
        posY = travelRange - ((Math.sin(ratio * Math.PI - Math.PI / 2) + 1) / 2) * (travelRange * 2);
        doorOpenRatio = 0;
        currentFloorIndex = posY > 0 ? (posY > 0.6 ? 3 : 2) : (posY > -0.6 ? 1 : 0);
        setHUD(currentFloorIndex, '▼ DOWN', '▼ TRAVELLING DOWN');
        hasPlayedBottomChime = false;
      } else if (progress < 0.50) {
        // At Bottom Floor (Ground): Doors slide open, reveal inside, hold, then close
        posY = -travelRange;
        const ratio = (progress - 0.35) / 0.15;
        doorOpenRatio = Math.sin(ratio * Math.PI);
        if (!hasPlayedBottomChime) {
          playChime();
          hasPlayedBottomChime = true;
        }
        setHUD(0, '◄► OPEN', doorOpenRatio > 0.5 ? '◄► DOORS OPEN' : '►◄ CLOSING');
      } else if (progress < 0.85) {
        // Moving upwards from Bottom (-travelRange) to Top (+travelRange)
        const ratio = (progress - 0.50) / 0.35;
        posY = -travelRange + ((Math.sin(ratio * Math.PI - Math.PI / 2) + 1) / 2) * (travelRange * 2);
        doorOpenRatio = 0;
        currentFloorIndex = posY < 0 ? (posY < -0.6 ? 0 : 1) : (posY < 0.6 ? 2 : 3);
        setHUD(currentFloorIndex, '▲ UP', '▲ TRAVELLING UP');
        hasPlayedTopChime = false;
      } else {
        // At Top Floor (Floor 3): Doors slide open, reveal inside, hold, then close
        posY = travelRange;
        const ratio = (progress - 0.85) / 0.15;
        doorOpenRatio = Math.sin(ratio * Math.PI);
        if (!hasPlayedTopChime) {
          playChime();
          hasPlayedTopChime = true;
        }
        setHUD(3, '◄► OPEN', doorOpenRatio > 0.5 ? '◄► DOORS OPEN' : '►◄ CLOSING');
      }

      // Smooth camera/cabin angle damping
      cabinGroup.rotation.y += (targetRotY - cabinGroup.rotation.y) * 0.08;
      cabinGroup.rotation.x += (targetRotX - cabinGroup.rotation.x) * 0.08;
      shadowPlane.rotation.z = -cabinGroup.rotation.y;

      // Apply vertical position with gentle float
      cabinGroup.position.y = posY + Math.sin(elapsed * 2) * 0.015;

      // Sliding doors: slide outward smoothly
      const doorSlide = doorOpenRatio * (At / 2.2);
      leftDoor.position.x = -At / 4 - doorSlide;
      rightDoor.position.x = At / 4 + doorSlide;

      // Dynamic ground shadow scaling & opacity based on distance from ground
      const heightNorm = Math.max(0, Math.min(1, (cabinGroup.position.y - (-travelRange)) / (travelRange * 2)));
      shadowPlane.scale.setScalar(1 + heightNorm * 0.2);
      shadowMat.opacity = 0.16 - heightNorm * 0.08;

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
