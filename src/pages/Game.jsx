import React, { useEffect, useRef, useState } from "react";
import { rumAction, setGamePlayedStatus } from '../lib/rum';

// HTML-based Datadog Runner for Session Replay DOM tracking
export default function Game() {
  // Game state
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [dogPosition, setDogPosition] = useState({ x: 80, y: 210, jumping: false, jumpCount: 0 });
  const [obstacles, setObstacles] = useState([]);

  // 동시접속자 상태
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState('익명');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userBestScores, setUserBestScores] = useState({}); // userId -> bestScore
  const wsRef = useRef(null);

  // Refs for game loop
  const gameLoopRef = useRef();
  const runningRef = useRef(running);
  const scoreRef = useRef(score);
  const dogRef = useRef(dogPosition);
  const obstaclesRef = useRef(obstacles);
  const gameOverRef = useRef(gameOver);
  const bestRef = useRef(best);
  const gameStartTimeRef = useRef(null); // 게임 시작 시간

  // Game constants
  const GAME_WIDTH = 900;
  const GAME_HEIGHT = 320;
  const GROUND_Y = 270;

  // 🐕 강아지 커스터마이징 색상 매핑
  const DOG_COLORS = {
    white: { body: '#fdfaff', shadow: '#f1edf7', ear: '#e9e2f5', paw: '#e9e2f5' },
    cream: { body: '#fff8e7', shadow: '#f5e6c8', ear: '#ead4a8', paw: '#ead4a8' },
    brown: { body: '#e8b87d', shadow: '#d4a06a', ear: '#c99458', paw: '#c99458' },
    pink: { body: '#ffd4e5', shadow: '#ffb8d4', ear: '#ff9fc4', paw: '#ff9fc4' },
    gray: { body: '#d1d5db', shadow: '#9ca3af', ear: '#6b7280', paw: '#6b7280' },
    purple: { body: '#e9d5ff', shadow: '#d8b4fe', ear: '#c084fc', paw: '#c084fc' },
    starlight: { body: '#e0e7ff', shadow: '#c7d2fe', ear: '#a5b4fc', paw: '#a5b4fc', sparkle: true },
  };

  // 🎩 모자 컴포넌트 (CSS 픽셀아트 스타일)
  const HatCrown = () => (
    <div style={{ position: 'relative', width: '18px', height: '16px' }}>
      {/* 왕관 베이스 */}
      <div style={{ position: 'absolute', bottom: 0, left: '2px', width: '20px', height: '6px', background: '#FFD700', borderRadius: '0 0 2px 2px' }} />
      {/* 왕관 뾰족이 3개 */}
      <div style={{ position: 'absolute', bottom: '6px', left: '2px', width: '4px', height: '8px', background: '#FFD700', borderRadius: '2px 2px 0 0' }} />
      <div style={{ position: 'absolute', bottom: '6px', left: '10px', width: '4px', height: '10px', background: '#FFD700', borderRadius: '2px 2px 0 0' }} />
      <div style={{ position: 'absolute', bottom: '6px', left: '18px', width: '4px', height: '8px', background: '#FFD700', borderRadius: '2px 2px 0 0' }} />
      {/* 보석 */}
      <div style={{ position: 'absolute', bottom: '2px', left: '9px', width: '6px', height: '3px', background: '#E11D48', borderRadius: '1px' }} />
    </div>
  );

  const HatRibbon = () => (
    <div style={{ position: 'relative', width: '28px', height: '16px' }}>
      {/* 리본 중앙 */}
      <div style={{ position: 'absolute', top: '7px', left: '10px', width: '8px', height: '8px', background: '#EC4899', borderRadius: '2px' }} />
      {/* 리본 양쪽 날개 */}
      <div style={{ position: 'absolute', top: '5px', left: '0px', width: '12px', height: '12px', background: '#F472B6', borderRadius: '50% 0 50% 50%', transform: 'rotate(-15deg)' }} />
      <div style={{ position: 'absolute', top: '5px', right: '0px', width: '12px', height: '12px', background: '#F472B6', borderRadius: '0 50% 50% 50%', transform: 'rotate(15deg)' }} />
    </div>
  );

  const HatParty = () => (
    <div style={{ position: 'relative', width: '15px', height: '24px', marginTop: '-7px' }}>
      {/* 파티 모자 콘 */}
      <div style={{
        position: 'absolute', bottom: 0, left: '0px',
        width: 0, height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderBottom: '24px solid #8B5CF6'
      }} />
      {/* 줄무늬 */}
      <div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '10px', height: '3px', background: '#FCD34D' }} />
      <div style={{ position: 'absolute', bottom: '12px', left: '6px', width: '8px', height: '3px', background: '#FCD34D' }} />
      {/* 폼폼 */}
      <div style={{ position: 'absolute', top: '-4px', left: '6px', width: '8px', height: '8px', background: '#FBBF24', borderRadius: '50%' }} />
    </div>
  );

  const HatGat = () => (
    <div style={{ position: 'relative', width: '44px', height: '22px', marginTop: '-5px' }}>
      {/* 갓 탕건 (윗부분 - 둥근 모자) */}
      <div style={{ position: 'absolute', bottom: '6px', left: '14px', width: '16px', height: '14px', background: '#1a1a1a', borderRadius: '8px 8px 3px 3px' }} />
      {/* 갓 양태 (넓은 챙) */}
      <div style={{ position: 'absolute', bottom: '0px', left: '0px', width: '44px', height: '8px', background: '#2d2d2d', borderRadius: '50%' }} />
      {/* 갓끈 (양쪽 끈) */}
      <div style={{ position: 'absolute', bottom: '-3px', left: '8px', width: '2px', height: '8px', background: '#8B4513', borderRadius: '1px' }} />
      <div style={{ position: 'absolute', bottom: '-3px', right: '8px', width: '2px', height: '8px', background: '#8B4513', borderRadius: '1px' }} />
    </div>
  );

  const HatFlower = () => (
    <div style={{ position: 'relative', width: '20px', height: '20px', marginTop: '1px' }}>
      {/* 꽃잎 5개 - 더 크고 환한 색상 */}
      <div style={{ position: 'absolute', top: '0px', left: '6px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '5px', left: '0px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '5px', left: '12px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '12px', left: '2px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '12px', left: '10px', width: '8px', height: '8px', background: '#FF8FAB', borderRadius: '50%' }} />
      {/* 중앙 - 더 밝은 노란색 */}
      <div style={{ position: 'absolute', top: '6px', left: '6px', width: '8px', height: '8px', background: '#FFD700', borderRadius: '50%' }} />
    </div>
  );

  // 모자 렌더링 함수
  const renderHat = (hatCode) => {
    switch (hatCode) {
      case 'crown': return <HatCrown />;
      case 'ribbon': return <HatRibbon />;
      case 'party': return <HatParty />;
      case 'gat': return <HatGat />;
      case 'flower': return <HatFlower />;
      default: return null;
    }
  };

  // 현재 커스터마이징 상태 (localStorage에서 초기 로드 후 API에서 최신 데이터 로드)
  const [dogCustomization, setDogCustomization] = useState(() => {
    const saved = localStorage.getItem('dogCustomization');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { bodyColor: 'white', hatCode: 'none' };
      }
    }
    return { bodyColor: 'white', hatCode: 'none' };
  });

  // API에서 최신 커스터마이징 데이터 로드
  useEffect(() => {
    const loadCustomization = async () => {
      try {
        const response = await fetch('/api/customization', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setDogCustomization(data);
          localStorage.setItem('dogCustomization', JSON.stringify(data));
        }
      } catch (e) {
        console.log('커스터마이징 로드 실패 (localStorage 사용):', e);
      }
    };
    loadCustomization();
  }, []);

  // 현재 색상 계산
  const currentColors = DOG_COLORS[dogCustomization.bodyColor] || DOG_COLORS.white;

  // 물리 상수 - 프레임레이트 문제 해결 과정에서 조정
  // MacBook ProMotion 120Hz 모니터에서 requestAnimationFrame이 과도하게 빨라지는 문제 발견
  // 30fps 제한을 시도했으나 사용자 요청으로 되돌림, 현재는 60fps 고정 구현
  const GRAVITY = 0.8;        // 중력 (원래 값 유지)
  const JUMP_VELOCITY = -14;  // 점프 속도 (원래 값 유지)

  // Load best score & initialize game state
  useEffect(() => {
    const savedBest = Number(localStorage.getItem("best") || 0);
    setBest(savedBest);
    bestRef.current = savedBest;

    // 🎮 페이지 로드 시 게임 플레이 상태 초기화
    setGamePlayedStatus(false);

    // 🎯 퍼널 추적: 게임 페이지 방문
    rumAction('page_visited', { page: 'game', previousBest: savedBest });

    // 현재 사용자 정보 가져오기
    fetch('/api/session/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setCurrentUser(data.user_id || '익명');
      })
      .catch(() => setCurrentUser('익명'));
  }, []);

  // WebSocket 연결 (동시접속자용)
  useEffect(() => {
    if (currentUser === '익명') return;

    const ws = new WebSocket((location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/chat/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // 연결 즉시 사용자 입장 메시지 전송
      ws.send(JSON.stringify({
        type: 'user_join',
        user: currentUser
      }));
    };
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      // 사용자 목록 업데이트 메시지 처리
      if (data.type === 'user_list_update') {
        setConnectedUsers(data.userList || []);
        // 접속자들의 최고 점수 가져오기
        fetchUserBestScores(data.userList || []);
      }
    };

    return () => ws.close();
  }, [currentUser]);

  // 접속자들의 최근 점수 가져오기 (플레이 안했으면 0)
  const fetchUserBestScores = async (users) => {
    try {
      if (!users || users.length === 0) return;

      const userIds = users.map(u => u.userId).join(',');
      const response = await fetch(`/rankings/ingame?userIds=${encodeURIComponent(userIds)}`, { credentials: 'include' });
      if (response.ok) {
        const rankings = await response.json();
        const scoresMap = {};
        rankings.forEach(r => {
          scoresMap[r.user_id] = r.score;
        });
        setUserBestScores(scoresMap);
      }
    } catch (e) {
      console.error('Failed to fetch rankings:', e);
    }
  };

  // 🐛 점수 새로고침 버튼용 함수 (일부러 에러 포함 - Datadog RUM 테스트용)
  const refreshScoresWithError = () => {
    // 일부러 에러 발생 (undefined 객체 접근)
    const fakeObject = undefined;
    console.log(fakeObject.property); // TypeError: Cannot read properties of undefined

    fetchUserBestScores(connectedUsers);
  };

  // Update refs when state changes
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { dogRef.current = dogPosition; }, [dogPosition]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { bestRef.current = best; }, [best]);

  // 🎯 퍼널 추적: 게임 점수 마일스톤
  useEffect(() => {
    if (score <= 0 || !running) return;

    const currentScore = Math.floor(score);
    const milestones = [50, 100, 200, 500, 1000, 2000];

    for (const milestone of milestones) {
      const storageKey = `milestone_${milestone}_reached`;
      const hasReached = sessionStorage.getItem(storageKey);

      if (currentScore >= milestone && !hasReached) {
        sessionStorage.setItem(storageKey, 'true');
        rumAction('game_milestone', {
          milestone: `score_${milestone}`,
          currentScore: currentScore,
          isRunning: running
        });
      }
    }
  }, [score, running]);

  // Game over handler
  const handleGameOver = async () => {
    if (gameOverRef.current) return;

    setGameOver(true);
    setRunning(false);

    const finalScore = Math.floor(scoreRef.current);
    const playTimeMs = gameStartTimeRef.current ? Date.now() - gameStartTimeRef.current : 0;
    rumAction('game_over', { score: finalScore, play_time_ms: playTimeMs });

    // Update best score
    const newBest = Math.max(bestRef.current, finalScore);
    if (newBest !== bestRef.current) {
      setBest(newBest);
      localStorage.setItem("best", String(newBest));
    }

    // Send score to backend
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score: finalScore })
      });

      if (response.ok) {
        // 🏆 게임 완료 - RUM 추적
        setGamePlayedStatus(true); // 점수 제출 성공 시 게임 완료로 마킹

        // 🎯 퍼널 추적: 게임 완료 정보 저장 (랭킹 확인 추적용)
        sessionStorage.setItem('game_completed', JSON.stringify({
          score: finalScore,
          completedAt: Date.now(),
          newBest: newBest > bestRef.current
        }));

        console.log('🏆 게임 완료 & 점수 제출 성공:', finalScore);

        // 점수 제출 후 랭킹 다시 가져오기
        fetchUserBestScores(connectedUsers);
      }
    } catch (e) {
      console.error('Failed to save score:', e);
    }
  };

  // Start game
  const startGame = () => {
    if (runningRef.current) return;

    setRunning(true);
    setGameOver(false);
    setScore(0);
    setDogPosition({ x: 80, y: 210, jumping: false, jumpCount: 0 });
    setObstacles([]);

    // 🎯 퍼널 추적: 마일스톤 초기화 (새 게임 시작)
    const milestones = [50, 100, 200, 500, 1000, 2000];
    milestones.forEach(milestone => {
      sessionStorage.removeItem(`milestone_${milestone}_reached`);
    });

    // 🎮 게임 시작 - RUM 추적
    gameStartTimeRef.current = Date.now(); // 시작 시간 기록
    rumAction('game_start');
    setGamePlayedStatus(false); // 게임 시작했지만 아직 완료하지 않음

    // 게임 시작 시 접속자 점수 업데이트
    fetchUserBestScores(connectedUsers);
  };

  // Jump function
  const jump = () => {
    if (!runningRef.current || gameOverRef.current) return;

    const dog = dogRef.current;
    if (dog.jumpCount < 2) {
      setDogPosition(prev => ({
        ...prev,
        jumping: true,
        jumpCount: prev.jumpCount + 1,
        velocity: prev.jumpCount === 0 ? JUMP_VELOCITY : JUMP_VELOCITY * 0.85
      }));
      rumAction('jump');
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      } else if (e.code === "KeyR") {
        startGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Game loop
  useEffect(() => {
    if (!running) return;

    let frameCount = 0;
    let speed = 6.6; // 기본 속도 10% 증가 (기존 6.0 → 6.6) - 난이도 조정 요청 반영
    let spawnTick = 0;
    let nextSpawn = 35;

    // 60fps 고정 게임 루프 구현 - 고주사율 모니터 대응
    // 문제: MacBook ProMotion 120Hz에서 requestAnimationFrame이 120fps로 실행되어 게임이 2배 빨라짐
    // 해결: 고정 60fps로 제한하여 일관된 게임 속도 보장
    let lastTime = 0;
    const targetFPS = 60;
    const frameDelay = 1000 / targetFPS; // 16.67ms - 60fps를 위한 프레임 간격

    // 동적 장애물 스폰 시스템 (원본 DogRunner에서 이식)
    // 기존 HTML 버전의 고정 스폰과 달리, 점수 기반 가속 및 랜덤 지터 적용
    const scheduleNextSpawn = () => {
      const base = 44;                                      // 기본 스폰 간격 (프레임 단위)
      const accel = Math.floor(scoreRef.current / 25);      // 점수 기반 가속 (25점당 1프레임 빨라짐, 20% 빠른 진행)
      const minInterval = 24;                               // 최소 스폰 간격 (너무 빠르지 않도록 제한)
      const interval = Math.max(minInterval, base - accel); // 최종 스폰 간격 계산
      nextSpawn = interval + Math.floor(Math.random() * 28); // 랜덤 지터 0~27프레임 추가하여 예측 불가능성 증대
    };

    scheduleNextSpawn(); // 첫 번째 장애물 스폰 스케줄링

    // 메인 게임 루프 - 60fps 고정으로 안정적인 게임 플레이 보장
    const gameLoop = (currentTime) => {
      if (!runningRef.current) return;

      // 60fps 제한: 16.67ms(frameDelay)보다 적게 지났으면 현재 프레임 스킵
      // 고주사율 모니터(120Hz, 144Hz 등)에서도 60fps로 일관된 속도 유지
      if (currentTime - lastTime < frameDelay) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      lastTime = currentTime;
      frameCount++;

      // Update score
      setScore(prev => prev + 0.2);

      // 점수 기반 속도 증가 - 난이도 조정 반영
      // 기본 속도: 6.6 (기존 6.0에서 10% 증가)
      // 진행 속도: scoreRef.current / 25 (기존 / 30에서 20% 빠르게 조정)
      // 최대 추가 속도: 11 (기존 10에서 10% 증가)
      speed = 6.6 + Math.min(11, Math.floor(scoreRef.current / 25));

      // Dog physics
      setDogPosition(prev => {
        let newY = prev.y;
        let newVelocity = prev.velocity || 0;
        let newJumping = prev.jumping;
        let newJumpCount = prev.jumpCount;

        if (prev.jumping) {
          newVelocity += GRAVITY;
          newY += newVelocity;

          if (newY >= GROUND_Y - 60) {
            newY = GROUND_Y - 60;
            newVelocity = 0;
            newJumping = false;
            newJumpCount = 0;
          }
        }

        return {
          ...prev,
          y: newY,
          velocity: newVelocity,
          jumping: newJumping,
          jumpCount: newJumpCount
        };
      });

      // Smart obstacle spawning (dynamic intervals + random jitter)
      spawnTick++;
      if (spawnTick >= nextSpawn) {
        const types = [
          { w: 18, h: 28 },
          { w: 28, h: 40 },
          { w: 42, h: 30 },
          { w: 30, h: 120 }
        ];
        const obstacle = types[Math.floor(Math.random() * types.length)];

        setObstacles(prev => [...prev, {
          id: Date.now(),
          x: GAME_WIDTH + 20,
          y: GROUND_Y - obstacle.h,
          width: obstacle.w,
          height: obstacle.h
        }]);

        // Optional burst spawning (like original)
        if (Math.random() < 0.2) {
          const offset = 40 + Math.floor(Math.random() * 60); // 40~99px ahead
          const burstObstacle = types[Math.floor(Math.random() * types.length)];
          setObstacles(prev => [...prev, {
            id: Date.now() + 1,
            x: GAME_WIDTH + 20 + offset,
            y: GROUND_Y - burstObstacle.h,
            width: burstObstacle.w,
            height: burstObstacle.h
          }]);
        }

        spawnTick = 0;
        scheduleNextSpawn(); // Schedule next spawn with new interval
      }

      // Move and clean obstacles
      setObstacles(prev => prev
        .map(obs => ({ ...obs, x: obs.x - speed }))
        .filter(obs => obs.x + obs.width > -50)
      );

      // Collision detection
      const dog = dogRef.current;
      const currentObstacles = obstaclesRef.current;

      for (const obs of currentObstacles) {
        if (
          dog.x + 30 > obs.x &&
          dog.x < obs.x + obs.width &&
          dog.y + 50 > obs.y &&
          dog.y < obs.y + obs.height
        ) {
          handleGameOver();
          return;
        }
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [running]);

  // 아바타 색상 생성 함수
  const getAvatarColor = (userId) => {
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
    ];
    const hash = userId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 style={{ textAlign: 'center', color: '#4b1f7e', marginBottom: '16px' }}>
        🐶 Datadog Pup Runner (HTML Edition)
      </h2>

      {/* 메인 레이아웃: 게임 + 동시접속자 패널 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 왼쪽: 게임 영역 */}
        <div className="flex-1 min-w-0">
          {/* 모바일용 접속자 표시 - 작게 상단에 */}
          <div className="lg:hidden mb-2 flex items-center gap-2 text-sm text-gray-600">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>접속 중 {connectedUsers.length}명</span>
            {connectedUsers.length > 0 && (
              <span className="text-xs text-gray-400">
                ({connectedUsers.map(u => u.userId).join(', ')})
              </span>
            )}
          </div>

          {/* Score Display with Connection Status */}
          <div className="flex items-center justify-between mb-3" style={{ width: '800px', maxWidth: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <strong data-testid="current-score">SCORE {Math.floor(score)}</strong>
              <span data-testid="best-score">BEST {best}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">{isConnected ? '연결됨' : '연결 끊김'}</span>
            </div>
          </div>

          {/* Game Container - 고정 크기 */}
          <div
            className="game-container"
            onClick={!running ? startGame : jump}
            style={{
              position: 'relative',
              width: '800px',
              maxWidth: '100%',
              height: '320px',
              background: 'linear-gradient(to bottom, #f9fbff 0%, #eef3ff 100%)',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0,0,0,.1)',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '2px solid #e7e9ff',
              margin: '0 auto'
            }}
            data-testid="game-area"
          >
            {/* Background Image (강아지들 - 맨 뒤에 배치) */}
            <div style={{
              position: 'absolute',
              bottom: '50px',
              left: 0,
              right: 0,
              height: '280px',
              backgroundImage: 'url(/background.png)',
              backgroundSize: '100% auto',
              backgroundPosition: 'center bottom',
              backgroundRepeat: 'no-repeat',
              opacity: 0.85,
              zIndex: 1,
              pointerEvents: 'none'
            }} />

            {/* Moving Ground Dashes */}
            <div style={{
              position: 'absolute',
              bottom: '46px',
              left: 0,
              right: 0,
              height: '2px',
              background: 'repeating-linear-gradient(to right, #c6cbff 0px, #c6cbff 8px, transparent 8px, transparent 20px)',
              animation: running ? 'groundMove 1s linear infinite' : 'none',
              zIndex: 5
            }} />

            {/* Dog Character Container - 80px (모자 20px + 본체 60px) */}
            <div
              className="dog-character"
              data-testid="dog-player"
              style={{
                position: 'absolute',
                left: `${dogPosition.x}px`,
                top: `${dogPosition.y - 20}px`,  // 모자 공간만큼 위로
                width: '40px',
                height: '80px',  // 60 → 80 (모자 공간 20px 추가)
                transition: dogPosition.jumping ? 'none' : 'top 0.1s ease-out',
                zIndex: 10
              }}
            >
              {/* 🎩 모자 영역 (강아지 머리 위) */}
              {dogCustomization.hatCode !== 'none' && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-40%)',
                  zIndex: 20
                }}>
                  {renderHat(dogCustomization.hatCode)}
                </div>
              )}

              {/* 몸통 (Main Body) - 동적 색상 */}
              <div style={{
                position: 'absolute',
                bottom: '2px',
                left: '4px',
                width: '32px',
                height: '36px',
                background: currentColors.sparkle
                  ? currentColors.body
                  : currentColors.body,
                boxShadow: currentColors.sparkle
                  ? `inset -3px -3px 0px ${currentColors.shadow}, 0 0 8px 3px rgba(255,255,255,0.8)`
                  : `inset -3px -3px 0px ${currentColors.shadow}`,
                borderRadius: '8px',
                animation: currentColors.sparkle ? 'sparkleBody 0.15s linear infinite' : 'none'
              }} />
              {/* 반짝이 효과 (starlight 전용) */}
              {currentColors.sparkle && (
                <>
                  <div style={{ position: 'absolute', bottom: '25px', left: '8px', width: '5px', height: '5px', background: '#fff', borderRadius: '50%', animation: 'twinkle 0.15s ease-in-out infinite', boxShadow: '0 0 6px 2px #fff' }} />
                  <div style={{ position: 'absolute', bottom: '32px', left: '22px', width: '3px', height: '3px', background: '#00ffff', borderRadius: '50%', animation: 'twinkle 0.18s ease-in-out infinite 0.1s', boxShadow: '0 0 4px 2px #00ffff' }} />
                </>
              )}
              <style>{`
                @keyframes sparkleBody {
                  0% { filter: brightness(1); box-shadow: 0 0 5px 2px rgba(255,255,255,0.5); }
                  25% { filter: brightness(1.6); box-shadow: 0 0 15px 5px rgba(255,255,0,0.8); }
                  50% { filter: brightness(1.3); box-shadow: 0 0 12px 4px rgba(255,150,255,0.7); }
                  75% { filter: brightness(1.8); box-shadow: 0 0 18px 6px rgba(100,255,255,0.9); }
                  100% { filter: brightness(1); box-shadow: 0 0 5px 2px rgba(255,255,255,0.5); }
                }
                @keyframes twinkle {
                  0%, 100% { opacity: 0; transform: scale(0.5); }
                  50% { opacity: 1; transform: scale(1.5); }
                }
              `}</style>

              {/* 머리 (Head) - 동적 색상 */}
              <div style={{
                position: 'absolute',
                top: '26px',  // 6 + 20 (모자 공간)
                left: '12px',
                width: '28px',
                height: '26px',
                background: currentColors.body,
                boxShadow: `inset -2px 2px 0px ${currentColors.shadow}`,
                borderRadius: '12px 12px 4px 12px'
              }} />

              {/* 귀 (Floppy Ears) - 동적 색상 */}
              <div style={{
                position: 'absolute',
                top: '24px',  // 4 + 20 (모자 공간)
                right: '-2px',
                width: '12px',
                height: '20px',
                background: currentColors.ear,
                borderRadius: '6px 10px 6px 10px',
                transform: 'rotate(10deg)',
                zIndex: -1
              }} />

              {/* 연보라색 눈 (Lavender Eyes) */}
              <div style={{
                position: 'absolute',
                top: '34px',  // 14 + 20 (모자 공간)
                right: '8px',
                width: '5px',
                height: '7px',
                background: '#A78BFA',
                borderRadius: '2px'
              }}>
                {/* 눈동자 하이라이트 */}
                <div style={{
                  position: 'absolute',
                  top: '1px',
                  left: '1px',
                  width: '2px',
                  height: '2px',
                  background: 'white',
                  borderRadius: '1px'
                }} />
              </div>

              {/* 코 (Button Nose) */}
              <div style={{
                position: 'absolute',
                top: '40px',  // 20 + 20 (모자 공간)
                right: '2px',
                width: '5px',
                height: '4px',
                background: '#4B5563',
                borderRadius: '2px'
              }} />

              {/* 핑크색 목걸이 (Collar) */}
              <div style={{
                position: 'absolute',
                top: '50px',  // 30 + 20 (모자 공간)
                left: '14px',
                width: '24px',
                height: '3px',
                background: '#FDA4AF',
                borderRadius: '3px'
              }} />

              {/* 꼬리 (Happy Tail) - 동적 색상 + 흔들기 애니메이션 */}
              <div style={{
                position: 'absolute',
                bottom: '31px',
                left: '-2px',
                width: '10px',
                height: '12px',
                background: currentColors.body,
                border: `2px solid ${currentColors.shadow}`,
                borderRadius: '40% 60% 40% 60%',
                transformOrigin: 'right bottom',
                animation: 'wagTail 0.1s ease-in-out infinite alternate'
              }} />
              <style>{`
                @keyframes wagTail {
                  0% { transform: rotate(-35deg); }
                  100% { transform: rotate(-5deg); }
                }
              `}</style>

              {/* 발 (Paws) - 동적 색상 */}
              <div style={{ // 뒷발
                position: 'absolute',
                bottom: '0',
                left: '10px',
                width: '10px',
                height: '6px',
                background: currentColors.paw,
                borderRadius: '3px 3px 0 0'
              }} />
              <div style={{ // 앞발
                position: 'absolute',
                bottom: '0',
                left: '26px',
                width: '10px',
                height: '6px',
                background: currentColors.paw,
                borderRadius: '3px 3px 0 0'
              }} />
            </div>

            {/* Obstacles */}
            {obstacles.map(obstacle => (
              <div
                key={obstacle.id}
                className="obstacle"
                data-testid={`obstacle-${obstacle.id}`}
                style={{
                  position: 'absolute',
                  left: `${obstacle.x}px`,
                  top: `${obstacle.y}px`,
                  width: `${obstacle.width}px`,
                  height: `${obstacle.height}px`,
                  zIndex: 10,
                  // 기존 사각형 배경 제거 (내부에서 디자인함)
                  background: 'transparent',
                }}
              >
                {/* 에러 불꽃 몸체: 픽셀 느낌을 위해 box-shadow 활용 */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'rgb(255, 90, 110)',
                  borderRadius: '2px',
                  boxShadow: 'inset -4px -4px 0px rgba(0,0,0,0.2)', // 도트 입체감
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}>
                  {/* 느낌표 (!) 상단 바 */}
                  <div style={{
                    width: '20%',
                    height: '40%',
                    background: 'white',
                    borderRadius: '20px'
                  }} />
                  {/* 느낌표 (!) 하단 점 */}
                  <div style={{
                    width: '20%',
                    height: '15%',
                    background: 'white',
                    borderRadius: '20px'
                  }} />
                </div>

                {/* 바닥 그림자 (배경과 분리감을 줌) */}
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '10%',
                  width: '80%',
                  height: '4px',
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '50%'
                }} />
              </div>
            ))}

            {/* Game Over / Start Overlay */}
            {!running && (
              <div
                className="game-overlay"
                data-testid="game-overlay"
                data-game-over={gameOver}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(255,255,255,0.95)',
                  padding: '20px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  zIndex: 20
                }}
              >
                <h3 style={{ color: '#4b1f7e', marginBottom: '10px' }}>
                  {gameOver ? "이런... 장애를 피하지 못했습니다! ㅠㅠ" : "Datadog Pup Runner"}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  스페이스/위쪽 화살표로 2단 점프 (모바일: 탭)
                </p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  {gameOver ? "R 키 또는 클릭으로 재시작" : "시작하려면 클릭"}
                </p>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
            <button
              onClick={startGame}
              data-testid="start-button"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#632CA6',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {gameOver ? '다시 시작' : '게임 시작'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("best");
                setBest(0);
              }}
              data-testid="reset-best-button"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#f0f0f0',
                color: '#666',
                border: '1px solid #ddd',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              최고점 초기화
            </button>
          </div>

        </div>

        {/* 오른쪽: 동시접속자 패널 - 데스크톱에서만 표시 */}
        <div className="hidden lg:block w-60 bg-white rounded-lg border border-gray-200 p-3 shadow-sm h-fit">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-sm font-semibold text-gray-700">접속 중 ({connectedUsers.length})</h3>
            </div>
            <button
              onClick={refreshScoresWithError}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
              title="점수 새로고침"
            >
              🔄
            </button>
          </div>

          {/* 사용자 목록 */}
          {connectedUsers.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-6">
              <div className="text-2xl mb-1">👥</div>
              <p>접속자 없음</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {[...connectedUsers]
                .sort((a, b) => (userBestScores[b.userId] || 0) - (userBestScores[a.userId] || 0))
                .map((user, i) => {
                  const isMe = user.userId === currentUser;
                  const userBest = userBestScores[user.userId] || 0;

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-1.5 rounded transition-colors ${isMe
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                    >
                      {/* 아바타 */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${getAvatarColor(user.userId)}`}>
                        {user.userId?.charAt(0)?.toUpperCase() || '?'}
                      </div>

                      {/* 사용자 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium truncate ${isMe ? 'text-blue-600' : 'text-gray-700'}`}>
                            {user.userId}
                          </span>
                          {isMe && <span className="text-blue-500 text-xs">•</span>}
                        </div>
                      </div>

                      {/* 최고 점수 */}
                      <div className="text-right flex items-center gap-0.5">
                        <span className="text-xs">🏆</span>
                        <span className="text-xs text-gray-500">{userBest}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation for ground movement */}
      <style jsx>{`
        @keyframes groundMove {
          from { background-position-x: 0px; }
          to { background-position-x: -20px; }
        }
      `}</style>
    </div>
  );
}
