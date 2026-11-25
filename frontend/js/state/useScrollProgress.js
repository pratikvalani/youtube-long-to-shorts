/**
 * Synapse Scroll & Transformation Controller
 * Handles header blur threshold and the 6-stage timeline transformation.
 */

export function initScrollController({ onStageChange, onHeaderScrolled }) {
  let currentStage = 1;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header scroll detection
  function handleWindowScroll() {
    const isScrolled = window.scrollY > 36;
    if (onHeaderScrolled) {
      onHeaderScrolled(isScrolled);
    }
  }

  window.addEventListener("scroll", handleWindowScroll, { passive: true });
  handleWindowScroll(); // Initial check

  function setStage(stageNumber) {
    if (stageNumber < 1) stageNumber = 1;
    if (stageNumber > 6) stageNumber = 6;
    currentStage = stageNumber;
    if (onStageChange) {
      onStageChange(currentStage);
    }
  }

  // Auto progression observer if user scrolls near the story section
  let autoTimer = null;
  function startAutoCycle() {
    if (prefersReducedMotion) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      currentStage = currentStage >= 6 ? 1 : currentStage + 1;
      setStage(currentStage);
    }, 4200);
  }

  function stopAutoCycle() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  return {
    getCurrentStage: () => currentStage,
    setStage,
    startAutoCycle,
    stopAutoCycle,
    cleanup: () => {
      window.removeEventListener("scroll", handleWindowScroll);
      stopAutoCycle();
    },
  };
}
