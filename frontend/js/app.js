/**
 * Synapse Application Orchestrator
 * Connects all modular components, state managers, and API services.
 */

import { videoApi } from "./api/videoApi.js";
import { createProcessingManager } from "./state/useProcessing.js";
import { initScrollController } from "./state/useScrollProgress.js";

import { renderNavbar } from "./components/Navbar.js";
import { renderHero } from "./components/Hero.js";
import { renderScrollExperience } from "./components/ScrollExperience.js";
import { renderConverter } from "./components/Converter.js";
import { renderProcessingView } from "./components/ProcessingView.js";
import { renderResultGrid } from "./components/ResultGrid.js";
import { renderFeatures } from "./components/Features.js";
import { renderHowItWorks } from "./components/HowItWorks.js";
import { renderFooter } from "./components/Footer.js";
import { createVideoModal } from "./components/VideoModal.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM Mounting Targets
  const navSlot = document.getElementById("navbarSlot");
  const heroSlot = document.getElementById("heroSlot");
  const scrollExpSlot = document.getElementById("scrollExperienceSlot");
  const converterSlot = document.getElementById("converterSlot");
  const processingSlot = document.getElementById("processingSlot");
  const resultsSlot = document.getElementById("resultsSlot");
  const featuresSlot = document.getElementById("featuresSlot");
  const howItWorksSlot = document.getElementById("howItWorksSlot");
  const footerSlot = document.getElementById("footerSlot");

  // Video Modal
  const videoModal = createVideoModal();

  // Scroll Controller
  let navbarComponent = null;
  const scrollController = initScrollController({
    onHeaderScrolled: (isScrolled) => {
      if (navbarComponent) navbarComponent.setScrolled(isScrolled);
    },
    onStageChange: (stage) => {
      if (scrollExpComponent) scrollExpComponent.setStage(stage);
    },
  });

  // 1. Mount Navbar
  navbarComponent = renderNavbar(navSlot, {
    onCtaClick: () => scrollToSection("converter"),
  });

  // 2. Mount Hero
  renderHero(heroSlot, {
    onCreateShortClick: () => scrollToSection("converter"),
    onSeeHowItWorksClick: () => scrollToSection("how-it-works"),
  });

  // 3. Mount Global Gateway Scroll Experience
  const scrollExpComponent = renderScrollExperience(scrollExpSlot);

  // 4. Mount Converter Form
  const converterComponent = renderConverter(converterSlot, {
    onSubmit: async ({ url, crop }) => {
      await handleStartConversion(url, crop);
    },
  });

  // 5. Mount Processing View (Hidden initially)
  processingSlot.style.display = "none";
  const processingComponent = renderProcessingView(processingSlot, {
    onCancel: () => handleResetToConverter(),
  });

  // 6. Mount Results Grid (Hidden initially)
  resultsSlot.style.display = "none";
  const resultGridComponent = renderResultGrid(resultsSlot, {
    onPreviewShort: (shortData) => {
      videoModal.open(shortData);
    },
    onNewLectureClick: () => {
      handleResetToConverter();
    },
  });

  // 7. Mount Features
  renderFeatures(featuresSlot);

  // 8. Mount How It Works
  renderHowItWorks(howItWorksSlot);

  // 9. Mount Footer
  renderFooter(footerSlot);

  // 10. Photorealistic Rotating Earth Video & Parallax Controller
  const earthVideo = document.getElementById("earthBgVideo");
  if (earthVideo) {
    earthVideo.muted = true;
    const playPromise = earthVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const startOnInteract = () => {
          earthVideo.play().catch(() => {});
          window.removeEventListener("pointerdown", startOnInteract);
          window.removeEventListener("keydown", startOnInteract);
        };
        window.addEventListener("pointerdown", startOnInteract, { once: true });
        window.addEventListener("keydown", startOnInteract, { once: true });
      });
    }

    // Scroll-driven 3D cosmic flyby parallax
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || 0;
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

          // Subtle cinematic scale & vertical float
          const scale = 1 + progress * 0.12;
          const translateY = -50 + progress * 6;
          earthVideo.style.transform = `translate(-50%, ${translateY}%) scale(${scale})`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Helper smooth scroll
  function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Processing Manager instance
  const processingManager = createProcessingManager({
    onUpdate: (state) => {
      processingComponent.updateStageUI(
        state.currentStageIndex,
        state.stageMessage,
        state.logs
      );
    },
    onComplete: (shorts, jobId) => {
      sessionStorage.removeItem("synapse_active_job");
      processingSlot.style.display = "none";
      resultsSlot.style.display = "block";
      resultGridComponent.showShorts(shorts, jobId);
      scrollToSection("resultsSection");
    },
    onError: (errorMsg, logs) => {
      sessionStorage.removeItem("synapse_active_job");
      processingSlot.style.display = "none";
      resultsSlot.style.display = "block";
      resultGridComponent.showError(errorMsg, logs);
      scrollToSection("resultsSection");
    },
  });

  async function handleStartConversion(url, crop) {
    converterComponent.setDisabled(true);
    resultsSlot.style.display = "none";
    processingSlot.style.display = "block";
    scrollToSection("processingSection");

    try {
      const response = await videoApi.startConversion(url, crop, true);
      const jobId = response.job_id;
      sessionStorage.setItem("synapse_active_job", jobId);
      processingManager.start(jobId);
    } catch (err) {
      converterComponent.setDisabled(false);
      processingSlot.style.display = "none";
      resultsSlot.style.display = "block";
      resultGridComponent.showError(err.message, []);
      scrollToSection("resultsSection");
    }
  }

  function handleResetToConverter() {
    sessionStorage.removeItem("synapse_active_job");
    processingManager.reset();
    processingSlot.style.display = "none";
    resultsSlot.style.display = "none";
    converterComponent.reset();
    converterComponent.setDisabled(false);
    scrollToSection("converter");
    setTimeout(() => converterComponent.focusInput(), 400);
  }

  // Check if session had an active job running before refresh
  const savedJobId = sessionStorage.getItem("synapse_active_job");
  if (savedJobId) {
    processingSlot.style.display = "block";
    processingManager.start(savedJobId);
  }

  // Diagnostic check
  videoApi.getSystemStatus().catch((err) => {
    console.warn("[Synapse] System diagnostic notice:", err.message);
  });
});
