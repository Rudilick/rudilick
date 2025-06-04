import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AudioRecorderTile = forwardRef(({ bpm, meter }, ref) => {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);

  useImperativeHandle(ref, () => ({
    startRecording: () => {
      handleRecord();
    }
  }));

  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        console.log("🔴 Recorded data:", e.data);
      };
      mediaRecorderRef.current.start();
      setRecording(true);
      setTimeout(() => {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }, 5000);
    } catch (err) {
      alert("❌ 마이크 접근 실패: " + err.message);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-lg text-white mt-4">
      <p>🎤 AudioRecorderTile Ready (BPM: {bpm}, Meter: {meter})</p>
      {recording && <p>Recording...</p>}
    </div>
  );
});

export default AudioRecorderTile;