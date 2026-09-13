from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from dotenv import load_dotenv
import shutil, os, uuid

load_dotenv()

from backend.main import run_pipeline
from backend.core.rag_engine import ask_question

app = FastAPI(title="VidMind API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store  { session_id: rag_chain }
_sessions: dict = {}

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Models ────────────────────────────────────────────────────────────────────

class ProcessURLRequest(BaseModel):
    url: str
    language: str = "english"

class ChatRequest(BaseModel):
    session_id: str
    question: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _pipeline_response(result: dict, session_id: str) -> dict:
    """Strip the rag_chain (not serialisable) and return clean JSON."""
    return {
        "session_id": session_id,
        "title":          result.get("title", ""),
        "transcript":     result.get("transcript", ""),
        "summary":        result.get("summary", ""),
        "action_items":   result.get("action_items", ""),
        "key_decisions":  result.get("key_decisions", ""),
        "open_questions": result.get("open_questions", ""),
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/process/url")
async def process_url(body: ProcessURLRequest):
    """Accept a YouTube URL and run the full pipeline."""
    try:
        result = await run_in_threadpool(run_pipeline, body.url, body.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    session_id = str(uuid.uuid4())
    _sessions[session_id] = result["rag_chain"]
    return _pipeline_response(result, session_id)


@app.post("/process/file")
async def process_file(
    file: UploadFile = File(...),
    language: str = Form("english"),
):
    """Accept an uploaded audio/video file and run the full pipeline."""
    ext = os.path.splitext(file.filename)[-1]
    tmp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{ext}")

    try:
        with open(tmp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        result = await run_in_threadpool(run_pipeline, tmp_path, language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    session_id = str(uuid.uuid4())
    _sessions[session_id] = result["rag_chain"]
    return _pipeline_response(result, session_id)


@app.post("/chat")
async def chat(body: ChatRequest):
    """Ask a question against the processed transcript via RAG."""
    rag_chain = _sessions.get(body.session_id)
    if not rag_chain:
        raise HTTPException(status_code=404, detail="Session not found. Please process a video first.")

    try:
        answer = await run_in_threadpool(ask_question, rag_chain, body.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"answer": answer}
