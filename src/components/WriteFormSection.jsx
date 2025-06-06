  import React, { useRef, useState } from 'react';
  import AudioRecorderTile from './AudioRecorderTile';
  export default function WriteFormSection() {
    const [bpm, setBpm] = useState(120);
    const [meter, setMeter] = useState("4/4");
    const [genre, setGenre] = useState("");
    const [slowMode, setSlowMode] = useState(false);
    const [mrType, setMrType] = useState("");
    const [recording, setRecording] = useState(false);
    const recorderRef = useRef(null);
    const triggerRecording = () => {
      if (recorderRef.current) {
        const settings = { bpm, meter, genre, mrType, slowMode };
        recorderRef.current.startRecording(settings);
        setRecording(true);
      }
    };
    const stopRecording = () => {
      if (recorderRef.current) {
        recorderRef.current.stopRecording();
        setRecording(false);
      }
    };
    const cancelRecording = () => {
      if (recorderRef.current) {
        recorderRef.current.cancelRecording();
        setRecording(false);
      }
    };
    return (
      <div className="w-full max-w-xl mx-auto mt-12 px-4 py-6 rounded-2xl shadow-lg bg-gray-900 text-white border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-center">Generate Drum Sheet Music</h2>
        {/* BPM */}
        <div className="mb-4">
          <label className="block font-medium mb-1">BPM</label>
          <input
            type="range"
            min="40"
            max="220"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-center mt-1">{bpm}</p>
        </div>
        {/* Meter */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Meter</label>
          <select
            value={meter}
            onChange={(e) => setMeter(e.target.value)}
            className="w-full text-black px-3 py-2 rounded"
          >
            {["4/4", "3/4", "6/8", "12/8", "5/4", "7/8"].map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        {/* Genre */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full text-black px-3 py-2 rounded"
          >
            <option value="">select jenre</option>
            {[
              "Rock", "Pop", "Funk", "Jazz", "Blues", "Hip-Hop", "R&B", "Soul", "Gospel",
              "EDM", "House", "Techno", "Afrobeat", "Reggae", "Samba", "Bossa Nova", "Latin",
              "Metal", "Punk", "Ballad", "K-Pop", "Trap", "Drum & Bass"
            ].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        {/* Slow Mode */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={slowMode}
              onChange={(e) => setSlowMode(e.target.checked)}
              className="mr-2"
            />
            Slow down for recording
          </label>
        </div>
        {/* MR Type */}
        <div className="mb-4">
          <label className="block font-medium mb-1">MR Type</label>
          {["Metronome", "Auto-Generated Backing Track", "Upload Custom MR"].map(type => (
            <label key={type} className="block">
              <input
                type="radio"
                name="mrType"
                value={type}
                checked={mrType === type}
                onChange={(e) => setMrType(e.target.value)}
                className="mr-2"
              />
              {type}
            </label>
          ))}
        </div>
        {/* Buttons */}
        {!recording ? (
          <div className="mt-6">
            <button
              onClick={triggerRecording}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold"
            >
              PLAY TO WRITE
            </button>
          </div>
        ) : (
          <div className="flex gap-4 mt-6">
            <button
              onClick={stopRecording}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold"
            >
              FINISH
            </button>
            <button
              onClick={cancelRecording}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-xl font-semibold"
            >
              CANCEL
            </button>
          </div>
        )}
        {/* 녹음기 연결 */}
        <AudioRecorderTile ref={recorderRef} />
      </div>
    );
  }