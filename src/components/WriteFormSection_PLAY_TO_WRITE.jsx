import React, { useState } from 'react';

export default function WriteFormSection() {
  const [bpm, setBpm] = useState(120);
  const [meter, setMeter] = useState("4/4");
  const [genre, setGenre] = useState("");
  const [slowMode, setSlowMode] = useState(false);
  const [mrType, setMrType] = useState("");

  const handleRecord = () => {
    alert("Recording with settings:\n" +
      "BPM: " + bpm + "\n" +
      "Meter: " + meter + "\n" +
      "Genre: " + genre + "\n" +
      "Slow mode: " + slowMode + "\n" +
      "MR type: " + mrType
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-12 px-4 py-6 rounded-2xl shadow-lg bg-gray-900 text-white border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center">Generate Drum Sheet Music</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">BPM</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="40"
            max="220"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="flex-grow"
          />
          <span className="w-12 text-center font-mono">{bpm}</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Time Signature</label>
        <select
          value={meter}
          onChange={(e) => setMeter(e.target.value)}
          className="w-full border rounded px-3 py-2 text-black"
        >
          <option>4/4</option>
          <option>3/4</option>
          <option>6/8</option>
          <option>12/8</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Genre</label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full border rounded px-3 py-2 text-black"
        >
          <option value="">Select genre</option>
          <option value="rock">Rock</option>
          <option value="jazz">Jazz</option>
          <option value="funk">Funk</option>
          <option value="hiphop">Hip Hop</option>
          <option value="ballad">Ballad</option>
        </select>
      </div>

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

      <div className="mb-6">
        <label className="block font-medium mb-2">MR Type</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="mrType"
              value="metronome"
              checked={mrType === "metronome"}
              onChange={(e) => setMrType(e.target.value)}
              className="mr-2"
            />
            Metronome
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="mrType"
              value="backing"
              checked={mrType === "backing"}
              onChange={(e) => setMrType(e.target.value)}
              className="mr-2"
            />
            Backing track
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="mrType"
              value="upload"
              checked={mrType === "upload"}
              onChange={(e) => setMrType(e.target.value)}
              className="mr-2"
            />
            Audio upload
          </label>
        </div>
      </div>

      <button
        onClick={handleRecord}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold"
      >
        PLAY TO WRITE
      </button>
    </div>
  );
}