/**
 * Synapse Features Component (Visual Story)
 * Replaces generic cards with a 3-part visual narrative:
 * 01 One long lecture -> 02 Moments worth keeping -> 03 Shorts people can watch
 */

export function renderFeatures(container) {
  container.innerHTML = `
    <section class="section features-section" id="features">
      <div class="container">
        <div class="features-header">
          <span class="features-label">DESIGNED FOR RETENTION</span>
          <h2 class="features-title">Context-aware clipping, not random cuts.</h2>
          <p class="story-subtitle">
            Most tools cut arbitrary timestamps. YT-Short-Converter listens to the conversation, preserving the setup, the hook, and the payoff so every clip makes sense on its own.
          </p>
        </div>

        <div class="features-story-grid">
          <!-- Step 01 -->
          <div class="feature-step-card">
            <div class="step-marker">
              <span>01</span>
              <span>•</span>
              <span>THE INPUT</span>
            </div>
            <h3 class="feature-heading">The Source</h3>
            <p class="feature-text">
              Long podcasts, keynotes, or interviews where the best moments are hidden across hours of video.
            </p>
            <div class="feature-graphic" aria-hidden="true">
              <div class="graphic-horizontal-bar"></div>
            </div>
          </div>

          <!-- Step 02 -->
          <div class="feature-step-card">
            <div class="step-marker">
              <span>02</span>
              <span>•</span>
              <span>THE SELECTION</span>
            </div>
            <h3 class="feature-heading">Smart Selection</h3>
            <p class="feature-text">
              AI that spots where conversations peak—capturing complete stories, memorable quotes, and breakthrough insights.
            </p>
            <div class="feature-graphic" aria-hidden="true">
              <div class="graphic-pins-row">
                <div class="graphic-pin">intro</div>
                <div class="graphic-pin chosen">Key Idea</div>
                <div class="graphic-pin">pause</div>
              </div>
            </div>
          </div>

          <!-- Step 03 -->
          <div class="feature-step-card">
            <div class="step-marker">
              <span>03</span>
              <span>•</span>
              <span>THE OUTPUT</span>
            </div>
            <h3 class="feature-heading">Production-Ready Output</h3>
            <p class="feature-text">
              Centered 9:16 vertical crop, clean typography, and balanced audio—exported as ready-to-publish MP4 files.
            </p>
            <div class="feature-graphic" aria-hidden="true">
              <div class="graphic-vertical-frames">
                <div class="graphic-mini-frame"></div>
                <div class="graphic-mini-frame"></div>
                <div class="graphic-mini-frame"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
