import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
const AudioRecorderTile = forwardRef((props, ref) => {
  const mediaRecorderRef = useRef(null);
  const settingsRef = useRef(null);
  const clickSourcesRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [countNumber, setCountNumber] = useState(null);
  const [readyText, setReadyText] = useState(null);
  const recordedChunks = useRef([]);
  const timeoutRef = useRef(null);
  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    cancelRecording,
  }));
  const playBufferedSound = async (context, url, scheduledTime) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start(scheduledTime);
    clickSourcesRef.current.push(source);
    return new Promise((resolve) => {
      source.onended = resolve;
    });
  };
  const playCountAndClick = async () => {
    const bpm = settingsRef.current.slowMode ? 50 : settingsRef.current.bpm;
    const meter = settingsRef.current.meter;
    const interval = 60 / bpm;
    const beatsPerMeasure = parseInt(meter.split('/')[0]);
    const countNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
    const hypeMessages = ["Let's groove!", "Let's go!", "Here we go!", "Time to hit!", "Drum on!"];
    const context = new (window.AudioContext || window.webkitAudioContext)();
    // 메시지 표시
    setReadyText("Are you ready?");
    setTimeout(() => {
      setReadyText(hypeMessages[Math.floor(Math.random() * hypeMessages.length)]);
    }, 1000);
    setTimeout(() => setReadyText(null), 3000);
    // 메시지 끝 + interval 여유 후 시작
    const now = context.currentTime + 2.5 + interval;
    // 카운트 보이스
    for (let i = 0; i < beatsPerMeasure; i++) {
      const name = countNames[i];
      const scheduledTime = now + i * interval;
      setTimeout(() => {
        setCountNumber(i + 1);
        if (i === beatsPerMeasure - 1) {
          setTimeout(() => setCountNumber(null), interval * 1000 * 0.8);
        }
      }, (scheduledTime - context.currentTime) * 1000);
      playBufferedSound(context, `/audio/${name}.wav`, scheduledTime);
    }
    // 클릭음 (첫 박만 high)
    const totalBeats = Math.floor(60 / interval);
    for (let i = 0; i < totalBeats; i++) {
      const scheduledTime = now + (beatsPerMeasure + i) * interval;
      const isFirstBeat = i % beatsPerMeasure === 0;
      const clickUrl = isFirstBeat ? '/audio/click_high.wav' : '/audio/click.wav';
      playBufferedSound(context, clickUrl, scheduledTime);
    }
    await new Promise((res) =>
      setTimeout(res, (beatsPerMeasure + totalBeats + 1) * interval * 1000)
    );
  };
  const startRecording = async (settings) => {
    if (recording) return;
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
        // 이후 전사 요청 등 수행
      };
      mediaRecorderRef.current.start();
      setRecording(true);
      await playCountAndClick();
      timeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 60000);
    } catch (err) {
      alert("❌ 마이크 가접 실패: " + err.message);
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setCountNumber(null);
      setReadyText(null);
      clearTimeout(timeoutRef.current);
      clickSourcesRef.current.forEach((source) => source.stop());
      clickSourcesRef.current = [];
    }
  };
  const cancelRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setCountNumber(null);
      setReadyText(null);
      clearTimeout(timeoutRef.current);
      clickSourcesRef.current.forEach((source) => source.stop());
      clickSourcesRef.current = [];
    }
  };
  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-lg text-white mt-4 text-center h-28 flex items-center justify-center">
      {readyText && (
        <p className="text-4xl font-bold text-blue-400 animate-pulse">{readyText}</p>
      )}
      {countNumber !== null && readyText === null && (
        <p className="text-4xl font-bold text-yellow-300 animate-pulse">{countNumber}</p>
      )}
      {recording && readyText === null && countNumber === null && (
        <p className="text-4xl font-bold text-green-400 animate-pulse">Now Recording...</p>
      )}
    </div>
  );
});
export default AudioRecorderTile;