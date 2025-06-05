import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AudioRecorderTile = forwardRef(({ bpm, meter, genre, slowMode, mrType }, ref) => {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [countNumber, setCountNumber] = useState(null);
  const clickAudio = useRef(null);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    cancelRecording
  }));

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const playSound = (src) => {
    const audio = new Audio(src);
    return new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play();
    });
  };

  const playCountAndClick = async () => {
    const interval = (60 / bpm) * 1000;

    // Count 1~4
    for (let i = 1; i <= 4; i++) {
      setCountNumber(i);
      await playSound(`/audio/count_audio/${i}.mp3`);
      await wait(interval - 100); // 살짝 overlap 방지
    }
    setCountNumber(null);

    // Click loop (5초간 BPM에 맞게 반복)
    const duration = 5000;
    const totalBeats = Math.floor(duration / interval);
    for (let i = 0; i < totalBeats; i++) {
      clickAudio.current = new Audio('/audio/click.mp3');
      clickAudio.current.play();
      await wait(interval);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        console.log("🔴 Recorded data:", e.data);
      };

      mediaRecorderRef.current.start();
      setRecording(true);

      // Play count and click sounds (while recording)
      await playCountAndClick();

      stopRecording();
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
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-lg text-white mt-4 text-center">
      <p>🎤 AudioRecorderTile Ready (BPM: {bpm}, Meter: {meter})</p>
      {recording && <p className="text-green-400">Recording...</p>}
      {countNumber !== null && (
        <p className="text-4xl font-bold text-yellow-300 animate-pulse mt-2">{countNumber}</p>
      )}
    </div>
  );
});

export default AudioRecorderTile;