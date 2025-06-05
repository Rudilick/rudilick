import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
const AudioRecorderTile = forwardRef(
({ bpm, meter, genre, mrType, slowMode }, ref) => {
const mediaRecorderRef = useRef(null);
const audioChunksRef = useRef([]);
const [recording, setRecording] = useState(false);
useImperativeHandle(ref, () => ({
  startRecording: () => handleRecord()
}));

const handleRecord = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      // 1단계: 업로드 요청
      const uploadRes = await fetch('https://rudilick.com/upload-wav/', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (uploadData.filename) {
        // 2단계: 전사 요청 (추가 정보 포함)
        const transcribeRes = await fetch('https://rudilick.com/transcribe-beat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: uploadData.filename,
            bpm,
            meter,
            genre,
            mrType,
            slowMode,
          })
        });
        const result = await transcribeRes.json();
        console.log('🎼 전사 결과:', result);
      }
    };

    mediaRecorderRef.current.start();
    setRecording(true);

    setTimeout(() => {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }, 5000);
  } catch (err) {
    alert('❌ 마이크 접근 실패: ' + err.message);
  }
};

return (
  <div className="p-4 bg-gray-800 rounded-xl shadow-lg text-white mt-4">
    <p>🎤 AudioRecorderTile Ready (BPM: {bpm}, Meter: {meter})</p>
    {recording && <p>Recording...</p>}
  </div>
);

}
);
export default AudioRecorderTile;
