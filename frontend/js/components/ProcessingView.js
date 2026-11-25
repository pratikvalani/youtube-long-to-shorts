/**
 * Synapse Processing View Component
 * Human language: "Finding the good parts."
 * Custom traveling-signal loading animation (no generic circular spinner!),
 * 5 staged progression indicators, and technical details accordion.
 */

export function renderProcessingView(container, { onCancel }) {
  const stages = [
    { num: 1, name: "Getting the video" },
    { num: 2, name: "Understanding the audio" },
    { num: 3, name: "Finding useful moments" },
    { num: 4, name: "Building the shorts" },
    { num: 5, name: "Preparing your videos" },
  ];

  container.innerHTML = `
    <section class="section" id="processingSection">
      <div class="container">
        <div class="processing-view">
          <div class="processing-header">
            <h2 class="processing-title">Finding the good parts.</h2>
            <p class="processing-subtitle">
              We're analyzing the video and looking for moments that work on their own.
            </p>
          </div>

          <!-- Custom Horizontal Signal/Timeline Waveform -->
          <div class="processing-signal-track" aria-hidden="true">
            <div class="signal-line"></div>
            <div class="signal-pulse-container">
              <span class="signal-dot"></span>
              <span class="signal-dot"></span>
              <span class="signal-dot"></span>
            </div>
            <div class="signal-wave-glow"></div>
          </div>

          <!-- Five Stage Milestones -->
          <div class="stages-list" id="stagesList" role="list">
            ${stages
              .map(
                (st) => `
              <div class="stage-item waiting" data-stage-num="${st.num}" role="listitem">
                <span class="stage-badge">${st.num}</span>
                <span class="stage-name">${st.name}</span>
                <span class="stage-live-detail" id="stageDetail${st.num}"></span>
              </div>
            `
              )
              .join("")}
          </div>

          <!-- Expandable Technical Details -->
          <div>
            <button type="button" class="tech-details-toggle" id="techToggleBtn" aria-expanded="false">
              <span>Show technical details</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div class="tech-logs-pane" id="techLogsPane" aria-hidden="true">
              <div id="techLogsContent">Awaiting initial server response…</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const toggleBtn = container.querySelector("#techToggleBtn");
  const logsPane = container.querySelector("#techLogsPane");
  const logsContent = container.querySelector("#techLogsContent");

  let isLogsOpen = false;
  if (toggleBtn && logsPane) {
    toggleBtn.addEventListener("click", () => {
      isLogsOpen = !isLogsOpen;
      toggleBtn.classList.toggle("open", isLogsOpen);
      logsPane.classList.toggle("open", isLogsOpen);
      toggleBtn.setAttribute("aria-expanded", String(isLogsOpen));
      logsPane.setAttribute("aria-hidden", String(!isLogsOpen));
      toggleBtn.querySelector("span").textContent = isLogsOpen
        ? "Hide technical details"
        : "Show technical details";
    });
  }

  function updateStageUI(activeStageIndex, liveMessage = "", logs = []) {
    for (let i = 1; i <= 5; i++) {
      const item = container.querySelector(`[data-stage-num="${i}"]`);
      const badge = item ? item.querySelector(".stage-badge") : null;
      const detail = container.querySelector(`#stageDetail${i}`);

      if (!item || !badge) continue;

      if (i < activeStageIndex) {
        item.className = "stage-item completed";
        badge.innerHTML = "✓";
        if (detail) detail.textContent = "";
      } else if (i === activeStageIndex) {
        item.className = "stage-item current";
        badge.innerHTML = `${i}`;
        if (detail) detail.textContent = liveMessage || "In progress…";
      } else {
        item.className = "stage-item waiting";
        badge.innerHTML = `${i}`;
        if (detail) detail.textContent = "";
      }
    }

    if (logs && logs.length > 0 && logsContent) {
      logsContent.innerHTML = logs
        .map(
          (l) =>
            `<div class="log-entry">${escapeHtml(l)}</div>`
        )
        .join("");
      logsPane.scrollTop = logsPane.scrollHeight;
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return {
    updateStageUI,
  };
}
