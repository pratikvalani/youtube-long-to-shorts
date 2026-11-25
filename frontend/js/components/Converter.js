/**
 * Synapse Converter Form Component
 * Handles YouTube URL validation, error state animations, crop options,
 * and submit action.
 */

export function renderConverter(container, { onSubmit }) {
  container.innerHTML = `
    <section class="section converter-section" id="converter">
      <div class="container">
        <div class="converter-card">
          <div class="converter-header">
            <span class="converter-kicker">NEW PROJECT</span>
            <h2 class="converter-title">Turn a video into clips.</h2>
            <p class="converter-subtitle">Drop in a YouTube URL to begin your edit.</p>
          </div>

          <form class="converter-form" id="converterForm" novalidate>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </span>

              <input
                type="url"
                class="url-input"
                id="youtubeUrlInput"
                placeholder="Paste any YouTube video or podcast URL (e.g., https://www.youtube.com/watch?v=...)"
                autocomplete="off"
                spellcheck="false"
                required
                aria-label="YouTube Video Link"
              />
            </div>

            <!-- Inline Animated Validation Error -->
            <div class="validation-error" id="validationError" role="alert" aria-live="polite">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span id="validationErrorText"></span>
            </div>

            <div class="converter-meta-row">
              <label class="option-toggle">
                <input type="checkbox" class="option-checkbox" id="cropCheckbox" checked />
                <span>Crop to vertical (9:16) format</span>
              </label>

              <div class="sample-links-group">
                <span>Try sample:</span>
                <button type="button" class="sample-pill" id="sampleNeuralNetBtn">Tech Podcast Highlights</button>
              </div>
            </div>

            <button type="submit" class="btn-submit-shorts" id="createShortsBtn" disabled>
              <span>Create shorts</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  `;

  const form = container.querySelector("#converterForm");
  const input = container.querySelector("#youtubeUrlInput");
  const cropCheck = container.querySelector("#cropCheckbox");
  const errorBox = container.querySelector("#validationError");
  const errorText = container.querySelector("#validationErrorText");
  const submitBtn = container.querySelector("#createShortsBtn");
  const sampleBtn = container.querySelector("#sampleNeuralNetBtn");

  // YouTube URL validation rules
  function isValidYouTubeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return false;
    const url = rawUrl.trim();
    return (
      url.includes("youtube.com/watch") ||
      url.includes("youtu.be/") ||
      url.includes("youtube.com/shorts/") ||
      url.includes("youtube.com/live/")
    );
  }

  function validateInput(showError = false) {
    const val = input.value.trim();

    if (!val) {
      if (showError) {
        showValidation("Paste a YouTube link to continue.");
      } else {
        hideValidation();
      }
      submitBtn.disabled = true;
      return false;
    }

    if (!isValidYouTubeUrl(val)) {
      if (showError) {
        showValidation("That doesn't look like a YouTube link.");
      }
      submitBtn.disabled = true;
      return false;
    }

    hideValidation();
    submitBtn.disabled = false;
    return true;
  }

  function showValidation(msg) {
    errorText.textContent = msg;
    errorBox.classList.add("visible");
    input.classList.add("input-error");
  }

  function hideValidation() {
    errorText.textContent = "";
    errorBox.classList.remove("visible");
    input.classList.remove("input-error");
  }

  // Realtime listeners
  input.addEventListener("input", () => {
    if (input.value.trim().length > 0) {
      validateInput(false);
    } else {
      hideValidation();
      submitBtn.disabled = true;
    }
  });

  input.addEventListener("blur", () => {
    if (input.value.trim().length > 0) {
      validateInput(true);
    }
  });

  // Sample link button
  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      input.value = "https://www.youtube.com/watch?v=aircAruvnKk";
      validateInput(false);
      input.focus();
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const isValid = validateInput(true);
    if (!isValid) return;

    if (onSubmit) {
      onSubmit({
        url: input.value.trim(),
        crop: cropCheck.checked,
      });
    }
  });

  return {
    setDisabled: (disabled) => {
      submitBtn.disabled = disabled;
      input.disabled = disabled;
    },
    reset: () => {
      input.value = "";
      hideValidation();
      submitBtn.disabled = true;
    },
    focusInput: () => {
      input.focus();
    },
  };
}
