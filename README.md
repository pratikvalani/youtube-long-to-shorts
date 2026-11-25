# ClipFlow

**Turn long YouTube videos into polished, vertical short-form clips.**

ClipFlow is an AI-assisted video editing web app built with Flask, Whisper, Groq, FFmpeg, OpenCV, and yt-dlp. It downloads a YouTube video, transcribes the audio, identifies strong moments, and exports ready-to-publish 9:16 MP4 shorts.

## Features

- YouTube link ingestion
- Local or cloud Whisper transcription
- AI-powered highlight and segment selection
- Automatic 9:16 cropping
- Real-time processing status
- Generated shorts preview and download
- ZIP export for completed jobs
- Modern responsive web interface

## Technology

| Component | Technology |
|---|---|
| Backend | Python, Flask |
| Speech transcription | Whisper |
| AI analysis | Groq |
| Video download | yt-dlp |
| Video editing | FFmpeg, OpenCV |
| Frontend | HTML, CSS, JavaScript |

## Requirements

- Windows 10/11
- Python 3.10 or newer
- Groq API key
- Internet connection

FFmpeg is supplied through `imageio-ffmpeg`; a separate FFmpeg installation is not required.

## Setup

### 1. Create a virtual environment

```powershell
python -m venv venv
```

### 2. Install dependencies

```powershell
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure your Groq API key

Copy `backend/.env.example` to `backend/.env`, then add your key:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

Create a free Groq API key at <https://console.groq.com>.

## Run

Windows:

```powershell
run.bat
```

Or manually:

```powershell
venv\Scripts\activate
cd backend
python app.py
```

Open <http://127.0.0.1:5000>.

## Usage

1. Paste a YouTube video URL.
2. Enable or disable 9:16 cropping.
3. Start conversion.
4. Follow the processing stages.
5. Preview and download the generated shorts.

## Project Structure

```text
backend/
  app.py
  processor.py
  .env.example
frontend/
  index.html
  css/
  js/
requirements.txt
run.bat
setup.bat
README.md
```

## Generated Files

Downloaded videos and rendered shorts are stored locally in:

- `backend/downloads/`
- `backend/output_shorts/`

These directories are intentionally excluded from Git.

## Troubleshooting

- **Groq API not configured:** confirm `backend/.env` contains a valid `GROQ_API_KEY`.
- **Port 5000 is busy:** set `PORT=5001` in `backend/.env`.
- **Local Whisper is slow:** use cloud transcription or choose a shorter test video.
- **YouTube download fails:** update yt-dlp with `venv\Scripts\python.exe -m pip install --upgrade yt-dlp`.

## License

Add a license if you plan to distribute this project publicly.
