"""
Flask REST API & Video Streaming Service
YouTube Long-Form to AI Shorts Platform
"""

import os
import sys

# Ensure UTF-8 stream handling on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import json
import threading
import uuid
import io
import zipfile
from pathlib import Path
from flask import Flask, request, jsonify, send_file, send_from_directory, Response
from flask_cors import CORS

BACKEND_DIR = Path(__file__).parent.resolve()
FRONTEND_DIR = BACKEND_DIR.parent.resolve() / "frontend"
OUTPUT_DIR = BACKEND_DIR / "output_shorts"
JOBS_FILE = BACKEND_DIR / "jobs.json"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from processor import convert, get_ffmpeg
except ImportError:
    from backend.processor import convert, get_ffmpeg

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="/")
CORS(app)

jobs_lock = threading.Lock()


def load_jobs() -> dict:
    if not JOBS_FILE.exists():
        return {}
    try:
        with JOBS_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def save_jobs():
    with jobs_lock:
        try:
            with JOBS_FILE.open("w", encoding="utf-8") as f:
                json.dump(jobs, f, indent=2, default=str)
        except Exception as e:
            print(f"[Jobs] Error saving jobs to disk: {e}")


jobs: dict = load_jobs()


def run_job(job_id: str, url: str, crop: bool):
    try:
        with jobs_lock:
            jobs[job_id]["status"] = "processing"
            jobs[job_id]["stage"] = "downloading"
            jobs[job_id]["logs"] = [f"Job initialized for URL: {url}"]
        save_jobs()

        def update_stage(stage: str):
            with jobs_lock:
                jobs[job_id]["stage"] = stage
                if "logs" not in jobs[job_id]:
                    jobs[job_id]["logs"] = []
                jobs[job_id]["logs"].append(f"Stage changed to: {stage}")
            save_jobs()

        print(f"[Job {job_id}] Starting conversion pipeline for: {url}")
        results = convert(
            url,
            crop_to_vert=crop,
            progress_callback=update_stage
        )

        with jobs_lock:
            jobs[job_id]["status"] = "done"
            jobs[job_id]["stage"] = "completed"
            jobs[job_id]["error"] = None
            jobs[job_id]["shorts"] = results
            jobs[job_id]["files"] = [r["filename"] for r in results]
            jobs[job_id]["logs"].append(f"Successfully rendered {len(results)} shorts.")
        save_jobs()
        print(f"[Job {job_id}] Pipeline completed successfully! ({len(results)} shorts generated)")

    except Exception as e:
        print(f"[Job {job_id}] Pipeline Exception: {str(e)}")
        with jobs_lock:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["stage"] = "failed"
            jobs[job_id]["error"] = str(e)
            if "logs" not in jobs[job_id]:
                jobs[job_id]["logs"] = []
            jobs[job_id]["logs"].append(f"ERROR: {str(e)}")
        save_jobs()


@app.route("/api/convert", methods=["POST"])
def start_conversion():
    """
    Body JSON: { "url": "<youtube_url>", "crop": true }
    Returns:   { "job_id": "..." }
    """
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON body"}), 400

    url = (data.get("url") or "").strip()
    if not url:
        return jsonify({"error": "YouTube URL is required"}), 400

    crop = bool(data.get("crop", True))
    job_id = str(uuid.uuid4())

    with jobs_lock:
        jobs[job_id] = {
            "status": "queued",
            "stage": "queued",
            "url": url,
            "crop": crop,
            "files": [],
            "shorts": [],
            "error": None,
            "logs": ["Job queued."],
        }
    save_jobs()

    t = threading.Thread(
        target=run_job,
        args=(job_id, url, crop),
        daemon=True
    )
    t.start()

    return jsonify({"job_id": job_id, "status": "queued"}), 202


@app.route("/api/status/<job_id>")
def job_status(job_id: str):
    """Poll job status, stage, progress logs, and generated shorts metadata."""
    with jobs_lock:
        job = jobs.get(job_id)

    if not job:
        # Reload disk if needed
        reloaded = load_jobs()
        with jobs_lock:
            jobs.clear()
            jobs.update(reloaded)
            job = jobs.get(job_id)

    if not job:
        return jsonify({
            "status": "not_found",
            "stage": "not_found",
            "files": [],
            "shorts": [],
            "error": "Job not found. Please start a new conversion."
        }), 200

    resp = {
        "status": job.get("status", "queued"),
        "stage": job.get("stage", "queued"),
        "files": job.get("files", []),
        "shorts": job.get("shorts", []),
        "logs": job.get("logs", []),
        "error": job.get("error"),
    }
    return jsonify(resp)


@app.route("/api/stream/<filename>")
def stream_short(filename: str):
    """Stream generated short MP4 in-browser with HTML5 video player."""
    safe_name = Path(filename).name
    file_path = OUTPUT_DIR / safe_name
    if not file_path.exists():
        return jsonify({"error": "Video file not found"}), 404
    return send_file(str(file_path), mimetype="video/mp4", conditional=True)


@app.route("/api/download/<filename>")
def download_short(filename: str):
    """Download short video as attachment."""
    safe_name = Path(filename).name
    file_path = OUTPUT_DIR / safe_name
    if not file_path.exists():
        return jsonify({"error": "Video file not found"}), 404
    return send_file(str(file_path), mimetype="video/mp4", as_attachment=True, download_name=safe_name)


@app.route("/api/download-all/<job_id>")
def download_all_shorts(job_id: str):
    """Download all generated shorts for a given job as a ZIP archive."""
    with jobs_lock:
        job = jobs.get(job_id)

    if not job:
        reloaded = load_jobs()
        with jobs_lock:
            jobs.clear()
            jobs.update(reloaded)
            job = jobs.get(job_id)

    if not job:
        return jsonify({"error": "Job not found"}), 404

    shorts = job.get("shorts", [])
    files = [s.get("filename") for s in shorts if s.get("filename")] or job.get("files", [])
    if not files:
        return jsonify({"error": "No shorts found for this job"}), 404

    zip_buffer = io.BytesIO()
    valid_files_count = 0
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for fname in files:
            safe_name = Path(fname).name
            file_path = OUTPUT_DIR / safe_name
            if file_path.exists():
                zip_file.write(file_path, arcname=safe_name)
                valid_files_count += 1

    if valid_files_count == 0:
        return jsonify({"error": "Shorts video files are no longer on disk"}), 404

    zip_buffer.seek(0)
    zip_name = f"synapse_shorts_{job_id[:8]}.zip"
    return send_file(
        zip_buffer,
        mimetype="application/zip",
        as_attachment=True,
        download_name=zip_name
    )


@app.route("/api/system-status")
def system_status():
    """Diagnostic endpoint for local processing dependencies."""
    return jsonify({
        "status": "healthy",
        "external_api_required": False,
        "whisper_local": True,
        "ffmpeg_path": get_ffmpeg(),
    })


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "yt-shorts-converter-platform"})


@app.route("/")
def index():
    return send_from_directory(str(FRONTEND_DIR), "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting server on http://localhost:{port}")
    app.run(debug=True, use_reloader=False, port=port)

