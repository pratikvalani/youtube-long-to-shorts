/**
 * Synapse Download Button Component
 * Multi-state animated feedback: Normal -> Preparing… -> Downloading… -> Downloaded ✓
 */

export function createDownloadButton({ label = "Download", downloadUrl, filename, onStart }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-card-download";
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    <span>${label}</span>
  `;

  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (btn.disabled) return;

    if (onStart) onStart();

    // State 1: Preparing…
    btn.disabled = true;
    btn.classList.add("preparing");
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/>
      </svg>
      <span>Preparing…</span>
    `;

    await new Promise((r) => setTimeout(r, 400));

    // State 2: Trigger browser download via anchor
    const tempLink = document.createElement("a");
    tempLink.href = downloadUrl;
    tempLink.download = filename || "short.mp4";
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // State 3: Downloaded ✓
    btn.classList.remove("preparing");
    btn.classList.add("downloaded");
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Downloaded</span>
    `;

    // Revert after 3.5s
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove("downloaded");
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>${label}</span>
      `;
    }, 3500);
  });

  return btn;
}
