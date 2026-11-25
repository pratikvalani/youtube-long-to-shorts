/**
 * Synapse Video API
 * Connects frontend UI to real backend endpoints.
 */

import { request } from "./client.js";

export const videoApi = {
  /**
   * Start conversion for a YouTube lecture
   * @param {string} url - Validated YouTube URL
   * @param {boolean} crop - Whether to crop to vertical (9:16)
   * @param {boolean} cloudWhisper - Whether to prefer cloud Whisper transcription
   * @returns {Promise<{ job_id: string, status: string }>}
   */
  async startConversion(url, crop = true, cloudWhisper = true) {
    return request("/api/convert", {
      method: "POST",
      body: JSON.stringify({
        url: url.trim(),
        crop: Boolean(crop),
        cloud_whisper: Boolean(cloudWhisper),
      }),
    });
  },

  /**
   * Poll job status, stage, logs, and generated shorts
   * @param {string} jobId
   * @returns {Promise<{ status: string, stage: string, files: string[], shorts: object[], logs: string[], error: string|null }>}
   */
  async getJobStatus(jobId) {
    return request(`/api/status/${encodeURIComponent(jobId)}`, {
      method: "GET",
    });
  },

  /**
   * Diagnostic health & model availability check
   */
  async getSystemStatus() {
    return request("/api/system-status", {
      method: "GET",
    });
  },

  /**
   * URL for streaming the short video directly in HTML5 player
   */
  getStreamUrl(filename) {
    return `/api/stream/${encodeURIComponent(filename)}`;
  },

  /**
   * URL for downloading the single short MP4 file
   */
  getDownloadUrl(filename) {
    return `/api/download/${encodeURIComponent(filename)}`;
  },

  /**
   * URL for downloading all generated shorts as a ZIP file
   */
  getDownloadAllZipUrl(jobId) {
    return `/api/download-all/${encodeURIComponent(jobId)}`;
  },
};
