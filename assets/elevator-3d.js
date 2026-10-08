/**
 * Universal Elevators Bengaluru - Interactive 3D Panoramic Elevator Experience
 * Powered by Three.js
 */
(function() {
  'use strict';

  function initElevator3D() {
    const container = document.querySelector('.elevator-wrapper');
    if (!container) return;

    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded yet, waiting...');
      setTimeout(initElevator3D, 100);
      return;
    }

    // Clear existing contents inside container, create canvas and overlay controls
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.background = 'radial-gradient(ellipse at 50% 40%, #1e293b 0%, #0f172a 70%, #020617 100%)';
    container.style.borderRadius = '1rem';
    container.style.boxShadow = '0 20px 50px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.1)';

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

    // Create Floor Control UI Overlay
    const uiOverlay = document.createElement('div');
    uiOverlay.className = 'elevator-3d-ui';
    uiOverlay.innerHTML = `
      <div style="position:absolute; top:12px; left:12px; right:12px; display:flex; justify-content:space-between; align-items:center; z-index:20; pointer-events:none;">
        <div style="background:rgba(15,23,42,0.85); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:6px 12px; display:flex; align-items:center; gap:8px; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e;" id="lift-status-dot"></span>
          <span style="font-family:'Sora',sans-serif; font-weight:700; font-size:12px; color:#f8fafc; letter-spacing:0.05em;" id="lift-display-text">LOBBY (G)</span>
          <span style="font-family:monospace; font-size:11px; color:#38bdf8; background:rgba(56,189,248,0.15); padding:2px 6px; border-radius:4px; font-weight:600;" id="lift-arrow-text">■ LEVEL</span>
        </div>
        <div style="display:flex; gap:6px; pointer-events:auto;">
          <button id="lift-sound-btn" title="Toggle Chime Sound" style="background:rgba(15,23,42,0.85); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:#94a3b8; font-size:12px; padding:6px 10px; cursor:pointer; display:flex; align-items:center; gap:4px; transition:all 0.2s;">
            <span id="sound-icon">🔊</span>
          </button>
          <button id="lift-reset-cam" title="Reset View" style="background:rgba(15,23,42,0.85); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:#94a3b8; font-size:11px; padding:6px 10px; cursor:pointer; font-weight:600; transition:all 0.2s;">
            Reset 3D
          </button>
        </div>
      </div>

      <!-- Car Operating Panel (Right side) -->
      <div style="position:absolute; right:12px; top:50%; transform:translateY(-50%); z-index:20; background:rgba(15,23,42,0.88); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.18); border-radius:14px; padding:10px 8px; display:flex; flex-direction:column; gap:6px; align-items:center; box-shadow:0 8px 30px rgba(0,0,0,0.5);">
        <div style="font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:2px;">Call Floor</div>
        <button class="floor-btn" data-floor="5" style="width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,255,255,0.2); background:linear-gradient(135deg, #334155, #1e293b); color:#fff; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.3);">5F</button>
        <button class="floor-btn" data-floor="4" style="width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,255,255,0.2); background:linear-gradient(135deg, #334155, #1e293b); color:#fff; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.3);">4F</button>
        <button class="floor-btn" data-floor="3" style="width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,255,255,0.2); background:linear-gradient(135deg, #334155, #1e293b); color:#fff; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.3);">3F</button>
        <button class="floor-btn" data-floor="2" style="width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,255,255,0.2); background:linear-gradient(135deg, #334155, #1e293b); color:#fff; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.3);">2F</button>
        <button class="floor-btn" data-floor="1" style="width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,255,255,0.2); background:linear-gradient(135deg, #334155, #1e293b); color:#fff; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.3);">1F</button>
        <button class="floor-btn active" data-floor="0" style="width:34px; height:34px; border-radius:50%; border:1px solid #38bdf8; background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 0 12px rgba(56,189,248,0.5);">G</button>
        
        <div style="height:1px; width:24px; background:rgba(255,255,255,0.15); margin:3px 0;"></div>
        
        <div style="display:flex; gap:4px;">
          <button id="door-open-btn" title="Open Doors" style="width:28px; height:24px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); background:#1e293b; color:#94a3b8; font-size:10px; cursor:pointer; transition:all 0.2s;">◄►</button>
          <button id="door-close-btn" title="Close Doors" style="width:28px; height:24px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); background:#1e293b; color:#94a3b8; font-size:10px; cursor:pointer; transition:all 0.2s;">►◄</button>
        </div>
      </div>

      <!-- Bottom Hint -->
      <div style="position:absolute; bottom:10px; left:16px; z-index:20; pointer-events:none; display:flex; align-items:center; gap:8px;">
        <span style="font-size:11px; color:#94a3b8; background:rgba(15,23,42,0.8); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:4px 10px;">
          🖱️ Drag to rotate 3D view · Click floor buttons to ride
        </span>
      </div>
    `;
    container.appendChild(uiOverlay);

    // Audio synthesizer for elevator chime
    let soundEnabled = true;
    let audioCtx = null;
    function playChime() {
      if (!soundEnabled) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const now = audioCtx.currentTime;
        
        // Tone 1 (High)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Tone 2 (Lower warm resolution)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25, now + 0.15); // C5
        gain2.gain.setValueAtTime(0.18, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.9);
      } catch (e) {
        // Audio might be blocked by browser policy until interaction
      }
    }

    // Toggle sound button
    const soundBtn = document.getElementById('lift-sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        soundBtn.style.color = soundEnabled ? '#38bdf8' : '#64748b';
      });
    }

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.04);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    const defaultCamPos = { x: 3.2, y: 0.2, z: 6.8 };
    camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Reset camera button
    const resetCamBtn = document.getElementById('lift-reset-cam');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        targetRotX = 0;
        targetRotY = 0.35;
        camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
        camera.lookAt(0, cabinGroup ? cabinGroup.position.y : 0, 0);
      });
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const blueFillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    blueFillLight.position.set(-6, -2, -4);
    scene.add(blueFillLight);

    const rimLight = new THREE.PointLight(0x0284c7, 1.5, 15);
    rimLight.position.set(0, 6, 2);
    scene.add(rimLight);

    // Floor configurations
    const floorHeights = {
      0: -2.8, // G - Lobby
      1: -1.7, // 1F - Showroom
      2: -0.6, // 2F - Commercial
      3:  0.5, // 3F - Offices
      4:  1.6, // 4F - Suites
      5:  2.7  // 5F - Penthouse
    };
    const floorNames = {
      0: 'GROUND LOBBY (G)',
      1: '1F · SHOWROOM',
      2: '2F · CORPORATE',
      3: '3F · EXECUTIVE',
      4: '4F · SUITES',
      5: '5F · PENTHOUSE'
    };

    // Shaft Structure (High-rise transparent glass & structural brushed steel columns)
    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    // Structural Materials
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.25
    });
    const darkSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.35
    });
    const shaftGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0.8
    });
    const glowingFloorMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8
    });

    // 4 Main Vertical Guide Rails
    const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 8.5, 16);
    const railPositions = [
      [-1.1, -1.0],
      [ 1.1, -1.0],
      [-1.1,  1.0],
      [ 1.1,  1.0]
    ];
    railPositions.forEach(pos => {
      const rail = new THREE.Mesh(railGeo, steelMaterial);
      rail.position.set(pos[0], 0, pos[1]);
      shaftGroup.add(rail);
    });

    // Rear counterweight guide rails
    const cwRailGeo = new THREE.CylinderGeometry(0.025, 0.025, 8.5, 12);
    [-0.45, 0.45].forEach(x => {
      const cwRail = new THREE.Mesh(cwRailGeo, darkSteelMaterial);
      cwRail.position.set(x, 0, -1.15);
      shaftGroup.add(cwRail);
    });

    // Horizontal Floor Rings and Level Indicator Rings
    const ringGeo = new THREE.BoxGeometry(2.35, 0.06, 2.15);
    const indicatorRingGeo = new THREE.BoxGeometry(2.38, 0.015, 2.18);
    for (let f = 0; f <= 5; f++) {
      const y = floorHeights[f];
      const ring = new THREE.Mesh(ringGeo, darkSteelMaterial);
      ring.position.set(0, y - 0.72, 0);
      shaftGroup.add(ring);

      // Thin futuristic neon floor level border
      const indRing = new THREE.Mesh(indicatorRingGeo, glowingFloorMaterial);
      indRing.position.set(0, y - 0.72, 0);
      shaftGroup.add(indRing);

      // Floor marker lights on side
      const markerGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const marker = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
      marker.position.set(1.18, y, 0);
      shaftGroup.add(marker);
    }

    // Top Overhead Machine Room Beams & Pulleys
    const topBeamGeo = new THREE.BoxGeometry(2.4, 0.15, 2.2);
    const topBeam = new THREE.Mesh(topBeamGeo, steelMaterial);
    topBeam.position.set(0, 4.2, 0);
    shaftGroup.add(topBeam);

    const bottomPitGeo = new THREE.BoxGeometry(2.4, 0.2, 2.2);
    const bottomPit = new THREE.Mesh(bottomPitGeo, steelMaterial);
    bottomPit.position.set(0, -3.8, 0);
    shaftGroup.add(bottomPit);

    // Pulley Sheaves on top
    const pulleyGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24);
    pulleyGeo.rotateZ(Math.PI / 2);
    const pulley1 = new THREE.Mesh(pulleyGeo, steelMaterial);
    pulley1.position.set(0, 3.95, 0);
    shaftGroup.add(pulley1);

    const pulley2 = new THREE.Mesh(pulleyGeo, steelMaterial);
    pulley2.position.set(0, 3.95, -0.9);
    shaftGroup.add(pulley2);

    // Elevator Cabin Assembly
    const cabinGroup = new THREE.Group();
    cabinGroup.position.y = floorHeights[0]; // Start at G
    scene.add(cabinGroup);

    const cabinWidth = 1.6;
    const cabinHeight = 1.45;
    const cabinDepth = 1.4;

    // Floor Base (Heavy Brushed Metal Platform)
    const baseGeo = new THREE.BoxGeometry(cabinWidth, 0.12, cabinDepth);
    const baseMesh = new THREE.Mesh(baseGeo, darkSteelMaterial);
    baseMesh.position.y = -cabinHeight / 2;
    cabinGroup.add(baseMesh);

    // Ceiling Canopy
    const roofGeo = new THREE.BoxGeometry(cabinWidth, 0.12, cabinDepth);
    const roofMesh = new THREE.Mesh(roofGeo, darkSteelMaterial);
    roofMesh.position.y = cabinHeight / 2;
    cabinGroup.add(roofMesh);

    // Cabin Interior Warm LED Downlight
    const cabinLight = new THREE.PointLight(0xfff7ed, 1.8, 3.5);
    cabinLight.position.set(0, cabinHeight / 2 - 0.1, 0);
    cabinGroup.add(cabinLight);

    const lightFixtureGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16);
    const lightFixtureMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightFixture = new THREE.Mesh(lightFixtureGeo, lightFixtureMat);
    lightFixture.position.set(0, cabinHeight / 2 - 0.05, 0);
    cabinGroup.add(lightFixture);

    // 4 Cabin Corner Stainless Steel Columns
    const colGeo = new THREE.BoxGeometry(0.06, cabinHeight - 0.12, 0.06);
    const colPositions = [
      [-cabinWidth / 2 + 0.03, -cabinDepth / 2 + 0.03],
      [ cabinWidth / 2 - 0.03, -cabinDepth / 2 + 0.03],
      [-cabinWidth / 2 + 0.03,  cabinDepth / 2 - 0.03],
      [ cabinWidth / 2 - 0.03,  cabinDepth / 2 - 0.03]
    ];
    colPositions.forEach(cp => {
      const col = new THREE.Mesh(colGeo, steelMaterial);
      col.position.set(cp[0], 0, cp[1]);
      cabinGroup.add(col);
    });

    // Glass Walls (Back and Sides - Panoramic View)
    const cabinGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.32,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
      reflectivity: 0.5
    });

    // Back Glass Wall
    const backWallGeo = new THREE.BoxGeometry(cabinWidth - 0.1, cabinHeight - 0.12, 0.02);
    const backWall = new THREE.Mesh(backWallGeo, cabinGlassMat);
    backWall.position.set(0, 0, -cabinDepth / 2 + 0.02);
    cabinGroup.add(backWall);

    // Side Glass Walls
    const sideWallGeo = new THREE.BoxGeometry(0.02, cabinHeight - 0.12, cabinDepth - 0.1);
    const leftWall = new THREE.Mesh(sideWallGeo, cabinGlassMat);
    leftWall.position.set(-cabinWidth / 2 + 0.02, 0, 0);
    cabinGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, cabinGlassMat);
    rightWall.position.set(cabinWidth / 2 - 0.02, 0, 0);
    cabinGroup.add(rightWall);

    // Interior Handrail (Luxury Stainless Steel Bar)
    const handrailGeo = new THREE.CylinderGeometry(0.02, 0.02, cabinWidth - 0.3, 12);
    handrailGeo.rotateZ(Math.PI / 2);
    const handrail = new THREE.Mesh(handrailGeo, steelMaterial);
    handrail.position.set(0, -0.15, -cabinDepth / 2 + 0.1);
    cabinGroup.add(handrail);

    // Sliding Front Doors (Left Door & Right Door)
    const doorWidth = (cabinWidth - 0.12) / 2;
    const doorHeight = cabinHeight - 0.16;
    const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.03);

    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.95,
      roughness: 0.18
    });

    const leftDoor = new THREE.Mesh(doorGeo, doorMaterial);
    leftDoor.position.set(-doorWidth / 2, 0, cabinDepth / 2 - 0.02);
    cabinGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(doorGeo, doorMaterial);
    rightDoor.position.set(doorWidth / 2, 0, cabinDepth / 2 - 0.02);
    cabinGroup.add(rightDoor);

    // Glass panel window on each door for modern capsule style
    const doorGlassGeo = new THREE.BoxGeometry(doorWidth * 0.5, doorHeight * 0.7, 0.035);
    const leftDoorGlass = new THREE.Mesh(doorGlassGeo, cabinGlassMat);
    leftDoorGlass.position.set(0, 0, 0);
    leftDoor.add(leftDoorGlass);

    const rightDoorGlass = new THREE.Mesh(doorGlassGeo, cabinGlassMat);
    rightDoorGlass.position.set(0, 0, 0);
    rightDoor.add(rightDoorGlass);

    // Overhead Digital Display Bar on Cabin Front
    const headerDisplayGeo = new THREE.BoxGeometry(0.7, 0.12, 0.04);
    const headerDisplayMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const headerDisplay = new THREE.Mesh(headerDisplayGeo, headerDisplayMat);
    headerDisplay.position.set(0, cabinHeight / 2 + 0.04, cabinDepth / 2);
    cabinGroup.add(headerDisplay);

    // Top Crosshead / Hitch for cables
    const crossheadGeo = new THREE.BoxGeometry(0.35, 0.18, 0.35);
    const crosshead = new THREE.Mesh(crossheadGeo, darkSteelMaterial);
    crosshead.position.set(0, cabinHeight / 2 + 0.15, 0);
    cabinGroup.add(crosshead);

    // Counterweight (Moves inversely on the back of the shaft)
    const cwGroup = new THREE.Group();
    const cwGeo = new THREE.BoxGeometry(0.8, 1.1, 0.2);
    const cwMesh = new THREE.Mesh(cwGeo, darkSteelMaterial);
    cwGroup.add(cwMesh);
    cwGroup.position.set(0, -floorHeights[0] * 0.9, -1.15);
    scene.add(cwGroup);

    // Hoisting Steel Wire Cables (Updated dynamically in render loop)
    const cableMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
    
    // Cabin Cables: from crosshead up to top pulley
    const cabinCablePoints = [
      new THREE.Vector3(0, cabinGroup.position.y + cabinHeight / 2 + 0.2, 0),
      new THREE.Vector3(0, 3.95, 0)
    ];
    const cabinCableGeo = new THREE.BufferGeometry().setFromPoints(cabinCablePoints);
    const cabinCableLine = new THREE.Line(cabinCableGeo, cableMat);
    scene.add(cabinCableLine);

    // Counterweight Cables: from counterweight up to rear pulley
    const cwCablePoints = [
      new THREE.Vector3(0, cwGroup.position.y + 0.6, -1.15),
      new THREE.Vector3(0, 3.95, -0.9)
    ];
    const cwCableGeo = new THREE.BufferGeometry().setFromPoints(cwCablePoints);
    const cwCableLine = new THREE.Line(cwCableGeo, cableMat);
    scene.add(cwCableLine);

    // State Variables
    let currentFloor = 0;
    let targetFloor = 0;
    let cabinY = floorHeights[0];
    let targetY = floorHeights[0];
    let isMoving = false;
    let doorProgress = 0; // 0 = closed, 1 = fully open
    let targetDoorProgress = 0;
    let state = 'IDLE'; // 'IDLE', 'MOVING', 'OPENING', 'WAITING', 'CLOSING'
    let dwellTimer = 0;
    let autoTourTimer = 0;
    const maxDoorSlide = doorWidth * 0.88;

    // UI elements
    const displayText = document.getElementById('lift-display-text');
    const arrowText = document.getElementById('lift-arrow-text');
    const statusDot = document.getElementById('lift-status-dot');
    const floorButtons = document.querySelectorAll('.floor-btn');

    function updateUI() {
      if (displayText) {
        displayText.textContent = floorNames[currentFloor] || `LEVEL ${currentFloor}`;
      }
      if (arrowText) {
        if (state === 'MOVING') {
          arrowText.textContent = targetFloor > currentFloor ? '▲ MOVING UP' : '▼ MOVING DOWN';
          arrowText.style.color = '#38bdf8';
        } else if (state === 'OPENING' || state === 'WAITING') {
          arrowText.textContent = '◄► DOORS OPEN';
          arrowText.style.color = '#4ade80';
        } else if (state === 'CLOSING') {
          arrowText.textContent = '►◄ CLOSING';
          arrowText.style.color = '#f59e0b';
        } else {
          arrowText.textContent = '■ LEVEL';
          arrowText.style.color = '#38bdf8';
        }
      }
      if (statusDot) {
        statusDot.style.background = isMoving ? '#38bdf8' : '#22c55e';
        statusDot.style.boxShadow = isMoving ? '0 0 8px #38bdf8' : '0 0 8px #22c55e';
      }
      floorButtons.forEach(btn => {
        const f = parseInt(btn.getAttribute('data-floor'), 10);
        if (f === currentFloor && !isMoving) {
          btn.style.borderColor = '#38bdf8';
          btn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          btn.style.boxShadow = '0 0 12px rgba(56,189,248,0.5)';
        } else if (f === targetFloor && isMoving) {
          btn.style.borderColor = '#f59e0b';
          btn.style.background = 'linear-gradient(135deg, #d97706, #b45309)';
          btn.style.boxShadow = '0 0 12px rgba(245,158,11,0.5)';
        } else {
          btn.style.borderColor = 'rgba(255,255,255,0.2)';
          btn.style.background = 'linear-gradient(135deg, #334155, #1e293b)';
          btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        }
      });
    }

    // Call Floor function
    function callFloor(floorNum) {
      if (floorNum < 0 || floorNum > 5) return;
      autoTourTimer = 0; // reset auto timer

      if (floorNum === currentFloor && !isMoving) {
        // Just reopen doors
        state = 'OPENING';
        targetDoorProgress = 1;
        playChime();
        updateUI();
        return;
      }

      targetFloor = floorNum;
      targetY = floorHeights[targetFloor];

      // If doors are open, close them first
      if (doorProgress > 0.05) {
        state = 'CLOSING';
        targetDoorProgress = 0;
      } else {
        startMoving();
      }
      updateUI();
    }

    function startMoving() {
      state = 'MOVING';
      isMoving = true;
      targetDoorProgress = 0;
      updateUI();
    }

    // Bind Floor Buttons
    floorButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const f = parseInt(btn.getAttribute('data-floor'), 10);
        callFloor(f);
      });
    });

    // Door Buttons
    const doorOpenBtn = document.getElementById('door-open-btn');
    if (doorOpenBtn) {
      doorOpenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isMoving) {
          state = 'OPENING';
          targetDoorProgress = 1;
          dwellTimer = 0;
          updateUI();
        }
      });
    }

    const doorCloseBtn = document.getElementById('door-close-btn');
    if (doorCloseBtn) {
      doorCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isMoving && doorProgress > 0.05) {
          state = 'CLOSING';
          targetDoorProgress = 0;
          updateUI();
        }
      });
    }

    // Left screen side elevator track synchronization (1F - 5F buttons)
    const sideTrackButtons = document.querySelectorAll('.elevator-track button');
    const sideCabin = document.querySelector('.elevator-track .cabin');
    if (sideTrackButtons && sideTrackButtons.length > 0) {
      sideTrackButtons.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          // 0 -> 1F, 1 -> 2F, 2 -> 3F, 3 -> 4F, 4 -> 5F
          const floor = idx + 1;
          callFloor(floor);
        });
      });
    }

    // Interactive Orbit / Rotation & Mouse Parallax
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0;
    let rotY = 0.35;
    let targetRotX = 0;
    let targetRotY = 0.35;

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
        targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
      } else {
        // Subtle Parallax when hovering over container
        const rect = container.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          targetRotY = 0.35 + normX * 0.25;
          targetRotX = -normY * 0.15;
        }
      }
    });

    // Touch support for mobile devices
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
        targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
      }
    }, { passive: true });

    // Handle Window Resize
    function onResize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    // Initial UI state
    updateUI();

    // Main Animation Loop
    let lastTime = performance.now();

    function animate(currentTime) {
      requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Smooth camera orbit interpolation
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;

      const radius = 7.2;
      camera.position.x = Math.sin(rotY) * radius * Math.cos(rotX);
      camera.position.z = Math.cos(rotY) * radius * Math.cos(rotX);
      camera.position.y = Math.sin(rotX) * radius + (cabinGroup.position.y * 0.35);
      camera.lookAt(0, cabinGroup.position.y * 0.5, 0);

      // Pulley wheel rotation
      if (isMoving) {
        const moveDir = targetY > cabinY ? 1 : -1;
        pulley1.rotation.x += moveDir * dt * 3.5;
        pulley2.rotation.x += moveDir * dt * 3.5;
      }

      // Elevator State Machine
      if (state === 'MOVING') {
        const dist = targetY - cabinY;
        const absDist = Math.abs(dist);

        if (absDist < 0.02) {
          // Arrived at destination floor!
          cabinY = targetY;
          isMoving = false;
          currentFloor = targetFloor;
          state = 'OPENING';
          targetDoorProgress = 1;
          dwellTimer = 0;
          playChime();
          updateUI();
        } else {
          // Smooth vertical speed easing (faster in middle, gentle deceleration)
          const speed = Math.max(0.6, Math.min(2.8, absDist * 2.2));
          cabinY += Math.sign(dist) * speed * dt;
          
          // Determine intermediate floor indicator
          let closestFloor = 0;
          let minDiff = 999;
          for (let f = 0; f <= 5; f++) {
            const diff = Math.abs(cabinY - floorHeights[f]);
            if (diff < minDiff) {
              minDiff = diff;
              closestFloor = f;
            }
          }
          if (displayText && displayText.textContent !== floorNames[closestFloor]) {
            displayText.textContent = floorNames[closestFloor];
          }
        }
      } else if (state === 'CLOSING') {
        doorProgress += (targetDoorProgress - doorProgress) * 4.5 * dt;
        if (doorProgress < 0.02) {
          doorProgress = 0;
          if (targetFloor !== currentFloor) {
            startMoving();
          } else {
            state = 'IDLE';
            updateUI();
          }
        }
      } else if (state === 'OPENING') {
        doorProgress += (targetDoorProgress - doorProgress) * 4.0 * dt;
        if (doorProgress > 0.98) {
          doorProgress = 1;
          state = 'WAITING';
          dwellTimer = 0;
          updateUI();
        }
      } else if (state === 'WAITING') {
        dwellTimer += dt;
        if (dwellTimer > 2.8) {
          state = 'CLOSING';
          targetDoorProgress = 0;
          updateUI();
        }
      } else if (state === 'IDLE') {
        // Auto-tour idle patrol (moves to an interesting floor if untouched for 7 seconds)
        autoTourTimer += dt;
        if (autoTourTimer > 7.0) {
          autoTourTimer = 0;
          const nextFloors = [0, 2, 5, 1, 4, 3].filter(f => f !== currentFloor);
          const nextF = nextFloors[Math.floor(Math.random() * nextFloors.length)];
          callFloor(nextF);
        }
      }

      // Apply cabin position
      cabinGroup.position.y = cabinY;

      // Apply counterweight position (moves inversely!)
      cwGroup.position.y = -cabinY * 0.95;

      // Apply door sliding animation
      const slide = doorProgress * maxDoorSlide;
      leftDoor.position.x = -doorWidth / 2 - slide;
      rightDoor.position.x = doorWidth / 2 + slide;

      // Update Cable vertices
      const cPos = cabinCableLine.geometry.attributes.position.array;
      cPos[0] = 0;
      cPos[1] = cabinY + cabinHeight / 2 + 0.15;
      cPos[2] = 0;
      cPos[3] = 0;
      cPos[4] = 3.95;
      cPos[5] = 0;
      cabinCableLine.geometry.attributes.position.needsUpdate = true;

      const cwPos = cwCableLine.geometry.attributes.position.array;
      cwPos[0] = 0;
      cwPos[1] = cwGroup.position.y + 0.55;
      cwPos[2] = -1.15;
      cwPos[3] = 0;
      cwPos[4] = 3.95;
      cwPos[5] = -0.9;
      cwCableLine.geometry.attributes.position.needsUpdate = true;

      // Sync side track cabin if present
      if (sideCabin) {
        // Map cabinY (-2.8 to 2.7) to top percentage (100% down to 0%)
        const minH = floorHeights[0];
        const maxH = floorHeights[5];
        const pct = 100 - ((cabinY - minH) / (maxH - minH)) * 100;
        sideCabin.style.top = `${Math.max(0, Math.min(100, pct))}%`;
      }

      // Render Scene
      renderer.render(scene, camera);
    }

    animate(performance.now());
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElevator3D);
  } else {
    initElevator3D();
  }
})();
