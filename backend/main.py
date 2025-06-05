class TranscriptionRequest(BaseModel):
    filename: str
    bpm: int
    meter: str
    genre: str
    mrType: str
    slowMode: bool

@app.post("/transcribe-beat/")
async def transcribe_beat(request: TranscriptionRequest):
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
                "notes": result,
                "bpm": request.bpm,
                "meter": request.meter,
                "genre": request.genre,
                "mrType": request.mrType,
                "slowMode": request.slowMode
            }

        return transcribe_with_beat_quantization(local_path)
    except Exception as e:
        return {"error": str(e)}