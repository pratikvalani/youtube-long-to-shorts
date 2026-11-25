# ClipFlow

An API-free YouTube-to-Shorts converter that turns long videos into polished 9:16 clips.

**Repository:** https://github.com/pratikvalani/youtube-long-to-shorts

## Overview

ClipFlow downloads a YouTube video, transcribes it with local OpenAI Whisper, selects highlight segments with local heuristics, crops clips vertically, and exports MP4 files. It does not require an external AI API key.

## Features

- YouTube video downloading through yt-dlp
- Offline local Whisper transcription
- Local highlight selection
- Automatic 9:16 vertical cropping
- Real-time processing stages
- Short preview and individual downloads
- ZIP download for all generated shorts

## API-free operation

- No third-party AI API key is required.
- No cloud transcription API is used.
- No language-model API is used for highlight selection.
- No credentials or `.env` file are needed.

## Technology

| Component | Technology |
|---|---|
| Web server | Flask |
| Speech transcription | OpenAI Whisper |
| Video download | yt-dlp |
| Video editing | FFmpeg and OpenCV |
| Frontend | HTML, CSS, JavaScript |

## Requirements

- Windows 10 or 11
- Python 3.10 or newer
- Internet access for downloading YouTube videos
- Sufficient disk space for source and generated media

FFmpeg is supplied through `imageio-ffmpeg`.

## Installation

```powershell
setup.bat
```

Or configure the environment manually:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```powershell
run.bat
```

Manual start:

```powershell
venv\Scripts\activate
cd backend
python app.py
```

Open http://127.0.0.1:5000.

## Usage

1. Paste a YouTube video URL.
2. Enable 9:16 cropping if required.
3. Start conversion.
4. Wait for local transcription and rendering.
5. Preview or download the generated shorts.

## Project structure

```text
backend/
  app.py
  processor.py
frontend/
  assets/
  css/
  js/
  index.html
requirements.txt
run.bat
setup.bat
README.md
```

## Gitignored files

The repository excludes virtual environments, credentials, environment files, generated media, job state, logs, caches, archives, and temporary files.

## Troubleshooting

**YouTube download fails**

```powershell
venv\Scripts\python.exe -m pip install --upgrade yt-dlp
```

**Transcription is slow**

Set `WHISPER_MODEL = "tiny"` in `backend/processor.py` for faster transcription.

**Port 5000 is occupied**

```powershell
$env:PORT="5001"
venv\Scripts\python.exe backend\app.py
```
