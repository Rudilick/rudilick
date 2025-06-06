import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AudioRecorderTile = forwardRef((props, ref) => {
  const mediaRecorderRef = useRef(null);
  const settingsRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [countNumber, setCountNumber] = useState(null);
  const [readyText, setReadyText] = useState(null);
  const recordedChunks = useRef([]);
  const clickIntervalIds = useRef([]);
  const audioContextRef = useRef(null);
  const recordingTimeoutRef = useRef(null);

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
    audioContextRef.current = context;

    const now = context.currentTime + 2.5; // 2.5초 여유 확보
    setReadyText("Are you ready?");
    setTimeout(() => {
      setReadyText(hypeMessages[Math.floor(Math.random() * hypeMessages.length)]);
    }, 1000);
    setTimeout(() => setReadyText(null), 3000);

    for (let i = 0; i < beatsPerMeasure; i++) {
      const name = countNames[i];
      const scheduledTime = now + i * interval;
      setTimeout(() => setCountNumber(i + 1), (scheduledTime - context.currentTime) * 1000);
      playBufferedSound(context, `/audio/${name}.wav`, scheduledTime);
    }

    const totalBeats = Math.floor(60 / interval);
    for (let i = 0; i < totalBeats; i++) {
      const scheduledTime = now + (beatsPerMeasure + i) * interval;
      playBufferedSound(context, `/audio/click.wav`, scheduledTime);
    }

    setTimeout(() => setCountNumber(null), beatsPerMeasure * interval * 1000);
  };

  const startRecording = async (settings) => {
    if (recording) return;
    settingsRef.current = settings;
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
        sendToServer(blob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      await playCountAndClick();

      // 60초 뒤 자동 종료
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 60000);
    } catch (err) {
      alert("❌ 마이크 접근 실패: " + err.message);
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    clearTimeout(recordingTimeoutRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setRecording(false);
  };

  const cancelRecording = () => {
    if (!recording) return;
    clearTimeout(recordingTimeoutRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    recordedChunks.current = [];
    setRecording(false);
    console.log("⛔ 녹음 취소, 전송 안함");
  };

  const sendToServer = (blob) => {
    const file = new File([blob], 'recorded.wav', { type: 'audio/webm' });
    const formData = new FormData();
    formData.append("file", file);

    fetch("/upload-wav/", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        const filename = data.filename;
        return fetch("/transcribe-beat/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        });
      })
      .then(res => res.json())
      .then(data => {
        console.log("✅ 전사 결과:", data);
        // props.onResult(data); // 필요시 결과 전달
      })
      .catch(err => {
        console.error("❌ 전송 오류:", err);
      });
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