// Forced update for Git push
// 
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AudioRecorderTile = forwardRef(({ bpm, meter, genre, slowMode, mrType }, ref) => {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [countNumber, setCountNumber] = useState(null);
  const recordedChunks = useRef([]);
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
    for (let i = 1; i <= 4; i++) {
      setCountNumber(i);
      await playSound(`/audio/count_audio/${i}.mp3`);
      await wait(interval - 100);
    }
    setCountNumber(null);

    const duration = 5000;
    const totalBeats = Math.floor(duration / interval);
    for (let i = 0; i < totalBeats; i++) {
      await playSound(`/audio/click.mp3`);
      await wait(interval - 100);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
        console.log("🔴 Recorded data:", blob);
      };

      setRecording(true);
      await playCountAndClick(); // 카운트+클릭 재생 먼저
      mediaRecorderRef.current.start(); // 재생 끝난 후 녹음 시작

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