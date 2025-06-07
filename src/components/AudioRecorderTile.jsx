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

  const playBufferedSound = async (context, url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start();
    return new Promise((resolve) => {
      source.onended = resolve;
    });
  };

  const playCountAndClick = async () => {
    const bpm = settingsRef.current.slowMode ? 50 : settingsRef.current.bpm;
    const meter = settingsRef.current.meter;
    const interval = (60 / bpm); // seconds
    const beatsPerMeasure = parseInt(meter.split('/')[0]);
    const countNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const now = context.currentTime;

    console.log("🎯 BPM:", bpm, "Interval:", (interval * 1000).toFixed(2) + "ms");

    // 카운트 보이스 재생
    for (let i = 0; i < beatsPerMeasure; i++) {
      const name = countNames[i];
      const scheduledTime = now + i * interval;
      setTimeout(() => setCountNumber(i + 1), (scheduledTime - context.currentTime) * 1000);
      playBufferedSound(context, `/audio/${name}.wav`, scheduledTime);
    }

    // 클릭 재생
    const totalBeats = Math.floor(5 / interval); // 5초 동안
    for (let i = 0; i < totalBeats; i++) {
      const scheduledTime = now + (beatsPerMeasure + i) * interval;
      playBufferedSound(context, `/audio/click.wav`, scheduledTime);
    }

    // 숫자표시 초기화
    setTimeout(() => setCountNumber(null), (beatsPerMeasure * interval * 1000));
    await new Promise((res) => setTimeout(res, (beatsPerMeasure + totalBeats) * interval * 1000));
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