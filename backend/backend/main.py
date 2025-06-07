from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import storage
from google.oauth2 import service_account
from pydantic import BaseModel
from datetime import datetime
import os
import json
import librosa
import shutil
from typing import List

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.rudilick.com", "https://rudilick.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GCS 설정
GCS_BUCKET_NAME = "rudilick_audio"
GCS_KEY_PATH = "gcs_key.json"
with open(GCS_KEY_PATH, "r") as f:
    credentials_info = json.load(f)
credentials = service_account.Credentials.from_service_account_info(credentials_info)
client = storage.Client(credentials=credentials)
bucket = client.bucket(GCS_BUCKET_NAME)

# 모델 정의
class FileRequest(BaseModel):
    filename: str

# 업로드
@app.post("/upload-wav/")
async def upload_wav(file: UploadFile = File(...)):
    print("📥 파일 업로드 요청 수신됨")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    blob_name = f"audio_{timestamp}.wav"
    blob = bucket.blob(blob_name)
    contents = await file.read()
    blob.upload_from_string(contents, content_type="audio/wav")
    return {
        "message": "파일이 GCS에 업로드되었습니다.",
        "filename": blob_name,
        "url": f"https://storage.googleapis.com/{GCS_BUCKET_NAME}/{blob_name}"
    }

# 전사
@app.post("/transcribe-beat/")
async def transcribe_beat(request: FileRequest):
    try:
        blob = bucket.blob(request.filename)
        local_path = f"temp/{request.filename}"
        os.makedirs("temp", exist_ok=True)
        blob.download_to_filename(local_path)

        # 전사 함수
        def transcribe_with_beat_quantization(wav_path: str, divisions: List[int] = [3, 4, 6]) -> dict:
            y, sr = librosa.load(wav_path, sr=None)
            tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
            beat_times = librosa.frames_to_time(beat_frames, sr=sr)
            grid_times = []
            for i in range(len(beat_times) - 1):
                start = beat_times[i]
                end = beat_times[i + 1]
                for div in divisions:
                    interval = (end - start) / div
                    grid_times.extend([round(start + interval * j, 3) for j in range(div)])
            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            onset_frames = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
            onset_times = librosa.frames_to_time(onset_frames, sr=sr)
            result = []
            for onset in onset_times:
                closest = min(grid_times, key=lambda g: abs(g - onset))
                result.append({
                    "quantized_time": round(closest, 3),
                    "raw_time": round(float(onset), 3)
                })
            return {
                "tempo": round(float(tempo), 2),
                "beats": len(beat_times),
                "notes": result
            }

        return transcribe_with_beat_quantization(local_path)

    except Exception as e:
        return {"error": str(e)}

# ✅ 설문 응답 저장 API
@app.post("/survey-feedback/")
async def survey_feedback(
    filename: str = Body(...),
    json_data: dict = Body(...),
    feedback: str = Body(...)  # "perfect" or "not_perfect"
):
    try:
        if feedback == "perfect":
            # 디렉토리 생성
            os.makedirs("confirmed_learn_dataset/confirmed_json", exist_ok=True)
            os.makedirs("confirmed_learn_dataset/confirmed_wav", exist_ok=True)

            # JSON 저장
            json_path = f"confirmed_learn_dataset/confirmed_json/{filename}.json"
            with open(json_path, "w") as f:
                json.dump(json_data, f, indent=2)

            # WAV 저장
            blob = bucket.blob(filename)
            wav_path = f"confirmed_learn_dataset/confirmed_wav/{filename}"
            blob.download_to_filename(wav_path)

            return {"message": "✅ 설문 결과 저장 완료 (학습용 포함)"}
        else:
            return {"message": "⚠️ 설문 결과: 학습 데이터로 제외됨"}
    except Exception as e:
        return {"error": str(e)}