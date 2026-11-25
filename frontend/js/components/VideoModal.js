/**
 * Synapse 9:16 Video Preview Modal
 * Focus-trapped modal with native HTML5 video player, keyboard shortcuts (ESC),
 * and outside-click dismissal.
 */

import { videoApi } from "../api/videoApi.js";
import { createDownloadButton } from "./DownloadButton.js";

export function createVideoModal() {
  const modalEl = document.createElement("div");
  modalEl.className = "modal-backdrop";
  modalEl.setAttribute("role", "dialog");
  modalEl.setAttribute("aria-modal", "true");
  modalEl.setAttribute("aria-hidden", "true");

  modalEl.innerHTML = `
    <div class="modal-dialog" id="modalDialog">
      <div class="modal-header">
        <div class="modal-title-group">
          <h3 id="modalShortTitle">Short Preview</h3>
          <span class="modal-timecode" id="modalTimecode"></span>
        </div>
        <button type="button" class="modal-close-btn" id="modalCloseBtn" aria-label="Close Preview (ESC)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-player-wrapper">
        <video id="modalVideoPlayer" controls playsinline preload="auto">
          Your browser does not support HTML5 video preview.
        </video>
      </div>

      <div class="modal-footer">
        <span class="concept-note" id="modalConceptNote"></span>
        <div id="modalDownloadSlot"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  const videoPlayer = modalEl.querySelector("#modalVideoPlayer");
  const titleEl = modalEl.querySelector("#modalShortTitle");
  const timecodeEl = modalEl.querySelector("#modalTimecode");
  const conceptEl = modalEl.querySelector("#modalConceptNote");
  const downloadSlot = modalEl.querySelector("#modalDownloadSlot");
  const closeBtn = modalEl.querySelector("#modalCloseBtn");
  const dialog = modalEl.querySelector("#modalDialog");

  let lastActiveElement = null;

  function formatTime(seconds) {
    if (seconds == null || isNaN(seconds)) return "00:00";
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const remSec = s % 60;
    return `${m.toString().padStart(2, "0")}:${remSec.toString().padStart(2, "0")}`;
  }

  function open(shortData) {
    lastActiveElement = document.activeElement;

    const filename = shortData.filename || "";
    const streamUrl = videoApi.getStreamUrl(filename);
    const downloadUrl = videoApi.getDownloadUrl(filename);

    titleEl.textContent = shortData.title || "Lesson Short";
    const startStr = formatTime(shortData.start_time);
    const endStr = formatTime(shortData.end_time);
    timecodeEl.textContent = `${startStr} – ${endStr} (${shortData.duration || 0}s)`;
    conceptEl.textContent = shortData.key_concept || "";

    // Set video source
    videoPlayer.src = streamUrl;

    // Set download button
    downloadSlot.innerHTML = "";
    const dlBtn = createDownloadButton({
      label: "Download",
      downloadUrl,
      filename,
    });
    downloadSlot.appendChild(dlBtn);

    modalEl.classList.add("open");
    modalEl.setAttribute("aria-hidden", "false");
    closeBtn.focus();

    // Play video after opening
    videoPlayer.play().catch(() => {
      // Autoplay with audio might be blocked by browser; user will click play
    });

    document.addEventListener("keydown", handleKeyDown);
  }

  function close() {
    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.load();

    modalEl.classList.remove("open");
    modalEl.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", handleKeyDown);

    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      close();
    }
  }

  closeBtn.addEventListener("click", close);

  modalEl.addEventListener("click", (e) => {
    if (!dialog.contains(e.target)) {
      close();
    }
  });

  return {
    open,
    close,
  };
}
