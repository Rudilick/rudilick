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

  const playCountAndClick = async (playbackBpm, meter) => {
    const interval = (60 / playbackBpm) * 1000;
    const countNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
    const beatsPerMeasure = parseInt(meter.split('/')[0]);

    // 카운트 재생
    for (let i = 0; i < beatsPerMeasure; i++) {
      setCountNumber(i + 1);
      await playSound(`/audio/${countNames[i]}.mp3`);
      await wait(interval);
    }

    setCountNumber(null);

    // 클릭음 재생 (녹음 시 메트로놈 역할)
    const duration = 5000;
    const totalBeats = Math.floor(duration / interval);
    for (let i = 0; i < totalBeats; i++) {
      await playSound(`/audio/click.mp3`);
      await wait(interval);
    }
  };

  const startRecording = async () => {
    try {
      // slowMode 체크 시 50으로 강제 재생 bpm 설정
      const playbackBpm = slowMode ? 50 : bpm;

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

      mediaRecorderRef.current.start(); // 먼저 녹음 시작
      setRecording(true);

      await playCountAndClick(playbackBpm, meter); // 그 다음 카운트+클릭 재생

      setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (err) {
      alert("❌ 마이크 접근 실패: " + err.message);
      console.error("❌ MediaRecorder error:", err);
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
      <p>🎤 AudioRecorderTile Ready (BPM: {bpm}, Meter: {meter}, Slow: {slowMode ? 'Yes' : 'No'})</p>
      {recording && <p className="text-green-400">Recording...</p>}
      {countNumber !== null && (
        <p className="text-4xl font-bold text-yellow-300 animate-pulse mt-2">{countNumber}</p>
      )}
    </div>
  );
});

export default AudioRecorderTile;