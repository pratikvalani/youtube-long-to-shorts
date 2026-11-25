/**
 * Synapse Footer Component
 * Minimal editorial footer.
 */

export function renderFooter(container) {
  container.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-container">
        <div class="footer-brand">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-film)">
            <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm4 2v8l6-4-6-4z"/>
          </svg>
          <span>ClipFlow</span>
        </div>

        <div class="footer-note">
          Turn long videos into shorts people actually want to watch.
        </div>

        <ul class="footer-links">
          <li><a href="#how-it-works" class="footer-link">How it works</a></li>
          <li><a href="#features" class="footer-link">Features</a></li>
          <li><a href="#architecture" class="footer-link">Architecture</a></li>
        </ul>
      </div>
    </footer>
  `;
}
