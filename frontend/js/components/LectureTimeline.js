/**
 * Synapse Lecture Timeline Visual
 * Realistic video-editing timeline showing a wide horizontal lecture
 * segmenting into 9:16 vertical shorts.
 */

export function renderLectureTimeline(container) {
  // Generate waveform bars with varying heights and highlighted moments
  const totalBars = 64;
  let barsHtml = "";
  for (let i = 0; i < totalBars; i++) {
    // Generate organic-looking speech amplitude
    const baseHeight = 8 + Math.sin(i * 0.35) * 14 + Math.cos(i * 0.8) * 12 + ((i * 13) % 18);
    const height = Math.max(6, Math.min(46, Math.round(baseHeight)));
    // Highlight three key moments: 12-20, 30-38, 48-56
    const isHighlight =
      (i >= 12 && i <= 21) || (i >= 31 && i <= 39) || (i >= 48 && i <= 57);
    barsHtml += `<div class="waveform-bar ${isHighlight ? "highlighted" : ""}" style="height: ${height}px;"></div>`;
  }

  container.innerHTML = `
    <div class="timeline-track-wrapper">
      <div class="timeline-ruler">
        <span>00:00</span>
        <span>15:00</span>
        <span>30:00</span>
        <span>45:00</span>
        <span>60:00</span>
        <span>75:00</span>
        <span>90:00</span>
      </div>

      <div class="timeline-wave-strip">
        ${barsHtml}
        <div class="timeline-playhead"></div>
      </div>
    </div>
  `;
}
