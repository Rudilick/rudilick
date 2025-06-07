import React, { useRef, useState } from 'react';
import AudioRecorderTile from './AudioRecorderTile';
import SurveyModal from './SurveyModal';

export default function WriteFormSection() {
  const recorderRef = useRef(null);
  const [filename, setFilename] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);

  const [bpm, setBpm] = useState(90);
  const [meter, setMeter] = useState('4/4');
  const [genre, setGenre] = useState('rock');
  const [slowMode, setSlowMode] = useState(false);
  const [mrType, setMrType] = useState('drumless');

  const handleStart = () => {
    const settings = { bpm, meter, genre, slowMode, mrType };
    recorderRef.current.startRecording(settings);
  };

  const handleUploadAndTranscribe = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, "recording.wav");
    try {
      const uploadRes = await fetch("https://rudilick-backend.onrender.com/upload-wav/", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      setFilename(uploadData.filename);

      const transcribeRes = await fetch("https://rudilick-backend.onrender.com/transcribe-beat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uploadData.filename,
          bpm,
          meter,
          genre,
          mrType,
          slowMode
        }),
      });
      const transcribed = await transcribeRes.json();
      setJsonData(transcribed);
      setShowSurvey(true);
    } catch (err) {
      alert("오류 발생: " + err.message);
    }
  };

  return (
    <section className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">PLAY TO WRITE</h2>

      <div className="mb-4">
        <label className="block mb-1">BPM</label>
        <input
          type="number"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Meter</label>
        <select
          value={meter}
          onChange={(e) => setMeter(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        >
          <option value="4/4">4/4</option>
          <option value="3/4">3/4</option>
          <option value="6/8">6/8</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Genre</label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        >
          <option value="rock">Rock</option>
          <option value="jazz">Jazz</option>
          <option value="funk">Funk</option>
          <option value="pop">Pop</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">MR Type</label>
        <select
          value={mrType}
          onChange={(e) => setMrType(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        >
          <option value="drumless">Drumless</option>
          <option value="withdrum">With Drum</option>
        </select>
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          checked={slowMode}
          onChange={(e) => setSlowMode(e.target.checked)}
          className="mr-2"
        />
        <label>Slow Mode</label>
      </div>

      <button
        onClick={handleStart}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
      >
        🎙️ 녹음 시작하기
      </button>

      <AudioRecorderTile ref={recorderRef} onRecordingComplete={handleUploadAndTranscribe} />

      <SurveyModal
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        filename={filename}
        jsonData={jsonData}
      />
    </section>
  );
}