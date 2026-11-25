

"""
Core Video Processing & Multi-Modal AI Pipeline
- YouTube Download via yt-dlp
- Local Whisper transcription
- Local highlight selection
- Intelligent 9:16 Re-Framing & Text Rendering with FFmpeg & OpenCV
"""

import os
import sys

# Ensure UTF-8 stream handling on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import re
import textwrap
import subprocess
import tempfile
from pathlib import Path
from typing import List, Dict, Tuple, Any, Optional

BACKEND_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = BACKEND_DIR.parent.resolve()

import yt_dlp
import whisper
import cv2
import numpy as np

OUTPUT_DIR = BACKEND_DIR / "output_shorts"
DOWNLOAD_DIR = BACKEND_DIR / "downloads"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_ffmpeg() -> str:
    """Find FFmpeg binary and ensure it is in the PATH for all subprocesses and Whisper."""
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        ffmpeg_dir = str(Path(ffmpeg_exe).parent)
        current_path = os.environ.get("PATH", "")
        if ffmpeg_dir not in current_path:
            os.environ["PATH"] = ffmpeg_dir + os.pathsep + current_path
        return ffmpeg_exe
    except Exception:
        return "ffmpeg"


# Initialize FFmpeg in PATH
FFMPEG_EXE = get_ffmpeg()


