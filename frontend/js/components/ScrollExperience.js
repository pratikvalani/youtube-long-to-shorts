/**
 * Synapse Scroll Experience ("Global Gateway" Interactive Transformation)
 * Transforms a wide horizontal timeline into separated 9:16 vertical cards.
 */

export function renderScrollExperience(container) {
  const stagesData = [
    {
      num: 1,
      name: "Source Timeline",
      caption: "We load the entire episode, <strong>preserving natural speech rhythms, energy, and tone</strong>.",
    },
    {
      num: 2,
      name: "Playhead Scrub",
      caption: "The model listens closely, <strong>pinpointing natural conversation arcs and emotional peaks</strong>.",
    },
    {
      num: 3,
      name: "Key Moments",
      caption: "The most compelling hooks, punchlines, and insights are <strong>highlighted along the timeline</strong>.",
    },
    {
      num: 4,
      name: "Track Separation",
      caption: "Selected moments <strong>cleanly lift off the main track</strong> into self-contained vertical stories.",
    },
    {
      num: 5,
      name: "9:16 Re-Framing",
      caption: "The wide shot smoothly re-centers, <strong>keeping the speaker framed naturally for mobile screens</strong>.",
    },
    {
      num: 6,
      name: "Final Shorts",
      caption: "Your clips emerge as <strong>fully polished, captioned vertical shorts ready for your feed</strong>.",
    },
  ];

  let currentStage = 1;

  container.innerHTML = `
    <section class="section story-section" id="how-it-works">
      <div class="container">
        <div class="story-header">
          <span class="story-label">Transformation Story</span>
          <h2 class="story-title">From long-form to high-impact clips.</h2>
          <p class="story-subtitle">Watch how a full episode naturally splits and reshapes into standalone clips people can't wait to watch.</p>
        </div>

        <div class="transformation-stage">
          <!-- Stepper navigation -->
          <div class="stage-stepper" role="tablist" aria-label="Transformation Stages">
            ${stagesData
              .map(
                (s) => `
              <button type="button" class="step-btn ${s.num === 1 ? "active" : ""}" data-step="${s.num}" role="tab" aria-selected="${s.num === 1}">
                <span class="step-num">0${s.num}</span>
                <span>${s.name}</span>
              </button>
            `
              )
              .join("")}
          </div>

          <!-- Scene Canvas -->
          <div class="scene-canvas" id="sceneCanvas" data-stage="1">
            <div class="visual-wrapper" id="sceneVisual"></div>
          </div>

          <!-- Scene Caption -->
          <div class="scene-caption" id="sceneCaption">
            ${stagesData[0].caption}
          </div>
        </div>
      </div>
    </section>
  `;

  const canvas = container.querySelector("#sceneCanvas");
  const visualWrapper = container.querySelector("#sceneVisual");
  const captionEl = container.querySelector("#sceneCaption");
  const stepButtons = container.querySelectorAll(".step-btn");

  function renderStageVisual(stageNum) {
    if (stageNum === 1) {
      visualWrapper.innerHTML = `
        <div style="width: 100%; max-width: 760px; background: var(--bg-film-track); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 24px;">
          <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
            <span>00:00:00</span>
            <span>FULL EPISODE TIMELINE (01:15:30)</span>
            <span>01:15:30</span>
          </div>
          <div style="height: 48px; background: rgba(255,255,255,0.06); border-radius: 4px; display: flex; align-items: center; gap: 2px; padding: 4px;">
            ${Array.from({ length: 48 }).map(() => `<div style="flex: 1; background: rgba(255,255,255,0.18); height: ${10 + Math.random() * 28}px; border-radius: 1px;"></div>`).join("")}
          </div>
        </div>
      `;
    } else if (stageNum === 2) {
      visualWrapper.innerHTML = `
        <div style="width: 100%; max-width: 760px; background: var(--bg-film-track); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 24px; position: relative;">
          <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
            <span style="color: var(--accent-film)">PLAYHEAD ACTIVE</span>
            <span>SCRUBBING TIMECODES</span>
            <span>01:15:30</span>
          </div>
          <div style="height: 48px; background: rgba(255,255,255,0.06); border-radius: 4px; display: flex; align-items: center; gap: 2px; padding: 4px; position: relative;">
            ${Array.from({ length: 48 }).map(() => `<div style="flex: 1; background: rgba(255,255,255,0.18); height: ${10 + Math.random() * 28}px; border-radius: 1px;"></div>`).join("")}
            <div style="position: absolute; top: 0; bottom: 0; left: 42%; width: 2px; background: #fff; box-shadow: 0 0 10px #fff;"></div>
          </div>
        </div>
      `;
    } else if (stageNum === 3) {
      visualWrapper.innerHTML = `
        <div style="width: 100%; max-width: 760px; background: var(--bg-film-track); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 24px;">
          <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: var(--accent-film); margin-bottom: 12px;">
            <span>3 CANDIDATE CLIPS FOUND</span>
            <span>CONFIDENCE: 98%</span>
          </div>
          <div style="height: 48px; background: rgba(255,255,255,0.06); border-radius: 4px; display: flex; align-items: center; gap: 2px; padding: 4px;">
            ${Array.from({ length: 48 }).map((_, i) => {
              const isMark = (i >= 8 && i <= 15) || (i >= 22 && i <= 29) || (i >= 36 && i <= 43);
              return `<div style="flex: 1; background: ${isMark ? "var(--accent-film)" : "rgba(255,255,255,0.1)"}; height: ${isMark ? "36px" : "14px"}; border-radius: 1px; transition: all 0.3s;"></div>`;
            }).join("")}
          </div>
        </div>
      `;
    } else if (stageNum === 4) {
      visualWrapper.innerHTML = `
        <div style="display: flex; gap: 20px; width: 100%; max-width: 760px; justify-content: center;">
          <div style="flex: 1; height: 110px; background: var(--bg-elevated); border: 1px solid var(--accent-film); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; justify-content: space-between; transform: translateY(-8px); box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--accent-film);">CLIP 01 (45s)</span>
            <span style="font-size: 13px; font-weight: 600;">The Core Axiom</span>
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);">08:10 – 08:55</span>
          </div>
          <div style="flex: 1; height: 110px; background: var(--bg-elevated); border: 1px solid var(--accent-film); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; justify-content: space-between; transform: translateY(-8px); box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--accent-film);">CLIP 02 (52s)</span>
            <span style="font-size: 13px; font-weight: 600;">Real-world Analogy</span>
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);">24:30 – 25:22</span>
          </div>
          <div style="flex: 1; height: 110px; background: var(--bg-elevated); border: 1px solid var(--accent-film); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; justify-content: space-between; transform: translateY(-8px); box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--accent-film);">CLIP 03 (38s)</span>
            <span style="font-size: 13px; font-weight: 600;">Exam Summary</span>
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);">41:00 – 41:38</span>
          </div>
        </div>
      `;
    } else if (stageNum === 5 || stageNum === 6) {
      visualWrapper.innerHTML = `
        <div class="aspect-cards-container">
          <div class="aspect-card">
            <div class="aspect-card-header">
              <span class="aspect-card-badge">01</span>
              <span>45s</span>
            </div>
            ${stageNum === 6 ? `
              <div class="card-play-glyph">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            ` : ""}
            <div class="aspect-card-body">
              <div class="aspect-card-title">The Core Axiom</div>
              <div class="aspect-card-time">08:10 – 08:55</div>
            </div>
          </div>

          <div class="aspect-card">
            <div class="aspect-card-header">
              <span class="aspect-card-badge">02</span>
              <span>52s</span>
            </div>
            ${stageNum === 6 ? `
              <div class="card-play-glyph">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            ` : ""}
            <div class="aspect-card-body">
              <div class="aspect-card-title">Real-world Analogy</div>
              <div class="aspect-card-time">24:30 – 25:22</div>
            </div>
          </div>

          <div class="aspect-card">
            <div class="aspect-card-header">
              <span class="aspect-card-badge">03</span>
              <span>38s</span>
            </div>
            ${stageNum === 6 ? `
              <div class="card-play-glyph">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            ` : ""}
            <div class="aspect-card-body">
              <div class="aspect-card-title">Exam Summary</div>
              <div class="aspect-card-time">41:00 – 41:38</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  function setStage(stage) {
    currentStage = stage;
    canvas.setAttribute("data-stage", stage);
    captionEl.innerHTML = stagesData[stage - 1].caption;

    stepButtons.forEach((btn) => {
      const sNum = parseInt(btn.getAttribute("data-step"), 10);
      if (sNum === stage) {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      }
    });

    renderStageVisual(stage);
  }

  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.getAttribute("data-step"), 10);
      setStage(step);
    });
  });

  // Initial render
  renderStageVisual(1);

  return {
    setStage,
  };
}
