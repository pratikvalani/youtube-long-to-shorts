/**
 * Synapse API Client
 * Centralized HTTP layer handling error normalization, request JSON serialization,
 * and robust network failure detection.
 */

const API_BASE = window.VITE_API_BASE_URL || window.API_BASE_URL || "";

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    throw new ApiError(
      "We couldn't reach the server. Check your connection and try again.",
      0,
      networkErr.message
    );
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg =
      (data && data.error) ||
      `Request failed with status ${response.status}: ${response.statusText}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data;
}
