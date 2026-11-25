/**
 * Synapse Navbar Component
 * Minimal editorial header with smooth scroll transition and section anchors.
 */

export function renderNavbar(container, { onCtaClick }) {
  container.innerHTML = `
    <header class="site-header" id="siteHeader">
      <div class="container nav-container">
        <a href="#" class="brand" aria-label="YT-Short-Converter Home">
          <span class="brand-glyph">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm4 2v8l6-4-6-4z"/>
            </svg>
          </span>
          <span>ClipFlow</span>
        </a>

        <nav aria-label="Main Navigation">
          <ul class="nav-links">
            <li><a href="#how-it-works" class="nav-link">How it works</a></li>
            <li><a href="#features" class="nav-link">Features</a></li>
            <li><a href="#architecture" class="nav-link">Architecture</a></li>
          </ul>
        </nav>

        <div>
          <a href="#converter" class="nav-cta" id="navCtaBtn">Create a short</a>
        </div>
      </div>
    </header>
  `;

  const header = container.querySelector("#siteHeader");
  const ctaBtn = container.querySelector("#navCtaBtn");

  if (ctaBtn && onCtaClick) {
    ctaBtn.addEventListener("click", (e) => {
      e.preventDefault();
      onCtaClick();
    });
  }

  return {
    setScrolled: (isScrolled) => {
      if (header) {
        if (isScrolled) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }
    },
  };
}
