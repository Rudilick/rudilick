import React, { useState, useRef } from 'react';

export default function WriteFormSection() {
  const [bpm, setBpm] = useState(120);
  const [meter, setMeter] = useState("4/4");
  const [genre, setGenre] = useState("");
  const [slowMode, setSlowMode] = useState(false);
  const [mrType, setMrType] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const clickIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const beatCountMap = {
    "4/4": 4, "3/4": 3, "6/8": 2, "12/8": 4,
    "5/4": 5, "7/8": 4, "9/8": 3, "2/4": 2,
    "7/4": 4, "9/4": 3
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const playAudio = (src) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play();
    });
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      clearInterval(clickIntervalRef.current);
      clearTimeout(timeoutRef.current);
      setRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    clearInterval(clickIntervalRef.current);
    clearTimeout(timeoutRef.current);
    audioChunks.current = [];
    setRecording(false);
  };

  const handleRecord = async () => {
    try {
      const permission = await navigator.mediaDevices.getUserMedia({ audio: true });
      const count = beatCountMap[meter] || 4;
      const beatDurationMs = (60 / bpm) * 1000;

      for (let i = 1; i <= count; i++) {
        await playAudio(`/audio/count_audio/${["one", "two", "three", "four", "five", "six", "seven"][i - 1]}.mp3`);
        await sleep(beatDurationMs);
      }

      mediaRecorderRef.current = new MediaRecorder(permission);
      audioChunks.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', blob, 'recorded.wav');

        try {
          const uploadRes = await fetch('https://rudilick-backend.onrender.com/upload-wav/', {
            method: 'POST',
            body: formData,
          });

          const uploadData = await uploadRes.json();
          console.log("✅ uploadData:", uploadData); // ✅ 여기 삽입됨

          if (!uploadData?.filename) {
            throw new Error("업로드 응답에 filename 없음");
          }

          const transcribeRes = await fetch('https://rudilick-backend.onrender.com/transcribe-beat/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: uploadData.filename })
          });

          const result = await transcribeRes.json();
          alert("🎵 전사 결과:\n" + JSON.stringify(result, null, 2));
        } catch (err) {
          alert("❌ 업로드 또는 전사 실패: " + err.message);
        }
      };

      mediaRecorderRef.current.start();
      setRecording(true);

      const clickAudio = new Audio("/audio/click.mp3");
      clickIntervalRef.current = setInterval(() => {
        clickAudio.currentTime = 0;
        clickAudio.play();
      }, beatDurationMs);

      timeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 60000);
    } catch (err) {
      alert("❌ 마이크 접근 실패: " + err.message);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-12 px-4 py-6 rounded-2xl shadow-lg bg-gray-900 text-white border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center">Generate Drum Sheet Music</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">BPM</label>
        <div className="flex items-center gap-4">
          <input type="range" min="40" max="220" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="flex-grow" />
          <span className="w-12 text-center font-mono">{bpm}</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Time Signature</label>
        <select value={meter} onChange={(e) => setMeter(e.target.value)} className="w-full border rounded px-3 py-2 text-black">
          {Object.keys(beatCountMap).map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Genre</label>
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full border rounded px-3 py-2 text-black">
          <option value="">Select genre</option>
          <option value="rock">Rock</option>
          <option value="jazz">Jazz</option>
          <option value="funk">Funk</option>
          <option value="hiphop">Hip Hop</option>
          <option value="ballad">Ballad</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center">
          <input type="checkbox" checked={slowMode} onChange={(e) => setSlowMode(e.target.checked)} className="mr-2" />
          Slow down for recording
        </label>
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">MR Type</label>
        <div className="space-y-2">
          {["metronome", "backing", "upload"].map((type) => (
            <label className="flex items-center" key={type}>
              <input type="radio" name="mrType" value={type} checked={mrType === type} onChange={(e) => setMrType(e.target.value)} className="mr-2" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {!recording && (
          <button onClick={handleRecord} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold">
            PLAY TO WRITE
          </button>
        )}
        {recording && (
          <>
            <button onClick={stopRecording} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold">
              FINISH
            </button>
            <button onClick={cancelRecording} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-xl font-semibold">
              CANCEL
            </button>
          </>
        )}
      </div>
    </div>
  );
}