import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AudioRecorderTile = forwardRef(({ bpm, meter, genre, slowMode, mrType }, ref) => {
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    cancelRecording
  }));

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play();
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

      const interval = 60000 / bpm;
      const countSequence = ['one', 'two', 'three', 'four'];

      countSequence.forEach((label, index) => {
        setTimeout(() => {
          playSound(`/audio/count_audio/${label}.mp3`);
        }, index * interval);
      });

      // 클릭음을 1분간 재생
      const clickRepeats = Math.floor(60000 / interval);
      for (let i = 0; i < clickRepeats; i++) {
        setTimeout(() => {
          playSound('/audio/count_audio/click.mp3');
        }, (countSequence.length + i) * interval);
      }

      // 자동 종료 (녹음 1분)
      setTimeout(() => {
        stopRecording();
      }, (countSequence.length + clickRepeats) * interval);

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
    <div className="p-4 bg-gray-800 rounded-xl shadow-lg text-white mt-4">
      <p>🎤 AudioRecorderTile Ready (BPM: {bpm}, Meter: {meter})</p>
      {recording && <p>Recording...</p>}
    </div>
  );
});

export default AudioRecorderTile;