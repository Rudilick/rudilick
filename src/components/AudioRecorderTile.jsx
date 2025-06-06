import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AudioRecorderTile = forwardRef((props, ref) => {
  const mediaRecorderRef = useRef(null);
  const settingsRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [countNumber, setCountNumber] = useState(null);
  const [readyText, setReadyText] = useState(null);
  const recordedChunks = useRef([]);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    cancelRecording,
  }));

  const preloadSounds = async (context, beatsPerMeasure, interval) => {
    const countNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
    const buffers = {};

    for (let i = 0; i < beatsPerMeasure; i++) {
      const url = `/audio/${countNames[i]}.wav`;
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      buffers[`count${i}`] = await context.decodeAudioData(arrayBuffer);
    }

    const clickResponse = await fetch('/audio/click.wav');
    const clickBuffer = await clickResponse.arrayBuffer();
    buffers.click = await context.decodeAudioData(clickBuffer);

    return buffers;
  };

  const playCountAndClick = async () => {
    const bpm = settingsRef.current.slowMode ? 50 : settingsRef.current.bpm;
    const meter = settingsRef.current.meter;
    const interval = 60 / bpm;
    const beatsPerMeasure = parseInt(meter.split('/')[0]);
    const hypeMessages = ["Let's groove!", "Let's go!", "Here we go!", "Time to hit!", "Drum on!"];
    const context = new (window.AudioContext || window.webkitAudioContext)();

    // ✅ preload
    const buffers = await preloadSounds(context, beatsPerMeasure, interval);

    // ✅ 메시지 표시
    setReadyText("Are you ready?");
    await new Promise(res => setTimeout(res, 1500));
    setReadyText(hypeMessages[Math.floor(Math.random() * hypeMessages.length)]);
    await new Promise(res => setTimeout(res, 2500));
    setReadyText(null);

    // ✅ 예약 재생 시작
    const now = context.currentTime + 0.1;

    for (let i = 0; i < beatsPerMeasure; i++) {
      const scheduledTime = now + i * interval;
      const source = context.createBufferSource();
      source.buffer = buffers[`count${i}`];
      source.connect(context.destination);
      source.start(scheduledTime);
      setTimeout(() => setCountNumber(i + 1), (scheduledTime - context.currentTime) * 1000);
    }

    const totalBeats = Math.floor(5 / interval);
    for (let i = 0; i < totalBeats; i++) {
      const scheduledTime = now + (beatsPerMeasure + i) * interval;
      const source = context.createBufferSource();
      source.buffer = buffers.click;
      source.connect(context.destination);
      source.start(scheduledTime);
    }

    setTimeout(() => setCountNumber(null), beatsPerMeasure * interval * 1000);
    await new Promise(res =>
      setTimeout(res, (beatsPerMeasure + totalBeats) * interval * 1000)
    );
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
      {readyText && <p className="text-2xl text-blue-400 font-semibold mt-2">{readyText}</p>}
      {countNumber !== null && (
        <p className="text-4xl font-bold text-yellow-300 animate-pulse mt-2">{countNumber}</p>
      )}
    </div>
  );
});

export default AudioRecorderTile;