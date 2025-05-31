import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 bg-gray-900 text-white">
      {/* ❌ 상단 header 제거됨 */}

      <main className="w-full max-w-md text-center">
        <h2 className="text-xl font-semibold mb-2">Make. Play. Share.</h2>
        <p className="text-gray-400 mb-6">
          Create your own drum licks and share them with the world.
        </p>

        <button
          onClick={() => navigate("/write")}
          className="w-full py-3 mb-10 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl"
        >
          PLAY TO WRITE
        </button>

        <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-300 border border-gray-600 rounded-xl">
          광고 구함
        </div>
      </main>
    </div>
  );
}