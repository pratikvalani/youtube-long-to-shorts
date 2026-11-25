/**
 * Synapse Video Card Component
 * 9:16 vertical card with hover overlay, timestamping, concept note,
 * preview modal trigger, and animated download button.
 */

import { videoApi } from "../api/videoApi.js";
import { createDownloadButton } from "./DownloadButton.js";

export function createVideoCard(shortData, { onPreview }) {
  const card = document.createElement("div");
  card.className = "short-card";

  const filename = shortData.filename || "";
  const streamUrl = videoApi.getStreamUrl(filename);
  const downloadUrl = videoApi.getDownloadUrl(filename);
  const shortNum = shortData.short_number || 1;
  const duration = shortData.duration || 0;

  function formatTime(seconds) {
    if (seconds == null || isNaN(seconds)) return "00:00";
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const remSec = s % 60;
    return `${m.toString().padStart(2, "0")}:${remSec.toString().padStart(2, "0")}`;
  }

  const startStr = formatTime(shortData.start_time);
  const endStr = formatTime(shortData.end_time);

  card.innerHTML = `
    <!-- 9:16 Video Frame / Poster -->
    <div class="video-preview-frame" tabindex="0" role="button" aria-label="Preview short: ${escapeHtml(shortData.title)}">
      <video preload="metadata" muted playsinline>
        <source src="${streamUrl}" type="video/mp4" />
      </video>

      <div class="card-top-badges">
        <span class="card-number-badge">SHORT 0${shortNum}</span>
        <span class="card-duration-badge">${duration}s</span>
      </div>

      <div class="video-hover-overlay">
        <div class="play-circle">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Content Body -->
    <div class="short-card-body">
      <h3 class="short-card-title">${escapeHtml(shortData.title || `Lesson ${shortNum}`)}</h3>
      ${shortData.key_concept ? `<p class="short-card-concept">${escapeHtml(shortData.key_concept)}</p>` : ""}
      <div class="short-card-meta">
        <span>${startStr} – ${endStr}</span>
        <span>•</span>
        <span>${duration} seconds</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="short-card-actions">
      <button type="button" class="btn-card-preview" aria-label="Preview in player">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Preview</span>
      </button>
      <div class="dl-slot"></div>
    </div>
  `;

  const previewFrame = card.querySelector(".video-preview-frame");
  const previewBtn = card.querySelector(".btn-card-preview");
  const dlSlot = card.querySelector(".dl-slot");

  function triggerPreview() {
    if (onPreview) onPreview(shortData);
  }

  previewFrame.addEventListener("click", triggerPreview);
  previewFrame.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerPreview();
    }
  });

  previewBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    triggerPreview();
  });

  // Attach animated download button
  const dlBtn = createDownloadButton({
    label: "Download",
    downloadUrl,
    filename,
  });
  dlSlot.appendChild(dlBtn);

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return card;
}
