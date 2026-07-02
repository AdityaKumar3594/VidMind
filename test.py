from utils.audio_processor import chunk_audio, process_input
from core.transcriber import transcribe_all

source="https://youtu.be/0jiLmhGzjOM?si=dWVOa4tiCbYp36zO"

chunks=process_input(source)
print(transcribe_all(chunks, language="english"))