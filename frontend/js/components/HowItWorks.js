/**
 * Synapse Technical Architecture Component
 * "What's happening behind the scenes."
 * Clean pipeline nodes + expandable technical specifications for evaluation.
 */

export function renderHowItWorks(container) {
  container.innerHTML = `
    <section class="section how-section" id="architecture">
      <div class="container">
        <div class="how-header">
          <span class="how-label">Under the Hood</span>
          <h2 class="how-title">Behind the engine.</h2>
          <p class="how-subtitle">
            What actually happens under the hood—from raw video stream to fully rendered vertical shorts.
          </p>
        </div>

        <!-- Sequential Pipeline Flow -->
        <div class="pipeline-flow" aria-label="Processing Pipeline Flow">
          <div class="pipeline-node">
            <div class="node-icon-box">📹</div>
            <div class="node-label">Source Stream</div>
            <div class="node-subtext">yt-dlp stream ingestion</div>
          </div>

          <div class="pipeline-arrow" aria-hidden="true">→</div>

          <div class="pipeline-node">
            <div class="node-icon-box">🎙️</div>
            <div class="node-label">Audio Extraction</div>
            <div class="node-subtext">Demux & volume normalization</div>
          </div>

          <div class="pipeline-arrow" aria-hidden="true">→</div>

          <div class="pipeline-node">
            <div class="node-icon-box">📝</div>
            <div class="node-label">Transcription</div>
            <div class="node-subtext">Whisper ASR word-level timing</div>
          </div>

          <div class="pipeline-arrow" aria-hidden="true">→</div>

          <div class="pipeline-node">
            <div class="node-icon-box">🧠</div>
            <div class="node-label">Highlight AI</div>
            <div class="node-subtext">LLM content analysis & scoring</div>
          </div>

          <div class="pipeline-arrow" aria-hidden="true">→</div>

          <div class="pipeline-node">
            <div class="node-icon-box">📐</div>
            <div class="node-label">Auto Framing</div>
            <div class="node-subtext">Dynamic 9:16 center cropping</div>
          </div>

          <div class="pipeline-arrow" aria-hidden="true">→</div>

          <div class="pipeline-node">
            <div class="node-icon-box">✨</div>
            <div class="node-label">Export</div>
            <div class="node-subtext">H.264 MP4 output</div>
          </div>
        </div>

        <!-- Optional Expandable Technical Architecture Details -->
        <div>
          <button type="button" class="tech-spec-toggle" id="specToggleBtn" aria-expanded="false">
            <span>Show system architecture details</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div class="tech-spec-content" id="specContent" aria-hidden="true">
            <div class="tech-specs-grid">
              <div class="tech-spec-item">
                <span class="tech-spec-name">Stream Ingestion</span>
                <span class="tech-spec-val">
                  yt-dlp resolves adaptive audio/video streams, selects the highest resolution single stream or demuxes for separate processing.
                </span>
              </div>

              <div class="tech-spec-item">
                <span class="tech-spec-name">Acoustic Transcription</span>
                <span class="tech-spec-val">
                  Groq Cloud Whisper-large-v3 turbo for sub-second word-level timestamps, with automatic fallback to offline local Whisper model.
                </span>
              </div>

              <div class="tech-spec-item">
                <span class="tech-spec-name">Content & Retention Reasoning</span>
                <span class="tech-spec-val">
                  Groq Compound & Qwen-3.8 evaluate transcript chunks for narrative yield, identifying standalone hooks and insights without dangling context.
                </span>
              </div>

              <div class="tech-spec-item">
                <span class="tech-spec-name">FFmpeg & OpenCV Framing</span>
                <span class="tech-spec-val">
                  Even-dimension parity center crop (9:16) with anti-aliased typographic overlays and audio re-muxing via FFmpeg 7.1.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const toggle = container.querySelector("#specToggleBtn");
  const content = container.querySelector("#specContent");

  let isOpen = false;
  if (toggle && content) {
    toggle.addEventListener("click", () => {
      isOpen = !isOpen;
      toggle.classList.toggle("open", isOpen);
      content.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      content.setAttribute("aria-hidden", String(!isOpen));
      toggle.querySelector("span").textContent = isOpen
        ? "Hide system architecture details"
        : "Show system architecture details";
    });
  }
}
