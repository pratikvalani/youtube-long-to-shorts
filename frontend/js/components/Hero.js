/**
 * Synapse Hero Component
 * Editorial typography: "Turn long lectures into short lessons."
 * Human language, video studio aesthetic, smooth staggered entrance.
 */

import { renderLectureTimeline } from "./LectureTimeline.js";

export function renderHero(container, { onCreateShortClick, onSeeHowItWorksClick }) {
  container.innerHTML = `
    <section class="hero-section" id="hero">
      <div class="container hero-content">
        <div class="hero-tag">
          <span class="hero-tag-dot"></span>
          <span>AI-POWERED SHORT-FORM STUDIO</span>
        </div>

        <h1 class="hero-headline">
          Your best moments,<br>
          <span class="serif-italic">already edited.</span>
        </h1>

        <p class="hero-description">
          Paste a YouTube link. ClipFlow finds the strongest hooks, cuts complete stories, and exports polished vertical shorts—ready to publish.
        </p>

        <div class="hero-actions">
          <button type="button" class="btn-primary" id="heroCreateCta">
            <span>Create a short</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          <button type="button" class="btn-secondary" id="heroHowItWorksBtn">
            <span>See how it works</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        <div class="hero-timeline-stage" id="heroTimelineStage"></div>
      </div>
    </section>
  `;

  const timelineContainer = container.querySelector("#heroTimelineStage");
  if (timelineContainer) {
    renderLectureTimeline(timelineContainer);
  }

  const createBtn = container.querySelector("#heroCreateCta");
  if (createBtn && onCreateShortClick) {
    createBtn.addEventListener("click", onCreateShortClick);
  }

  const howBtn = container.querySelector("#heroHowItWorksBtn");
  if (howBtn && onSeeHowItWorksClick) {
    howBtn.addEventListener("click", onSeeHowItWorksClick);
  }
}
