// 메인 App 컴포넌트 - 인증, 라우팅, 네비게이션 관리
// 기존 demo 전용에서 회원가입 지원 및 사용자별 개인화 기능으로 확장
import { Avatar, Dropdown, Modal, Navbar } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { clearRumUser, setRumUser } from './lib/rum';
import Chat from './pages/Chat.jsx';
import Customize from './pages/Customize.jsx';
import Game from './pages/Game.jsx';
import Login from './pages/Login.jsx';
import Ranking from './pages/Ranking.jsx';
import Signup from './pages/Signup.jsx'; // 회원가입 기능 추가

export default function App() {
  // 인증 상태 관리
  const [authed, setAuthed] = useState(false);

  // 로그인/회원가입 화면 전환 관리 - 새로운 사용자 가입 지원
  const [showSignup, setShowSignup] = useState(false);

  // 현재 로그인한 사용자 정보 - 네비게이션 바 및 채팅에서 표시
  const [currentUser, setCurrentUser] = useState('');

  // 🏆 업적 모달 상태
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState({
    bestScore: 0,
    playCount: 0,
    totalScore: 0
  });
  const [loadingAchievements, setLoadingAchievements] = useState(false);

  // 🏆 업적 조회 함수
  const fetchAchievements = async () => {
    setLoadingAchievements(true);
    try {
      const response = await fetch('/api/customization', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.achievements) {
          setAchievements(data.achievements);
        }
      }
    } catch (e) {
      console.error('업적 조회 실패:', e);
    } finally {
      setLoadingAchievements(false);
    }
  };

  // 업적 모달 열기
  const openAchievements = () => {
    fetchAchievements();
    setShowAchievements(true);
  };

  // 앱 초기화 시 세션 확인 - 새로고침해도 로그인 상태 유지
  useEffect(() => {
    fetch('/api/session/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setAuthed(true);
        // 기존: 고정된 사용자 정보 → 현재: 실제 로그인한 사용자 ID 표시
        setCurrentUser(data.user_id || '사용자');
        // 🔐 앱 초기화 시 RUM에 사용자 정보 설정
        setRumUser(data);
      })
      .catch(() => {
        setAuthed(false);
        setCurrentUser('');
        // 🧹 세션 없을 시 RUM 사용자 정보 초기화
        clearRumUser();
      });
  }, []);

  // 로그아웃 핸들러 - 프론트엔드 상태 리셋으로 UX 개선
  // 기존: API 호출 후 리다이렉트 → 현재: 즉시 로그인 화면으로 이동
  const handleLogout = () => {
    setAuthed(false);
    setCurrentUser('');
    setShowSignup(false); // 로그인 화면으로 리셋
    // 🧹 로그아웃 시 RUM 사용자 정보 초기화
    clearRumUser();
  };

  // 로그인/회원가입 성공 후 처리 - 사용자 정보 갱신
  // 로그인과 회원가입(자동 로그인) 모두에서 공통으로 사용
  const handleLoginSuccess = () => {
    fetch('/api/session/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setAuthed(true);
        setCurrentUser(data.user_id || '사용자');
        // 🔐 로그인 성공 시 RUM에 사용자 정보 설정
        setRumUser(data);
      })
      .catch(() => {
        setAuthed(false);
        setCurrentUser('');
        // 🧹 로그인 실패 시 RUM 사용자 정보 초기화
        clearRumUser();
      });
  };

  // 인증 화면 컴포넌트 - 로그인/회원가입 조건부 렌더링
  // 기존: 고정된 Login 컴포넌트 → 현재: 동적 Login/Signup 전환
  const AuthPage = () => {
    if (showSignup) {
      return (
        <Signup
          onLogin={handleLoginSuccess}                    // 회원가입 후 자동 로그인
          onSwitchToLogin={() => setShowSignup(false)}   // "로그인" 버튼 클릭 시
        />
      );
    } else {
      return (
        <Login
          onLogin={handleLoginSuccess}                    // 로그인 성공 시
          onSwitchToSignup={() => setShowSignup(true)}   // "회원가입" 버튼 클릭 시
        />
      );
    }
  };

  return (
    <BrowserRouter>
      <Navbar fluid rounded className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <Navbar.Brand as={Link} to="/">
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white flex items-center gap-2">
            🐶 Datadog Runner
          </span>
        </Navbar.Brand>
        {authed && (
          <>
            {/* 사용자 정보 및 로그아웃 드롭다운 - 개인화된 네비게이션 제공 */}
            <div className="flex md:order-2">
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  // 아바타 개선: 기존 고정 이미지 → 사용자 ID 첫 글자 기반 이니셜 표시
                  <Avatar
                    alt="User settings"
                    placeholderInitials={currentUser?.charAt(0)?.toUpperCase() || '?'}
                    rounded
                    className="ring-2 ring-white"
                    data-dd-action-name="사용자 아바타 클릭"
                  />
                }
              >
                {/* 사용자 정보 표시: 기존 "user@example.com" → 실제 로그인 사용자 ID */}
                <Dropdown.Header>
                  <span className="block text-sm">플레이어</span>
                  <span className="block truncate text-sm font-medium">{currentUser || '사용자'}</span>
                </Dropdown.Header>
                {/* 🏆 업적 보기 */}
                <Dropdown.Item
                  onClick={openAchievements}
                  className="cursor-pointer"
                >
                  🏆 업적 보기
                </Dropdown.Item>
                <Dropdown.Divider />
                {/* 로그아웃: 기존 API 호출 방식 → 즉시 상태 리셋으로 UX 개선 */}
                <Dropdown.Item onClick={handleLogout} className="text-red-600 hover:bg-red-50 cursor-pointer">
                  로그아웃
                </Dropdown.Item>
              </Dropdown>
              <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
              <Navbar.Link as={Link} to="/game" className="text-white hover:text-purple-200 text-base font-medium">
                🎮 게임 하기
              </Navbar.Link>
              <Navbar.Link as={Link} to="/ranking" className="text-white hover:text-purple-200 text-base font-medium">
                🏆 랭킹 보기
              </Navbar.Link>
              <Navbar.Link as={Link} to="/chat" className="text-white hover:text-purple-200 text-base font-medium">
                💬 채팅
              </Navbar.Link>
              <Navbar.Link as={Link} to="/customize" className="text-white hover:text-purple-200 text-base font-medium">
                🎨 꾸미기
              </Navbar.Link>
            </Navbar.Collapse>
          </>
        )}
      </Navbar>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="mx-auto max-w-7xl">
          <Routes>
            <Route path="/" element={authed ? <Navigate to="/game" /> : <AuthPage />} />
            <Route path="/game" element={authed ? <Game /> : <Navigate to="/" />} />
            <Route path="/ranking" element={authed ? <Ranking /> : <Navigate to="/" />} />
            <Route path="/chat" element={authed ? <Chat /> : <Navigate to="/" />} />
            <Route path="/customize" element={authed ? <Customize /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </main>

      <footer className="bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 py-4 text-center text-sm">
        <div className="mx-auto max-w-7xl px-6">
          <p>
            © 2025 Datadog Runners. All rights reserved. {' '}
            <a
              href="https://bit.ly/DD-FE-FEEDBACK"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              feedback
            </a>
          </p>
        </div>
      </footer>

      {/* 🏆 업적 모달 - 배경 반투명 */}
      <Modal
        show={showAchievements}
        onClose={() => setShowAchievements(false)}
        size="md"
        theme={{
          root: {
            base: "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
            show: {
              on: "flex bg-gray-900/30 backdrop-blur-sm",
              off: "hidden"
            }
          }
        }}
      >
        <Modal.Header>🏆 나의 업적</Modal.Header>
        <Modal.Body>
          {loadingAchievements ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 플레이어 정보 */}
              <div className="text-center pb-4 border-b">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white text-2xl font-bold mb-2">
                  {currentUser?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <p className="text-lg font-semibold text-gray-700">{currentUser}</p>
              </div>

              {/* 업적 카드들 */}
              <div className="grid grid-cols-1 gap-4">
                {/* 최고 점수 */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🥇</span>
                      <div>
                        <p className="text-sm text-gray-500">최고 점수</p>
                        <p className="text-2xl font-bold text-yellow-600">{achievements.bestScore.toLocaleString()}점</p>
                      </div>
                    </div>
                    {achievements.bestScore >= 500 && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">🎩 모자 해금!</span>
                    )}
                  </div>
                </div>

                {/* 누적 플레이 횟수 */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🎮</span>
                      <div>
                        <p className="text-sm text-gray-500">누적 플레이 횟수</p>
                        <p className="text-2xl font-bold text-blue-600">{achievements.playCount.toLocaleString()}회</p>
                      </div>
                    </div>
                    {achievements.playCount >= 10 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">🎨 색상 해금!</span>
                    )}
                  </div>
                </div>

                {/* 누적 점수 */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⭐</span>
                    <div>
                      <p className="text-sm text-gray-500">누적 점수</p>
                      <p className="text-2xl font-bold text-purple-600">{achievements.totalScore.toLocaleString()}점</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </Modal.Body>
      </Modal>
    </BrowserRouter>
  );
}
