import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Home, Search, BookOpen, User } from 'lucide-react';
import logo from './assets/rudiilick_logo.png';
import AudioRecorderTile from './components/AudioRecorderTile';

const isKorean = navigator.language.startsWith('ko');
const text = {
  home: isKorean ? '홈' : 'Home',
  explore: isKorean ? '탐색' : 'Explore',
  library: isKorean ? '라이브러리' : 'Library',
  mypage: isKorean ? '마이페이지' : 'My Page',
  upload: isKorean ? '릭 업로드' : 'Upload Lick',
  tags: ['Rudiments', 'Jazz', 'Syncopat'],
  trending: ['Paradiddle groove', 'Backbeat fill'],
  licks: ['Half-time shuffle', 'Double stroe roll'],
  account: isKorean ? '계정 정보' : 'Account Info',
  payment: isKorean ? '결제 내역' : 'Purchases',
  level: isKorean ? '등급' : 'My level',
  points: isKorean ? '포인트' : 'Points',
  alert: isKorean ? '아직 준비중입니다' : 'Coming soon...'
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
        <Header />
        <div className="flex-grow overflow-auto pt-[70px] pb-[70px] px-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/library" element={<Library />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </div>
        <TabBar />
      </div>
    </Router>
  );
}

function Header() {
  return (
    <div className="w-full fixed top-0 inset-x-0 z-10 py-3 flex justify-center items-center border-b border-gray-800 bg-gray-900">
      <img src={logo} alt="RudiiLick Logo" className="w-auto h-12 md:h-16 max-w-[240px] sm:max-w-[280px] md:max-w-[320px]" />
    </div>
  );
}

function TabBar() {
  const location = useLocation();
  const active = (path) => location.pathname === path ? "text-blue-400" : "text-white";
  return (
    <div className="fixed bottom-0 inset-x-0 z-10 flex justify-around py-3 border-t border-gray-700 bg-gray-800">
      <Link to="/" className={`flex flex-col items-center ${active("/")}`}>
        <Home size={20} />
        <span className="text-xs mt-1">{text.home}</span>
      </Link>
      <Link to="/explore" className={`flex flex-col items-center ${active("/explore")}`}>
        <Search size={20} />
        <span className="text-xs mt-1">{text.explore}</span>
      </Link>
      <Link to="/library" className={`flex flex-col items-center ${active("/library")}`}>
        <BookOpen size={20} />
        <span className="text-xs mt-1">{text.library}</span>
      </Link>
      <Link to="/mypage" className={`flex flex-col items-center ${active("/mypage")}`}>
        <User size={20} />
        <span className="text-xs mt-1">{text.mypage}</span>
      </Link>
    </div>
  );
}

function HomePage() {
  return (
    <div className="space-y-6">
      <AudioRecorderTile label="Click to record and generate sheet" />
      <div className="grid grid-cols-2 gap-4">
        <Tile label="Fonk groove" />
        <Tile label="Swing lick" />
      </div>
      <Tile label={text.upload} fullWidth />
    </div>
  );
}

function Explore() {
  return (
    <div className="space-y-6">
      <input type="text" placeholder="Search" className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600" />
      <div className="flex flex-wrap gap-2">
        {text.tags.map(tag => (
          <span key={tag} className="px-3 py-1 rounded-full bg-gray-700 text-sm">{tag}</span>
        ))}
      </div>
      <div className="space-y-4">
        {text.trending.map(item => (
          <Tile key={item} label={item} />
        ))}
      </div>
    </div>
  );
}

function Library() {
  return (
    <div className="space-y-6">
      <input type="text" placeholder="Search licks" className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600" />
      <div className="flex gap-2">
        <button className="flex-1 py-2 rounded bg-gray-700">All Licks</button>
        <button className="flex-1 py-2 rounded bg-gray-800 border border-gray-600">Favorites</button>
      </div>
      <div className="space-y-4">
        {text.licks.map(item => (
          <Tile key={item} label={item} />
        ))}
      </div>
    </div>
  );
}

function MyPage() {
  return (
    <div className="space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-gray-700"></div>
      <Tile label={text.account} fullWidth />
      <Tile label={text.payment} fullWidth />
      <Tile label={text.level} fullWidth />
      <Tile label={text.points} fullWidth />
    </div>
  );
}

function Tile({ label, fullWidth = false }) {
  const handleClick = () => alert(text.alert);
  return (
    <div
      onClick={handleClick}
      className={`rounded-xl p-4 text-white font-medium hover:bg-gray-700 cursor-pointer shadow-md bg-gray-800 ${fullWidth ? 'w-full' : ''}`}
    >
      <div className="w-full h-20 bg-gray-600 rounded mb-3"></div>
      <div className="text-center">{label}</div>
    </div>
  );
}

export default App;