import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 bg-gray-900 text-white">
      <header className="w-full flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">RUDILICK</h1>
        <button
          className="text-sm text-gray-300 underline"
          onClick={() => navigate("/mypage")}
        >
          Account
        </button>
      </header>

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