WHISPER_MODEL = "base"   # local fallback model: tiny | base | small | medium


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — Download YouTube Video
# ─────────────────────────────────────────────────────────────────────────────
def download_video(url: str) -> Tuple[Path, str]:
    """Download video in highest available MP4 quality using yt-dlp."""
    print(f"[Download] Ingesting stream from: {url}")
    out_template = str(DOWNLOAD_DIR / "%(id)s.%(ext)s")

    ydl_opts = {
        "format": "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "outtmpl": out_template,
        "merge_output_format": "mp4",
        "ffmpeg_location": get_ffmpeg(),
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info.get("id", "video")
        title = info.get("title", "YouTube Educational Video")
        
        # Check standard mp4 path first
        mp4_path = DOWNLOAD_DIR / f"{video_id}.mp4"
        if mp4_path.exists():
            print(f"[Download] Successfully saved: '{title}' ({mp4_path.name})")
            return mp4_path, title

        # Fallback to searching matching file by ID
        matches = list(DOWNLOAD_DIR.glob(f"{video_id}.*"))
        if matches:
            target = matches[0]
            print(f"[Download] Saved format: '{title}' ({target.name})")
            return target, title

        raise FileNotFoundError(f"Downloaded video file for ID '{video_id}' not found in {DOWNLOAD_DIR}")


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — Local Audio Transcription
# ─────────────────────────────────────────────────────────────────────────────
def extract_audio_track(video_path: Path, max_duration_sec: Optional[float] = None) -> Path:
    """Extract audio track as lightweight MP3 for fast Whisper transcription."""
    ffmpeg = get_ffmpeg()
    tmp_audio = video_path.parent / f"_tmp_audio_{video_path.stem}.mp3"
    
    cmd = [
        ffmpeg, "-y",
        "-i", str(video_path),
    ]
    if max_duration_sec:
        cmd.extend(["-t", str(max_duration_sec)])
    
    cmd.extend([
        "-vn",
        "-ar", "16000",
        "-ac", "1",
        "-b:a", "64k",
        str(tmp_audio)
    ])
    
    subprocess.run(cmd, capture_output=True, check=True)
    return tmp_audio


def transcribe_video(video_path: Path) -> dict:
    """Transcribe audio locally with OpenAI Whisper."""
    print(f"[Transcribe] Loading local Whisper '{WHISPER_MODEL}' model (offline CPU/GPU)...")
    model = whisper.load_model(WHISPER_MODEL)
    print("[Transcribe] Transcribing video stream...")
    result = model.transcribe(str(video_path), verbose=False, fp16=False)
    print(f"[Transcribe] Local transcription completed: {len(result.get('segments', []))} segments found.")
    return result


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — Local Semantic Segment Selection
# ─────────────────────────────────────────────────────────────────────────────
ANALYSIS_PROMPT = """
You are an expert academic curriculum designer and educational video analyst.
Given a timestamped transcript of a long educational YouTube video, identify the 5-6 MOST IMPORTANT, high-impact key segments that together give a student the complete conceptual understanding of the topic.

Focus on:
1. Core Fundamental Concepts & Axioms
2. Key Equations, Formulas, & Algorithms
3. Critical Step-by-Step Worked Examples
4. High-Yield Summary / Synthesis Points

Return ONLY a valid JSON array matching this exact schema (no markdown, no conversational commentary, no code block delimiters):
[
  {
    "short_number": 1,
    "title": "Concise Descriptive Title",
    "key_concept": "High-impact one-sentence summary of what this segment teaches",
    "important_terms": ["Term1", "Term2"],
    "start_time": 12.5,
    "end_time": 75.0,
    "reason": "Why this specific concept is essential for full comprehension"
  }
]

Strict Rules:
- Each segment duration (end_time - start_time) MUST be between 30 and 90 seconds.
- Segments must NOT overlap.
- start_time and end_time MUST be real numbers within the video timestamp bounds.
- Output MUST be valid JSON array ONLY.
"""


def clean_json_response(raw_text: str) -> str:
    """Strip reasoning tokens (<think>...</think>), markdown code blocks, and isolate JSON array."""
    text = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()
    text = re.sub(r"^```[a-z]*\n?", "", text, flags=re.MULTILINE)
    text = re.sub(r"```$", "", text, flags=re.MULTILINE).strip()
    match = re.search(r"\[\s*\{.*\}\s*\]", text, re.DOTALL)
    if match:
        text = match.group(0)
    return text


def sanitize_segments(segments: list, max_duration: float = 3600.0) -> list:
    """Validate and sanitize extracted segments."""
    sanitized = []
    for idx, seg in enumerate(segments, 1):
        if not isinstance(seg, dict):
            continue
        start = max(0.0, float(seg.get("start_time", 0.0)))
        end = float(seg.get("end_time", start + 45.0))
        if end <= start:
            end = start + 45.0
        if max_duration > 0 and end > max_duration:
            end = max_duration

        # Ensure duration is at least 15s and at most 120s
        dur = end - start
        if dur < 15.0:
            end = min(max_duration, start + 30.0)
        elif dur > 120.0:
            end = start + 90.0

        title = str(seg.get("title", f"Key Concept {idx}")).strip() or f"Key Concept {idx}"
        concept = str(seg.get("key_concept", "")).strip() or "Essential topic highlight"
        terms = seg.get("important_terms", [])
        if isinstance(terms, str):
            terms = [t.strip() for t in terms.split(",") if t.strip()]
        elif not isinstance(terms, list):
            terms = []

        sanitized.append({
            "short_number": idx,
            "title": title,
            "key_concept": concept,
            "important_terms": terms[:5],
            "start_time": round(start, 1),
            "end_time": round(end, 1),
            "reason": str(seg.get("reason", "Selected as a core highlight of the lesson.")).strip(),
        })
    return sanitized


def analyze_transcript(transcript_result: dict, video_title: str) -> list:
    """Select highlight segments using local transcript heuristics."""
    transcript_segments = transcript_result.get("segments", [])
    if not transcript_segments:
        raise ValueError("No speech or audio segments detected in the video.")
    print("[AI Analysis] Using local highlight selection (no external AI API).")
    return select_fallback_segments(transcript_result)


def select_fallback_segments(transcript_result: dict) -> list:
    """Local algorithmic fallback to evenly partition key video highlights when LLM is offline."""
    transcript_segments = transcript_result.get("segments", [])
    if not transcript_segments:
        raise ValueError("No speech segments detected in transcript.")

    total_duration = float(transcript_segments[-1]["end"])
    clip_count = min(6, max(2, int(total_duration // 45)))
    clip_duration = min(75.0, max(30.0, total_duration / clip_count))
    results = []

    for index in range(clip_count):
        start = min(index * total_duration / clip_count, max(0.0, total_duration - clip_duration))
        end = min(total_duration, start + clip_duration)
        nearby_text = " ".join(
            s["text"].strip()
            for s in transcript_segments
            if float(s["end"]) > start and float(s["start"]) < end
        )
        concept = nearby_text[:180] or "Essential concept highlight from the source lecture."
        results.append({
            "short_number": index + 1,
            "title": f"Key Milestone {index + 1}",
            "key_concept": concept,
            "important_terms": ["Core Concept", "Educational Summary"],
            "start_time": round(start, 1),
            "end_time": round(end, 1),
            "reason": "Evenly distributed high-signal educational segment.",
        })

    return results


# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — FFmpeg Video Cutting & 9:16 Vertical Cropping
# ─────────────────────────────────────────────────────────────────────────────
def cut_clip_ffmpeg(source: Path, start: float, end: float, out: Path):
    """Cut exact time slice from source video."""
    ffmpeg = get_ffmpeg()
    duration = max(1.0, end - start)
    cmd = [
        ffmpeg, "-y",
        "-ss", str(start),
        "-i", str(source),
        "-t", str(duration),
        "-c:v", "libx264",
        "-preset", "fast",
        "-c:a", "aac",
        "-avoid_negative_ts", "make_zero",
        str(out)
    ]
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode != 0:
        err_msg = res.stderr.decode("utf-8", errors="replace")
        raise RuntimeError(f"FFmpeg clip cut failed:\n{err_msg}")


def calculate_even_crop_dimensions(w: int, h: int) -> Tuple[int, int, int]:
    """
    Calculate 9:16 portrait crop parameters guaranteed to be even numbers
    (divisible by 2) for H.264 video codec compatibility.
    """
    target_w = int(h * 9 / 16)
    # Ensure target width is even
    target_w = (target_w // 2) * 2
    if target_w > w:
        target_w = (w // 2) * 2

    # Ensure horizontal offset is even
    x_offset = (w - target_w) // 2
    x_offset = (x_offset // 2) * 2
    return target_w, h, max(0, x_offset)


def crop_to_vertical_ffmpeg(source: Path, out: Path) -> Path:
    """Center-crop 16:9 widescreen video to 9:16 vertical short format."""
    ffmpeg = get_ffmpeg()

    # Accurately probe video resolution using OpenCV
    cap = cv2.VideoCapture(str(source))
    if not cap.isOpened():
        return source

    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()

    if w <= 0 or h <= 0 or w <= h:
        return source  # Already vertical or invalid dimensions

    target_w, target_h, x_offset = calculate_even_crop_dimensions(w, h)

    cmd = [
        ffmpeg, "-y",
        "-i", str(source),
        "-vf", f"crop={target_w}:{target_h}:{x_offset}:0",
        "-c:v", "libx264",
        "-preset", "fast",
        "-c:a", "aac",
        str(out)
    ]
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode != 0:
        print(f"[FFmpeg] Vertical crop warning: {res.stderr.decode('utf-8', errors='replace')[:200]}")
        return source
    return out


# ─────────────────────────────────────────────────────────────────────────────
# STEP 5 — Modern Typography & Subtitle Overlays (OpenCV)
# ─────────────────────────────────────────────────────────────────────────────
def draw_text_with_pill_background(
    frame: np.ndarray,
    text: str,
    position: Tuple[int, int],
    font_scale: float,
    color: Tuple[int, int, int],
    bg_color: Tuple[int, int, int] = (15, 23, 42),
    thickness: int = 2,
    padding: int = 8
):
    """Render anti-aliased text inside a sleek modern background container."""
    font = cv2.FONT_HERSHEY_DUPLEX
    lines = text.split("\n")
    x, y = position
    line_h = int(32 * font_scale)

    for i, line in enumerate(lines):
        ly = y + i * line_h
        (tw, th), baseline = cv2.getTextSize(line, font, font_scale, thickness)
        # Background card
        cv2.rectangle(
            frame,
            (x - padding, ly - th - padding),
            (x + tw + padding, ly + padding),
            bg_color,
            -1
        )
        # Subtle border
        cv2.rectangle(
            frame,
            (x - padding, ly - th - padding),
            (x + tw + padding, ly + padding),
            (51, 65, 85),
            1
        )
        # Foreground text
        cv2.putText(frame, line, (x, ly), font, font_scale, color, thickness, cv2.LINE_AA)


def build_audio_mux_command(
    video_path: Path,
    audio_source: Path,
    out_path: Path,
    ffmpeg_exe: str = "ffmpeg"
) -> list:
    """Build FFmpeg command to mux processed video stream with exact audio slice."""
    return [
        ffmpeg_exe, "-y",
        "-i", str(video_path),
        "-i", str(audio_source),
        "-c:v", "libx264",
        "-preset", "fast",
        "-c:a", "aac",
        "-map", "0:v:0",
        "-map", "1:a?",
        "-shortest",
        str(out_path),
    ]


def add_text_overlay_opencv(
    video_path: Path,
    out_path: Path,
    title: str,
    concept: str,
    audio_source: Optional[Path] = None
):
    """
    Render sleek educational badges & captions on frames,
    then mux synchronously with the trimmed clip audio.
    """
    source_audio = audio_source or video_path
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video stream: {video_path}")

    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    tmp_video = out_path.parent / f"_tmp_novid_{out_path.name}"
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(str(tmp_video), fourcc, fps, (w, h))

    font_scale_title = max(0.55, w / 950.0)
    font_scale_caption = max(0.48, w / 1050.0)

    # Wrap concept text to fit mobile portrait width
    max_chars = max(22, int(w / (14 * font_scale_caption)))
    wrapped_concept = "\n".join(textwrap.wrap(concept, max_chars))

    title_frames = int(fps * 3.5)
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Header Badge (first 3.5 seconds)
        if frame_idx < title_frames:
            draw_text_with_pill_background(
                frame,
                text=title[:55],
                position=(24, int(h * 0.08)),
                font_scale=font_scale_title,
                color=(0, 217, 255),       # Vibrant Cyan
                bg_color=(15, 23, 42),     # Slate-900
                thickness=2,
                padding=10,
            )

        # Concept Caption at bottom (constant high-yield summary)
        lines = wrapped_concept.split("\n")
        line_h = int(34 * font_scale_caption)
        caption_y = h - (len(lines) * line_h) - 40

        draw_text_with_pill_background(
            frame,
            text=wrapped_concept,
            position=(24, caption_y),
            font_scale=font_scale_caption,
            color=(248, 250, 252),      # Pure white
            bg_color=(15, 23, 42),      # Slate-900
            thickness=2,
            padding=10,
        )

        writer.write(frame)
        frame_idx += 1

    cap.release()
    writer.release()

    # Mux OpenCV video with the clip's synchronized audio stream
    ffmpeg = get_ffmpeg()
    cmd = build_audio_mux_command(tmp_video, source_audio, out_path, ffmpeg)
    res = subprocess.run(cmd, capture_output=True)

    if res.returncode != 0:
        import shutil
        shutil.copy(str(tmp_video), str(out_path))

    tmp_video.unlink(missing_ok=True)


# ─────────────────────────────────────────────────────────────────────────────
# STEP 6 — Export Shorts & Master Pipeline Orchestrator
# ─────────────────────────────────────────────────────────────────────────────
def slugify(text: str) -> str:
    """Create URL/filesystem-safe filename string."""
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")[:40]


def export_short(source_video: Path, segment: dict, idx: int, crop: bool = True) -> Path:
    """Generate and export a single short video from the source."""
    start = float(segment["start_time"])
    end = float(segment["end_time"])
    title = segment.get("title", f"Short {idx}")
    concept = segment.get("key_concept", "")

    slug = slugify(title)
    tmp_cut = OUTPUT_DIR / f"_tmp_cut_{idx}_{slug}.mp4"
    tmp_crop = OUTPUT_DIR / f"_tmp_crop_{idx}_{slug}.mp4"
    out_path = OUTPUT_DIR / f"short_{idx:02d}_{slug}.mp4"

    try:
        # 1. Cut segment
        cut_clip_ffmpeg(source_video, start, end, tmp_cut)

        # 2. Crop to vertical 9:16
        if crop:
            cropped = crop_to_vertical_ffmpeg(tmp_cut, tmp_crop)
        else:
            cropped = tmp_cut

        # 3. Add overlays & mux
        add_text_overlay_opencv(
            cropped,
            out_path,
            title=f"#{idx} {title}",
            concept=concept,
            audio_source=cropped
        )
        return out_path

    finally:
        for f in [tmp_cut, tmp_crop]:
            if f.exists():
                f.unlink(missing_ok=True)


def convert(
    youtube_url: str,
    crop_to_vert: bool = True,
    progress_callback=None
) -> List[Dict[str, Any]]:
    """
    Master pipeline executing:
    Stream Ingestion -> Local Whisper Transcription -> Local Highlight Analysis -> FFmpeg Clipping & Render.
    Returns list of dicts with generated file info and conceptual metadata.
    """
    print("\n========================================================")
    print("  AI Video Intelligence Platform — Pipeline Started")
    print("========================================================")

    if progress_callback:
        progress_callback("downloading")
    video_path, title = download_video(youtube_url)

    if progress_callback:
        progress_callback("transcribing")
    transcript = transcribe_video(video_path)

    if progress_callback:
        progress_callback("analyzing")
    segments = analyze_transcript(transcript, title)

    total_shorts = len(segments)
    print(f"\n[Export] Rendering {total_shorts} conceptual shorts...")
    results = []

    for i, seg in enumerate(segments, 1):
        if progress_callback:
            progress_callback(f"exporting:{i}/{total_shorts}")
        out_file = export_short(video_path, seg, i, crop=crop_to_vert)
        duration = round(float(seg["end_time"]) - float(seg["start_time"]), 1)
        results.append({
            "filename": out_file.name,
            "filepath": str(out_file),
            "short_number": i,
            "title": seg.get("title", f"Short {i}"),
            "key_concept": seg.get("key_concept", ""),
            "important_terms": seg.get("important_terms", []),
            "start_time": seg.get("start_time"),
            "end_time": seg.get("end_time"),
            "duration": duration,
            "reason": seg.get("reason", ""),
        })

    print("\n========================================================")
    print("  Pipeline Completed Successfully!")
    print("========================================================\n")
    return results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python processor.py <youtube_url> [--landscape]")
        sys.exit(1)

    url_arg = sys.argv[1]
    is_landscape = "--landscape" in sys.argv
    res = convert(url_arg, crop_to_vert=not is_landscape)
    for r in res:
        print(f"Generated: {r['filename']} ({r['duration']}s) - {r['title']}")