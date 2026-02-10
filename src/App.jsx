// 메인 App 컴포넌트 - 인증, 라우팅, 네비게이션 관리
// 기존 demo 전용에서 회원가입 지원 및 사용자별 개인화 기능으로 확장
import { Avatar, Dropdown, Modal, Navbar } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { clearRumUser, setRumUser, setRumUserProfile } from './lib/rum';
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

  // 📋 프로필 모달 상태
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    gender: '',
    ageGroup: '',
    region: '',
    gameLove: '',
    datadogExp: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // 프로필 옵션
  const PROFILE_OPTIONS = {
    gender: { label: '성별', options: [{ value: 'male', label: '남' }, { value: 'female', label: '여' }, { value: 'other', label: '그외' }] },
    ageGroup: { label: '나이대', options: [{ value: 'under10', label: '10대 이하' }, { value: '20s', label: '20대' }, { value: '30s', label: '30대' }, { value: '40s', label: '40대' }, { value: '50s', label: '50대' }, { value: 'over60', label: '60대 이상' }] },
    region: { label: '지역', options: [{ value: 'seoul_gangnam', label: '서울(강남)' }, { value: 'seoul_gangbuk', label: '서울(강북)' }, { value: 'gyeonggi_south', label: '경기(남부)' }, { value: 'gyeonggi_north', label: '경기(북부)' }, { value: 'other_region', label: '그 외' }] },
    gameLove: { label: '평소 게임을 좋아하시나요?', options: [{ value: 'love', label: '매우 좋아함' }, { value: 'like', label: '좋아함' }, { value: 'neutral', label: '보통' }, { value: 'dislike', label: '별로' }] },
    datadogExp: { label: 'Datadog 경험', options: [{ value: 'none', label: '처음 들어봄' }, { value: 'beginner', label: '입문' }, { value: 'intermediate', label: '중급' }, { value: 'advanced', label: '고급' }] },
  };

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

  // 📋 프로필 조회 함수
  const fetchProfile = async () => {
    setLoadingProfile(true);
    // 먼저 초기값으로 리셋 (이전 계정 데이터 제거)
    const initialProfile = { gender: '', ageGroup: '', region: '', gameLove: '', datadogExp: '' };
    setProfileData(initialProfile);
    try {
      const response = await fetch('/api/profile', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const mergedProfile = { ...initialProfile, ...data };
        setProfileData(mergedProfile);
        // 🎯 RUM Global Context에 프로필 설정
        setRumUserProfile(mergedProfile);
      }
    } catch (e) {
      console.error('프로필 조회 실패:', e);
    } finally {
      setLoadingProfile(false);
    }
  };

  // 📋 프로필 저장 함수
  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      if (response.ok) {
        setProfileMessage('✅ 저장되었습니다!');
        // 🎯 RUM Global Context에 프로필 업데이트
        setRumUserProfile(profileData);
        setTimeout(() => setProfileMessage(''), 3000);
      } else {
        setProfileMessage('❌ 저장 실패');
      }
    } catch (e) {
      console.error('프로필 저장 실패:', e);
      setProfileMessage('❌ 저장 실패');
    } finally {
      setSavingProfile(false);
    }
  };

  // 프로필 변경 핸들러
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // 업적 모달 열기
  const openAchievements = () => {
    fetchAchievements();
    setShowAchievements(true);
  };

  // 프로필 모달 열기
  const openProfileInfo = () => {
    fetchProfile();
    setShowProfile(true);
  };

  // 📋 프로필을 RUM Global Context에 설정하는 함수 (로그인 시 호출)
  const loadProfileForRum = async () => {
    try {
      const response = await fetch('/api/profile', { credentials: 'include' });
      if (response.ok) {
        const profile = await response.json();
        setRumUserProfile(profile);
        console.log('📋 로그인 시 RUM 프로필 설정 완료:', profile);
      }
    } catch (e) {
      console.warn('프로필 RUM 설정 실패:', e);
    }
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
        // 📋 프로필 정보도 RUM Global Context에 설정
        loadProfileForRum();
      })
      .catch(() => {
        setAuthed(false);
        setCurrentUser('');
        // 🧹 세션 없을 시 RUM 사용자 정보 초기화
        clearRumUser();
      });
  }, []);

  // 로그아웃 핸들러 - 서버 세션 삭제 후 프론트엔드 상태 리셋
  const handleLogout = () => {
    // 🔐 서버 세션 쿠키 삭제 (Redis 세션도 삭제됨)
    fetch('/api/auth/logout', { credentials: 'include' })
      .finally(() => {
        setAuthed(false);
        setCurrentUser('');
        setShowSignup(false); // 로그인 화면으로 리셋
        // 🧹 로그아웃 시 RUM 사용자 정보 초기화
        clearRumUser();
        // 🧹 로그아웃 시 localStorage 캐시 클리어 (다른 계정 데이터 혼동 방지)
        localStorage.removeItem('dogCustomization');
      });
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
        // 📋 프로필 정보도 RUM Global Context에 설정
        loadProfileForRum();
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
                  <span className="block truncate text-sm font-medium">{currentUser || '사용자'}</span>
                </Dropdown.Header>
                {/* 프로필 보기 */}
                <Dropdown.Item
                  onClick={openProfileInfo}
                  className="cursor-pointer"
                >
                  내 프로필
                </Dropdown.Item>
                {/* 🏆 업적 보기 */}
                <Dropdown.Item
                  onClick={openAchievements}
                  className="cursor-pointer"
                >
                  업적 보기
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
                게임 하기
              </Navbar.Link>
              <Navbar.Link as={Link} to="/ranking" className="text-white hover:text-purple-200 text-base font-medium">
                랭킹 보기
              </Navbar.Link>
              <Navbar.Link as={Link} to="/chat" className="text-white hover:text-purple-200 text-base font-medium">
                채팅
              </Navbar.Link>
              <Navbar.Link as={Link} to="/customize" className="text-white hover:text-purple-200 text-base font-medium">
                꾸미기
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
            © 2025 Datadog Runner. All rights reserved. {' '}
            <a
              href="https://forms.gle/WdRTZYG7QnHR2WNCA"
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
              on: "flex bg-gray-900/50 backdrop-blur-sm",
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

      {/* 📋 프로필 모달 */}
      <Modal
        show={showProfile}
        onClose={() => setShowProfile(false)}
        size="lg"
        theme={{
          root: {
            base: "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
            show: {
              on: "flex bg-gray-900/50 backdrop-blur-sm",
              off: "hidden"
            }
          }
        }}
      >
        <Modal.Header>📋 내 프로필</Modal.Header>
        <Modal.Body>
          {loadingProfile ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 플레이어 정보 */}
              <div className="text-center pb-4 border-b">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white text-xl font-bold mb-1">
                  {currentUser?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <p className="text-base font-semibold text-gray-700">{currentUser}</p>

                {/* 프로필 완성도 */}
                {(() => {
                  const completedCount = Object.keys(PROFILE_OPTIONS).filter(key => profileData[key]).length;
                  const totalCount = Object.keys(PROFILE_OPTIONS).length;
                  const percent = Math.round((completedCount / totalCount) * 100);
                  return (
                    <div className="mt-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">프로필 완성도</span>
                        <span className="text-xs font-bold text-purple-600">{percent}%</span>
                      </div>
                      <div className="w-32 mx-auto bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 프로필 옵션들 */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {Object.entries(PROFILE_OPTIONS).map(([field, config]) => (
                  <div key={field}>
                    <p className="text-sm font-medium text-gray-700 mb-2">{config.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {config.options.map(option => {
                        const isSelected = profileData[field] === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`
                              cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all
                              ${isSelected
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-purple-300'
                              }
                            `}
                          >
                            <input
                              type="radio"
                              name={field}
                              value={option.value}
                              checked={isSelected}
                              onChange={() => handleProfileChange(field, option.value)}
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 저장 버튼 */}
              <div className="pt-4 border-t">
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? '저장 중...' : '💾 저장하기'}
                </button>
                {profileMessage && (
                  <p className="text-center mt-2 text-sm font-medium">{profileMessage}</p>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </BrowserRouter>
  );
}
