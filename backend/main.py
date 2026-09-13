from dotenv import load_dotenv
import time
from backend.utils.audio_processor import process_input
from backend.core.transcriber import transcribe_all
from backend.core.summarizer import summarize, generate_title
from backend.core.extractor import extract_action_items, extract_key_decisions, extract_questions
from backend.core.rag_engine import build_rag_chain, ask_question


load_dotenv()

# Delay (seconds) between sequential Mistral calls to stay within free-tier rate limits.
# Mistral free tier: ~2 RPM. max_retries=6 on the LLM handles occasional bursts via
# exponential backoff, but a proactive delay reduces retries and avoids WinError 10054.
_MISTRAL_CALL_DELAY = 15


def run_pipeline(source: str, language: str = "english") -> dict:
    print("Starting AI Video Assistant")

    chunks = process_input(source)

    transcript = transcribe_all(chunks, language)
    print(f"Raw transcription (first 300 chars): {transcript[:300]}")

    # Run LLM tasks sequentially to avoid Mistral 429 rate-limit errors.
    # A small delay between each call keeps token-per-minute usage under the free-tier cap.
    print("Running analysis tasks sequentially (rate-limit safe)...")

    results = {}

    sequential_tasks = [
        ("title",          lambda: generate_title(transcript)),
        ("summary",        lambda: summarize(transcript)),
        ("action_items",   lambda: extract_action_items(transcript)),
        ("key_decisions",  lambda: extract_key_decisions(transcript)),
        ("open_questions", lambda: extract_questions(transcript)),
        ("rag_chain",      lambda: build_rag_chain(transcript)),
    ]

    for key, fn in sequential_tasks:
        try:
            print(f"  → Running {key}...")
            results[key] = fn()
            print(f"  ✓ {key} done")
        except Exception as e:
            print(f"  ✗ {key} failed: {e}")
            results[key] = f"Error: {e}"

        # Brief pause between Mistral calls (skip delay after the last task)
        if key != sequential_tasks[-1][0]:
            time.sleep(_MISTRAL_CALL_DELAY)

    results["transcript"] = transcript
    return results