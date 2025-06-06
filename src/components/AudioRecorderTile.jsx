import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AudioRecorderTile = forwardRef((props, ref) => {
  const mediaRecorderRef = useRef(null);
  const settingsRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [countNumber, setCountNumber] = useState(null);
  const recordedChunks = useRef([]);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    cancelRecording,
  }));

  const playSound = (src) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play();
    });
  };

  const playCountAndClick = async () => {
    const bpm = settingsRef.current.slowMode ? 50 : settingsRef.current.bpm;
    const meter = settingsRef.current.meter;
    const interval = (60 / bpm) * 1000;
    const beatsPerMeasure = parseInt(meter.split('/')[0]);
    const countNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];

    console.log("🎯 BPM:", bpm, "Interval:", interval.toFixed(2) + "ms");

    for (let i = 0; i < beatsPerMeasure; i++) {
      setCountNumber(i + 1);
      await playSound('/audio/' + countNames[i] + '.wav');
    }
    setCountNumber(null);

    const duration = 5000;
    const totalBeats = Math.floor(duration / interval);
    for (let i = 0; i < totalBeats; i++) {
      await playSound('/audio/click.wav');
    }
  };

  const startRecording = async (settings) => {
    try {
      settingsRef.current = settings;
      await Promise.resolve();

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

      await playCountAndClick();

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