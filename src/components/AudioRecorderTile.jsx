import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AudioRecorderTile = forwardRef(({ bpm, meter, genre, slowMode, mrType }, ref) => {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    cancelRecording
  }));

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        console.log("🔴 Recorded data:", e.data);
      };
      mediaRecorderRef.current.start();
      setRecording(true);

      setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (err) {
      alert("❌ 마이크 접근 실패: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop(); // 또는 .stop() 후에 stream 트랙을 끄는 로직도 가능
      setRecording(false);
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