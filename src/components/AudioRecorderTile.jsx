
// src/components/AudioRecorderTile.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function AudioRecorderTile() {
  const [bpm, setBpm] = useState(120);
  const [step, setStep] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const timeoutRef = useRef(null);
  const clickBufferRef = useRef(null);
  const countBuffersRef = useRef([]);
  const audioCtxRef = useRef(null);
  const countNames = ['one', 'two', 'three', 'four'];

  const loadAudio = async (url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return audioCtxRef.current.decodeAudioData(arrayBuffer);
  };

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    (async () => {
      clickBufferRef.current = await loadAudio('/audio/click.mp3');
      countBuffersRef.current = await Promise.all(
        countNames.map(name => loadAudio(`/audio/count_audio/${name}.mp3`))
      );
    })();
  }, []);

  const playCountAndClick = async () => {
    const ctx = audioCtxRef.current;
    const beatMs = 60000 / bpm;
    const now = ctx.currentTime + 0.1;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => setStep(i + 1), i * beatMs);
      const countSource = ctx.createBufferSource();
      countSource.buffer = countBuffersRef.current[i];
      countSource.connect(ctx.destination);
      countSource.start(now + i * (beatMs / 1000));
      const clickSource = ctx.createBufferSource();
      clickSource.buffer = clickBufferRef.current;
      clickSource.connect(ctx.destination);
      clickSource.start(now + i * (beatMs / 1000));
    }
    setTimeout(() => setStep(null), 4 * beatMs);
  };

  const handleRecord = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
      const filename = `audio_${timestamp}.wav`;
      const formData = new FormData();
      formData.append('file', blob, filename);

      const uploadRes = await fetch('https://rudilick-backend.onrender.com/upload-wav/', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.filename) return alert('업로드 실패');

      const transcribeRes = await fetch('https://rudilick-backend.onrender.com/transcribe-beat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: uploadData.filename })
      });

      const result = await transcribeRes.json();
      alert("🎵 전사 결과:\n" + JSON.stringify(result, null, 2));
    };

    await playCountAndClick();
    mediaRecorderRef.current.start();
    setRecording(true);
    timeoutRef.current = setTimeout(() => stopRecording(), 60000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      clearTimeout(timeoutRef.current);
      setRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    clearTimeout(timeoutRef.current);
    audioChunks.current = [];
    setRecording(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-12 px-4 py-6 rounded-2xl shadow-lg bg-gray-900 text-white border border-gray-700 relative">
      <h2 className="text-2xl font-bold mb-4 text-center">Play + Count + Record</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">BPM</label>
        <input
          type="range"
          min="40"
          max="220"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-center font-mono mt-2">{bpm} BPM</p>
      </div>
      {step && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 text-white text-[10rem] font-extrabold animate-pulse">
          {step}
        </div>
      )}
      <div className="flex gap-4">
        {!recording && (
          <button
            onClick={handleRecord}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold"
          >
            START
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
