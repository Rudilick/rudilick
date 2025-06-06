import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AudioRecorderTile = forwardRef((props, ref) => {
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

  const playCountAndClick = async (playBpm, meter) => {
    const interval = (60 / playBpm) * 1000;
    const countNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
    const beatsPerMeasure = parseInt(meter.split('/')[0]);

    for (let i = 0; i < beatsPerMeasure; i++) {
      setCountNumber(i + 1);
      await playSound(`/audio/${countNames[i]}.mp3`);
      await wait(interval);
    }
    setCountNumber(null);

    const duration = 5000;
    const totalBeats = Math.floor(duration / interval);
    for (let i = 0; i < totalBeats; i++) {
      await playSound(`/audio/click.mp3`);
      await wait(interval);
    }
  };

  const startRecording = async (settings) => {
    try {
      const { bpm, meter, slowMode } = settings;
      const playBpm = slowMode ? 50 : bpm;

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

      mediaRecorderRef.current.start();
      setRecording(true);

      await playCountAndClick(playBpm, meter);

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
      <p>🎤 AudioRecorderTile Ready</p>
      {recording && <p className="text-green-400">Recording...</p>}
      {countNumber !== null && (
        <p className="text-4xl font-bold text-yellow-300 animate-pulse mt-2">{countNumber}</p>
      )}
    </div>
  );
});

export default AudioRecorderTile;