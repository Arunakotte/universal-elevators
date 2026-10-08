/**
 * Universal Elevators - High-Precision 3D Panoramic Elevator Simulation
 * Architecture: Three.js WebGL with PBR Materials, Dynamic Kinematics & Audio Chime
 */
(function() {
  'use strict';

  function initElevator3D() {
    const container = document.querySelector('.elevator-wrapper') || document.querySelector('.hero-elevator-container');
    if (!container) return;

    // Respect reduced motion accessibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check Three.js availability
    if (typeof THREE === 'undefined') {
      setTimeout(initElevator3D, 100);
      return;
    }

    // Reset container contents
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.background = 'radial-gradient(ellipse at 50% 35%, #18263f 0%, #0d1628 55%, #050810 100%)';

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

    // Create Luxury Architectural HUD Overlay
    const uiOverlay = document.createElement('div');
    uiOverlay.className = 'elevator-hud-overlay';
    uiOverlay.innerHTML = `
      <!-- Top Status Header -->
      <div style="position:absolute; top:14px; left:14px; right:14px; display:flex; justify-content:space-between; align-items:center; z-index:20; pointer-events:none;">
        <div style="background:rgba(8,12,20,0.88); backdrop-filter:blur(14px); border:1px solid rgba(212,175,55,0.3); border-radius:12px; padding:6px 14px; display:flex; align-items:center; gap:10px; box-shadow:0 8px 24px rgba(0,0,0,0.6);">
          <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:#22c55e; box-shadow:0 0 10px #22c55e;" id="lift-status-dot"></span>
          <div style="display:flex; flex-direction:column;">
            <span style="font-family:'Sora',sans-serif; font-weight:800; font-size:12px; color:#f8fafc; letter-spacing:0.04em;" id="lift-display-text">GROUND LOBBY (G)</span>
            <span style="font-size:9px; color:#c5a059; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Universal MRL Series</span>
          </div>
          <span style="font-family:monospace; font-size:11px; color:#d4af37; background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.25); padding:3px 8px; border-radius:6px; font-weight:700;" id="lift-arrow-text">■ LEVEL</span>
        </div>
        
        <div style="display:flex; gap:8px; pointer-events:auto;">
          <button id="lift-sound-btn" title="Toggle Elevator Chime" style="background:rgba(8,12,20,0.85); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.15); border-radius:10px; color:#e2e8f0; font-size:13px; padding:6px 12px; cursor:pointer; transition:all 0.25s; box-shadow:0 4px 15px rgba(0,0,0,0.4);">
            <span id="sound-icon">🔊</span>
          </button>
          <button id="lift-reset-cam" title="Reset 3D Perspective" style="background:rgba(8,12,20,0.85); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.15); border-radius:10px; color:#cbd5e1; font-size:11px; padding:6px 12px; cursor:pointer; font-weight:700; transition:all 0.25s; box-shadow:0 4px 15px rgba(0,0,0,0.4);">
            Reset 3D
          </button>
        </div>
      </div>

      <!-- Right Car Operating Panel (COP) -->
      <div style="position:absolute; right:14px; top:50%; transform:translateY(-50%); z-index:20; background:rgba(8,12,20,0.92); backdrop-filter:blur(16px); border:1px solid rgba(212,175,55,0.35); border-radius:16px; padding:12px 10px; display:flex; flex-direction:column; gap:7px; align-items:center; box-shadow:0 12px 35px rgba(0,0,0,0.7);">
        <div style="font-size:9px; font-weight:800; color:#c5a059; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:2px;">Call Floor</div>
        <button class="floor-btn" data-floor="5" style="width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(135deg, #1e293b, #0f172a); color:#f8fafc; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">5F</button>
        <button class="floor-btn" data-floor="4" style="width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(135deg, #1e293b, #0f172a); color:#f8fafc; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">4F</button>
        <button class="floor-btn" data-floor="3" style="width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(135deg, #1e293b, #0f172a); color:#f8fafc; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">3F</button>
        <button class="floor-btn" data-floor="2" style="width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(135deg, #1e293b, #0f172a); color:#f8fafc; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">2F</button>
        <button class="floor-btn" data-floor="1" style="width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:linear-gradient(135deg, #1e293b, #0f172a); color:#f8fafc; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s;">1F</button>
        <button class="floor-btn active" data-floor="0" style="width:36px; height:36px; border-radius:50%; border:1px solid #d4af37; background:linear-gradient(135deg, #d4af37, #b8932b); color:#080c14; font-family:'Sora',sans-serif; font-size:12px; font-weight:800; cursor:pointer; transition:all 0.2s; box-shadow:0 0 14px rgba(212,175,55,0.6);">G</button>
        
        <div style="height:1px; width:26px; background:rgba(212,175,55,0.25); margin:4px 0;"></div>
        
        <div style="display:flex; gap:5px;">
          <button id="door-open-btn" title="Open Doors" style="width:28px; height:24px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); background:#1e293b; color:#cbd5e1; font-size:10px; cursor:pointer; transition:all 0.2s;">◄►</button>
          <button id="door-close-btn" title="Close Doors" style="width:28px; height:24px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); background:#1e293b; color:#cbd5e1; font-size:10px; cursor:pointer; transition:all 0.2s;">►◄</button>
        </div>
      </div>

      <!-- Bottom Hint -->
      <div style="position:absolute; bottom:14px; left:14px; z-index:20; pointer-events:none; display:flex; align-items:center; gap:8px;">
        <span style="font-size:11px; color:#cbd5e1; background:rgba(8,12,20,0.85); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:5px 12px; box-shadow:0 4px 15px rgba(0,0,0,0.5);">
          ✨ Realistic 3D Simulation · Drag to orbit · Select floor to ride
        </span>
      </div>
    `;
    container.appendChild(uiOverlay);

    // Audio Chime Synthesizer
    let soundEnabled = true;
    let audioCtx = null;
    function playChime() {
      if (!soundEnabled || prefersReducedMotion) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const now = audioCtx.currentTime;
        
        // Bell Note 1
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(783.99, now); // G5
        gain1.gain.setValueAtTime(0.16, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.7);

        // Bell Note 2 (Resolution)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.16); // E5
        gain2.gain.setValueAtTime(0.18, now + 0.16);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.16);
        osc2.stop(now + 1.1);
      } catch (e) {}
    }

    const soundBtn = document.getElementById('lift-sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        soundBtn.style.borderColor = soundEnabled ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.15)';
      });
    }

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a101d, 0.038);

    const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
    const defaultCamPos = { x: 3.1, y: 0.1, z: 6.9 };
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

    // Reset Camera Button
    const resetCamBtn = document.getElementById('lift-reset-cam');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        targetRotX = 0;
        targetRotY = 0.35;
        camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
      });
    }

    // High-End Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Warm Sun/Studio Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Champagne Rim Light
    const goldRimLight = new THREE.DirectionalLight(0xd4af37, 1.1);
    goldRimLight.position.set(-7, 3, -5);
    scene.add(goldRimLight);

    // Cool Sky Fill
    const blueFill = new THREE.DirectionalLight(0x38bdf8, 0.5);
    blueFill.position.set(0, -6, 5);
    scene.add(blueFill);

    // Floor Definitions
    const floorHeights = {
      0: -2.8, // G
      1: -1.7, // 1F
      2: -0.6, // 2F
      3:  0.5, // 3F
      4:  1.6, // 4F
      5:  2.7  // 5F
    };
    const floorNames = {
      0: 'GROUND LOBBY (G)',
      1: '1F · ARCHITECTURAL SHOWROOM',
      2: '2F · CORPORATE SUITES',
      3: '3F · EXECUTIVE LEVEL',
      4: '4F · RESIDENTIAL SUITES',
      5: '5F · SKY PENTHOUSE'
    };

    // Shaft Structure Group
    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    // Materials
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.22
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.32,
      roughness: 0.04,
      metalness: 0.08,
      transmission: 0.88,
      ior: 1.5,
      clearcoat: 1.0
    });
    const floorGlowMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37
    });

    // 4 Vertical Heavy Guide Columns
    const colGeo = new THREE.CylinderGeometry(0.045, 0.045, 8.6, 16);
    const colCoords = [
      [-1.15, -1.05],
      [ 1.15, -1.05],
      [-1.15,  1.05],
      [ 1.15,  1.05]
    ];
    colCoords.forEach(pos => {
      const col = new THREE.Mesh(colGeo, chromeMat);
      col.position.set(pos[0], 0, pos[1]);
      shaftGroup.add(col);
    });

    // Counterweight Rear Guide Rails
    const cwRailGeo = new THREE.CylinderGeometry(0.025, 0.025, 8.6, 12);
    [-0.45, 0.45].forEach(x => {
      const cwRail = new THREE.Mesh(cwRailGeo, darkSteelMat);
      cwRail.position.set(x, 0, -1.18);
      shaftGroup.add(cwRail);
    });

    // Floor Landing Structural Rings & Gold Level Beams
    const ringGeo = new THREE.BoxGeometry(2.45, 0.08, 2.25);
    const neonBeamGeo = new THREE.BoxGeometry(2.48, 0.02, 2.28);
    for (let f = 0; f <= 5; f++) {
      const y = floorHeights[f];
      const ring = new THREE.Mesh(ringGeo, darkSteelMat);
      ring.position.set(0, y - 0.74, 0);
      shaftGroup.add(ring);

      const neonBeam = new THREE.Mesh(neonBeamGeo, floorGlowMat);
      neonBeam.position.set(0, y - 0.74, 0);
      shaftGroup.add(neonBeam);

      // Floor Landing Beacon Dot
      const beaconGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const beacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0xfce8a6 }));
      beacon.position.set(1.24, y, 0);
      shaftGroup.add(beacon);
    }

    // Top Machine Overhead Beams & Hoist Pulleys
    const topCapGeo = new THREE.BoxGeometry(2.5, 0.2, 2.3);
    const topCap = new THREE.Mesh(topCapGeo, chromeMat);
    topCap.position.set(0, 4.25, 0);
    shaftGroup.add(topCap);

    const bottomPitGeo = new THREE.BoxGeometry(2.5, 0.25, 2.3);
    const bottomPit = new THREE.Mesh(bottomPitGeo, darkSteelMat);
    bottomPit.position.set(0, -3.85, 0);
    shaftGroup.add(bottomPit);

    const pulleyGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.09, 32);
    pulleyGeo.rotateZ(Math.PI / 2);
    const pulley1 = new THREE.Mesh(pulleyGeo, goldTrimMat);
    pulley1.position.set(0, 4.0, 0);
    shaftGroup.add(pulley1);

    const pulley2 = new THREE.Mesh(pulleyGeo, goldTrimMat);
    pulley2.position.set(0, 4.0, -0.92);
    shaftGroup.add(pulley2);

    // Luxury Panoramic Elevator Cabin Assembly
    const cabinGroup = new THREE.Group();
    cabinGroup.position.y = floorHeights[0];
    scene.add(cabinGroup);

    const cabinW = 1.62;
    const cabinH = 1.48;
    const cabinD = 1.42;

    // Platform Base with Chamfered Trim
    const baseGeo = new THREE.BoxGeometry(cabinW, 0.12, cabinD);
    const baseMesh = new THREE.Mesh(baseGeo, darkSteelMat);
    baseMesh.position.y = -cabinH / 2;
    cabinGroup.add(baseMesh);

    // Floor Base Gold Trim Band
    const baseTrimGeo = new THREE.BoxGeometry(cabinW + 0.02, 0.02, cabinD + 0.02);
    const baseTrim = new THREE.Mesh(baseTrimGeo, goldTrimMat);
    baseTrim.position.y = -cabinH / 2 + 0.05;
    cabinGroup.add(baseTrim);

    // Ceiling Canopy
    const roofGeo = new THREE.BoxGeometry(cabinW, 0.12, cabinD);
    const roofMesh = new THREE.Mesh(roofGeo, darkSteelMat);
    roofMesh.position.y = cabinH / 2;
    cabinGroup.add(roofMesh);

    const roofTrim = new THREE.Mesh(baseTrimGeo, goldTrimMat);
    roofTrim.position.y = cabinH / 2 - 0.05;
    cabinGroup.add(roofTrim);

    // Cabin Interior Downlight System
    const interiorLight = new THREE.PointLight(0xfff3d6, 2.2, 4.2);
    interiorLight.position.set(0, cabinH / 2 - 0.12, 0);
    cabinGroup.add(interiorLight);

    const ceilingPanelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 24);
    const ceilingPanelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ceilingPanel = new THREE.Mesh(ceilingPanelGeo, ceilingPanelMat);
    ceilingPanel.position.set(0, cabinH / 2 - 0.05, 0);
    cabinGroup.add(ceilingPanel);

    // Corner Stainless & Gold Beveled Pillars
    const pillarGeo = new THREE.BoxGeometry(0.06, cabinH - 0.12, 0.06);
    const pillarPositions = [
      [-cabinW / 2 + 0.03, -cabinD / 2 + 0.03],
      [ cabinW / 2 - 0.03, -cabinD / 2 + 0.03],
      [-cabinW / 2 + 0.03,  cabinD / 2 - 0.03],
      [ cabinW / 2 - 0.03,  cabinD / 2 - 0.03]
    ];
    pillarPositions.forEach(p => {
      const pillar = new THREE.Mesh(pillarGeo, chromeMat);
      pillar.position.set(p[0], 0, p[1]);
      cabinGroup.add(pillar);
    });

    // Rear Luxury Mirror Wall
    const mirrorWallGeo = new THREE.BoxGeometry(cabinW - 0.12, cabinH - 0.14, 0.02);
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.98,
      roughness: 0.03
    });
    const mirrorWall = new THREE.Mesh(mirrorWallGeo, mirrorMat);
    mirrorWall.position.set(0, 0, -cabinD / 2 + 0.025);
    cabinGroup.add(mirrorWall);

    // Panoramic Side Glass Walls
    const sideGlassGeo = new THREE.BoxGeometry(0.02, cabinH - 0.14, cabinD - 0.12);
    const leftGlass = new THREE.Mesh(sideGlassGeo, glassMat);
    leftGlass.position.set(-cabinW / 2 + 0.025, 0, 0);
    cabinGroup.add(leftGlass);

    const rightGlass = new THREE.Mesh(sideGlassGeo, glassMat);
    rightGlass.position.set(cabinW / 2 - 0.025, 0, 0);
    cabinGroup.add(rightGlass);

    // Polished Gold Handrail
    const railGeom = new THREE.CylinderGeometry(0.022, 0.022, cabinW - 0.28, 16);
    railGeom.rotateZ(Math.PI / 2);
    const handrail = new THREE.Mesh(railGeom, goldTrimMat);
    handrail.position.set(0, -0.18, -cabinD / 2 + 0.12);
    cabinGroup.add(handrail);

    // Telescopic Sliding Doors
    const doorW = (cabinW - 0.14) / 2;
    const doorH = cabinH - 0.16;
    const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.03);

    const doorMat = new THREE.MeshStandardMaterial({
      color: 0xc8d1dc,
      metalness: 0.94,
      roughness: 0.2
    });

    const leftDoor = new THREE.Mesh(doorGeo, doorMat);
    leftDoor.position.set(-doorW / 2, 0, cabinD / 2 - 0.02);
    cabinGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(doorGeo, doorMat);
    rightDoor.position.set(doorW / 2, 0, cabinD / 2 - 0.02);
    cabinGroup.add(rightDoor);

    // Door Glass Vision Panels
    const doorGlassGeo = new THREE.BoxGeometry(doorW * 0.45, doorH * 0.72, 0.035);
    const leftDoorGlass = new THREE.Mesh(doorGlassGeo, glassMat);
    leftDoor.add(leftDoorGlass);

    const rightDoorGlass = new THREE.Mesh(doorGlassGeo, glassMat);
    rightDoor.add(rightDoorGlass);

    // Digital Header Indicator on Car
    const carHeaderGeo = new THREE.BoxGeometry(0.72, 0.11, 0.04);
    const carHeaderMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
    const carHeader = new THREE.Mesh(carHeaderGeo, carHeaderMat);
    carHeader.position.set(0, cabinH / 2 + 0.045, cabinD / 2);
    cabinGroup.add(carHeader);

    // Roof Hitch & Cables
    const hitchGeo = new THREE.BoxGeometry(0.38, 0.16, 0.38);
    const hitch = new THREE.Mesh(hitchGeo, darkSteelMat);
    hitch.position.set(0, cabinH / 2 + 0.14, 0);
    cabinGroup.add(hitch);

    // Counterweight Assembly
    const cwGroup = new THREE.Group();
    const cwGeo = new THREE.BoxGeometry(0.82, 1.15, 0.22);
    const cwMesh = new THREE.Mesh(cwGeo, darkSteelMat);
    cwGroup.add(cwMesh);
    cwGroup.position.set(0, -floorHeights[0] * 0.95, -1.18);
    scene.add(cwGroup);

    // Steel Suspension Cables
    const cableMat = new THREE.LineBasicMaterial({ color: 0xcfd8dc, linewidth: 2 });
    
    const cabinCablePoints = [
      new THREE.Vector3(0, cabinGroup.position.y + cabinH / 2 + 0.2, 0),
      new THREE.Vector3(0, 4.0, 0)
    ];
    const cabinCableGeo = new THREE.BufferGeometry().setFromPoints(cabinCablePoints);
    const cabinCable = new THREE.Line(cabinCableGeo, cableMat);
    scene.add(cabinCable);

    const cwCablePoints = [
      new THREE.Vector3(0, cwGroup.position.y + 0.6, -1.18),
      new THREE.Vector3(0, 4.0, -0.92)
    ];
    const cwCableGeo = new THREE.BufferGeometry().setFromPoints(cwCablePoints);
    const cwCable = new THREE.Line(cwCableGeo, cableMat);
    scene.add(cwCable);

    // Animation & State Machine Variables
    let currentFloor = 0;
    let targetFloor = 0;
    let cabinY = floorHeights[0];
    let targetY = floorHeights[0];
    let isMoving = false;
    let doorProgress = 0; // 0 = closed, 1 = open
    let targetDoorProgress = 0;
    let state = 'IDLE'; // IDLE, MOVING, OPENING, WAITING, CLOSING
    let dwellTimer = 0;
    let tourTimer = 0;
    const tourSequence = [0, 2, 5, 3, 1, 4];
    let tourIndex = 0;
    const maxDoorSlide = doorW * 0.88;

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
          arrowText.style.color = '#d4af37';
        } else if (state === 'OPENING' || state === 'WAITING') {
          arrowText.textContent = '◄► DOORS OPEN';
          arrowText.style.color = '#22c55e';
        } else if (state === 'CLOSING') {
          arrowText.textContent = '►◄ CLOSING';
          arrowText.style.color = '#f59e0b';
        } else {
          arrowText.textContent = '■ LEVEL';
          arrowText.style.color = '#d4af37';
        }
      }
      if (statusDot) {
        statusDot.style.background = isMoving ? '#d4af37' : '#22c55e';
        statusDot.style.boxShadow = isMoving ? '0 0 12px #d4af37' : '0 0 10px #22c55e';
      }
      floorButtons.forEach(btn => {
        const f = parseInt(btn.getAttribute('data-floor'), 10);
        if (f === currentFloor && !isMoving) {
          btn.style.borderColor = '#d4af37';
          btn.style.background = 'linear-gradient(135deg, #d4af37, #b8932b)';
          btn.style.color = '#080c14';
          btn.style.boxShadow = '0 0 14px rgba(212,175,55,0.6)';
        } else if (f === targetFloor && isMoving) {
          btn.style.borderColor = '#f59e0b';
          btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
          btn.style.color = '#080c14';
          btn.style.boxShadow = '0 0 14px rgba(245,158,11,0.6)';
        } else {
          btn.style.borderColor = 'rgba(255,255,255,0.15)';
          btn.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
          btn.style.color = '#f8fafc';
          btn.style.boxShadow = 'none';
        }
      });
    }

    function callFloor(floorNum) {
      if (floorNum < 0 || floorNum > 5) return;
      tourTimer = 0;

      if (floorNum === currentFloor && !isMoving) {
        state = 'OPENING';
        targetDoorProgress = 1;
        playChime();
        updateUI();
        return;
      }

      targetFloor = floorNum;
      targetY = floorHeights[targetFloor];

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

    floorButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const f = parseInt(btn.getAttribute('data-floor'), 10);
        callFloor(f);
      });
    });

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

    // Interactive Drag to Orbit & Parallax
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

        targetRotY += deltaX * 0.007;
        targetRotX += deltaY * 0.007;
        targetRotX = Math.max(-0.55, Math.min(0.55, targetRotX));
      } else {
        const rect = container.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          targetRotY = 0.35 + normX * 0.22;
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

        targetRotY += deltaX * 0.009;
        targetRotX += deltaY * 0.009;
        targetRotX = Math.max(-0.55, Math.min(0.55, targetRotX));
      }
    }, { passive: true });

    // Handle Resize
    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    updateUI();

    // Render Animation Loop
    let lastTime = performance.now();

    function animate(currentTime) {
      requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Orbit camera damping
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;

      const radius = 7.1;
      camera.position.x = Math.sin(rotY) * radius * Math.cos(rotX);
      camera.position.z = Math.cos(rotY) * radius * Math.cos(rotX);
      camera.position.y = Math.sin(rotX) * radius + (cabinGroup.position.y * 0.35);
      camera.lookAt(0, cabinGroup.position.y * 0.5, 0);

      // Pulley rotation while travelling
      if (isMoving) {
        const dir = targetY > cabinY ? 1 : -1;
        pulley1.rotation.x += dir * dt * 3.8;
        pulley2.rotation.x += dir * dt * 3.8;
      }

      // Kinematics & Door State Machine
      if (state === 'MOVING') {
        const dist = targetY - cabinY;
        const absDist = Math.abs(dist);

        if (absDist < 0.02) {
          cabinY = targetY;
          isMoving = false;
          currentFloor = targetFloor;
          state = 'OPENING';
          targetDoorProgress = 1;
          dwellTimer = 0;
          playChime();
          updateUI();
        } else {
          // Smooth sinusoidal ease
          const speed = Math.max(0.65, Math.min(2.7, absDist * 2.3));
          cabinY += Math.sign(dist) * speed * dt;

          // Closest floor indicator
          let nearestF = 0;
          let minD = 999;
          for (let f = 0; f <= 5; f++) {
            const d = Math.abs(cabinY - floorHeights[f]);
            if (d < minD) {
              minD = d;
              nearestF = f;
            }
          }
          if (displayText && displayText.textContent !== floorNames[nearestF]) {
            displayText.textContent = floorNames[nearestF];
          }
        }
      } else if (state === 'CLOSING') {
        doorProgress += (targetDoorProgress - doorProgress) * 4.6 * dt;
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
        doorProgress += (targetDoorProgress - doorProgress) * 4.2 * dt;
        if (doorProgress > 0.98) {
          doorProgress = 1;
          state = 'WAITING';
          dwellTimer = 0;
          updateUI();
        }
      } else if (state === 'WAITING') {
        dwellTimer += dt;
        if (dwellTimer > 2.6) {
          state = 'CLOSING';
          targetDoorProgress = 0;
          updateUI();
        }
      } else if (state === 'IDLE') {
        // Continuous Natural Tour Patrol
        tourTimer += dt;
        if (tourTimer > 5.5) {
          tourTimer = 0;
          tourIndex = (tourIndex + 1) % tourSequence.length;
          const nextFloor = tourSequence[tourIndex];
          if (nextFloor !== currentFloor) {
            callFloor(nextFloor);
          }
        }
      }

      // Update Cabin & Counterweight Y positions
      cabinGroup.position.y = cabinY;
      cwGroup.position.y = -cabinY * 0.95;

      // Sliding doors
      const slide = doorProgress * maxDoorSlide;
      leftDoor.position.x = -doorW / 2 - slide;
      rightDoor.position.x = doorW / 2 + slide;

      // Update dynamic cables
      const cPos = cabinCable.geometry.attributes.position.array;
      cPos[0] = 0;
      cPos[1] = cabinY + cabinH / 2 + 0.14;
      cPos[2] = 0;
      cPos[3] = 0;
      cPos[4] = 4.0;
      cPos[5] = 0;
      cabinCable.geometry.attributes.position.needsUpdate = true;

      const cwPos = cwCable.geometry.attributes.position.array;
      cwPos[0] = 0;
      cwPos[1] = cwGroup.position.y + 0.58;
      cwPos[2] = -1.18;
      cwPos[3] = 0;
      cwPos[4] = 4.0;
      cwPos[5] = -0.92;
      cwCable.geometry.attributes.position.needsUpdate = true;

      // Render Three.js Scene
      renderer.render(scene, camera);
    }

    animate(performance.now());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElevator3D);
  } else {
    initElevator3D();
  }
})();
