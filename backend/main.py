from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
import hashlib

app = FastAPI()

# Configure CORS to allow requests from the React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PasswordRequest(BaseModel):
    password: str

class ContentRequest(BaseModel):
    content: str

@app.get("/")
def read_root():
    return {"message": "Hashing Service is running"}

@app.post("/hash/password")
def hash_password(request: PasswordRequest):
    """
    Hashes a password using bcrypt.
    """
    try:
        # bcrypt requires bytes
        hashed_bytes = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())
        return {"hash": hashed_bytes.decode('utf-8')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/hash/content")
def hash_content(request: ContentRequest):
    """
    Hashes string content using SHA-256.
    """
    try:
        sha256_hash = hashlib.sha256(request.content.encode('utf-8')).hexdigest()
        return {"hash": sha256_hash}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/hash/file")
async def hash_file(file: UploadFile = File(...)):
    """
    Hashes an uploaded file using SHA-256.
    """
    try:
        sha256_hash = hashlib.sha256()
        while chunk := await file.read(8192):
            sha256_hash.update(chunk)
        return {"hash": sha256_hash.hexdigest()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
