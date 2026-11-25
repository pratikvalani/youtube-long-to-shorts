/**
 * Synapse Results View Component
 * "Your shorts are ready."
 * Grid of 9:16 video cards, "Download all" (ZIP), and friendly error state handling.
 */

import { videoApi } from "../api/videoApi.js";
import { createVideoCard } from "./VideoCard.js";

export function renderResultGrid(container, { onPreviewShort, onNewLectureClick }) {
  container.innerHTML = `
    <section class="section results-section" id="resultsSection">
      <div class="container">
        <!-- Success Results Header -->
        <div id="resultsNormalView">
          <div class="results-header">
            <div>
              <h2 class="results-title">Your shorts are ready.</h2>
              <p class="results-subtitle" id="resultsCountLabel">
                Review and download your focused vertical videos.
              </p>
            </div>

            <div class="results-actions">
              <button type="button" class="btn-new-lecture" id="btnNewLecture">
                <span>Start another</span>
              </button>

              <a href="#" class="btn-download-all" id="btnDownloadAll" download>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download all (ZIP)</span>
              </a>
            </div>
          </div>

          <!-- Video Cards Grid -->
          <div class="shorts-grid" id="shortsGrid"></div>
        </div>

        <!-- Friendly Error View (Hidden by default) -->
        <div id="resultsErrorView" style="display: none;">
          <div class="error-card">
            <h3 class="error-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Something went wrong while creating the shorts.</span>
            </h3>
            <p class="error-desc" id="friendlyErrorMsg">
              We encountered an issue during processing. You can try again or check the details below.
            </p>

            <button type="button" class="btn-primary" id="btnRetry">
              <span>Try again</span>
            </button>

            <div style="margin-top: 24px;">
              <button type="button" class="tech-details-toggle" id="errorTechToggle" aria-expanded="false">
                <span>Show technical details</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="tech-logs-pane" id="errorLogsPane" aria-hidden="true">
                <div id="errorTechDetailsText"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const normalView = container.querySelector("#resultsNormalView");
  const errorView = container.querySelector("#resultsErrorView");
  const countLabel = container.querySelector("#resultsCountLabel");
  const grid = container.querySelector("#shortsGrid");
  const downloadAllBtn = container.querySelector("#btnDownloadAll");
  const newLectureBtn = container.querySelector("#btnNewLecture");
  const retryBtn = container.querySelector("#btnRetry");
  const errorMsgEl = container.querySelector("#friendlyErrorMsg");
  const errorTechText = container.querySelector("#errorTechDetailsText");
  const errorTechToggle = container.querySelector("#errorTechToggle");
  const errorLogsPane = container.querySelector("#errorLogsPane");

  let isErrorLogsOpen = false;
  if (errorTechToggle && errorLogsPane) {
    errorTechToggle.addEventListener("click", () => {
      isErrorLogsOpen = !isErrorLogsOpen;
      errorTechToggle.classList.toggle("open", isErrorLogsOpen);
      errorLogsPane.classList.toggle("open", isErrorLogsOpen);
      errorTechToggle.setAttribute("aria-expanded", String(isErrorLogsOpen));
      errorTechToggle.querySelector("span").textContent = isErrorLogsOpen
        ? "Hide technical details"
        : "Show technical details";
    });
  }

  if (newLectureBtn && onNewLectureClick) {
    newLectureBtn.addEventListener("click", onNewLectureClick);
  }
  if (retryBtn && onNewLectureClick) {
    retryBtn.addEventListener("click", onNewLectureClick);
  }

  function showShorts(shorts = [], jobId = null) {
    normalView.style.display = "block";
    errorView.style.display = "none";

    grid.innerHTML = "";
    countLabel.textContent = `${shorts.length} focused vertical clip${shorts.length === 1 ? "" : "s"} ready for download.`;

    if (jobId) {
      downloadAllBtn.href = videoApi.getDownloadAllZipUrl(jobId);
      downloadAllBtn.style.display = shorts.length > 1 ? "inline-flex" : "none";
    }

    shorts.forEach((shortItem) => {
      const cardEl = createVideoCard(shortItem, {
        onPreview: (data) => {
          if (onPreviewShort) onPreviewShort(data);
        },
      });
      grid.appendChild(cardEl);
    });
  }

  function showError(errorText, logs = []) {
    normalView.style.display = "none";
    errorView.style.display = "block";

    let friendly = "Something went wrong while creating the shorts. Please try again.";
    if (errorText.includes("Private video") || errorText.includes("Sign in")) {
      friendly = "This video is private or requires sign in. Please use a publicly accessible video.";
    } else if (errorText.includes("not found") || errorText.includes("unavailable")) {
      friendly = "We couldn't access that YouTube video. Check the link and try again.";
    }

    errorMsgEl.textContent = friendly;

    const fullTechnical = [
      `Error Message: ${errorText}`,
      "",
      "--- Session Logs ---",
      ...logs,
    ].join("\n");
    errorTechText.textContent = fullTechnical;
  }

  return {
    showShorts,
    showError,
  };
}
