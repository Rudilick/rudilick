import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Home, Search, BookOpen, User, PenLine } from "lucide-react";
import logo from "./assets/rudiilick_logo.png";
import HomeScreen from "./components/HomeScreen";
import WriteFormSection from "./components/WriteFormSection_PLAY_TO_WRITE";
import LibrarySection from "./components/LibrarySection";
import AccountSection from "./components/AccountSection_shared_tracking";

const isKorean = navigator.language.startsWith("ko");
const text = {
  home: isKorean ? "홈" : "Home",
  explore: isKorean ? "탐색" : "Explore",
  library: isKorean ? "라이브러리" : "Library",
  mypage: isKorean ? "마이페이지" : "My Page",
  write: isKorean ? "작성" : "Write",
  upload: isKorean ? "릭 업로드" : "Upload Lick",
  tags: ["Rudiments", "Jazz", "Syncopat"],
  trending: ["Paradiddle groove", "Backbeat fill"],
  licks: ["Half-time shuffle", "Double stroke roll"],
  account: isKorean ? "계정 정보" : "Account Info",
  payment: isKorean ? "결제 내역" : "Purchases",
  level: isKorean ? "등급" : "My level",
  points: isKorean ? "포인트" : "Points",
  alert: isKorean ? "아직 준비중입니다" : "Coming soon...",
};

function App() {
  console.log("Force update at " + new Date());  // ✅ Git이 감지할 강제 변경

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
        <h1 className="text-center text-sm text-gray-500">
          🎯 이건 변경 감지를 위한 테스트 메시지입니다.
        </h1>
        <Header />
        <div className="flex-grow overflow-auto pt-[72px] pb-[72px] px-4">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/write" element={<WriteFormSection />} />
            <Route path="/library" element={<LibrarySection />} />
            <Route path="/mypage" element={<AccountSection />} />
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
      <img
        src={logo}
        alt="RudiiLick Logo"
        className="h-auto w-auto max-h-16 object-contain"
      />
    </div>
  );
}

function TabBar() {
  const location = useLocation();
  const active = (path) =>
    location.pathname === path ? "text-blue-400" : "text-white";
  return (
    <div className="fixed bottom-0 inset-x-0 z-10 flex justify-around py-3 border-t border-gray-700 bg-gray-800">
      <Link to="/" className={`flex flex-col items-center ${active("/")}`}>
        <Home size={20} />
        <span className="text-xs mt-1">{text.home}</span>
      </Link>
      <Link
        to="/write"
        className={`flex flex-col items-center ${active("/write")}`}
      >
        <PenLine size={20} />
        <span className="text-xs mt-1">{text.write}</span>
      </Link>
      <Link
        to="/library"
        className={`flex flex-col items-center ${active("/library")}`}
      >
        <BookOpen size={20} />
        <span className="text-xs mt-1">{text.library}</span>
      </Link>
      <Link
        to="/mypage"
        className={`flex flex-col items-center ${active("/mypage")}`}
      >
        <User size={20} />
        <span className="text-xs mt-1">{text.mypage}</span>
      </Link>
    </div>
  );
}

export default App;