import yt_dlp
from pydub import AudioSegment
import os

# Directory where downloaded and processed audio files will be stored
DOWNLOAD_DIR = "downloads"

# Create the directory if it doesn't already exist
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def download_youtube_audio(url: str) -> str:
    """
    Downloads audio from a YouTube video and converts it to WAV format.

    Args:
        url (str): YouTube video URL.

    Returns:
        str: Path to the downloaded WAV file.
    """

    # Output filename template
    output_path = os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s")

    # yt-dlp configuration
    ydl_opts = {
        "format": "bestaudio/best",  # Download highest quality audio
        "outtmpl": output_path,      # Save in downloads folder
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",   # Convert audio after download
                "preferredcodec": "wav",       # Output format
                "preferredquality": "192",     # Audio bitrate
            }
        ],
        "quiet": True,  # Suppress download logs
    }

    # Download and process audio
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

        # Generate final filename and replace original extension with .wav
        filename = (
            ydl.prepare_filename(info)
            .replace(".webm", ".wav")
            .replace(".m4a", ".wav")
        )

    return filename


def convert_to_wav(input_path: str) -> str:
    """
    Converts any supported audio/video file into a mono 16kHz WAV file.

    Args:
        input_path (str): Path to input media file.

    Returns:
        str: Path to converted WAV file.
    """

    # Create output filename
    output_path = os.path.splitext(input_path)[0] + "_converted.wav"

    # Load media file
    audio = AudioSegment.from_file(input_path)

    # Convert to mono channel and 16kHz sample rate
    # (Preferred format for speech recognition models)
    audio = audio.set_channels(1).set_frame_rate(16000)

    # Export as WAV
    audio.export(output_path, format="wav")

    return output_path


def chunk_audio(wav_path: str, chunk_minutes: int = 10) -> list:
    """
    Splits a WAV file into smaller chunks.

    Args:
        wav_path (str): Path to WAV file.
        chunk_minutes (int): Length of each chunk in minutes.

    Returns:
        list: Paths of generated chunk files.
    """

    # Load WAV audio
    audio = AudioSegment.from_wav(wav_path)

    # Convert chunk duration to milliseconds
    chunk_ms = chunk_minutes * 60 * 1000

    # Store generated chunk paths
    chunks = []

    # Iterate over audio in fixed-size intervals
    for i, start in enumerate(range(0, len(audio), chunk_ms)):

        # Extract current chunk
        chunk = audio[start:start + chunk_ms]

        # Generate chunk filename
        chunk_path = f"{wav_path}_chunk_{i}.wav"

        # Save chunk
        chunk.export(chunk_path, format="wav")

        # Store path
        chunks.append(chunk_path)

    return chunks


def process_input(source: str) -> list:
    """
    Processes either:
    - A YouTube URL (downloads audio)
    - A local audio/video file (converts to WAV)

    Then splits the audio into chunks.

    Args:
        source (str): URL or local file path.

    Returns:
        list: List of chunk file paths.
    """

    # Check whether input is a YouTube URL
    if source.startswith("http://") or source.startswith("https://"):
        print("Detected YouTube URL. Downloading audio...")
        wav_path = download_youtube_audio(source)

    else:
        print("Detected local file. Converting to WAV...")
        wav_path = convert_to_wav(source)

    # Split audio into chunks
    print("Chunking audio...")
    chunks = chunk_audio(wav_path)

    print(f"Audio ready — {len(chunks)} chunk(s) created.")

    return chunks