import React, { useState, useRef } from 'react';

function AudioRecorderTile({ label }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const handleRecording = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunks.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
          const formData = new FormData();
          formData.append('file', blob, 'recorded.wav');

          try {
            const res = await fetch('https://rudilick-backend.onrender.com/upload-wav/', {
              method: 'POST',
              body: formData,
            });

            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            alert('악보가 생성되었습니다: ' + data.url);
          } catch (err) {
            alert('업로드 실패: ' + err.message);
          }
        };

        mediaRecorderRef.current.start();
        setRecording(true);

        setTimeout(() => {
          mediaRecorderRef.current.stop();
          setRecording(false);
        }, 5000); // 5초 녹음
      } catch (err) {
        alert('마이크 접근 실패: ' + err.message);
      }
    }
  };

  return (
    <div
      onClick={handleRecording}
      className="bg-orange-700 rounded-xl p-6 text-white font-bold text-center text-lg shadow-md cursor-pointer hover:bg-orange-600"
    >
      {recording ? '녹음 중...' : label}
    </div>
  );
}

export default AudioRecorderTile;