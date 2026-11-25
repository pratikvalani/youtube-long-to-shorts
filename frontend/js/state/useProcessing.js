/**
 * Synapse Processing State Manager
 * Handles polling backend status, stage translation to human steps,
 * log collection, and cleanup.
 */

import { videoApi } from "../api/videoApi.js";

export function createProcessingManager({ onUpdate, onComplete, onError }) {
  let pollInterval = null;
  let activeJobId = null;

  const state = {
    jobId: null,
    status: "idle", // idle | processing | done | error
    currentStageIndex: 1, // 1 to 5
    stageMessage: "",
    logs: [],
    shorts: [],
    error: null,
  };

  function mapBackendStage(stageStr) {
    if (!stageStr) return { index: 1, message: "Preparing video stream…" };
    const s = stageStr.toLowerCase();

    if (s === "queued") {
      return { index: 1, message: "Queueing video download…" };
    }
    if (s === "downloading") {
      return { index: 1, message: "Downloading video and extracting audio track…" };
    }
    if (s === "transcribing") {
      return { index: 2, message: "Transcribing audio into timestamped words…" };
    }
    if (s === "analyzing") {
      return { index: 3, message: "Finding the most important explanations and lessons…" };
    }
    if (s.startsWith("exporting")) {
      const match = s.match(/exporting:(\d+)\/(\d+)/);
      if (match) {
        const [, curr, tot] = match;
        return {
          index: 4,
          message: `Framing and clipping vertical short ${curr} of ${tot}…`,
        };
      }
      return { index: 4, message: "Clipping and vertical re-framing (9:16)…" };
    }
    if (s === "completed") {
      return { index: 5, message: "All shorts ready for download!" };
    }
    return { index: 1, message: stageStr };
  }

  async function poll() {
    if (!activeJobId) return;

    try {
      const data = await videoApi.getJobStatus(activeJobId);

      state.status = data.status || "processing";
      state.logs = Array.isArray(data.logs) ? data.logs : [];

      const { index, message } = mapBackendStage(data.stage);
      state.currentStageIndex = index;
      state.stageMessage = message;

      if (data.status === "done") {
        stopPolling();
        state.status = "done";
        state.currentStageIndex = 5;
        state.shorts = Array.isArray(data.shorts) ? data.shorts : [];
        if (onUpdate) onUpdate({ ...state });
        if (onComplete) onComplete(state.shorts, state.jobId);
        return;
      }

      if (data.status === "error") {
        stopPolling();
        state.status = "error";
        state.error =
          data.error || "Something went wrong while creating the shorts.";
        if (onUpdate) onUpdate({ ...state });
        if (onError) onError(state.error, state.logs);
        return;
      }

      if (data.status === "not_found") {
        stopPolling();
        state.status = "error";
        state.error =
          "We couldn't locate this session. Please paste your link again.";
        if (onUpdate) onUpdate({ ...state });
        if (onError) onError(state.error, state.logs);
        return;
      }

      if (onUpdate) onUpdate({ ...state });
    } catch (err) {
      // Network hiccup during polling: keep trying unless repeated
      console.warn("[Synapse] Polling notice:", err.message);
    }
  }

  function start(jobId) {
    stopPolling();
    activeJobId = jobId;
    state.jobId = jobId;
    state.status = "processing";
    state.currentStageIndex = 1;
    state.stageMessage = "Starting up the pipeline…";
    state.logs = [];
    state.shorts = [];
    state.error = null;

    if (onUpdate) onUpdate({ ...state });

    // Poll immediately, then every 2000ms
    poll();
    pollInterval = setInterval(poll, 2000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function reset() {
    stopPolling();
    activeJobId = null;
    state.jobId = null;
    state.status = "idle";
    state.currentStageIndex = 1;
    state.stageMessage = "";
    state.logs = [];
    state.shorts = [];
    state.error = null;
    if (onUpdate) onUpdate({ ...state });
  }

  return {
    getState: () => ({ ...state }),
    start,
    stop: stopPolling,
    reset,
  };
}
