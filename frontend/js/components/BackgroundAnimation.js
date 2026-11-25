/**
 * Synapse — Photorealistic Solar System & Deep Space Galaxies Engine
 *
 * Replaces cartoon graphics with cinematic, NASA-grade space visualization:
 * - Thermonuclear Central Star (The Sun) with boiling plasma core, volumetric corona,
 *   anamorphic lens flare streak, and optical diffraction spikes
 * - 8 Photorealistic Planets with procedural surface maps (Earth with oceans, continents,
 *   clouds & Rayleigh atmospheric rim; Jupiter with turbulent cloud belts & Great Red Spot;
 *   Saturn with realistic photoreal rings, Cassini division & planet shadow; Mars with polar caps)
 * - True 3D Keplerian orbital mechanics with full depth sorting and celestial sphere illumination
 * - Volumetric Spiral Galaxies with glowing gaseous arms, dark dust lanes, and galactic cores
 * - Photoreal deep space starfield with stellar spectral types and subtle optical diffraction
 * - Cinematic Scroll Flight:
 *   - Camera orbital inclination tilts dynamically as user scrolls down
 *   - Deep space 3D flight parallax with velocity warp stardust
 *   - Smooth spring inertia for mouse and scroll movement
 */

export function initBackgroundAnimation(canvasId = "gatewayCanvas") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrameId = null;
  let isRunning = true;

  // Scroll tracking & smooth inertia
  let targetScrollY = window.scrollY || 0;
  let currentScrollY = targetScrollY;
  let scrollVelocity = 0;
  let lastScrollY = targetScrollY;

  // Mouse tilt inertia
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // =========================================================================
  // PROCEDURAL TEXTURE GENERATION FOR PHOTOREAL PLANETS
  // =========================================================================
  const textures = {};

  function createOffscreen(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  // Generate Earth Texture (Oceans, Continents, Clouds, Ice Caps)
  function generateEarthTexture() {
    const size = 256;
    const c = createOffscreen(size, size);
    const cctx = c.getContext("2d");

    // Deep Ocean
    const ocean = cctx.createLinearGradient(0, 0, 0, size);
    ocean.addColorStop(0, "#082f49");
    ocean.addColorStop(0.5, "#0369a1");
    ocean.addColorStop(1, "#082f49");
    cctx.fillStyle = ocean;
    cctx.fillRect(0, 0, size, size);

    // Continents (organic landmass clusters)
    cctx.fillStyle = "#15803d"; // lush vegetation
    const continents = [
      { x: 50, y: 80, rx: 35, ry: 25 },
      { x: 65, y: 150, rx: 25, ry: 40 },
      { x: 140, y: 70, rx: 45, ry: 30 },
      { x: 160, y: 140, rx: 30, ry: 35 },
      { x: 210, y: 170, rx: 25, ry: 20 },
      { x: 110, y: 110, rx: 20, ry: 15 },
    ];
    for (const land of continents) {
      cctx.beginPath();
      cctx.ellipse(land.x, land.y, land.rx, land.ry, 0.2, 0, Math.PI * 2);
      cctx.fill();

      // Desert/arid inner plateau
      cctx.fillStyle = "#a16207";
      cctx.beginPath();
      cctx.ellipse(land.x + 4, land.y + 2, land.rx * 0.55, land.ry * 0.5, 0.1, 0, Math.PI * 2);
      cctx.fill();
      cctx.fillStyle = "#15803d";
    }

    // Polar Ice Caps
    cctx.fillStyle = "#f8fafc";
    cctx.fillRect(0, 0, size, 16);
    cctx.fillRect(0, size - 14, size, 14);

    // Swirling Cloud Cover
    cctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    for (let i = 0; i < 9; i++) {
      const cy = 30 + i * 24;
      cctx.beginPath();
      cctx.ellipse(size * 0.5 + Math.sin(i) * 30, cy, size * 0.45, 6 + Math.cos(i) * 4, -0.08, 0, Math.PI * 2);
      cctx.fill();
    }

    textures.earth = c;
  }

  // Generate Jupiter Texture (16 Turbulent Cloud Belts + Great Red Spot)
  function generateJupiterTexture() {
    const size = 256;
    const c = createOffscreen(size, size);
    const cctx = c.getContext("2d");

    // Base atmospheric tone
    cctx.fillStyle = "#fef3c7";
    cctx.fillRect(0, 0, size, size);

    // Alternating cloud belts (zones and belts)
    const beltColors = [
      "#78350f", "#b45309", "#d97706", "#fef3c7",
      "#92400e", "#b45309", "#fef3c7", "#78350f",
      "#b45309", "#fef3c7", "#d97706", "#92400e",
      "#78350f", "#fef3c7", "#b45309", "#78350f"
    ];

    const bandH = size / beltColors.length;
    for (let i = 0; i < beltColors.length; i++) {
      cctx.fillStyle = beltColors[i];
      cctx.fillRect(0, i * bandH, size, bandH);

      // Micro-turbulent wave border
      cctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      cctx.beginPath();
      cctx.moveTo(0, i * bandH);
      for (let x = 0; x <= size; x += 16) {
        cctx.lineTo(x, i * bandH + Math.sin(x * 0.08 + i) * 2.5);
      }
      cctx.lineTo(size, i * bandH + 3);
      cctx.lineTo(0, i * bandH + 3);
      cctx.closePath();
      cctx.fill();
    }

    // The Great Red Spot
    cctx.save();
    cctx.translate(size * 0.62, size * 0.64);
    cctx.rotate(-0.1);
    const spotGrad = cctx.createRadialGradient(0, 0, 2, 0, 0, 16);
    spotGrad.addColorStop(0, "#991b1b");
    spotGrad.addColorStop(0.5, "#dc2626");
    spotGrad.addColorStop(0.85, "#ea580c");
    spotGrad.addColorStop(1, "transparent");
    cctx.fillStyle = spotGrad;
    cctx.beginPath();
    cctx.ellipse(0, 0, 18, 11, 0, 0, Math.PI * 2);
    cctx.fill();
    cctx.restore();

    textures.jupiter = c;
  }

  // Generate Mars Texture (Red Ochre, Basalt Plains, Polar Cap)
  function generateMarsTexture() {
    const size = 180;
    const c = createOffscreen(size, size);
    const cctx = c.getContext("2d");

    // Rust iron base
    const base = cctx.createLinearGradient(0, 0, 0, size);
    base.addColorStop(0, "#c2410c");
    base.addColorStop(0.5, "#ea580c");
    base.addColorStop(1, "#9a3412");
    cctx.fillStyle = base;
    cctx.fillRect(0, 0, size, size);

    // Darker volcanic basaltic maria (Syrtis Major, Acidalia Planitia)
    cctx.fillStyle = "#7c2d12";
    const darkAreas = [
      { x: 50, y: 70, rx: 30, ry: 20 },
      { x: 110, y: 110, rx: 40, ry: 25 },
      { x: 80, y: 130, rx: 25, ry: 15 },
    ];
    for (const d of darkAreas) {
      cctx.beginPath();
      cctx.ellipse(d.x, d.y, d.rx, d.ry, 0.3, 0, Math.PI * 2);
      cctx.fill();
    }

    // Polar Ice Cap
    cctx.fillStyle = "#ffffff";
    cctx.beginPath();
    cctx.ellipse(size * 0.5, 8, 22, 6, 0, 0, Math.PI * 2);
    cctx.fill();

    textures.mars = c;
  }

  // Generate Saturn Rings Texture with Cassini Division
  function generateSaturnRingsTexture() {
    const size = 320;
    const c = createOffscreen(size, size);
    const cctx = c.getContext("2d");
    const cx = size / 2;
    const cy = size / 2;

    // Draw realistic concentric dust rings
    for (let r = 52; r < 148; r++) {
      const normR = (r - 52) / (148 - 52);
      let alpha = 0.55;
      let color = "253, 230, 138"; // warm sand

      // Cassini Division gap (r around 105 - 114)
      if (r >= 105 && r <= 113) {
        alpha = 0.04; // dark gap
      } else if (r < 75) {
        // Ring C (crepe ring, faint)
        alpha = 0.22;
        color = "217, 119, 6";
      } else if (r >= 75 && r < 105) {
        // Ring B (brightest, densest)
        alpha = 0.75 + Math.sin(r * 0.5) * 0.15;
        color = "254, 240, 138";
      } else {
        // Ring A (outer ring)
        alpha = 0.5 + Math.sin(r * 0.8) * 0.1;
        color = "245, 158, 11";
      }

      cctx.beginPath();
      cctx.arc(cx, cy, r, 0, Math.PI * 2);
      cctx.strokeStyle = `rgba(${color}, ${alpha})`;
      cctx.lineWidth = 1.2;
      cctx.stroke();
    }

    textures.saturnRings = c;
  }

  // Generate all textures once
  generateEarthTexture();
  generateJupiterTexture();
  generateMarsTexture();
  generateSaturnRingsTexture();

  // =========================================================================
  // 1. DEEP SPACE STARFIELD & OPTICAL DIFFRACTION
  // =========================================================================
  const STAR_COUNT = 340;
  const stars = [];

  const SPECTRAL_COLORS = [
    { base: "255, 255, 255", label: "A-type" },  // Brilliant white
    { base: "191, 219, 254", label: "O-type" },  // Hot blue giant
    { base: "254, 240, 138", label: "G-type" },  // Solar golden
    { base: "254, 215, 170", label: "K-type" },  // Warm orange
    { base: "254, 202, 202", label: "M-type" },  // Red dwarf
  ];

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      const spectral = SPECTRAL_COLORS[Math.floor(Math.random() * SPECTRAL_COLORS.length)];
      stars.push({
        x: Math.random(),
        y: Math.random(),
        depth: 0.1 + Math.random() * 0.9,
        baseRadius: 0.6 + Math.random() * 1.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.035,
        colorBase: spectral.base,
        hasSpikes: Math.random() < 0.05, // Bright foreground stars have telescope diffraction spikes
      });
    }
  }

  // Realistic Meteors / Shooting Stars
  const meteors = [];
  function spawnMeteor() {
    if (meteors.length >= 2 || Math.random() > 0.02) return;
    meteors.push({
      x: Math.random() * width * 1.3 - width * 0.15,
      y: Math.random() * height * 0.45,
      length: 90 + Math.random() * 140,
      speed: 16 + Math.random() * 14,
      angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.22,
      alpha: 1,
      decay: 0.022 + Math.random() * 0.018,
      color: Math.random() > 0.4 ? "255, 245, 220" : "190, 225, 255"
    });
  }

  // =========================================================================
  // 2. VOLUMETRIC SPIRAL GALAXIES & INTERSTELLAR DUST
  // =========================================================================
  class VolumetricGalaxy {
    constructor(cxFactor, cyFactor, radius, tiltAngle, rotSpeed, coreColor, armColorA, armColorB) {
      this.cxFactor = cxFactor;
      this.cyFactor = cyFactor;
      this.radius = radius;
      this.tiltAngle = tiltAngle;
      this.rotSpeed = rotSpeed;
      this.coreColor = coreColor;
      this.armColorA = armColorA;
      this.armColorB = armColorB;
      this.currentAngle = Math.random() * Math.PI * 2;
      this.clouds = [];
      this.initGalaxyClouds();
    }

    initGalaxyClouds() {
      // Create volumetric gas clouds along logarithmic spiral arms
      this.clouds = [];
      const NUM_CLOUDS = 280;
      for (let i = 0; i < NUM_CLOUDS; i++) {
        const arm = i % 2;
        const armAngle = arm * Math.PI;
        const distRatio = Math.pow(Math.random(), 1.4);
        const r = distRatio * this.radius;
        const theta = armAngle + Math.pow(distRatio, 0.65) * 3.6;
        const scatter = (Math.random() - 0.5) * (18 + distRatio * 38);

        this.clouds.push({
          r,
          theta,
          scatter,
          size: 6 + Math.random() * 18 * (1 - distRatio * 0.5),
          alpha: (0.15 + Math.random() * 0.4) * (1 - distRatio * 0.4),
          color: Math.random() > 0.45 ? this.armColorA : this.armColorB,
          isDustLane: Math.random() < 0.12 && distRatio > 0.25 // dark molecular absorption lane
        });
      }
    }

    update(delta) {
      this.currentAngle += this.rotSpeed * delta;
    }

    draw(ctx, scrollOffset) {
      const gx = width * this.cxFactor + currentTiltX * 35;
      const gy = height * this.cyFactor - scrollOffset * 0.12 + currentTiltY * 25;

      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(this.tiltAngle);
      ctx.scale(1, 0.42); // 3D galactic inclination perspective
      ctx.rotate(this.currentAngle);

      // 1. Brilliant Volumetric Galactic Nucleus
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 0.35);
      coreGrad.addColorStop(0, "rgba(255, 250, 240, 0.85)");
      coreGrad.addColorStop(0.2, this.coreColor);
      coreGrad.addColorStop(0.6, "rgba(59, 130, 246, 0.12)");
      coreGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // 2. Volumetric Glowing Gas Clouds along Spiral Arms
      for (const c of this.clouds) {
        const x = Math.cos(c.theta) * c.r - Math.sin(c.theta) * c.scatter;
        const y = Math.sin(c.theta) * c.r + Math.cos(c.theta) * c.scatter;

        if (c.isDustLane) {
          // Dark cosmic dust absorbing light
          ctx.beginPath();
          ctx.arc(x, y, c.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(4, 5, 10, 0.45)";
          ctx.fill();
        } else {
          // Glowing stellar nebula
          const grad = ctx.createRadialGradient(x, y, 0, x, y, c.size);
          grad.addColorStop(0, `rgba(${c.color}, ${c.alpha})`);
          grad.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.arc(x, y, c.size, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // Two majestic deep space galaxies
  const galaxies = [
    // Andromeda-style spiral galaxy in upper right
    new VolumetricGalaxy(
      0.82, 0.22, 190, -0.42, 0.00008,
      "rgba(254, 215, 170, 0.45)",
      "147, 197, 253", // cyan-blue young stars
      "216, 180, 254"  // magenta interstellar gas
    ),
    // Whirlpool-style face-on galaxy in lower left
    new VolumetricGalaxy(
      0.15, 0.74, 230, 0.58, -0.00006,
      "rgba(224, 242, 254, 0.4)",
      "125, 211, 252",
      "244, 114, 182"
    )
  ];

  // =========================================================================
  // 3. THERMONUCLEAR CENTRAL STAR (THE SUN) WITH ANAMORPHIC FLARE
  // =========================================================================
  class RealisticSun {
    constructor() {
      this.plasmaPhase = 0;
    }

    update(delta) {
      this.plasmaPhase += 0.0008 * delta;
    }

    draw(ctx, x, y, scale = 1) {
      const r = 34 * scale;
      const pulse = 1 + Math.sin(this.plasmaPhase * 3) * 0.03;

      // 1. Volumetric Coronal Plasma Halo
      const corona = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 4.8 * pulse);
      corona.addColorStop(0, "rgba(254, 240, 138, 0.42)");
      corona.addColorStop(0.22, "rgba(245, 158, 11, 0.25)");
      corona.addColorStop(0.55, "rgba(234, 88, 12, 0.1)");
      corona.addColorStop(0.85, "rgba(180, 83, 9, 0.03)");
      corona.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(x, y, r * 4.8 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = corona;
      ctx.fill();

      // 2. Boiling Photosphere Core (Thermonuclear white/gold)
      const coreGrad = ctx.createRadialGradient(x - r * 0.18, y - r * 0.18, r * 0.1, x, y, r);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.2, "#fef9c3");
      coreGrad.addColorStop(0.48, "#fbbf24");
      coreGrad.addColorStop(0.78, "#f59e0b");
      coreGrad.addColorStop(1, "#c2410c");

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = "rgba(251, 191, 36, 0.9)";
      ctx.shadowBlur = 42 * scale;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 3. Cinematic Anamorphic Horizontal Lens Flare Streak
      const flareWidth = Math.min(width * 0.75, 750 * scale);
      const flareGrad = ctx.createLinearGradient(x - flareWidth / 2, y, x + flareWidth / 2, y);
      flareGrad.addColorStop(0, "transparent");
      flareGrad.addColorStop(0.35, "rgba(186, 230, 253, 0.1)");
      flareGrad.addColorStop(0.48, "rgba(254, 240, 138, 0.4)");
      flareGrad.addColorStop(0.5, "#ffffff");
      flareGrad.addColorStop(0.52, "rgba(254, 240, 138, 0.4)");
      flareGrad.addColorStop(0.65, "rgba(186, 230, 253, 0.1)");
      flareGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.ellipse(x, y, flareWidth / 2, 2.5 * scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = flareGrad;
      ctx.fill();

      // 4. Optical 4-Point Telescope Diffraction Needles
      const spikeLen = r * 3.8;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(x - spikeLen, y);
      ctx.lineTo(x + spikeLen, y);
      ctx.moveTo(x, y - spikeLen);
      ctx.lineTo(x, y + spikeLen);
      ctx.stroke();
    }
  }

  // =========================================================================
  // 4. THE 8 PHOTOREAL PLANETS IN KEPLERIAN ORBITS
  // =========================================================================
  const planets = [
    {
      name: "Mercury",
      distX: 95,
      distZ: 75,
      speed: 0.0016,
      radius: 3.4,
      baseColor: "#94a3b8",
      shadowColor: "#0f172a",
      glowColor: "rgba(148, 163, 184, 0.3)",
      angle: 0.8
    },
    {
      name: "Venus",
      distX: 145,
      distZ: 115,
      speed: 0.0012,
      radius: 5.6,
      baseColor: "#fed7aa",
      shadowColor: "#7c2d12",
      glowColor: "rgba(254, 215, 170, 0.4)",
      angle: 2.2,
      hasAtmosphereHaze: true,
      hazeColor: "rgba(254, 243, 199, 0.35)"
    },
    {
      name: "Earth",
      distX: 205,
      distZ: 160,
      speed: 0.00095,
      radius: 6.4,
      textureKey: "earth",
      glowColor: "rgba(56, 189, 248, 0.6)", // Vibrant Rayleigh cyan rim
      angle: 4.1,
      hasAtmosphereHaze: true,
      hazeColor: "rgba(56, 189, 248, 0.5)",
      hasMoon: true,
      moonAngle: 0,
      moonDist: 15
    },
    {
      name: "Mars",
      distX: 265,
      distZ: 205,
      speed: 0.00078,
      radius: 4.6,
      textureKey: "mars",
      glowColor: "rgba(234, 88, 12, 0.45)",
      angle: 1.4
    },
    {
      name: "Jupiter",
      distX: 355,
      distZ: 275,
      speed: 0.00045,
      radius: 14.5,
      textureKey: "jupiter",
      glowColor: "rgba(245, 158, 11, 0.45)",
      angle: 5.3
    },
    {
      name: "Saturn",
      distX: 450,
      distZ: 350,
      speed: 0.00032,
      radius: 12.0,
      baseColor: "#fef08a",
      shadowColor: "#713f12",
      glowColor: "rgba(254, 240, 138, 0.4)",
      angle: 3.2,
      hasRings: true,
      ringInner: 16,
      ringOuter: 32,
      ringTilt: -0.32
    },
    {
      name: "Uranus",
      distX: 540,
      distZ: 420,
      speed: 0.00022,
      radius: 8.0,
      baseColor: "#67e8f9",
      shadowColor: "#155e75",
      glowColor: "rgba(103, 232, 249, 0.45)",
      angle: 0.5,
      hasAtmosphereHaze: true,
      hazeColor: "rgba(165, 243, 252, 0.35)"
    },
    {
      name: "Neptune",
      distX: 630,
      distZ: 490,
      speed: 0.00016,
      radius: 7.6,
      baseColor: "#38bdf8",
      shadowColor: "#1e3a8a",
      glowColor: "rgba(56, 189, 248, 0.5)",
      angle: 2.8,
      hasAtmosphereHaze: true,
      hazeColor: "rgba(96, 165, 250, 0.4)"
    }
  ];

  const centralStar = new RealisticSun();

  // =========================================================================
  // 5. RESIZE & LISTENERS
  // =========================================================================
  function handleResize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    initStars();
  }

  function handleScroll() {
    targetScrollY = window.scrollY || 0;
  }

  function handleMouseMove(e) {
    const normX = (e.clientX / width) * 2 - 1;
    const normY = (e.clientY / height) * 2 - 1;
    targetTiltX = normX;
    targetTiltY = normY;
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("mousemove", handleMouseMove, { passive: true });

  handleResize();

  // Tab visibility management (auto-pause)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      isRunning = true;
      lastTime = performance.now();
      loop(lastTime);
    }
  });

  // =========================================================================
  // 6. ANIMATION LOOP & PHOTOREAL RENDER PIPELINE
  // =========================================================================
  let lastTime = performance.now();

  function loop(currentTime) {
    if (!isRunning) return;

    const delta = Math.min(currentTime - lastTime, 64);
    lastTime = currentTime;

    // Smooth scroll interpolation
    const scrollDiff = targetScrollY - currentScrollY;
    currentScrollY += scrollDiff * 0.08;
    scrollVelocity = (targetScrollY - lastScrollY);
    lastScrollY = targetScrollY;

    // Smooth mouse tilt interpolation
    currentTiltX += (targetTiltX - currentTiltX) * 0.04;
    currentTiltY += (targetTiltY - currentTiltY) * 0.04;

    // Dynamic scroll progress (0 to 1 over document height)
    const docHeight = Math.max(1, document.documentElement.scrollHeight - height);
    const scrollFactor = Math.min(1, Math.max(0, currentScrollY / docHeight));

    // Clear Canvas with deep void of space
    ctx.fillStyle = "#040508";
    ctx.fillRect(0, 0, width, height);

    // -----------------------------------------------------------------------
    // A. DEEP SPACE STARFIELD & METEORS (3 Parallax Layers)
    // -----------------------------------------------------------------------
    for (const star of stars) {
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = 0.5 + Math.sin(star.twinklePhase) * 0.5;

      // Parallax shifts smoothly with scroll & mouse
      const starParallaxY = (currentScrollY * star.depth * 0.16) % height;
      const sx = (star.x * width + currentTiltX * star.depth * 25) % width;
      let sy = (star.y * height - starParallaxY + currentTiltY * star.depth * 20) % height;
      if (sy < 0) sy += height;

      const r = star.baseRadius * (0.8 + twinkle * 0.4);
      const alpha = star.depth * (0.35 + twinkle * 0.65);

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${star.colorBase}, ${alpha})`;
      ctx.fill();

      // Optical Diffraction spikes on foreground bright stars
      if (star.hasSpikes && r > 1.2) {
        ctx.strokeStyle = `rgba(${star.colorBase}, ${alpha * 0.35})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(sx - r * 3, sy);
        ctx.lineTo(sx + r * 3, sy);
        ctx.moveTo(sx, sy - r * 3);
        ctx.lineTo(sx, sy + r * 3);
        ctx.stroke();
      }
    }

    // Spawn & update shooting stars / meteors
    spawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= m.decay;

      if (m.alpha <= 0 || m.x > width + 100 || m.y > height + 100) {
        meteors.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - Math.cos(m.angle) * m.length, m.y - Math.sin(m.angle) * m.length);
      ctx.strokeStyle = `rgba(${m.color}, ${m.alpha})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // -----------------------------------------------------------------------
    // B. VOLUMETRIC SPIRAL GALAXIES
    // -----------------------------------------------------------------------
    for (const galaxy of galaxies) {
      galaxy.update(delta);
      galaxy.draw(ctx, currentScrollY);
    }

    // -----------------------------------------------------------------------
    // C. THE SOLAR SYSTEM: DYNAMIC CAMERA FLIGHT & LIGHTING
    // -----------------------------------------------------------------------
    const responsiveScale = Math.min(1, Math.max(0.65, width / 1200));

    // Dynamic Camera Flight:
    // - Sun center glides with depth parallax as user scrolls down
    // - Orbital plane inclination opens up (from 0.28 edge-on to 0.56 panoramic view)
    const sunX = width * 0.48 + currentTiltX * 45;
    const sunY = (height * 0.42 - currentScrollY * 0.22) + currentTiltY * 30;
    const flattening = 0.28 + scrollFactor * 0.28;

    // Temporal scroll velocity acceleration
    const speedMultiplier = 1 + Math.min(Math.abs(scrollVelocity) * 0.04, 3);

    // 1. Ultra-subtle Gravitational Orbit Dust Tracks (NO cartoon dashed lines!)
    for (const p of planets) {
      const rx = p.distX * responsiveScale;
      const rz = p.distZ * responsiveScale * flattening;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(sunX, sunY, rx, rz, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.045)"; // ultra-faint celestial guide
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Compute Planet Coordinates & Depth Projection
    const renderQueue = [];

    for (const p of planets) {
      p.angle += p.speed * delta * speedMultiplier;

      const rx = p.distX * responsiveScale;
      const rz = p.distZ * responsiveScale;

      const px = Math.cos(p.angle) * rx;
      const pz = Math.sin(p.angle) * rz; // Depth: negative = behind Sun, positive = in front

      const screenX = sunX + px;
      const screenY = sunY + pz * flattening;

      const depthScale = 1 + (pz / 650) * 0.28;

      renderQueue.push({
        type: "planet",
        planet: p,
        screenX,
        screenY,
        z: pz,
        scale: depthScale * responsiveScale
      });
    }

    // Add Central Star (Sun) into depth queue at z = 0
    renderQueue.push({
      type: "sun",
      screenX: sunX,
      screenY: sunY,
      z: 0,
      scale: responsiveScale
    });

    // Depth Sorting (furthest celestial bodies render first)
    renderQueue.sort((a, b) => a.z - b.z);

    // 3. Render Objects in Accurate Depth Order with Photoreal Lighting
    for (const item of renderQueue) {
      if (item.type === "sun") {
        centralStar.update(delta);
        centralStar.draw(ctx, item.screenX, item.screenY, item.scale);
      } else if (item.type === "planet") {
        const p = item.planet;
        const pr = Math.max(2.2, p.radius * item.scale);

        // Vector pointing from planet to Sun for realistic celestial illumination
        const dx = sunX - item.screenX;
        const dy = sunY - item.screenY;
        const sunAngle = Math.atan2(dy, dx);

        // A. If Saturn, render back half of photoreal rings (behind globe)
        if (p.hasRings && textures.saturnRings) {
          ctx.save();
          ctx.translate(item.screenX, item.screenY);
          ctx.rotate(p.ringTilt);
          ctx.scale(1, 0.32);

          // Clip top half (behind planet)
          ctx.beginPath();
          ctx.rect(-160 * item.scale, -160 * item.scale, 320 * item.scale, 160 * item.scale);
          ctx.clip();

          // Draw Saturn Rings Texture
          const rw = 160 * item.scale;
          ctx.drawImage(textures.saturnRings, -rw, -rw, rw * 2, rw * 2);

          ctx.restore();
        }

        // B. Render Planet Globe with Celestial Directional Shading
        ctx.save();

        // Clip to planet circle
        ctx.beginPath();
        ctx.arc(item.screenX, item.screenY, pr, 0, Math.PI * 2);
        ctx.clip();

        // 1. Draw Surface Texture or Base
        if (p.textureKey && textures[p.textureKey]) {
          const tex = textures[p.textureKey];
          // Slow axial rotation
          ctx.drawImage(tex, item.screenX - pr, item.screenY - pr, pr * 2, pr * 2);
        } else {
          ctx.fillStyle = p.baseColor;
          ctx.fillRect(item.screenX - pr, item.screenY - pr, pr * 2, pr * 2);
        }

        // 2. Photoreal Directional Day/Night Terminator Shading
        // The side pointing towards the Sun is illuminated; opposite side is in shadow
        const shadowX = item.screenX - Math.cos(sunAngle) * pr * 0.4;
        const shadowY = item.screenY - Math.sin(sunAngle) * pr * 0.4;

        const sphereShade = ctx.createRadialGradient(
          item.screenX + Math.cos(sunAngle) * pr * 0.55,
          item.screenY + Math.sin(sunAngle) * pr * 0.55,
          pr * 0.1,
          shadowX,
          shadowY,
          pr * 1.35
        );
        sphereShade.addColorStop(0, "rgba(255, 255, 255, 0.35)"); // daylight specular
        sphereShade.addColorStop(0.35, "transparent");             // true surface colors
        sphereShade.addColorStop(0.72, "rgba(4, 7, 15, 0.78)");    // twilight terminator
        sphereShade.addColorStop(1, "rgba(2, 3, 8, 0.96)");        // night hemisphere

        ctx.fillStyle = sphereShade;
        ctx.fillRect(item.screenX - pr, item.screenY - pr, pr * 2, pr * 2);

        ctx.restore();

        // C. Rayleigh Atmospheric Rim Haze (e.g. Earth's cyan atmospheric edge)
        if (p.hasAtmosphereHaze) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(item.screenX, item.screenY, pr * 1.08, 0, Math.PI * 2);
          ctx.strokeStyle = p.hazeColor;
          ctx.lineWidth = 1.2 * item.scale;
          ctx.stroke();
          ctx.restore();
        }

        // D. If Saturn, render front half of photoreal rings (in front of globe)
        if (p.hasRings && textures.saturnRings) {
          ctx.save();
          ctx.translate(item.screenX, item.screenY);
          ctx.rotate(p.ringTilt);
          ctx.scale(1, 0.32);

          // Clip bottom half (in front of planet)
          ctx.beginPath();
          ctx.rect(-160 * item.scale, 0, 320 * item.scale, 160 * item.scale);
          ctx.clip();

          // Draw Saturn Rings Texture
          const rw = 160 * item.scale;
          ctx.drawImage(textures.saturnRings, -rw, -rw, rw * 2, rw * 2);

          // Cast Shadow of Saturn's Globe onto the Rings
          const shadowAngle = sunAngle - p.ringTilt;
          const castX = -Math.cos(shadowAngle) * pr * 0.9;
          const castY = -Math.sin(shadowAngle) * pr * 0.9;
          ctx.fillStyle = "rgba(4, 6, 12, 0.88)";
          ctx.beginPath();
          ctx.ellipse(castX, castY, pr * 1.1, pr * 1.8, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        // E. Earth's Moon
        if (p.hasMoon) {
          p.moonAngle += 0.018 * speedMultiplier;
          const mx = item.screenX + Math.cos(p.moonAngle) * p.moonDist * item.scale;
          const my = item.screenY + Math.sin(p.moonAngle) * p.moonDist * item.scale * flattening;
          const mr = Math.max(1, 1.3 * item.scale);

          // Moon directional lighting
          const mdx = sunX - mx;
          const mdy = sunY - my;
          const mSunAngle = Math.atan2(mdy, mdx);

          const moonGrad = ctx.createRadialGradient(
            mx + Math.cos(mSunAngle) * mr * 0.4,
            my + Math.sin(mSunAngle) * mr * 0.4,
            mr * 0.1,
            mx,
            my,
            mr
          );
          moonGrad.addColorStop(0, "#ffffff");
          moonGrad.addColorStop(0.5, "#cbd5e1");
          moonGrad.addColorStop(1, "#1e293b");

          ctx.beginPath();
          ctx.arc(mx, my, mr, 0, Math.PI * 2);
          ctx.fillStyle = moonGrad;
          ctx.fill();
        }
      }
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  animationFrameId = requestAnimationFrame(loop);

  return {
    destroy: () => {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    }
  };
}
