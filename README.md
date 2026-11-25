# ClipFlow

ClipFlow is a local YouTube-to-Shorts converter built with Python and Flask. It downloads a YouTube video, transcribes it with local OpenAI Whisper, selects highlights using local heuristics, crops clips to 9:16, and exports MP4 files.

**Repository:** https://github.com/pratikvalani/youtube-long-to-shorts

## Privacy and API-free operation

- No third-party AI API key is required.
- Audio and transcription run locally.
- No external API is used for highlight selection.
- The only remote input is the YouTube URL supplied for downloading.
- No credentials or environment variables are required.

## Features

- YouTube video download through yt-dlp
- Local Whisper transcription
- Local highlight selection
- 9:16 vertical cropping with OpenCV and FFmpeg
- Live processing stages
- Video preview and individual downloads
- ZIP download for all generated shorts

## Technology

| Component | Technology |
|---|---|
| Web server | Flask |
| Speech transcription | OpenAI Whisper |
| Video download | yt-dlp |
| Video processing | FFmpeg and OpenCV |
| Frontend | HTML, CSS, JavaScript |

## Requirements

- Windows 10 or 11
- Python 3.10+
- Internet access for downloading YouTube media
- Enough disk space for downloaded videos and generated clips

FFmpeg binaries are supplied through `imageio-ffmpeg`.

## Installation

### Windows setup

```powershell
setup.bat
```

### Manual setup

```powers
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```powershell
run.bat
```

Or run manually:

```powershell
venv\Scripts\activate
cd backend
python app.py
```

Open http://127.0.0.1:5000.

## Usage

1. Paste a YouTube URL.
2. Choose whether to export in 9:16 or landscape format.
3. Start conversion.
4. Wait for local transcription and rendering.
5. Preview or download generated shorts.

## Project structure

```text
backend/
  app.py
  processor.py
frontend/
  css/
  js/
  assets/
  index.html
requirements.txt
run.bat
setup.bat
README.md
```

## Generated and sensitive files

The following are created locally and excluded from Git:

- `venv/`
- `backend/.env*`
- `backend/downloads/`
- `backend/output_shorts/`
- `backend/jobs.json`
- Python cache and coverage files
- Temporary media, logs, credentials, and ZIP files

## Troubleshooting

**YouTube download fails**

Update yt-dlp:

```powershell
venv\Scripts\python.exe -m pip install --upgrade yt-dlp
```

**Transcription is slow**

Use a shorter video or set `WHISPER_MODEL = "tiny"` in `backend/processor.py`.

**Port 5000 is occupied**

Set the `PORT` environment variable before starting the server:

```powershell
$env:PORT="5001"
venv\Scripts\python.exe backend\app.py
```
