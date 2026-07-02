from utils.audio_processor import chunk_audio, process_input
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title

source="https://youtu.be/0jiLmhGzjOM?si=dWVOa4tiCbYp36zO"

chunks=process_input(source)
print(summarize(transcribe_all(chunks, language="english")))
print(generate_title(transcribe_all(chunks, language="english")))