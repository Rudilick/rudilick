import React, { useState, useRef } from 'react';

export default function WriteFormSection() {
  const [bpm, setBpm] = useState(120);
  const [meter, setMeter] = useState("4/4");
  const [genre, setGenre] = useState("");
  const [slowMode, setSlowMode] = useState(false);
  const [mrType, setMrType] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const beatCountMap = {
    "4/4": 4, "3/4": 3, "6/8": 2, "12/8": 4,
    "5/4": 5, "7/8": 4, "9/8": 3, "2/4": 2,
    "7/4": 4, "9/4": 3
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const playAudio = (src) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play();
    });
  };

  const handleFinish = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecord = async () => {
    const count = beatCountMap[meter] || 4;
    const beatDurationMs = (60 / bpm) * 1000;

    for (let i = 1; i <= count; i++) {
      const fileName = ["one", "two", "three", "four", "five", "six", "seven"][i - 1];
      await playAudio(`/audio/count_audio/${fileName}.mp3`);
      await sleep(beatDurationMs);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
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

          const transcribeRes = await fetch('https://rudilick-backend.onrender.com/transcribe-beat/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: uploadData.filename })
          });
          const result = await transcribeRes.json();
          alert("🎵 전사 결과:\n" + JSON.stringify(result, null, 2));
        } catch (err) {
          alert("❌ 업로드/전사 실패: " + err.message);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // 강제 종료 (1분 제한)
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 60000);
    } catch (err) {
      alert("❌ 마이크 접근 실패: " + err.message);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-12 px-4 py-6 rounded-2xl shadow-lg bg-gray-900 text-white border border-gray-700">
      {/* 생략: BPM, Meter, Genre, SlowMode, MRType 등 기존 입력 폼 */}
      <button
        onClick={isRecording ? handleFinish : handleRecord}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold"
      >
        {isRecording ? "FINISH" : "PLAY TO WRITE"}
      </button>
    </div>
  );
}